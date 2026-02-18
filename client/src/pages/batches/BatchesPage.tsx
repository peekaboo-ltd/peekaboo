import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/inputs/Button';
import { useFetchBatches } from '@/hooks/batches/batches.hooks';
import { useAppDispatch } from '@/states/hooks';
import { setImportBatchModal } from '@/states/slices/batch.slice';
import { BatchStatus } from '@/types/batch.type';
import type { Batch } from '@/types/batch.type';

const getBatchStatusVariant = (status: BatchStatus): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case BatchStatus.DRAFT:
      return 'secondary';
    case BatchStatus.PENDING:
      return 'default';
    case BatchStatus.PROCESSING:
      return 'default';
    case BatchStatus.COMPLETED:
      return 'default';
    case BatchStatus.FAILED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getBatchStatusColor = (status: BatchStatus): string => {
  switch (status) {
    case BatchStatus.DRAFT:
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case BatchStatus.PENDING:
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case BatchStatus.PROCESSING:
      return 'text-purple-700 bg-purple-50 border-purple-200';
    case BatchStatus.COMPLETED:
      return 'text-green-700 bg-green-50 border-green-200';
    case BatchStatus.FAILED:
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const BatchesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { fetchBatches, batches, isFetching } = useFetchBatches();

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleImport = useCallback(() => {
    dispatch(setImportBatchModal(true));
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your import batches and review draft orders.
          </p>
        </div>
        <Button type="button" primary onClick={handleImport}>
          Import New Batch
        </Button>
      </header>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-900">
            All Batches ({batches.length})
          </h2>
        </div>

        {isFetching ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-slate-500">No batches yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Import a batch to get started.
            </p>
            <Button type="button" primary onClick={handleImport} className="mt-4">
              Import First Batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 text-left text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Created By</th>
                  <th className="px-4 py-3 font-semibold">Created At</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch: Batch, index: number) => (
                  <motion.tr
                    key={batch.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {batch.referenceId}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {batch.name || <span className="text-slate-400 italic text-xs">Unnamed</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBatchStatusColor(batch.status)}`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {batch.orders?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {batch.createdBy?.name || batch.createdBy?.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(batch.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {batch.status === BatchStatus.DRAFT && (
                          <Button
                            type="button"
                            primary
                            onClick={() => navigate(`/batches/${batch.id}/preview`)}
                          >
                            Review
                          </Button>
                        )}
                        <Button
                          type="button"
                          onClick={() => navigate(`/batches/${batch.id}/preview`)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BatchesPage;
