import {
  DEVELOPMENT_PAYMENT_AMOUNT_RWF,
  ENVIRONMENTS,
} from '@/constants/environments.constants';
import type { Order } from '@/types/order.type';
import { formatCurrency, formatDate, formatPhone } from '@/utils/strings.util';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface OrderDetailsProps {
  order?: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-(--muted)">Sender</dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-(--ink)">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.sender?.name ||
            formatPhone(order?.sender?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-(--muted)">
          Recipient
        </dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-(--ink)">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.recipient?.name ||
            formatPhone(order?.recipient?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-(--muted)">Fee</dt>
        <dd className="text-xs sm:text-sm font-normal text-(--ink)">
          {order?.finalFee ? `${formatCurrency(order.finalFee)}` : 'TBD'}
          {ENVIRONMENTS.isPaymentSimulation && order?.finalFee ? (
            <p className="mt-1 text-[11px] font-normal leading-snug text-(--ink)">
              Payments are simulated in this environment. No real charge will be
              made.
            </p>
          ) : null}
          {ENVIRONMENTS.isDevPrice && order?.finalFee ? (
            <p className="mt-1 text-[11px] font-normal leading-snug text-(--ink)">
              Catalog fee shown. You will only be charged{' '}
              {formatCurrency(DEVELOPMENT_PAYMENT_AMOUNT_RWF)} at checkout.
            </p>
          ) : null}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-(--muted)">
          Last Updated
        </dt>
        <dd className="text-xs sm:text-sm font-normal text-(--ink)">
          {formatDate(order?.updatedAt, 'DD/MM/YYYY HH:mm')}
        </dd>
      </dl>
    </>
  );
};

export default OrderDetails;
