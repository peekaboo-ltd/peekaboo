import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
import type { Order } from '@/types/order.type';
import { formatCurrency, formatDate, formatPhone } from '@/utils/strings.util';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useI18n } from '@/i18n/i18n';

export interface OrderDetailsProps {
  order?: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const { t } = useI18n();

  return (
    <>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-normal text-(--muted)">{t('orderDetails.sender')}</dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-(--ink)">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.sender?.name ||
            formatPhone(order?.sender?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-normal text-(--muted)">
          {t('orderDetails.recipient')}
        </dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-(--ink)">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.recipient?.name ||
            formatPhone(order?.recipient?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-normal text-(--muted)">{t('common.fee')}</dt>
        <dd className="text-xs sm:text-sm font-normal text-(--ink)">
          {order?.finalFee ? `${formatCurrency(order.finalFee)}` : 'TBD'}
          {ENVIRONMENTS.isPaymentSimulation && order?.finalFee ? (
            <p className="mt-1 text-xs font-normal leading-snug text-(--ink)">
              {t('orderPayment.simulation')}
            </p>
          ) : null}
          {ENVIRONMENTS.isDevPrice && order?.finalFee ? (
            <p className="mt-1 text-xs font-normal leading-snug text-(--ink)">
              {t('orderDetails.catalogFee', {
                amount: formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF),
              })}
            </p>
          ) : null}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-normal text-(--muted)">
          {t('common.lastUpdated')}
        </dt>
        <dd className="text-xs sm:text-sm font-normal text-(--ink)">
          {formatDate(order?.updatedAt, 'DD/MM/YYYY HH:mm')}
        </dd>
      </dl>
    </>
  );
};

export default OrderDetails;
