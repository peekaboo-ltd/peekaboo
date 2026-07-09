import test from 'node:test';
import assert from 'node:assert/strict';
import { AppDataSource } from '../data-source';
import { PaymentService } from './payment.service';
import { KpayCurrency, KpayPaymentStatus } from '../types/kpay.types';
import { PaymentProvider, UrubutoChannelName } from '../types/urubuto.types';
import { PaymentType } from '../constants/payment.constants';
import { DEVELOPMENT_PAYMENT_AMOUNT_RWF } from '../helpers/developmentPricing.helper';

const paymentId = '22222222-2222-4222-8222-222222222222';
const orderId = '33333333-3333-4333-8333-333333333333';

function createRepositoryMock(orderOverrides: Record<string, any> = {}) {
  const saves: any[] = [];
  const updates: any[] = [];
  return {
    saves,
    updates,
    save: async (payment: any) => {
      const saved = {
        id: paymentId,
        ...payment,
      };
      saves.push(saved);
      return saved;
    },
    update: async (id: string, patch: any) => {
      updates.push({ id, patch });
      return { affected: 1 };
    },
    findOne: async () => ({
      id: orderId,
      referenceId: 'ORDER-TIMEOUT',
      finalFee: 2500,
      initialFee: 1500,
      sender: { name: 'Sender' },
      recipient: { name: 'Recipient' },
      notes: 'Test order',
      description: 'Test description',
      ...orderOverrides,
    }),
  };
}

test('PaymentService.createPayment keeps Urubuto timeout payments pending for reconciliation', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.RESEND_API_KEY = 're_test';
  process.env.NODE_ENV = 'test';
  const repository = createRepositoryMock();
  (AppDataSource.getRepository as any) = () => repository;

  try {
    const service = new PaymentService();
    (service as any).urubutoService = {
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
    assert.equal(repository.updates.at(-1).patch.status, KpayPaymentStatus.PENDING);
    assert.equal(repository.updates.at(-1).patch.metadata.initiationError.code, 'URUBUTO_TIMEOUT');
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test('PaymentService.createPayment charges 10 RWF and stores catalog amount in development', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.RESEND_API_KEY = 're_test';
  process.env.NODE_ENV = 'development';
  const repository = createRepositoryMock();
  (AppDataSource.getRepository as any) = () => repository;

  let initiatedAmount: number | undefined;

  try {
    const service = new PaymentService();
    (service as any).urubutoService = {
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
    assert.equal(payment.metadata.chargedAmount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
    assert.equal(initiatedAmount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
    assert.equal(repository.saves[0].amount, DEVELOPMENT_PAYMENT_AMOUNT_RWF);
  } finally {
    (AppDataSource.getRepository as any) = originalGetRepository;
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test('PaymentService.createPayment keeps catalog amount outside development', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.RESEND_API_KEY = 're_test';
  process.env.NODE_ENV = 'production';
  const repository = createRepositoryMock();
  (AppDataSource.getRepository as any) = () => repository;

  let initiatedAmount: number | undefined;

  try {
    const service = new PaymentService();
    (service as any).urubutoService = {
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
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test('PaymentService.validateUrubutoPayer returns 10 RWF in development', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.RESEND_API_KEY = 're_test';
  process.env.NODE_ENV = 'DEVELOPMENT';
  const repository = createRepositoryMock({
    finalFee: 3200,
    initialFee: 1500,
    referenceId: 'ORDER-VALIDATE',
  });
  (AppDataSource.getRepository as any) = () => repository;

  try {
    const service = new PaymentService();
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
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test('PaymentService.validateUrubutoPayer returns catalog fee outside development', async () => {
  const originalGetRepository = AppDataSource.getRepository;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.RESEND_API_KEY = 're_test';
  process.env.NODE_ENV = 'production';
  const repository = createRepositoryMock({
    finalFee: 3200,
    initialFee: 1500,
    referenceId: 'ORDER-VALIDATE',
  });
  (AppDataSource.getRepository as any) = () => repository;

  try {
    const service = new PaymentService();
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
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});
