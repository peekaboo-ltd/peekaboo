import { UUID } from '.';
import { Batch } from '../entities/batch.entity';
import { Order } from '../entities/order.entity';

export interface BulkImportRowInput {
  rowNumber: number;
  recipientPhoneNumber: string;
  deliveryLocation?: string;
  productReferenceNo?: string;
  productName?: string;
  description?: string;
}

export interface BulkImportRequest {
  rows: BulkImportRowInput[];
  batch?: {
    name?: string;
    description?: string;
  };
}

export interface BulkImportRowResult {
  rowNumber: number;
  orderId: UUID;
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
  orders: BulkImportRowResult[];
  batch: Pick<Batch, 'id' | 'name' | 'referenceId' | 'status'>;
  createdOrders?: Pick<Order, 'id' | 'referenceId'>[];
  errors: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
}
