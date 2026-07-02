import test from 'node:test';
import assert from 'node:assert/strict';
import { AppDataSource } from '../data-source';
import { PaymentService } from './payment.service';
import { KpayCurrency, KpayPaymentStatus } from '../types/kpay.types';
import { PaymentProvider, UrubutoChannelName } from '../types/urubuto.types';
import { PaymentType } from '../constants/payment.constants';

const paymentId = '22222222-2222-4222-8222-222222222222';
const orderId = '33333333-3333-4333-8333-333333333333';

function createRepositoryMock() {
  const updates: any[] = [];
  return {
    updates,
    save: async (payment: any) => ({
      id: paymentId,
      ...payment,
    }),
    update: async (id: string, patch: any) => {
      updates.push({ id, patch });
      return { affected: 1 };
    },
    findOne: async () => ({ id: orderId, referenceId: 'ORDER-TIMEOUT' }),
  };
}

test('PaymentService.createPayment keeps Urubuto timeout payments pending for reconciliation', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test';
  const repository = createRepositoryMock();
  (AppDataSource.getRepository as any) = () => repository;

  try {
    const service = new PaymentService();
    (service as any).urubutoService = {
      initiatePayment: async () => ({
        success: false,
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'UrubutoPay payment initiation timed out.',
        },
      }),
    };

    const payment = await service.createPayment({
      entityId: orderId,
      amount: 2500,
      currency: KpayCurrency.RWF,
      type: PaymentType.ORDER,
      customerEmail: 'payer@example.com',
      customerName: 'Timeout Payer',
      customerPhone: '250788000000',
      provider: PaymentProvider.URUBUTO,
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(payment.status, KpayPaymentStatus.PENDING);
    assert.equal(payment.metadata.pendingReconciliation, true);
    assert.equal(payment.metadata.reconciliationReason, 'URUBUTO_INITIATION_TIMEOUT');
    assert.equal(repository.updates.at(-1).patch.status, KpayPaymentStatus.PENDING);
    assert.equal(repository.updates.at(-1).patch.metadata.initiationError.code, 'TIMEOUT_ERROR');
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
  }
});
