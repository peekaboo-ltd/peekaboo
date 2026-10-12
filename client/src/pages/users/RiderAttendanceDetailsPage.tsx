import Button from '@/components/inputs/Button';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
} from '@/components/layout/InternalPage';
import { UserStatus } from '@/constants/user.constants';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchRiderManagementAttendanceById } from '@/hooks/users/users.hooks';
import { useI18n } from '@/i18n/i18n';
import { formatAttendanceDateTime } from '@/utils/riderMedia.util';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RiderDetailFallback, useRiderManagementBack } from './riderDetailShared';

const RiderAttendanceDetailsPage = () => {
  const { t } = useI18n();
  const { proofId } = useParams();
  const goBack = useRiderManagementBack();
  useDocumentTitle(t('riderManagement.attendanceDocTitle'));

  const {
    fetchRiderManagementAttendanceById,
    attendance,
    isFetching,
    isUninitialized,
    isError,
  } = useFetchRiderManagementAttendanceById();

  useEffect(() => {
    if (!proofId) return;
    fetchRiderManagementAttendanceById(proofId);
  }, [fetchRiderManagementAttendanceById, proofId]);

  if (!proofId) {
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

  if (isError || !attendance) {
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
        title={t('riderManagement.attendanceProof', {
          name: attendance.riderName ? ` - ${attendance.riderName}` : '',
        })}
        description={t('riderManagement.attendanceProofDate', {
          date: attendance.date || '-',
        })}
        actions={
          <Button type="button" onClick={goBack}>
            {t('riderManagement.back')}
          </Button>
        }
      />
      <InternalSectionCard>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-(--muted)">
            {t('riderManagement.attendanceEvent', {
              event:
                attendance.status === UserStatus.ACTIVE
                  ? t('riderManagement.checkIn')
                  : t('riderManagement.checkOut'),
              time: formatAttendanceDateTime(attendance.timestamp),
            })}
          </p>
          {attendance.locationLabel ? (
            <p className="type-meta">
              {t('riderManagement.location')}: {attendance.locationLabel}
            </p>
          ) : null}
          <img
            src={attendance.imageUrl}
            alt={t('riderManagement.proofAlt', {
              name: attendance.riderName || t('riderManagement.rider'),
            })}
            className="w-full max-h-96 object-contain rounded-lg bg-(--surface)"
          />
        </div>
      </InternalSectionCard>
    </InternalPage>
  );
};

export default RiderAttendanceDetailsPage;
