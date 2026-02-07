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
        <dt className="text-xs sm:text-sm font-medium text-gray-500">Sender</dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-black">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.sender?.name ||
            formatPhone(order?.sender?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Recipient
        </dt>
        <dd className="text-xs sm:text-sm font-normal flex items-center gap-1 text-black">
          <FontAwesomeIcon icon={faUser} />{' '}
          {order?.recipient?.name ||
            formatPhone(order?.recipient?.phoneNumber ?? '') ||
            'N/A'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">Fee</dt>
        <dd className="text-xs sm:text-sm font-normal text-black">
          {order?.finalFee ? `${formatCurrency(order.finalFee)}` : 'TBD'}
        </dd>
      </dl>
      <dl className="space-y-2 sm:space-y-2">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Last Updated
        </dt>
        <dd className="text-xs sm:text-sm font-normal text-black">
          {formatDate(order?.updatedAt, 'DD/MM/YYYY HH:mm')}
        </dd>
      </dl>
    </>
  );
};

export default OrderDetails;
