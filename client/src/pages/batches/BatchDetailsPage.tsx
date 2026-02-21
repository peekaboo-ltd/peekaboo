import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Table from '@/components/table/Table';
import { Badge } from '@/components/ui/badge';
import { useGetBatchById } from '@/hooks/batches/batches.hooks';
import { useStatusFilter } from '@/hooks/common/filters.hooks';
import { useFetchOrders } from '@/hooks/orders/orders.hooks';
import { useAppSelector } from '@/states/hooks';
import { BatchStatus } from '@/types/batch.type';
import { OrderStatus } from '@/types/order.type';
import type { UUID } from '@/types';
import { validateAndFormatPhoneNumber } from '@/utils/phone.util';
import { formatDate } from '@/utils/strings.util';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrdersColumns } from '@/hooks/orders/columns.orders';

const batchStatusVariantMap: Record<
  BatchStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [BatchStatus.DRAFT]: 'secondary',
  [BatchStatus.PENDING]: 'outline',
  [BatchStatus.PROCESSING]: 'default',
  [BatchStatus.COMPLETED]: 'default',
  [BatchStatus.FAILED]: 'destructive',
};

const BatchDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ordersList } = useAppSelector((state) => state.order);

  const { control: filterControl, setValue: setFilterValue } = useForm();
  const [referenceFilter, setReferenceFilter] = useState('');

  const availableStatuses = useMemo(() => Object.values(OrderStatus), []);
  const { statusFilter, applicationStatus } = useStatusFilter({
    control: filterControl,
    setValue: setFilterValue,
    label: 'Order Status',
    applicationStatuses: availableStatuses,
  });

  const {
    fetchBatchById,
    batch,
    isFetching: isFetchingBatch,
    error: batchError,
  } = useGetBatchById();

  const {
    fetchOrders,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalCount,
    isFetching: isFetchingOrders,
  } = useFetchOrders();

  useEffect(() => {
    if (id) {
      fetchBatchById(id as UUID);
    }
  }, [fetchBatchById, id]);

  useEffect(() => {
    if (!id) return;

    fetchOrders({
      page,
      size,
      batchId: id as UUID,
      status:
        applicationStatus.length > 0 ? applicationStatus.join(',') : undefined,
      referenceId: referenceFilter.trim() || undefined,
    });
  }, [applicationStatus, fetchOrders, id, page, referenceFilter, size]);

  useEffect(() => {
    setPage(0);
  }, [applicationStatus, referenceFilter, setPage]);

  const invalidCurrentPageCount = useMemo(
    () =>
      ordersList.filter((order) => {
        const phone = order.recipient?.phoneNumber || '';
        return !validateAndFormatPhoneNumber(phone).isValid;
      }).length,
    [ordersList],
  );

  const draftCount = useMemo(
    () =>
      (batch?.orders || []).filter((order) => order.status === OrderStatus.DRAFT)
        .length,
    [batch?.orders],
  );

  const { ordersColumns } = useOrdersColumns();


  if (isFetchingBatch && !batch) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading batch details...</div>
      </div>
    );
  }

  if (!id || (!batch && batchError)) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-sm text-slate-500">Batch not found.</div>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  return (
    <main className="w-full flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-black">
                {batch.name || 'Unnamed Batch'}
              </h1>
              <Badge
                variant={batchStatusVariantMap[batch.status] ?? 'outline'}
                className="text-[11px]"
              >
                {batch.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ref: {batch.referenceId} · Created by{' '}
              {batch.createdBy?.name || batch.createdBy?.phoneNumber || 'Unknown'} ·{' '}
              {formatDate(batch.createdAt, 'DD/MM/YYYY HH:mm')}
            </p>
          </article>
          <menu className="flex items-center gap-2 flex-wrap">
            <Button type="button" onClick={() => navigate('/batches')}>
              Back to Batches
            </Button>
            {batch.status === BatchStatus.DRAFT && (
              <Button
                type="button"
                primary
                onClick={() => navigate(`/batches/${batch.id}/preview`)}
              >
                Open Preview
              </Button>
            )}
          </menu>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total orders',
              value: batch.orders?.length ?? 0,
            },
            {
              label: 'Draft orders',
              value: draftCount,
            },
            {
              label: 'Current page invalid phones',
              value: invalidCurrentPageCount,
            },
            {
              label: 'Paginated records',
              value: totalCount,
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {card.value}
              </p>
            </article>
          ))}
        </section>

        <fieldset className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusFilter}
          <Input
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            placeholder="Search by order reference"
            className="bg-white"
          />
        </fieldset>
      </motion.header>

      <section className="w-full flex flex-col gap-4">
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
          isLoading={isFetchingOrders}
          noDataMessage="No orders found for this batch and filters."
        />
      </section>
    </main>
  );
};

export default BatchDetailsPage;
