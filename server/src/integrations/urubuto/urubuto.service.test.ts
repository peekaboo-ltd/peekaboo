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
    assert.equal(result.data?.status, KpayPaymentStatus.PENDING);
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

test('wallet account validation sends a digit-only Rwanda number and selected channel', async () => {
  let postedUrl = '';
  let postedPayload: any;
  const restore = mockAxiosPost(async (url, payload) => {
    postedUrl = url;
    postedPayload = payload;
    return {
      status: 200,
      data: {
        status: 200,
        message: 'Successful',
        data: { valid: true },
      },
    };
  });

  try {
    const result = await new UrubutoService(config).validateAccountHolder({
      customerPhone: '+250 788 000 000',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(postedUrl, '/api/v2/payment/account-holder/validate');
    assert.deepEqual(postedPayload, {
      payer_phone_number: '250788000000',
      payment_channel_name: UrubutoChannelName.MOMO,
    });
    assert.equal(result.success, true);
    assert.equal(result.valid, true);
  } finally {
    restore();
  }
});

test('wallet initiation remains pending until a webhook confirms VALID', async () => {
  const restore = mockAxiosPost(async () => ({
    status: 200,
    data: {
      status: 200,
      message: 'initiated',
      data: {
        transaction_status: UrubutoTransactionStatus.VALID,
        internal_transaction_ref_number: 'wallet-ref',
        external_transaction_ref_number: 'merchant-ref',
        currency: KpayCurrency.RWF,
      },
    },
  }));

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '+250788000000',
      refId: '11111111-1111-4111-8111-111111111116',
      payerCode: 'ORDER-6',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, true);
    assert.equal(result.data?.status, KpayPaymentStatus.PENDING);
    assert.equal(result.data?.paymentUrl, undefined);
  } finally {
    restore();
  }
});

test('incomplete Urubuto initiation responses are rejected', async () => {
  const restore = mockAxiosPost(async () => ({
    status: 200,
    data: {
      status: 200,
      message: 'initiated',
      data: {
        transaction_status: UrubutoTransactionStatus.PENDING,
      },
    },
  }));

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111117',
      payerCode: 'ORDER-7',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'INVALID_URUBUTO_RESPONSE');
  } finally {
    restore();
  }
});

test('an expired provider certificate is reported as unreachable, not as a bad account', async () => {
  const restore = mockAxiosPost(async (url) => {
    assert.equal(url, '/api/v2/payment/account-holder/validate');
    const error: any = new Error('certificate has expired');
    error.code = 'CERT_HAS_EXPIRED';
    throw error;
  });

  try {
    const result = await new UrubutoService(config).validateAccountHolder({
      customerPhone: '250788000000',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'PROVIDER_UNREACHABLE');
    assert.match(result.error?.message || '', /temporarily unavailable/i);
    assert.doesNotMatch(result.error?.message || '', /validate this mobile money account/i);
  } finally {
    restore();
  }
});

test('DNS and refused connections during validation are reported as unreachable', async () => {
  for (const code of ['ENOTFOUND', 'ECONNREFUSED']) {
    const restore = mockAxiosPost(async () => {
      const error: any = new Error(`connect ${code} urubuto.test`);
      error.code = code;
      throw error;
    });

    try {
      const result = await new UrubutoService(config).validateAccountHolder({
        customerPhone: '250788000000',
        channelName: UrubutoChannelName.MOMO,
      });

      assert.equal(result.error?.code, 'PROVIDER_UNREACHABLE', `code ${code}`);
    } finally {
      restore();
    }
  }
});

test('a rejection carrying a provider response is never treated as unreachable', async () => {
  const restore = mockAxiosPost(async () => {
    const error: any = new Error('Request failed with status code 400');
    error.response = {
      status: 400,
      data: { status: 400, message: 'Account not found' },
    };
    throw error;
  });

  try {
    const result = await new UrubutoService(config).validateAccountHolder({
      customerPhone: '250788000000',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.equal(result.error?.code, '400');
    assert.equal(result.error?.message, 'Account not found');
  } finally {
    restore();
  }
});

test('transaction status lookups surface unreachable separately from provider errors', async () => {
  const restore = mockAxiosPost(async (url) => {
    assert.equal(url, '/api/v2/payment/transaction/status');
    const error: any = new Error('certificate has expired');
    error.code = 'CERT_HAS_EXPIRED';
    throw error;
  });

  try {
    const result = await new UrubutoService(config).verifyTransactionStatus(
      'urubuto-ref',
    );

    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'PROVIDER_UNREACHABLE');
  } finally {
    restore();
  }
});

test('an unreachable provider fails initiation fast instead of reconciling', async () => {
  const restore = mockAxiosPost(async () => {
    const error: any = new Error('certificate has expired');
    error.code = 'CERT_HAS_EXPIRED';
    throw error;
  });

  try {
    const result = await new UrubutoService(config).initiatePayment({
      amount: 1000,
      currency: KpayCurrency.RWF,
      customerName: 'Momo Payer',
      customerPhone: '250788000000',
      refId: '11111111-1111-4111-8111-111111111116',
      payerCode: 'ORDER-6',
      channelName: UrubutoChannelName.MOMO,
    });

    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'PROVIDER_UNREACHABLE');
    assert.equal(result.error?.metadata?.transportErrorCode, 'CERT_HAS_EXPIRED');
    assert.match(result.error?.message || '', /no payment was taken/i);
  } finally {
    restore();
  }
});

test('an ambiguous mid-flight failure stays a timeout so the payment is reconciled', async () => {
  for (const code of ['ECONNRESET', 'ETIMEDOUT']) {
    const restore = mockAxiosPost(async () => {
      const error: any = new Error(`socket hang up ${code}`);
      error.code = code;
      throw error;
    });

    try {
      const result = await new UrubutoService(config).initiatePayment({
        amount: 1000,
        currency: KpayCurrency.RWF,
        customerName: 'Momo Payer',
        customerPhone: '250788000000',
        refId: '11111111-1111-4111-8111-111111111117',
        payerCode: 'ORDER-7',
        channelName: UrubutoChannelName.MOMO,
      });

      assert.notEqual(result.error?.code, 'PROVIDER_UNREACHABLE', `code ${code}`);
    } finally {
      restore();
    }
  }
});
