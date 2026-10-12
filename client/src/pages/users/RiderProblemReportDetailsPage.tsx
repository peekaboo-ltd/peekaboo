import Button from '@/components/inputs/Button';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
} from '@/components/layout/InternalPage';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useFetchRiderManagementProblemReportById } from '@/hooks/users/users.hooks';
import { useI18n } from '@/i18n/i18n';
import {
  formatAttendanceDateTime,
  getCloudinaryVideoSourceCandidates,
  isLikelyVideoMedia,
  normalizeProblemMediaUrl,
} from '@/utils/riderMedia.util';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RiderDetailFallback, useRiderManagementBack } from './riderDetailShared';

const RiderProblemReportDetailsPage = () => {
  const { t } = useI18n();
  const { reportId } = useParams();
  const goBack = useRiderManagementBack();
  const [videoPreviewError, setVideoPreviewError] = useState(false);
  useDocumentTitle(t('riderManagement.problemDocTitle'));

  const {
    fetchRiderManagementProblemReportById,
    report,
    isFetching,
    isUninitialized,
    isError,
  } = useFetchRiderManagementProblemReportById();

  useEffect(() => {
    if (!reportId) return;
    setVideoPreviewError(false);
    fetchRiderManagementProblemReportById(reportId);
  }, [fetchRiderManagementProblemReportById, reportId]);

  const mediaUrl = useMemo(
    () => normalizeProblemMediaUrl(report?.imageUrl),
    [report?.imageUrl],
  );
  const isVideo = useMemo(
    () => isLikelyVideoMedia(report?.mediaType, mediaUrl),
    [mediaUrl, report?.mediaType],
  );
  const videoSources = useMemo(
    () => getCloudinaryVideoSourceCandidates(mediaUrl),
    [mediaUrl],
  );

  if (!reportId) {
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

  if (isError || !report) {
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
        title={t('riderManagement.problemReport', {
          name: report.riderName ? ` - ${report.riderName}` : '',
        })}
        description={t('riderManagement.reportedAt', {
          time: formatAttendanceDateTime(report.timestamp),
        })}
        actions={
          <Button type="button" onClick={goBack}>
            {t('riderManagement.back')}
          </Button>
        }
      />
      <InternalSectionCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-xs text-(--muted)">
            <p>
              <strong>{t('riderManagement.type')}:</strong>{' '}
              {report.mediaType === 'video'
                ? t('riderManagement.video')
                : t('riderManagement.photo')}
            </p>
            <p>
              <strong>{t('riderManagement.timestamp')}:</strong>{' '}
              {formatAttendanceDateTime(report.timestamp)}
            </p>
            <p>
              <strong>{t('riderManagement.location')}:</strong>{' '}
              {report.locationLabel || '-'}
            </p>
            <p>
              <strong>{t('riderManagement.descriptionLabel')}:</strong>{' '}
              {report.description || '-'}
            </p>
          </div>

          {isVideo ? (
            videoPreviewError ? (
              <div className="w-full rounded-lg bg-(--surface) p-4 text-sm text-(--ink)">
                <p className="font-normal">{t('riderManagement.videoError')}</p>
                {mediaUrl ? (
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-normal text-(--ink) underline"
                  >
                    {t('riderManagement.openVideo')}
                  </a>
                ) : null}
              </div>
            ) : (
              <video
                key={report.id}
                controls
                preload="metadata"
                className="w-full max-h-72 rounded-lg border border-(--line) bg-(--ink)"
                onError={() => setVideoPreviewError(true)}
                onLoadedData={() => setVideoPreviewError(false)}
              >
                {videoSources.map((sourceUrl, sourceIndex) => (
                  <source key={`problem-report-video-source-${sourceIndex}`} src={sourceUrl} />
                ))}
              </video>
            )
          ) : (
            <img
              src={mediaUrl}
              alt={t('riderManagement.problemAlt', {
                name: report.riderName || t('riderManagement.rider'),
              })}
              className="w-full max-h-72 object-contain rounded-lg border border-(--line) bg-(--paper)"
            />
          )}
        </div>
      </InternalSectionCard>
    </InternalPage>
  );
};

export default RiderProblemReportDetailsPage;
