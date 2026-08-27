import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import {
  PublicPageHero,
  PublicSectionCard,
  PublicStatCard,
} from '@/components/layout/PublicPage';
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
import {
  faClipboardList,
  faFileLines,
  faPhoneSlash,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard title="Loading" description="Fetching batch details…">
          <p className="text-sm text-(--muted) text-center py-8">
            Loading batch details...
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  if (!id || (!batch && batchError)) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard title="Not found">
          <p className="text-sm text-(--muted) text-center py-8">Batch not found.</p>
        </PublicSectionCard>
      </main>
    );
  }

  if (!batch) {
    return null;
  }

  return (
    <main className="w-full flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4"
      >
        <PublicPageHero
          eyebrow="Batch"
          title={
            <span className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span>{batch.name || 'Unnamed Batch'}</span>
              <Badge
                variant={batchStatusVariantMap[batch.status] ?? 'outline'}
                className="text-xs font-normal"
              >
                {batch.status}
              </Badge>
            </span>
          }
          description={
            <span>
              Ref: {batch.referenceId} · Created by{' '}
              {batch.createdBy?.name || batch.createdBy?.phoneNumber || 'Unknown'} ·{' '}
              {formatDate(batch.createdAt, 'DD/MM/YYYY HH:mm')}
            </span>
          }
          actions={
            <>
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
            </>
          }
        />

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PublicStatCard
            label="Total orders"
            value={batch.orders?.length ?? 0}
            icon={<FontAwesomeIcon icon={faTableList} className="h-5 w-5" />}
          />
          <PublicStatCard
            label="Draft orders"
            value={draftCount}
            icon={<FontAwesomeIcon icon={faFileLines} className="h-5 w-5" />}
          />
          <PublicStatCard
            label="Current page invalid phones"
            value={invalidCurrentPageCount}
            icon={<FontAwesomeIcon icon={faPhoneSlash} className="h-5 w-5" />}
          />
          <PublicStatCard
            label="Paginated records"
            value={totalCount}
            icon={<FontAwesomeIcon icon={faClipboardList} className="h-5 w-5" />}
          />
        </section>
      </motion.div>

      <PublicSectionCard
        eyebrow="Orders"
        title="Batch orders"
        description="Filter by status or order reference. Pagination applies to this list."
        contentClassName="space-y-4 px-0 pb-0 pt-0 sm:px-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 sm:px-6 pt-5 sm:pt-6">
          {statusFilter}
          <Input
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            placeholder="Search by order reference"
            className="bg-(--paper)"
          />
        </div>
        <div className="px-0 sm:px-0">
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
        </div>
      </PublicSectionCard>
    </main>
  );
};

export default BatchDetailsPage;
