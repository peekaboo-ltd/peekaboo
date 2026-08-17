import test from 'node:test';
import assert from 'node:assert/strict';
import { AppDataSource } from '../data-source';
import { PaymentService } from './payment.service';
import { KpayCurrency, KpayPaymentStatus } from '../types/kpay.types';
import {
  PaymentProvider,
  UrubutoChannelName,
  UrubutoTransactionStatus,
} from '../types/urubuto.types';
import { PaymentType } from '../constants/payment.constants';
import { DEVELOPMENT_PAYMENT_AMOUNT_RWF } from '../helpers/paymentMode.helper';
import { ValidationError } from '../helpers/errors.helper';

const paymentId = '22222222-2222-4222-8222-222222222222';
const orderId = '33333333-3333-4333-8333-333333333333';

function withEnv(
  env: Record<string, string | undefined>,
  run: () => Promise<void>,
): Promise<void> {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    previous[key] = process.env[key];
    const value = env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return run().finally(() => {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  });
}

function createRepositoryMock(orderOverrides: Record<string, any> = {}) {
  const saves: any[] = [];
  const updates: any[] = [];
  let savedPayment: any = null;

  return {
    saves,
    updates,
    save: async (payment: any) => {
      if (payment.amount === undefined || !payment.currency) {
        return { id: 'audit-log-1', ...payment };
      }
      const saved = {
        id: paymentId,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...payment,
      };
      savedPayment = saved;
      saves.push(saved);
      return saved;
    },
    update: async (id: string, patch: any) => {
      updates.push({ id, patch });
      if (savedPayment && savedPayment.id === id) {
        savedPayment = { ...savedPayment, ...patch };
      }
      return { affected: 1 };
    },
    findOne: async (options?: { where?: Record<string, any> }) => {
      const where = options?.where || {};
      if (
        where.id === paymentId &&
        where.entityId &&
        savedPayment?.entityId !== where.entityId
      ) {
        return null;
      }
      if (where.id === paymentId || (savedPayment && where.id === savedPayment.id)) {
        return savedPayment;
      }
      if (where.orderId) {
        return null;
      }
      if (where.entityId || where.referenceId || where.id === orderId) {
        return {
          id: orderId,
          referenceId: 'ORDER-TIMEOUT',
          finalFee: 2500,
          initialFee: 1500,
          sender: { name: 'Sender' },
          recipient: { name: 'Recipient' },
          notes: 'Test order',
          description: 'Test description',
          activities: [],
          ...orderOverrides,
        };
      }
      return savedPayment || {
        id: orderId,
        referenceId: 'ORDER-TIMEOUT',
        finalFee: 2500,
        initialFee: 1500,
        sender: { name: 'Sender' },
        recipient: { name: 'Recipient' },
        notes: 'Test order',
        description: 'Test description',
        activities: [],
        ...orderOverrides,
      };
    },
  };
}

function stubSideEffects(service: PaymentService) {
  const counts = { activities: 0, assignments: 0 };
  (service as any).orderActivityService = {
    createOrderActivity: async () => {
      counts.activities += 1;
      return { id: 'activity-1' };
    },
  };
  (service as any).orderAssignmentService = {
    handleOrderAssignment: async () => {
      counts.assignments += 1;
      return { id: 'assignment-1' };
    },
  };
  (service as any).emailService = {
    sendPaymentInitiatedEmail: async () => undefined,
    sendPaymentFailedEmail: async () => undefined,
  };
  return counts;
}

test('PaymentService rejects a valid Rwanda fixed line at a mobile-money boundary', async () => {
  const originalGetRepository = AppDataSource.getRepository;

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'test',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => createRepositoryMock();

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        await assert.rejects(
          service.createPayment({
            entityId: orderId,
            amount: 2500,
            currency: KpayCurrency.RWF,
            type: PaymentType.ORDER,
            customerEmail: '',
            customerName: '',
            customerPhone: '0250 500 500',
            provider: PaymentProvider.URUBUTO,
            channelName: UrubutoChannelName.MOMO,
          }),
          (error: unknown) => {
            assert.ok(error instanceof ValidationError);
            assert.match(error.message, /mobile number/i);
            return true;
          },
        );
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.createPayment keeps Urubuto timeout payments pending for reconciliation', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'test',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          validateAccountHolder: async () => ({ success: true, valid: true }),
          initiatePayment: async () => ({
            success: false,
            error: {
              code: 'URUBUTO_TIMEOUT',
              message: 'UrubutoPay payment initiation timed out.',
            },
          }),
          verifyTransactionStatus: async () => ({
            success: false,
            error: {
              code: 'URUBUTO_ERROR',
              message: 'status check failed',
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
        assert.equal(
          Boolean(payment.metadata.urubutoTimeoutReconciliation?.checkedAt),
          true,
        );
        assert.equal(
          payment.metadata.urubutoTimeoutReconciliation?.transactionId,
          paymentId,
        );
        assert.equal(
          repository.updates.at(-1).patch.status,
          KpayPaymentStatus.PENDING,
        );
        assert.equal(
          repository.updates.at(-1).patch.metadata.initiationError.code,
          'URUBUTO_TIMEOUT',
        );
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.createPayment charges 10 RWF in dev_price mode', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  let initiatedAmount: number | undefined;

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'dev_price',
      NODE_ENV: 'development',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          validateAccountHolder: async () => ({ success: true, valid: true }),
          initiatePayment: async (request: { amount: number }) => {
            initiatedAmount = request.amount;
            return {
              success: true,
              data: {
                transactionId: 'urubuto-tx-dev',
                paymentUrl: 'https://example.com/pay',
                reference: paymentId,
                amount: request.amount,
                currency: KpayCurrency.RWF,
                status: KpayPaymentStatus.PENDING,
                message: 'ok',
                metadata: { provider: 'URUBUTO' },
              },
            };
          },
        };

        const payment = await service.createPayment({
          entityId: orderId,
          amount: 2500,
          currency: KpayCurrency.RWF,
          type: PaymentType.ORDER,
          customerEmail: 'dev@example.com',
          customerName: 'Dev Payer',
          customerPhone: '250788000000',
          provider: PaymentProvider.URUBUTO,
          channelName: UrubutoChannelName.MOMO,
        });

        assert.equal(payment.amount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
        assert.equal(payment.metadata.developmentPricing, true);
        assert.equal(payment.metadata.catalogAmount, 2500);
        assert.equal(
          payment.metadata.chargedAmount,
          DEVELOPMENT_PAYMENT_AMOUNT_RWF,
        );
        assert.equal(initiatedAmount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
        assert.equal(repository.saves[0].amount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
        assert.equal(payment.metadata.simulated, undefined);
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.createPayment keeps catalog amount in live mode', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  let initiatedAmount: number | undefined;

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'production',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          validateAccountHolder: async () => ({ success: true, valid: true }),
          initiatePayment: async (request: { amount: number }) => {
            initiatedAmount = request.amount;
            return {
              success: true,
              data: {
                transactionId: 'urubuto-tx-prod',
                paymentUrl: 'https://example.com/pay',
                reference: paymentId,
                amount: request.amount,
                currency: KpayCurrency.RWF,
                status: KpayPaymentStatus.PENDING,
                message: 'ok',
                metadata: { provider: 'URUBUTO' },
              },
            };
          },
        };

        const payment = await service.createPayment({
          entityId: orderId,
          amount: 2500,
          currency: KpayCurrency.RWF,
          type: PaymentType.ORDER,
          customerEmail: 'prod@example.com',
          customerName: 'Prod Payer',
          customerPhone: '250788000000',
          provider: PaymentProvider.URUBUTO,
          channelName: UrubutoChannelName.MOMO,
        });

        assert.equal(payment.amount, 2500);
        assert.equal(payment.metadata.developmentPricing, undefined);
        assert.equal(initiatedAmount, 2500);
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.createPayment simulates success without provider call', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  let providerCalled = false;

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'simulate',
      NODE_ENV: 'development',
      FRONTEND_URL: 'http://localhost:5173',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          initiatePayment: async () => {
            providerCalled = true;
            return { success: false };
          },
        };

        const payment = await service.createPayment({
          entityId: orderId,
          amount: 2500,
          currency: KpayCurrency.RWF,
          type: PaymentType.ORDER,
          customerEmail: 'sim@example.com',
          customerName: 'Sim Payer',
          customerPhone: '250788000000',
          provider: PaymentProvider.URUBUTO,
          channelName: UrubutoChannelName.MOMO,
        });

        assert.equal(providerCalled, false);
        assert.equal(payment.status, KpayPaymentStatus.SUCCESSFUL);
        assert.equal(payment.metadata.simulated, true);
        assert.equal(payment.metadata.catalogAmount, 2500);
        assert.equal(payment.amount, 2500);
        assert.equal(payment.externalReferenceId, `sim_${paymentId}`);
        assert.match(
          payment.paymentUrl || payment.metadata.paymentUrl || '',
          /\/p\/orders\/.*\/payment-pending\?paymentId=/,
        );
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.validateUrubutoPayer returns 10 RWF in dev_price mode', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock({
    finalFee: 3200,
    initialFee: 1500,
    referenceId: 'ORDER-VALIDATE',
  });

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'dev_price',
      NODE_ENV: 'development',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          getMerchantCode: () => 'merchant-test',
        };

        const result = await service.validateUrubutoPayer({
          merchant_code: 'merchant-test',
          payer_code: 'ORDER-VALIDATE',
        });

        assert.equal(result.amount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
        assert.equal(result.currency, 'RWF');
        assert.equal(result.payer_code, 'ORDER-VALIDATE');
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService.validateUrubutoPayer returns catalog fee in live mode', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock({
    finalFee: 3200,
    initialFee: 1500,
    referenceId: 'ORDER-VALIDATE',
  });

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'production',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;

      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          getMerchantCode: () => 'merchant-test',
        };

        const result = await service.validateUrubutoPayer({
          merchant_code: 'merchant-test',
          payer_code: 'ORDER-VALIDATE',
        });

        assert.equal(result.amount, 3200);
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService requires the selected Urubuto wallet to be registered', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'test',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;
      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          validateAccountHolder: async () => ({ success: true, valid: false }),
        };

        await assert.rejects(
          service.createPayment({
            entityId: orderId,
            amount: 2500,
            currency: KpayCurrency.RWF,
            type: PaymentType.ORDER,
            customerEmail: 'payer@example.com',
            customerName: 'Wallet Payer',
            customerPhone: '0788000000',
            provider: PaymentProvider.URUBUTO,
            channelName: UrubutoChannelName.MOMO,
          }),
          /not registered for MTN Mobile Money/i,
        );
        assert.equal(repository.saves.length, 0);
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService fails closed when Urubuto wallet validation is unavailable', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();

  await withEnv(
    {
      RESEND_API_KEY: 're_test',
      PAYMENT_MODE: 'live',
      NODE_ENV: 'test',
    },
    async () => {
      (AppDataSource.getRepository as any) = () => repository;
      try {
        const service = new PaymentService();
        stubSideEffects(service);
        (service as any).urubutoService = {
          validateAccountHolder: async () => ({ success: false }),
        };

        await assert.rejects(
          service.createPayment({
            entityId: orderId,
            amount: 2500,
            currency: KpayCurrency.RWF,
            type: PaymentType.ORDER,
            customerEmail: 'payer@example.com',
            customerName: 'Wallet Payer',
            customerPhone: '+250788000000',
            provider: PaymentProvider.URUBUTO,
            channelName: UrubutoChannelName.MOMO,
          }),
          (error: any) => error?.statusCode === 503,
        );
        assert.equal(repository.saves.length, 0);
      } finally {
        (AppDataSource.getRepository as any) = originalGetRepository;
      }
    },
  );
});

test('PaymentService preserves the provider reference and terminal success on delayed callbacks', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  await repository.save({
    entityId: orderId,
    amount: 2500,
    currency: KpayCurrency.RWF,
    type: PaymentType.ORDER,
    status: KpayPaymentStatus.PENDING,
    provider: PaymentProvider.URUBUTO,
    method: UrubutoChannelName.MOMO,
    externalReferenceId: 'urubuto-provider-ref',
    metadata: { payerCode: 'ORDER-TIMEOUT' },
  });

  (AppDataSource.getRepository as any) = () => repository;
  try {
    const service = new PaymentService();
    stubSideEffects(service);
    (service as any).urubutoService = {
      getMerchantCode: () => 'MERCHANT',
      mapStatusToInternal: (status: UrubutoTransactionStatus) =>
        status === UrubutoTransactionStatus.VALID
          ? KpayPaymentStatus.SUCCESSFUL
          : KpayPaymentStatus.PENDING,
    };

    const successful = await service.processUrubutoPaymentWebhook(
      {
        merchant_code: 'MERCHANT',
        payer_code: 'ORDER-TIMEOUT',
        transaction_id: paymentId,
        transaction_status: UrubutoTransactionStatus.VALID,
        amount: 2500,
        currency: KpayCurrency.RWF,
        callback_type: 'PAYMENT',
      },
      'callback',
    );
    assert.equal(successful.status, KpayPaymentStatus.SUCCESSFUL);
    assert.equal(successful.externalReferenceId, 'urubuto-provider-ref');

    const delayed = await service.processUrubutoPaymentWebhook(
      {
        merchant_code: 'MERCHANT',
        payer_code: 'ORDER-TIMEOUT',
        transaction_id: paymentId,
        transaction_status: UrubutoTransactionStatus.PENDING,
        callback_type: 'PAYMENT',
      },
      'callback',
    );
    assert.equal(delayed.status, KpayPaymentStatus.SUCCESSFUL);
    assert.equal(delayed.externalReferenceId, 'urubuto-provider-ref');
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
  }
});

test('PaymentService rejects mismatched Urubuto webhook correlation data', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  await repository.save({
    entityId: orderId,
    amount: 2500,
    currency: KpayCurrency.RWF,
    type: PaymentType.ORDER,
    status: KpayPaymentStatus.PENDING,
    provider: PaymentProvider.URUBUTO,
    method: UrubutoChannelName.MOMO,
    metadata: { payerCode: 'ORDER-TIMEOUT' },
  });

  (AppDataSource.getRepository as any) = () => repository;
  try {
    const service = new PaymentService();
    stubSideEffects(service);
    (service as any).urubutoService = {
      getMerchantCode: () => 'MERCHANT',
      mapStatusToInternal: () => KpayPaymentStatus.SUCCESSFUL,
    };

    const validBase = {
      merchant_code: 'MERCHANT',
      payer_code: 'ORDER-TIMEOUT',
      transaction_id: paymentId,
      transaction_status: UrubutoTransactionStatus.VALID,
      amount: 2500,
      currency: KpayCurrency.RWF,
      callback_type: 'PAYMENT',
    };

    await assert.rejects(
      service.processUrubutoPaymentWebhook(
        { ...validBase, merchant_code: 'OTHER' },
        'callback',
      ),
      /merchant code does not match/i,
    );
    await assert.rejects(
      service.processUrubutoPaymentWebhook(
        { ...validBase, amount: 2501 },
        'callback',
      ),
      /amount does not match/i,
    );
    await assert.rejects(
      service.processUrubutoPaymentWebhook(
        { ...validBase, currency: 'USD' },
        'callback',
      ),
      /currency does not match/i,
    );
    await assert.rejects(
      service.processUrubutoPaymentWebhook(
        { ...validBase, payer_code: 'OTHER-ORDER' },
        'callback',
      ),
      /payer code does not match/i,
    );
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
  }
});

test('PaymentService handles notification duplicates once and explicit reversals', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  await repository.save({
    entityId: orderId,
    amount: 2500,
    currency: KpayCurrency.RWF,
    type: PaymentType.ORDER,
    status: KpayPaymentStatus.PENDING,
    provider: PaymentProvider.URUBUTO,
    method: UrubutoChannelName.MOMO,
    externalReferenceId: 'urubuto-provider-ref',
    metadata: { payerCode: 'ORDER-TIMEOUT' },
  });

  (AppDataSource.getRepository as any) = () => repository;
  try {
    const service = new PaymentService();
    const sideEffects = stubSideEffects(service);
    (service as any).urubutoService = {
      getMerchantCode: () => 'MERCHANT',
      mapStatusToInternal: (status: UrubutoTransactionStatus) =>
        status === UrubutoTransactionStatus.VALID
          ? KpayPaymentStatus.SUCCESSFUL
          : status === UrubutoTransactionStatus.CANCELED
            ? KpayPaymentStatus.FAILED
            : KpayPaymentStatus.PENDING,
    };

    const notification = {
      merchant_code: 'MERCHANT',
      payer_code: 'ORDER-TIMEOUT',
      transaction_id: paymentId,
      amount: 2500,
      currency: KpayCurrency.RWF,
      slip_number: 'SLIP-001',
    };

    const first = await service.processUrubutoPaymentWebhook(
      notification,
      'notification',
    );
    const duplicate = await service.processUrubutoPaymentWebhook(
      notification,
      'notification',
    );

    assert.equal(first.status, KpayPaymentStatus.SUCCESSFUL);
    assert.equal(duplicate.status, KpayPaymentStatus.SUCCESSFUL);
    assert.deepEqual(sideEffects, { activities: 1, assignments: 1 });

    const reversed = await service.processUrubutoPaymentWebhook(
      {
        merchant_code: 'MERCHANT',
        payer_code: 'ORDER-TIMEOUT',
        transaction_id: paymentId,
        initial_slip_number: 'SLIP-001',
      },
      'reversal',
    );
    assert.equal(reversed.status, KpayPaymentStatus.FAILED);
    assert.equal(reversed.externalReferenceId, 'urubuto-provider-ref');
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
  }
});

test('PaymentService public status is scoped to the matching order and omits private metadata', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const repository = createRepositoryMock();
  await repository.save({
    entityId: orderId,
    amount: 2500,
    currency: KpayCurrency.RWF,
    type: PaymentType.ORDER,
    status: KpayPaymentStatus.PENDING,
    provider: PaymentProvider.URUBUTO,
    method: UrubutoChannelName.MOMO,
    customerPhone: '+250788000000',
    metadata: { secret: 'private' },
  });
  (AppDataSource.getRepository as any) = () => repository;

  try {
    const service = new PaymentService();
    const status = await service.getPublicPaymentStatus(paymentId, orderId);
    assert.equal(status.id, paymentId);
    assert.equal(status.entityId, orderId);
    assert.equal('metadata' in status, false);
    assert.equal('customerPhone' in status, false);

    await assert.rejects(
      service.getPublicPaymentStatus(
        paymentId,
        '44444444-4444-4444-8444-444444444444',
      ),
      /Payment not found/,
    );
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
  }
});
