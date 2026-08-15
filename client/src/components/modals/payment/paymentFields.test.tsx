import { useForm } from 'react-hook-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaymentChannel } from '@/types/payment.types';
import CardFields from './CardFields';
import MobileMoneyFields from './MobileMoneyFields';
import type { PaymentFormValues, PayerType } from './payment.types';

const defaultValues: PaymentFormValues = {
  channelName: PaymentChannel.MOMO,
  payerType: 'sender',
  customPhone: '',
  fallbackPhone: '',
  cardholderName: '',
  payerEmail: '',
};

/** The warning spans several elements, so match against collapsed text. */
const normalized = (container: HTMLElement) =>
  (container.textContent ?? '').replace(/\s+/g, ' ');

const CardHost = ({ onValid = vi.fn() }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: { ...defaultValues, channelName: PaymentChannel.CARD },
  });

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <CardFields control={control} errors={errors} />
      <button type="submit">Continue</button>
    </form>
  );
};

const MobileMoneyHost = ({
  channelName = PaymentChannel.MOMO,
  payerType = 'sender' as PayerType,
  payerPhone,
  payerPhoneError,
}: {
  channelName?: PaymentChannel;
  payerType?: PayerType;
  payerPhone?: string;
  payerPhoneError?: string;
}) => {
  const {
    control,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: { ...defaultValues, channelName, payerType },
  });

  return (
    <MobileMoneyFields
      control={control}
      errors={errors}
      channelName={channelName}
      payerType={payerType}
      senderLabel="Alex"
      payerPhone={payerPhone}
      payerPhoneError={payerPhoneError}
    />
  );
};

describe('CardFields', () => {
  it('collects only the details the hosted checkout needs, never card numbers', () => {
    render(<CardHost />);

    expect(screen.getByRole('textbox', { name: /name on card/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email for the receipt/i })).toBeInTheDocument();
    expect(
      screen.getByText(/never sees or stores your card number/i),
    ).toBeInTheDocument();

    // No PAN / expiry / CVV inputs exist — cards are entered on UrubutoPay.
    const labels = screen
      .getAllByRole('textbox')
      .map((field) => field.getAttribute('autocomplete'));
    expect(labels).not.toContain('cc-number');
    expect(labels).not.toContain('cc-csc');
    expect(labels).not.toContain('cc-exp');
  });

  it('blocks submission until the cardholder name and email are valid', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<CardHost onValid={onValid} />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onValid).not.toHaveBeenCalled();
    expect(await screen.findByText('Cardholder name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required for card payments')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /name on card/i }), 'Alex 99');
    await user.type(screen.getByRole('textbox', { name: /email for the receipt/i }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onValid).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Cardholder name cannot contain numbers'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();

    await user.clear(screen.getByRole('textbox', { name: /name on card/i }));
    await user.type(screen.getByRole('textbox', { name: /name on card/i }), 'Alex Uwase');
    await user.clear(screen.getByRole('textbox', { name: /email for the receipt/i }));
    await user.type(screen.getByRole('textbox', { name: /email for the receipt/i }), 'alex@example.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onValid).toHaveBeenCalledTimes(1);
  });
});

describe('MobileMoneyFields', () => {
  it('names the payer options from the order', () => {
    render(<MobileMoneyHost />);

    expect(screen.getByRole('radio', { name: 'Sender (Alex)' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Recipient' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Other' })).toBeInTheDocument();
  });

  it('warns without blocking when the number looks like another network', () => {
    const { container } = render(<MobileMoneyHost payerPhone="+250738123456" />);

    expect(normalized(container)).toMatch(
      /This number looks like Airtel, but you selected MTN/,
    );
    // A hint, not a blocker — Rwanda allows number portability.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays quiet when the number matches the selected network', () => {
    const { container } = render(
      <MobileMoneyHost
        channelName={PaymentChannel.AIRTEL_MONEY}
        payerPhone="+250738123456"
      />,
    );

    expect(normalized(container)).not.toMatch(/but you selected/);
  });

  it('surfaces the submit-time error for payers taken from the order', () => {
    render(<MobileMoneyHost payerPhoneError="No phone number on file for this payer." />);

    expect(
      screen.getByText('No phone number on file for this payer.'),
    ).toBeInTheDocument();
  });
});
