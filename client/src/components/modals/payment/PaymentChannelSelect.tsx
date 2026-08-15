import Select from '@/components/inputs/Select';
import {
  PAYMENT_CHANNEL_LABELS,
  PaymentChannel,
} from '@/types/payment.types';

const options = Object.values(PaymentChannel).map((channel) => ({
  label: PAYMENT_CHANNEL_LABELS[channel],
  value: channel,
}));

interface PaymentChannelSelectProps {
  value: PaymentChannel;
  onChange: (channel: PaymentChannel) => void;
}

const PaymentChannelSelect = ({ value, onChange }: PaymentChannelSelectProps) => (
  <Select
    label="Payment method"
    required
    searchable
    options={options}
    value={value}
    placeholder="Choose how to pay"
    onChange={(selected) => onChange(selected as PaymentChannel)}
  />
);

export default PaymentChannelSelect;
