import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TelInput from './TelInput';

const ControlledTelInput = ({ onChange = vi.fn() }) => {
  const [value, setValue] = useState('');

  return (
    <TelInput
      label="Phone number"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
};

describe('TelInput', () => {
  it('locks selection to Rwanda and emits E.164 values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTelInput onChange={onChange} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveAccessibleName(
      'Rwanda (RW) +250',
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '0788123456');

    expect(onChange).toHaveBeenLastCalledWith('+250788123456');
    expect(input).toHaveValue('0788 123 456');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel');
  });

  it('converts a cleared package value to an empty string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTelInput onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '0788123456');
    await user.clear(input);

    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('normalizes a pasted formatted Rwanda number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTelInput onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    await user.paste('+250 (788) 123-456');

    expect(onChange).toHaveBeenLastCalledWith('+250788123456');
  });

  it('rejects a pasted foreign number', async () => {
    const user = userEvent.setup();
    render(<ControlledTelInput />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.click(input);
    await user.paste('+1 202 456 1414');

    expect(
      screen.getByText('Only Rwanda (+250) numbers are supported.'),
    ).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows live validation and gives external errors precedence', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ControlledTelInput />);

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    await user.type(input, '0788');
    expect(
      screen.getByText('Enter a complete Rwandan phone number.'),
    ).toHaveAttribute('aria-live', 'polite');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <TelInput
        label="Phone number"
        value="+250788123456"
        onChange={vi.fn()}
        errorMessage="This phone is already registered."
      />,
    );
    expect(screen.getByText('This phone is already registered.')).toBeVisible();
    expect(
      screen.queryByText('Enter a complete Rwandan phone number.'),
    ).not.toBeInTheDocument();
  });

  it('forwards its ref and native states to the telephone field', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <TelInput
        ref={ref}
        label="Phone number"
        value=""
        onChange={vi.fn()}
        required
        disabled
      />,
    );

    expect(ref.current).toBe(screen.getByRole('textbox', { name: /phone number/i }));
    expect(ref.current).toBeDisabled();
    expect(ref.current).toBeRequired();

    rerender(
      <TelInput
        ref={ref}
        label="Phone number"
        value="+250788123456"
        onChange={vi.fn()}
        readOnly
      />,
    );
    expect(ref.current).toHaveAttribute('readonly');
  });
});
