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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
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
          description="Generate a business report that includes delivery activity and the current billing breakdown for your organization."
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <InternalSectionCard
          eyebrow="Report Range"
          title="Business Report"
          description="Monthly reports are also sent automatically on the 1st, and current-period billing totals remain estimates until the cycle closes."
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
            <label className="text-sm text-(--ink)">
              Start date
              <input
                type="date"
                className="mt-1 h-11 w-full rounded-(--radius-control) border-0 bg-(--surface) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="text-sm text-(--ink)">
              End date
              <input
                type="date"
                className="mt-1 h-11 w-full rounded-(--radius-control) border-0 bg-(--surface) px-3 text-sm outline-none focus:shadow-[var(--ink)_0_0_0_2px_inset]"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
          </div>
          <div className="mt-4 rounded border border-(--line) bg-(--surface) p-4 text-sm text-(--ink)">
            <p className="font-medium">What the report includes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Current billing breakdown details from the server for the active billing record.</li>
              <li>Delivery activity for the selected report period.</li>
              <li>Early-period billing totals that may still change until the billing cycle ends.</li>
            </ul>
          </div>
          <p className="mt-3 text-sm text-(--muted)">
            Provided by Peekaboo. Any enquiry: +250 788 000 000 | info@peekaboo.co.rw
          </p>
        </InternalSectionCard>
      </motion.section>
    </InternalPage>
  );
};

export default BillingReportPage;
