import Select from '@/components/inputs/Select';
import {
  PAYMENT_CHANNEL_LABELS,
  PaymentChannel,
} from '@/types/payment.types';
import { useI18n } from '@/i18n/i18n';

interface PaymentChannelSelectProps {
  value: PaymentChannel;
  onChange: (channel: PaymentChannel) => void;
}

const PaymentChannelSelect = ({ value, onChange }: PaymentChannelSelectProps) => {
  const { t } = useI18n();
  const options = Object.values(PaymentChannel).map((channel) => ({
    label: PAYMENT_CHANNEL_LABELS[channel],
    value: channel,
  }));
  return (
  <Select
    label={t('orderPayment.method')}
    required
    searchable
    options={options}
    value={value}
    placeholder={t('orderPayment.chooseMethod')}
    onChange={(selected) => onChange(selected as PaymentChannel)}
  />
  );
};

export default PaymentChannelSelect;
