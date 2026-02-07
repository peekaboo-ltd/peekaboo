import Table from '@/components/table/Table';
import { useOrdersColumns } from '@/hooks/orders/columns.orders';
import { useFetchOrders } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import OrderSearchBar from '@/components/dashboard/OrderSearchBar';
import { OrderStatus } from '@/types/order.type';
import { useStatusFilter } from '@/hooks/common/filters.hooks';
import { useForm } from 'react-hook-form';

const OrdersPage = () => {
  // STATE VARIABLES
  const { ordersList } = useAppSelector((state) => state.order);

  // REACT HOOK FORM
  const { control, setValue } = useForm();

  const {
    fetchOrders,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching,
  } = useFetchOrders();

  const [searchParams, setSearchParams] = useSearchParams();
  const referenceId = searchParams.get('referenceId') || '';

  const { statusFilter, applicationStatus } = useStatusFilter({
    control,
    setValue,
    label: 'Order Status',
    applicationStatuses: Object.values(OrderStatus),
  });

  useEffect(() => {
    fetchOrders({
      page,
      size,
      referenceId: referenceId || undefined,
      status: applicationStatus ? applicationStatus?.join(',') : undefined,
    });
  }, [page, size, referenceId, applicationStatus, fetchOrders]);

  const { ordersColumns } = useOrdersColumns();

  const searchInitial = useMemo(() => referenceId, [referenceId]);

  return (
    <main className="text-primary h-full w-full">
      <header className="w-full flex flex-col gap-4 mb-4">
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Search and filter orders by status or Order ID.
            </p>
          </article>
          <OrderSearchBar
            initialValue={searchInitial}
            onSearch={(query) => {
              const next = new URLSearchParams(searchParams);
              next.set('referenceId', query);
              setSearchParams(next);
              setPage(0);
            }}
          />
        </section>

        <fieldset className="w-full grid grid-cols-4 gap-4 max-md:grid-cols-3 max-sm:grid-cols-2">
          {statusFilter}
        </fieldset>
      </header>

      <section aria-label="Orders list" className="w-full flex flex-col gap-4">
        <Table
          columns={ordersColumns}
          data={ordersList}
          showPagination={true}
          page={page}
          setPage={setPage}
          size={size}
          setSize={setSize}
          totalPages={totalPages}
          totalCount={totalCount}
          isLoading={isFetching}
        />
      </section>
    </main>
  );
};

export default OrdersPage;
