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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const BillingReportPage = () => {
  useDocumentTitle('Billing Report');

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
      toast.error('Please sign in again to download report.');
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
        throw new Error('Unable to download report');
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
      toast.success('Business report downloaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download report.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleEmailReport = async () => {
    const token = localStorageUtil.getItem('token');
    if (!token) {
      toast.error('Please sign in again to email report.');
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
        throw new Error('Unable to email report');
      }

      toast.success('Business report sent to your email.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to email report.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <InternalPage>
      <motion.section variants={itemVariants}>
        <InternalPageHeader
          eyebrow="Billing & Payments"
          title="Report"
          description="Generate a complete business report with graph, pie chart, and completed deliveries table."
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <InternalSectionCard
          eyebrow="Report Range"
          title="Business Report"
          description="Monthly reports are also sent automatically on the 1st."
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
                Download Report
              </Button>
              <Button
                type="button"
                submit
                disabled={isBusy}
                isLoading={isBusy}
                onClick={handleEmailReport}
              >
                Email Report
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Start date
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-700">
              End date
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Provided by Peekaboo. Any enquiry: +250 788 000 000 | info@peekaboo.co.rw
          </p>
        </InternalSectionCard>
      </motion.section>
    </InternalPage>
  );
};

export default BillingReportPage;

