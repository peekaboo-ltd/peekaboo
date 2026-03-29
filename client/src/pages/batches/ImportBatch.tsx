import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setImportBatchModal } from '@/states/slices/batch.slice';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { cleanPhoneNumber, validateAndFormatPhoneNumber } from '@/utils/phone.util';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Badge } from '@/components/ui/badge';
import { useImportBulkOrders } from '@/hooks/orders/orders.hooks';
import { parseBillingGuardPrompt, type BillingGuardPrompt } from '@/utils/billingGuard.util';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type {
  ImportPreviewState,
  ImportRowValidationError,
  ImportTemplateRow,
} from '@/types/orderImport.type';

const TEMPLATE_HEADERS_CURRENT = [
  'RECIPIENT PHONE NUMBER (+250 7XX XXX XXXX)',
  'DELIVERY LOCATION',
  'PRODUCT REFERENCE NO (OPTIONAL)',
  'DESCRIPTION (OPTIONAL)',
  'NOTES (OPTIONAL)',
] as const;

const TEMPLATE_HEADERS_LEGACY = [
  'RECIPIENT PHONE NUMBER (+250 7XX XXX XXXX)',
  'DELIVERY LOCATION',
  'PRODUCT REFERENCE NO (OPTIONAL)',
  'PRODUCT NAME (OPTIONAL)',
  'DESCRIPTION (OPTIONAL)',
] as const;

/** Single-row example after headers (optional columns may be left empty). */
const TEMPLATE_CSV_EXAMPLE_ROW =
  '+250788123456,Kigali City Tower,REF-001,Electronics sample,Notes here';

const buildBatchImportCsvTemplate = (): string => {
  const esc = (cell: string) =>
    /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  const header = TEMPLATE_HEADERS_CURRENT.map(esc).join(',');
  return `${header}\n${TEMPLATE_CSV_EXAMPLE_ROW}\n`;
};

const normalizeHeader = (value: string) =>
  value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();

const trimTrailingEmpty = (values: string[]) => {
  const copy = [...values];
  while (copy.length > 0 && !copy[copy.length - 1]?.trim()) {
    copy.pop();
  }
  return copy;
};

const MAX_TEXT_LENGTH = 255;

function buildImportPreviewFromGrid(rows: (string | null)[][]): ImportPreviewState {
  const headerRow = trimTrailingEmpty(
    (rows[0] || []).map((value) => String(value || '')),
  );
  const normalizedHeaderRow = headerRow.map(normalizeHeader);

  const normalizedCurrent = TEMPLATE_HEADERS_CURRENT.map(normalizeHeader);
  const normalizedLegacy = TEMPLATE_HEADERS_LEGACY.map(normalizeHeader);

  const matchesCurrent =
    normalizedHeaderRow.length === normalizedCurrent.length &&
    normalizedCurrent.every((h, i) => h === normalizedHeaderRow[i]);
  const matchesLegacy =
    normalizedHeaderRow.length === normalizedLegacy.length &&
    normalizedLegacy.every((h, i) => h === normalizedHeaderRow[i]);

  if (!matchesCurrent && !matchesLegacy) {
    return {
      rows: [],
      errors: [{
        rowNumber: 1,
        field: 'headers',
        message: 'Invalid template headers. Please use the official Bulk Import Template.',
      }],
    };
  }

  const parsedRows: ImportTemplateRow[] = [];
  const validationErrors: ImportRowValidationError[] = [];

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const recipientPhoneNumber = String(row?.[0] || '').trim();
    const deliveryLocation = String(row?.[1] || '').trim();
    const productReferenceNo = String(row?.[2] || '').trim();
    const column4 = String(row?.[3] || '').trim();
    const column5 = String(row?.[4] || '').trim();
    const productName = matchesLegacy ? column4 : undefined;
    const description = matchesLegacy
      ? column5
      : [column4, column5].filter(Boolean).join(' - ');

    const isCompletelyEmpty = [
      recipientPhoneNumber,
      deliveryLocation,
      productReferenceNo,
      productName || '',
      description,
    ].every((value) => !value);

    if (isCompletelyEmpty) return;

    const phoneValidation = validateAndFormatPhoneNumber(
      cleanPhoneNumber(recipientPhoneNumber)?.formattedNumber || '',
    );
    if (!phoneValidation.isValid || !phoneValidation.formattedNumber) {
      validationErrors.push({
        rowNumber,
        field: 'recipientPhoneNumber',
        message: phoneValidation.error || 'Recipient phone number is required and must be valid',
      });
    }

    if (productReferenceNo.length > MAX_TEXT_LENGTH) {
      validationErrors.push({
        rowNumber,
        field: 'productReferenceNo',
        message: `Product reference cannot exceed ${MAX_TEXT_LENGTH} characters`,
      });
    }

    if ((productName?.length ?? 0) > MAX_TEXT_LENGTH) {
      validationErrors.push({
        rowNumber,
        field: 'productName',
        message: `Product name cannot exceed ${MAX_TEXT_LENGTH} characters`,
      });
    }

    parsedRows.push({
      rowNumber,
      recipientPhoneNumber: phoneValidation.formattedNumber || recipientPhoneNumber,
      deliveryLocation: deliveryLocation || undefined,
      productReferenceNo: productReferenceNo || undefined,
      productName: productName || undefined,
      description: description || undefined,
    });
  });

  if (!parsedRows.length) {
    validationErrors.push({
      rowNumber: 2,
      field: 'rows',
      message: 'No valid data rows found. Add at least one order row.',
    });
  }

  return { rows: parsedRows, errors: validationErrors };
}

interface ImportBatchFormData {
  batchName: string;
}

const ImportBatch = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { importBatchModal } = useAppSelector((state) => state.batch);
  const [fileName, setFileName] = useState<string>('');
  const [billingGuardPrompt, setBillingGuardPrompt] = useState<BillingGuardPrompt | null>(null);
  const [preview, setPreview] = useState<ImportPreviewState>({
    rows: [],
    errors: [],
  });

  const { register, getValues, reset: resetForm } = useForm<ImportBatchFormData>({
    defaultValues: { batchName: '' },
  });

  const { importBulkOrders, isLoading, isError, error, reset } = useImportBulkOrders();

  const errorsByRow = useMemo(() => {
    return preview.errors.reduce<Record<number, ImportRowValidationError[]>>(
      (acc, rowError) => {
        if (!acc[rowError.rowNumber]) {
          acc[rowError.rowNumber] = [];
        }
        acc[rowError.rowNumber].push(rowError);
        return acc;
      },
      {},
    );
  }, [preview.errors]);

  const hasBlockingErrors = useMemo(() => {
    if (preview.rows.length === 0) return true;
    if (preview.errors.length > 0) return true;
    return false;
  }, [preview.errors.length, preview.rows.length]);

  const closeModal = useCallback(() => {
    dispatch(setImportBatchModal(false));
    setFileName('');
    setPreview({ rows: [], errors: [] });
    resetForm();
    reset();
  }, [dispatch, reset, resetForm]);

  const parseWorkbook = useCallback((file: File, format: 'xlsx' | 'csv') => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let workbook: XLSX.WorkBook;
        if (format === 'csv') {
          const text = String(event.target?.result ?? '');
          workbook = XLSX.read(text, { type: 'string', raw: false });
        } else {
          workbook = XLSX.read(event.target?.result as string, { type: 'binary' });
        }

        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          setPreview({
            rows: [],
            errors: [{ rowNumber: 1, field: 'file', message: 'No worksheet found in file' }],
          });
          return;
        }

        const sheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json<(string | null)[]>(sheet, {
          header: 1,
          blankrows: false,
          defval: '',
          raw: false,
        });

        setPreview(buildImportPreviewFromGrid(rows));
      } catch {
        setPreview({
          rows: [],
          errors: [{
            rowNumber: 1,
            field: 'file',
            message: 'Unable to parse file. Please upload a valid .xlsx or .csv template.',
          }],
        });
      }
    };

    if (format === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }, []);

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      const lower = selectedFile.name.toLowerCase();
      const isXlsx =
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        lower.endsWith('.xlsx');
      const isCsv =
        selectedFile.type === 'text/csv' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        lower.endsWith('.csv');

      if (!isXlsx && !isCsv) {
        setPreview({
          rows: [],
          errors: [{ rowNumber: 1, field: 'file', message: 'Only .xlsx or .csv files are supported' }],
        });
        return;
      }

      setFileName(selectedFile.name);
      parseWorkbook(selectedFile, isCsv ? 'csv' : 'xlsx');
    },
    [parseWorkbook],
  );

  const downloadCsvTemplate = useCallback(() => {
    const csv = '\uFEFF' + buildBatchImportCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'peekaboo-batch-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const onSubmit = useCallback(async () => {
    if (hasBlockingErrors) return;

    const batchName = getValues('batchName')?.trim();

    try {
      const response = await importBulkOrders({
        rows: preview.rows,
        batch: batchName ? { name: batchName } : undefined,
      }).unwrap();

      const batchId = response?.data?.batch?.id;
      toast.success(`Batch created with ${preview.rows.length} orders. Review before completing.`);
      closeModal();

      if (batchId) {
        navigate(`/batches/${batchId}/preview`);
      } else {
        navigate('/batches');
      }
    } catch (submissionError) {
      const billingPrompt = parseBillingGuardPrompt(submissionError);
      if (billingPrompt) {
        setBillingGuardPrompt(billingPrompt);
        dispatch(setImportBatchModal(false));
        return;
      }

      const backendErrors = (submissionError as {
        data?: { data?: { errors?: ImportRowValidationError[] } };
      })?.data?.data?.errors as ImportRowValidationError[] | undefined;

      if (backendErrors?.length) {
        setPreview((previous) => ({ ...previous, errors: backendErrors }));
      }
      toast.error('Bulk import failed. Fix highlighted errors and retry.');
    }
  }, [closeModal, dispatch, getValues, hasBlockingErrors, importBulkOrders, navigate, preview?.rows]);

  const closeBillingGuardModal = useCallback(() => {
    setBillingGuardPrompt(null);
  }, []);

  const handlePayFirst = useCallback(() => {
    setBillingGuardPrompt(null);
    navigate('/billing-payments');
  }, [navigate]);

  return (
    <>
      <Modal
        isOpen={importBatchModal}
        onClose={closeModal}
        heading="Import Batch Orders"
        description="Upload the official template, review, then complete the batch after validating."
        className="!max-w-[96vw] !w-[86vw] lg:!w-[78vw]"
      >
        <section className="w-full flex flex-col gap-4 pb-2">
        {/* File Upload */}
        <motion.article
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4"
        >
          <header className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-900">
                Template Upload
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Accepted formats: <code>.xlsx</code> or <code>.csv</code> with exact 5-column template headers.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" className="text-xs py-1.5 px-3" onClick={downloadCsvTemplate}>
                Download CSV template
              </Button>
              {fileName && <Badge variant="secondary">{fileName}</Badge>}
            </div>
          </header>
          <label className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-white p-4 cursor-pointer hover:border-primary-900 transition-colors">
            <input type="file" accept=".xlsx,.csv,text/csv" onChange={onFileChange} className="hidden" />
            <p className="text-sm text-slate-700">Click to select import file</p>
            <p className="text-xs text-slate-500 mt-1">
              Recipient phone is required. Delivery location, product ref, and description are optional.
            </p>
          </label>
        </motion.article>

        {/* Validation Errors */}
        {preview.errors.length > 0 && (
          <motion.article
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 sticky top-0 z-20"
          >
            <h4 className="text-sm font-semibold text-red-800">
              Validation Issues ({preview.errors.length})
            </h4>
            <ul className="mt-2 space-y-1 text-xs text-red-700 max-h-36 overflow-y-auto">
              {preview.errors.map((item, idx) => (
                <li key={`${item.rowNumber}-${item.field}-${idx}`}>
                  Row {item.rowNumber} · {item.field}: {item.message}
                </li>
              ))}
            </ul>
          </motion.article>
        )}

        {/* Preview Table */}
        {preview.rows.length > 0 && (
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <header className="px-4 py-3 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-900">
                Preview ({preview.rows.length} rows)
              </h4>
              <Badge variant={preview.errors.length ? 'destructive' : 'secondary'}>
                {preview.errors.length ? 'Blocked' : 'Ready'}
              </Badge>
            </header>
            <section className="overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Row</th>
                    <th className="text-left px-3 py-2">Recipient Phone</th>
                    <th className="text-left px-3 py-2">Delivery Location</th>
                    <th className="text-left px-3 py-2">Product Ref</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, index) => {
                    const rowErrors = errorsByRow[row.rowNumber] || [];
                    return (
                      <motion.tr
                        key={`${row.rowNumber}-${index}`}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.015 }}
                        className="border-b border-slate-100"
                      >
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.recipientPhoneNumber}</td>
                        <td className="px-3 py-2">
                          {row.deliveryLocation || (
                            <span className="text-slate-400 italic">Optional</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{row.productReferenceNo || '-'}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={rowErrors.length ? 'destructive' : 'secondary'}
                            className="text-[10px]"
                          >
                            {rowErrors.length ? `${rowErrors.length} issue(s)` : 'Validated'}
                          </Badge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </motion.article>
        )}

        {/* Batch Name Field */}
        <motion.article
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Batch Details (Optional)</h3>
          <Input
            label="Batch Name"
            placeholder="e.g. Morning Kigali Drop-offs"
            {...register('batchName')}
          />
          <p className="text-xs text-slate-500 mt-1">
            Leave blank to create an unnamed batch. You can review and edit all orders on the next page.
          </p>
        </motion.article>

        {isError && (
          <p className="text-sm text-red-700">
            {String((error as { data?: { message?: string } })?.data?.message || 'Import failed')}
          </p>
        )}

        <footer className="flex justify-between gap-3 pt-2 border-t">
          <Button type="button" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            primary
            onClick={onSubmit}
            disabled={hasBlockingErrors || isLoading}
            isLoading={isLoading}
          >
            Create Batch &amp; Review
          </Button>
        </footer>
        </section>
      </Modal>

      <Modal
        isOpen={Boolean(billingGuardPrompt)}
        onClose={closeBillingGuardModal}
        heading={billingGuardPrompt?.title || 'Billing Action Needed'}
        description={billingGuardPrompt?.description || ''}
      >
        <section className="flex flex-col gap-4">
          {billingGuardPrompt?.billingStatus ? (
            <p className="text-sm text-slate-600">
              Billing status:{' '}
              <span className="font-medium text-slate-900">
                {billingGuardPrompt.billingStatus}
              </span>
            </p>
          ) : null}
          <footer className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" onClick={closeBillingGuardModal}>
              Close
            </Button>
            <Button type="button" primary onClick={handlePayFirst}>
              Pay First To Continue
            </Button>
          </footer>
        </section>
      </Modal>
    </>
  );
};

export default ImportBatch;
