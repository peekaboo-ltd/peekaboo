import Modal from '@/components/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setImportBatchModal } from '@/states/slices/batch.slice';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { cleanPhoneNumber, validateAndFormatPhoneNumber } from '@/utils/phone.util';
import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useImportBulkOrders } from '@/hooks/orders/orders.hooks';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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

const ImportBatch = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { importBatchModal } = useAppSelector((state) => state.batch);
  const [fileName, setFileName] = useState<string>('');
  const [preview, setPreview] = useState<ImportPreviewState>({
    rows: [],
    errors: [],
  });
  const [createBatch, setCreateBatch] = useState<boolean>(false);
  const [batchName, setBatchName] = useState<string>('');
  const [batchDescription, setBatchDescription] = useState<string>('');

  const { importBulkOrders, isLoading, data, isSuccess, isError, error, reset } =
    useImportBulkOrders();

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
    if (preview.rows.length === 0) {
      return true;
    }
    if (preview.errors.length > 0) {
      return true;
    }
    if (createBatch && !batchName.trim()) {
      return true;
    }
    return false;
  }, [batchName, createBatch, preview.errors.length, preview.rows.length]);

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setImportBatchModal(false));
    setFileName('');
    setPreview({ rows: [], errors: [] });
    setCreateBatch(false);
    setBatchName('');
    setBatchDescription('');
    reset();
  }, [dispatch, reset]);

  const parseWorkbook = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryData = event.target?.result;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          setPreview({
            rows: [],
            errors: [
              {
                rowNumber: 1,
                field: 'file',
                message: 'No worksheet found in file',
              },
            ],
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

        const headerRow = trimTrailingEmpty(
          (rows[0] || []).map((value) => String(value || '')),
        );
        const normalizedHeaderRow = headerRow.map(normalizeHeader);

        const normalizedCurrent = TEMPLATE_HEADERS_CURRENT.map(normalizeHeader);
        const normalizedLegacy = TEMPLATE_HEADERS_LEGACY.map(normalizeHeader);

        const matchesCurrent =
          normalizedHeaderRow.length === normalizedCurrent.length &&
          normalizedCurrent.every((header, index) => header === normalizedHeaderRow[index]);
        const matchesLegacy =
          normalizedHeaderRow.length === normalizedLegacy.length &&
          normalizedLegacy.every((header, index) => header === normalizedHeaderRow[index]);

        const headersAreValid = matchesCurrent || matchesLegacy;

        if (!headersAreValid) {
          setPreview({
            rows: [],
            errors: [
              {
                rowNumber: 1,
                field: 'headers',
                message:
                  'Invalid template headers. Please use the official Bulk Import Template.',
              },
            ],
          });
          return;
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

          if (isCompletelyEmpty) {
            return;
          }

          const phoneValidation = validateAndFormatPhoneNumber(cleanPhoneNumber(recipientPhoneNumber)?.formattedNumber || '');
          if (!phoneValidation.isValid || !phoneValidation.formattedNumber) {
            validationErrors.push({
              rowNumber,
              field: 'recipientPhoneNumber',
              message:
                phoneValidation.error || 'Recipient phone number is required and must be valid',
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

        setPreview({
          rows: parsedRows,
          errors: validationErrors,
        });
      } catch {
        setPreview({
          rows: [],
          errors: [
            {
              rowNumber: 1,
              field: 'file',
              message: 'Unable to parse file. Please upload a valid .xlsx template.',
            },
          ],
        });
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const onFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) {
        return;
      }

      const isXlsx =
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.name.toLowerCase().endsWith('.xlsx');
      if (!isXlsx) {
        setPreview({
          rows: [],
          errors: [
            {
              rowNumber: 1,
              field: 'file',
              message: 'Only .xlsx files are supported',
            },
          ],
        });
        return;
      }

      setFileName(selectedFile.name);
      parseWorkbook(selectedFile);
    },
    [parseWorkbook],
  );

  const onSubmit = useCallback(async () => {
    if (hasBlockingErrors) {
      return;
    }

    try {
      const response = await importBulkOrders({
        rows: preview.rows,
        createBatch,
        batch: createBatch
          ? {
              name: batchName.trim(),
              description: batchDescription.trim() || undefined,
            }
          : undefined,
      }).unwrap();

      toast.success(
        `Imported ${response?.data?.summary?.total || preview.rows.length} orders successfully`,
      );
      closeModal();
    } catch (submissionError) {
      const backendErrors = (submissionError as {
        data?: { data?: { errors?: ImportRowValidationError[] } };
      })?.data?.data
        ?.errors as ImportRowValidationError[] | undefined;
      if (backendErrors?.length) {
        setPreview((previous) => ({
          ...previous,
          errors: backendErrors,
        }));
      }
      toast.error('Bulk import failed. Fix highlighted errors and retry.');
    }
  }, [
    batchDescription,
    batchName,
    closeModal,
    createBatch,
    hasBlockingErrors,
    importBulkOrders,
    preview.rows,
    setPreview,
  ]);

  return (
    <Modal
      isOpen={importBatchModal}
      onClose={closeModal}
      heading={`Import Batch Orders`}
      description="Upload the official template, review strict validations, then import."
      className="!max-w-[96vw] !w-[86vw] lg:!w-[78vw]"
    >
      <section className="w-full flex flex-col gap-4 pb-2">
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
                Accepted format: `.xlsx` with exact 5-column template headers.
              </p>
            </div>
            {fileName && <Badge variant="secondary">{fileName}</Badge>}
          </header>
          <label className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-white p-4 cursor-pointer hover:border-primary-900 transition-colors">
            <input
              type="file"
              accept=".xlsx"
              onChange={onFileChange}
              className="hidden"
            />
            <p className="text-sm text-slate-700">Click to select import file</p>
            <p className="text-xs text-slate-500 mt-1">
              Recipient phone is required. Delivery location is optional.
            </p>
          </label>
        </motion.article>

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
                            {rowErrors.length
                              ? `${rowErrors.length} issue(s)`
                              : 'Validated'}
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

        <section className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={createBatch}
              onCheckedChange={(value) => setCreateBatch(Boolean(value))}
            />
            <span className="font-medium text-slate-800">Create batch now</span>
          </label>

          {createBatch && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <Input
                label="Batch Name"
                required
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Morning Kigali Drop-offs"
                errorMessage={
                  !batchName.trim() ? 'Batch name is required when enabled' : undefined
                }
              />
              <label className="w-full flex flex-col gap-1">
                <span className="text-sm font-normal">Batch Description (Optional)</span>
                <Textarea
                  value={batchDescription}
                  onChange={(e) => setBatchDescription(e.target.value)}
                  placeholder="Extra context for this import..."
                  className="min-h-10 h-10 py-2"
                />
              </label>
            </motion.div>
          )}
        </section>

        {isError && (
          <p className="text-sm text-red-700">
            {String((error as {
              data?: { message?: string };
            })?.data?.message || 'Import failed')}
          </p>
        )}
        {isSuccess && data?.data?.summary && (
          <p className="text-sm text-green-700">
            Imported {data.data.summary.total} rows ({data.data.summary.created} created,{' '}
            {data.data.summary.linked} linked).
          </p>
        )}

        <footer className="flex justify-end gap-3 pt-2 border-t">
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
            Import Orders
          </Button>
        </footer>
      </section>
    </Modal>
  );
};

export default ImportBatch;
