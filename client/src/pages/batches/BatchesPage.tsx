import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Table from '@/components/table/Table';
import { useBatchesColumns } from '@/hooks/batches/columns.batches';
import { useFetchBatches } from '@/hooks/batches/batches.hooks';
import { useStatusFilter } from '@/hooks/common/filters.hooks';
import { useAppDispatch } from '@/states/hooks';
import { setImportBatchModal } from '@/states/slices/batch.slice';
import type { Batch } from '@/types/batch.type';
import { BatchStatus } from '@/types/batch.type';
import {
  faBoxesPacking,
  faClockRotateLeft,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import ImportBatch from './ImportBatch';
import { useI18n } from '@/i18n/i18n';

const BatchesPage = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { fetchBatches, batches, isFetching } = useFetchBatches();

  const { control: filterControl, setValue: setFilterValue } = useForm();
  const [referenceFilter, setReferenceFilter] = useState('');

  const availableStatuses = useMemo(() => Object.values(BatchStatus), []);
  const { statusFilter, applicationStatus } = useStatusFilter({
    control: filterControl,
    setValue: setFilterValue,
    label: t('batches.status'),
    applicationStatuses: availableStatuses,
  });

  useEffect(() => {
    fetchBatches({});
  }, [fetchBatches]);

  const handleImport = useCallback(() => {
    dispatch(setImportBatchModal(true));
  }, [dispatch]);

  const filteredBatches = useMemo(() => {
    const normalizedReferenceFilter = referenceFilter.trim().toLowerCase();

    return batches.filter((batch) => {
      const hasStatusMatch =
        applicationStatus.length === 0 || applicationStatus.includes(batch.status);
      const hasReferenceMatch =
        normalizedReferenceFilter.length === 0 ||
        batch.referenceId.toLowerCase().includes(normalizedReferenceFilter);

      return hasStatusMatch && hasReferenceMatch;
    });
  }, [applicationStatus, batches, referenceFilter]);

  const draftCount = useMemo(
    () => batches.filter((batch) => batch.status === BatchStatus.DRAFT).length,
    [batches],
  );
  const pendingCount = useMemo(
    () =>
      batches.filter(
        (batch) =>
          batch.status === BatchStatus.PENDING ||
          batch.status === BatchStatus.PROCESSING,
      ).length,
    [batches],
  );
  const completedCount = useMemo(
    () => batches.filter((batch) => batch.status === BatchStatus.COMPLETED).length,
    [batches],
  );

  const { batchesColumns } = useBatchesColumns({
    onView: (batch: Batch) => navigate(`/batches/${batch.id}`),
    onReview: (batch: Batch) => navigate(`/batches/${batch.id}/preview`),
  });

  return (
    <main className="w-full flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4"
      >
        <section className="flex items-start justify-between gap-4 flex-wrap">
          <article>
            <h1 className="type-page-title">{t('batches.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('batches.description')}
            </p>
          </article>
          <menu className="flex items-center gap-2 flex-wrap">
            <Button type="button" primary onClick={handleImport}>
              {t('batches.importNew')}
            </Button>
          </menu>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: t('batches.total'),
              value: batches.length,
              icon: faBoxesPacking,
            },
            {
              label: t('batches.draftPending'),
              value: draftCount + pendingCount,
              icon: faClockRotateLeft,
            },
            {
              label: t('batches.completed'),
              value: completedCount,
              icon: faCircleCheck,
            },
          ].map((card) => (
            <article
              key={card.label}
              className="bg-(--paper) border border-(--line) rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="type-meta">
                  {card.label}
                </p>
                <p className="type-metric mt-1">
                  {card.value}
                </p>
              </div>
              <span className="w-10 h-10 rounded-lg bg-(--ink) flex items-center justify-center text-(--paper)">
                <FontAwesomeIcon icon={card.icon} />
              </span>
            </article>
          ))}
        </section>

        <fieldset className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusFilter}
          <Input
            value={referenceFilter}
            onChange={(e) => setReferenceFilter(e.target.value)}
            placeholder={t('batches.searchReference')}
            className="bg-(--paper)"
          />
        </fieldset>
      </motion.header>

      <section className="w-full flex flex-col gap-4">
        <Table
          columns={batchesColumns}
          data={filteredBatches}
          isLoading={isFetching}
          showPagination={false}
          noDataMessage={t('batches.empty')}
        />
      </section>
      <ImportBatch />
    </main>
  );
};

export default BatchesPage;
