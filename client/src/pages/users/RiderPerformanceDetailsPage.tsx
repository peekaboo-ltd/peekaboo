import { StatusBadge } from '@/components/inputs/StatusBadge';
import Button from '@/components/inputs/Button';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
} from '@/components/layout/InternalPage';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchRiderManagementPerformanceByRiderId } from '@/hooks/users/users.hooks';
import { useI18n } from '@/i18n/i18n';
import { formatCurrency, formatNumbers } from '@/utils/strings.util';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RiderDetailFallback, useRiderManagementBack } from './riderDetailShared';

const RiderPerformanceDetailsPage = () => {
  const { t } = useI18n();
  const { riderId } = useParams();
  const [searchParams] = useSearchParams();
  const goBack = useRiderManagementBack();
  useDocumentTitle(t('riderManagement.performanceDocTitle'));

  const {
    fetchRiderManagementPerformanceByRiderId,
    rider,
    isFetching,
    isUninitialized,
    isError,
  } = useFetchRiderManagementPerformanceByRiderId();

  const timeframe = searchParams.get('timeframe') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const search = searchParams.get('search') || undefined;
  const riderStatus = searchParams.get('status') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = searchParams.get('sortOrder') || undefined;

  useEffect(() => {
    if (!riderId) return;
    fetchRiderManagementPerformanceByRiderId({
      riderId,
      timeframe,
      startDate,
      endDate,
      search,
      status: riderStatus,
      sortBy,
      sortOrder,
    });
  }, [
    endDate,
    fetchRiderManagementPerformanceByRiderId,
    riderId,
    riderStatus,
    search,
    sortBy,
    sortOrder,
    startDate,
    timeframe,
  ]);

  if (!riderId) {
    return (
      <RiderDetailFallback
        message={t('riderManagement.notFound')}
        backLabel={t('riderManagement.back')}
        onBack={goBack}
      />
    );
  }

  if (isUninitialized || isFetching) {
    return (
      <RiderDetailFallback
        loading
        message={t('riderManagement.loadingDetails')}
        backLabel={t('riderManagement.back')}
        onBack={goBack}
      />
    );
  }

  if (isError || !rider) {
    return (
      <RiderDetailFallback
        message={t('riderManagement.notFound')}
        backLabel={t('riderManagement.back')}
        onBack={goBack}
      />
    );
  }

  return (
    <InternalPage>
      <InternalPageHeader
        title={t('riderManagement.details', {
          name: rider.riderName ? ` - ${rider.riderName}` : '',
        })}
        description={t('riderManagement.detailsDescription')}
        actions={
          <Button type="button" onClick={goBack}>
            {t('riderManagement.back')}
          </Button>
        }
      />
      <InternalSectionCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p><strong>{t('riderManagement.name')}:</strong> {rider.riderName || '-'}</p>
          <p><strong>{t('riderManagement.email')}:</strong> {rider.riderEmail || '-'}</p>
          <p><strong>{t('riderManagement.phone')}:</strong> {rider.riderPhoneNumber || '-'}</p>
          <p className="flex items-center gap-2">
            <strong>{t('common.status')}:</strong> <StatusBadge status={rider.riderStatus} />
          </p>
          <p><strong>{t('riderManagement.rank')}:</strong> #{rider.rank}</p>
          <p><strong>{t('riderManagement.totalDeliveries')}:</strong> {formatNumbers(rider.totalDeliveriesCompleted) || '0'}</p>
          <p><strong>{t('riderManagement.totalEarnings')}:</strong> {formatCurrency(rider.totalEarnings, 'RWF') || 'RWF 0'}</p>
          <p><strong>{t('riderManagement.canceled')}:</strong> {formatNumbers(rider.canceledDeliveries) || '0'}</p>
          <p><strong>{t('riderManagement.failed')}:</strong> {formatNumbers(rider.failedDeliveries) || '0'}</p>
          <p><strong>{t('riderManagement.activeDays')}:</strong> {formatNumbers(rider.activeDays) || '0'}</p>
          <p><strong>{t('riderManagement.activeHours')}:</strong> {formatNumbers(rider.activeHours) || '0'}</p>
        </div>
      </InternalSectionCard>
    </InternalPage>
  );
};

export default RiderPerformanceDetailsPage;
