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
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ordersList } = useAppSelector((state) => state.order);

  const { control: filterControl, setValue: setFilterValue } = useForm();
  const [referenceFilter, setReferenceFilter] = useState('');

  const availableStatuses = useMemo(() => Object.values(OrderStatus), []);
  const { statusFilter, applicationStatus } = useStatusFilter({
    control: filterControl,
    setValue: setFilterValue,
    label: t('orders.status'),
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
        <PublicSectionCard title={t('batch.loading')} description={t('batch.fetching')}>
          <p className="text-sm text-(--muted) text-center py-8">
            {t('batch.fetching')}
          </p>
        </PublicSectionCard>
      </main>
    );
  }

  if (!id || (!batch && batchError)) {
    return (
      <main className="w-full flex flex-col gap-6">
        <PublicSectionCard title={t('batch.notFoundTitle')}>
          <p className="text-sm text-(--muted) text-center py-8">{t('batch.notFound')}</p>
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
          eyebrow={t('batch.eyebrow')}
          title={
            <span className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span>{batch.name || t('batch.unnamed')}</span>
              <Badge
                variant={batchStatusVariantMap[batch.status] ?? 'outline'}
                className="text-xs font-normal"
              >
                {t(`status.${batch.status.toLowerCase()}`)}
              </Badge>
            </span>
          }
          description={
            <span>{t('batch.summary', {
              reference: batch.referenceId,
              creator: batch.createdBy?.name || batch.createdBy?.phoneNumber || t('batch.unknown'),
              date: formatDate(batch.createdAt, 'DD/MM/YYYY HH:mm'),
            })}</span>
          }
          actions={
            <>
              <Button type="button" onClick={() => navigate('/batches')}>
                {t('batch.back')}
              </Button>
              {batch.status === BatchStatus.DRAFT && (
                <Button
                  type="button"
                  primary
                  onClick={() => navigate(`/batches/${batch.id}/preview`)}
                >
                  {t('batch.openPreview')}
                </Button>
              )}
            </>
          }
        />

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PublicStatCard
            label={t('batch.totalOrders')}
            value={batch.orders?.length ?? 0}
            icon={<FontAwesomeIcon icon={faTableList} className="h-5 w-5" />}
          />
          <PublicStatCard
            label={t('batch.draftOrders')}
            value={draftCount}
            icon={<FontAwesomeIcon icon={faFileLines} className="h-5 w-5" />}
          />
          <PublicStatCard
            label={t('batch.invalidPhones')}
            value={invalidCurrentPageCount}
            icon={<FontAwesomeIcon icon={faPhoneSlash} className="h-5 w-5" />}
          />
          <PublicStatCard
            label={t('batch.paginatedRecords')}
            value={totalCount}
            icon={<FontAwesomeIcon icon={faClipboardList} className="h-5 w-5" />}
          />
        </section>
      </motion.div>

      <PublicSectionCard
        eyebrow={t('batches.orders')}
        title={t('batch.ordersTitle')}
        description={t('batch.ordersDescription')}
        contentClassName="space-y-4 px-0 pb-0 pt-0 sm:px-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 sm:px-6 pt-5 sm:pt-6">
          {statusFilter}
          <Input
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            placeholder={t('batch.searchOrder')}
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
            noDataMessage={t('batch.ordersEmpty')}
          />
        </div>
      </PublicSectionCard>
    </main>
  );
};

export default BatchDetailsPage;
