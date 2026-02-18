import { BatchStatus } from './batch.type';

export interface ImportTemplateRow {
  rowNumber: number;
  recipientPhoneNumber: string;
  deliveryLocation?: string;
  productReferenceNo?: string;
  productName?: string;
  description?: string;
}

export interface ImportRowValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ImportPreviewState {
  rows: ImportTemplateRow[];
  errors: ImportRowValidationError[];
}

export interface BulkImportOrderResult {
  rowNumber: number;
  orderId: string;
  referenceId: string;
  action: 'created' | 'linked';
}

export interface BulkImportResponse {
  summary: {
    total: number;
    created: number;
    linked: number;
    failed: number;
  };
  orders: BulkImportOrderResult[];
  batch?: {
    id: string;
    name?: string;
    referenceId: string;
    status: BatchStatus;
  };
  errors: ImportRowValidationError[];
}
