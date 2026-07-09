import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { KpayCurrency, KpayPaymentStatus } from '../../types/kpay.types';
import { UrubutoChannelName, UrubutoTransactionStatus } from '../../types/urubuto.types';
import { UrubutoService } from './urubuto.service';

const config = {
  baseUrl: 'https://urubuto.test',
  apiKey: 'test-api-key',
  merchantCode: 'MERCHANT',
  serviceCode: 'SERVICE',
  webhookUsername: 'webhook-user',
  webhookPassword: 'webhook-pass',
  webhookJwtSecret: 'webhook-secret',
  checkoutBaseUrl: 'https://checkout.urubuto.test',
};

function mockAxiosPost(post: (url: string, payload: any) => Promise<any>) {
  const originalCreate = axios.create;
  (axios.create as any) = () => ({ post });
  return () => {
    (axios.create as any) = originalCreate;
  };
}

test('CARD payment with a valid redirect URL sends redirection_url', async () => {
  let postedPayload: any;
  const restore = mockAxiosPost(async (_url, payload) => {
    postedPayload = payload;
    return {
      status: 200,
      data: {
        status: 200,
        message: 'initiated',
        card_processing_url: 'https://cards.urubuto.test/process',
        data: {
          transaction_status: UrubutoTransactionStatus.INITIATED,
          internal_transaction_ref_number: 'urubuto-ref',
          external_transaction_ref_number: 'external-ref',
          currency: KpayCurrency.RWF,
        },
      },
    };
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerEmail: 'payer@example.com',
      customerName: 'Card Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111111',
      payerCode: 'ORDER-1',
      channelName: UrubutoChannelName.CARD,
      redirectUrl: 'https://peekaboo.test/payment/success',
    });

    assert.equal(result.success, true);
    assert.equal(postedPayload.redirection_url, 'https://peekaboo.test/payment/success');
    assert.equal(postedPayload.channel_name, UrubutoChannelName.CARD);
    assert.equal(postedPayload.service_code, config.serviceCode);
    assert.equal(postedPayload.merchant_code, config.merchantCode);
  } finally {
    restore();
  }
});

test('CARD payment without a valid redirect URL fails before calling UrubutoPay', async () => {
  let called = false;
  const restore = mockAxiosPost(async () => {
    called = true;
    throw new Error('should not call UrubutoPay');
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Card Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111112',
      payerCode: 'ORDER-2',
      channelName: UrubutoChannelName.CARD,
      redirectUrl: 'not-a-url',
    });

    assert.equal(called, false);
    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'INVALID_REDIRECTION_URL');
  } finally {
    restore();
  }
});

test('MOMO payment does not require redirection_url', async () => {
  let postedPayload: any;
  const restore = mockAxiosPost(async (_url, payload) => {
    postedPayload = payload;
    return {
      status: 200,
      data: {
        status: 200,
        message: 'initiated',
        data: {
          transaction_status: UrubutoTransactionStatus.PENDING,
          internal_transaction_ref_number: 'momo-ref',
          external_transaction_ref_number: 'momo-external-ref',
          currency: KpayCurrency.RWF,
        },
      },
    };
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111113',
      payerCode: 'ORDER-3',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, true);
    assert.equal(postedPayload.channel_name, UrubutoChannelName.MOMO);
    assert.equal(postedPayload.service_code, config.serviceCode);
    assert.equal('redirection_url' in postedPayload, false);
  } finally {
    restore();
  }
});

test('Axios timeout from /api/v2/payment/initiate returns a distinct timeout result', async () => {
  const restore = mockAxiosPost(async (url) => {
    assert.equal(url, '/api/v2/payment/initiate');
    const error: any = new Error('timeout of 30000ms exceeded');
    error.code = 'ECONNABORTED';
    throw error;
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111114',
      payerCode: 'ORDER-4',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'URUBUTO_TIMEOUT');
    assert.match(result.error?.message || '', /timed out/i);
  } finally {
    restore();
  }
});

test('service code errors include actionable metadata and guidance', async () => {
  const restore = mockAxiosPost(async () => {
    const error: any = new Error('Request failed with status code 400');
    error.response = {
      status: 400,
      data: {
        status: 400,
        message: 'service code not found',
      },
    };
    throw error;
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111115',
      payerCode: 'ORDER-5',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.match(result.error?.message || '', /URUBUTO_SERVICE_CODE/i);
    assert.equal(result.error?.metadata?.serviceCodeSource, 'URUBUTO_SERVICE_CODE');
    assert.equal(result.error?.metadata?.serviceCodeError, true);
  } finally {
    restore();
  }
});
