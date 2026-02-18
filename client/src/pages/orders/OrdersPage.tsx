import Table from '@/components/table/Table';
import { useOrdersColumns } from '@/hooks/orders/columns.orders';
import { useFetchOrders } from '@/hooks/orders/orders.hooks';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { useEffect, useMemo, useRef } from 'react';
import { OrderStatus } from '@/types/order.type';
import { useStatusFilter } from '@/hooks/common/filters.hooks';
import { useForm } from 'react-hook-form';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Button from '@/components/inputs/Button';
import { faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { setCreateOrderModal } from '@/states/slices/order.slice';
import { useSearchParams } from 'react-router-dom';
import CreateOrder from './CreateOrder';
import DeleteOrder from './DeleteOrder';
import ImportBatch from '../batches/ImportBatch';
import { setImportBatchModal } from '@/states/slices/batch.slice';

const OrdersPage = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { ordersList, deleteOrderModal } = useAppSelector(
    (state) => state.order,
  );
  useDocumentTitle('Orders');

  // REACT HOOK FORM
  const { control: filterControl, setValue: setFilterValue } = useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  const availableStatuses = useMemo(() => Object.values(OrderStatus), []);

  const urlStatusGroup = searchParams.get('statusGroup') || undefined;
  const urlStatuses = useMemo(() => {
    const parsedStatuses = (searchParams.get('status') || '')
      .split(',')
      .map((status) => status.trim())
      .filter(
        (status): status is OrderStatus =>
          Boolean(status) && availableStatuses.includes(status as OrderStatus),
      );

    return Array.from(new Set(parsedStatuses));
  }, [searchParams, availableStatuses]);

  const initialStatusesRef = useRef<string[]>(urlStatuses);
  const initialStatusGroupRef = useRef(urlStatusGroup);
  const hasFetchedInitiallyRef = useRef(false);

  // CREATE ORDER MODAL
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

  const { statusFilter, applicationStatus } = useStatusFilter({
    control: filterControl,
    setValue: setFilterValue,
    label: 'Order Status',
    applicationStatuses: availableStatuses,
    defaultStatuses: initialStatusesRef.current,
  });

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    const currentStatusParam = searchParams.get('status') || '';
    const nextStatusParam = applicationStatus.join(',');

    if (currentStatusParam === nextStatusParam) {
      return;
    }

    if (applicationStatus.length > 0) {
      nextSearchParams.set('status', nextStatusParam);
    } else {
      nextSearchParams.delete('status');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [applicationStatus, searchParams, setSearchParams]);

  useEffect(() => {
    const activeStatuses = hasFetchedInitiallyRef.current
      ? applicationStatus
      : initialStatusesRef.current;

    const activeStatusGroup = hasFetchedInitiallyRef.current
      ? searchParams.get('statusGroup') || undefined
      : initialStatusGroupRef.current;

    if (!deleteOrderModal)
      fetchOrders({
        page,
        size,
        status: activeStatuses.length > 0 ? activeStatuses.join(',') : undefined,
        statusGroup: activeStatusGroup as
          | 'recent'
          | 'pending'
          | 'active'
          | 'completed'
          | undefined,
      });

    if (!hasFetchedInitiallyRef.current) {
      hasFetchedInitiallyRef.current = true;
    }
  }, [page, size, applicationStatus, fetchOrders, deleteOrderModal, searchParams]);

  const { ordersColumns } = useOrdersColumns();

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
          <nav className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <Button
              type="button"
              icon={faUpload}
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                dispatch(setImportBatchModal(true));
              }}
            >
              Import batch orders
            </Button>
            <Button
              type="button"
              primary
              icon={faPlus}
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                dispatch(setCreateOrderModal(true));
              }}
            >
              Create Order
            </Button>
          </nav>
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
      <CreateOrder />
      <DeleteOrder />
      <ImportBatch />
    </main>
  );
};

export default OrdersPage;
