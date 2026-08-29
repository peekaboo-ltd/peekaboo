import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { localStorageUtil } from '@/utils/localStorage.util';
import { ENVIRONMENTS } from '@/constants/environments.constants';
import Button from '@/components/inputs/Button';
import {
  InternalPage,
  InternalPageHeader,
  InternalSectionCard,
} from '@/components/layout/InternalPage';
import { controlClassName } from '@/components/inputs/control';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/i18n';

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const BillingReportPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('billing.reportDocTitle'));

  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  const [startDate, setStartDate] = useState(formatDateInput(defaultStart));
  const [endDate, setEndDate] = useState(formatDateInput(today));
  const [isBusy, setIsBusy] = useState(false);

  const handleDownloadReport = async () => {
    const token = localStorageUtil.getItem('token');
    if (!token) {
      toast.error(t('billing.signInDownload'));
      return;
    }

    setIsBusy(true);
    try {
      const query = new URLSearchParams({ startDate, endDate });
      const response = await fetch(
        `${ENVIRONMENTS.API_URL}/dashboard/business-report/download?${query.toString()}`,
        {
          method: 'GET',
          headers: { authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(t('billing.reportDownloadError'));
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `peekaboo_business_report_${startDate}_${endDate}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success(t('billing.reportDownloaded'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('billing.reportDownloadError'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleEmailReport = async () => {
    const token = localStorageUtil.getItem('token');
    if (!token) {
      toast.error(t('billing.signInEmail'));
      return;
    }

    setIsBusy(true);
    try {
      const query = new URLSearchParams({ startDate, endDate });
      const response = await fetch(
        `${ENVIRONMENTS.API_URL}/dashboard/business-report/email?${query.toString()}`,
        {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error(t('billing.reportEmailError'));
      }

      toast.success(t('billing.reportEmailed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('billing.reportEmailError'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow={t('billing.title')}
          title={t('billing.report')}
          description={t('billing.reportPageDescription')}
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <InternalSectionCard
          eyebrow={t('billing.reportRange')}
          title={t('billing.businessReport')}
          description={t('billing.reportSchedule')}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                submit
                primary
                disabled={isBusy}
                isLoading={isBusy}
                onClick={handleDownloadReport}
              >
                {t('billing.downloadReport')}
              </Button>
              <Button
                type="button"
                submit
                disabled={isBusy}
                isLoading={isBusy}
                onClick={handleEmailReport}
              >
                {t('billing.emailReport')}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm text-(--ink)">
              {t('billing.startDate')}
              <input
                type="date"
                className={cn(controlClassName, 'mt-1 px-3')}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="text-sm text-(--ink)">
              {t('billing.endDate')}
              <input
                type="date"
                className={cn(controlClassName, 'mt-1 px-3')}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 rounded bg-(--surface) p-4 text-sm text-(--ink)">
            <p className="font-normal">{t('billing.reportIncludes')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{t('billing.reportIncludesBreakdown')}</li>
              <li>{t('billing.reportIncludesActivity')}</li>
              <li>{t('billing.reportIncludesEstimate')}</li>
            </ul>
          </div>
          <p className="mt-3 text-sm text-(--muted)">
            {t('billing.reportContact')}
          </p>
        </InternalSectionCard>
      </motion.section>
    </InternalPage>
  );
};

export default BillingReportPage;
