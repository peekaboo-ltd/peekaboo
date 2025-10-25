import type { Order } from '@/types/order.type';
import { formatCurrency, formatDate } from '@/utils/strings.util';

export interface OrderDetailsProps {
  order?: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Reference ID
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary break-all">
          {order?.referenceId}
        </dd>
      </figure>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Order Type
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary capitalize">
          {String(order?.type).toLowerCase()}
        </dd>
      </figure>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Initial Fee
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary">
          {formatCurrency(order?.initialFee)}
        </dd>
      </figure>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Final Fee
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary">
          {order?.finalFee ? `${formatCurrency(order.finalFee)}` : 'TBD'}
        </dd>
      </figure>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Created
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary">
          {formatDate(order?.createdAt, 'DD/MM/YYYY HH:mm')}
        </dd>
      </figure>
      <figure className="space-y-1 sm:space-y-1">
        <dt className="text-xs sm:text-sm font-medium text-gray-500">
          Last Updated
        </dt>
        <dd className="text-xs sm:text-sm font-semibold text-primary">
          {formatDate(order?.updatedAt, 'DD/MM/YYYY HH:mm')}
        </dd>
      </figure>
    </>
  );
};

export default OrderDetails;
