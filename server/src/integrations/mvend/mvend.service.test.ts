import test from 'node:test';
import assert from 'node:assert/strict';
import { AxiosInstance } from 'axios';
import { PaymentStatus } from '../../types/payment-status.types';
import { MvendConfig } from '../../types/mvend.types';
import { computeIntegrityHash } from './mvend.hash';
import {
  generateMvendTxref,
  mapMvendStatus,
  MVEND_TIMEOUT,
  MvendService,
  PROVIDER_UNREACHABLE,
} from './mvend.service';

const NOW = 1_700_000_000_000;

const config: MvendConfig = {
  baseUrl: 'https://qa.mvendpay.com',
  paymentsPath: '/mpay/requestpayment',
  appId: '101202303',
  appKey: 'MERCPAY',
  salt: 'test-salt',
  currency: 'RWF',
  useTokenAuth: false,
  authString: '',
  callbackToken: 'x'.repeat(32),
};

type Call = { url: string; body: any; headers?: Record<string, string> };

function stubClient(responder: (call: Call) => any): { client: AxiosInstance; calls: Call[] } {
  const calls: Call[] = [];
  const client = {
    post: async (url: string, body: any, options?: { headers?: Record<string, string> }) => {
      const call = { url, body, headers: options?.headers };
      calls.push(call);
      const result = responder(call);
      if (result instanceof Error) throw result;
      return { data: result };
    },
  } as unknown as AxiosInstance;
  return { client, calls };
}

function service(responder: (call: Call) => any, overrides: Partial<MvendConfig> = {}) {
  const stub = stubClient(responder);
  return {
    svc: new MvendService({ ...config, ...overrides }, { client: stub.client, now: () => NOW }),
    calls: stub.calls,
  };
}

test('mapMvendStatus maps final states and leaves unknowns pending', () => {
  assert.equal(mapMvendStatus('Successful'), PaymentStatus.SUCCESSFUL);
  assert.equal(mapMvendStatus('COMPLETED'), PaymentStatus.SUCCESSFUL);
  assert.equal(mapMvendStatus('Failed'), PaymentStatus.FAILED);
  assert.equal(mapMvendStatus('cancelled'), PaymentStatus.FAILED);
  assert.equal(mapMvendStatus('New'), PaymentStatus.PENDING);
  assert.equal(mapMvendStatus('Pending'), PaymentStatus.PENDING);
  assert.equal(mapMvendStatus(undefined), PaymentStatus.PENDING);
  assert.equal(mapMvendStatus('something-new'), PaymentStatus.PENDING);
});

test('generateMvendTxref is digits only and unique', () => {
  const a = generateMvendTxref(NOW);
  const b = generateMvendTxref(NOW);
  assert.match(a, /^\d{19}$/);
  assert.notEqual(a, b);
});

test('requestPayment posts a signed paymentrequest body', async () => {
  const { svc, calls } = service(() => ({ status_code: 100, response_errormsg: 'Successful', paymentref: 9 }));
  const result = await svc.requestPayment({ txref: '123', amount: 150.4, paymentAccount: '250788318046' });

  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/mpay/requestpayment');
  const body = calls[0].body;
  assert.equal(body.requesttype, 'paymentrequest');
  assert.equal(body.appid, 101202303);
  assert.equal(body.appkey, 'MERCPAY');
  assert.equal(body.timestamp, NOW / 1000);
  assert.equal(body.amount, 150);
  assert.equal(body.currency, 'RWF');
  assert.equal(body.payment_account, '250788318046');
  assert.equal(
    body.integrity_hash,
    computeIntegrityHash(
      { timestamp: NOW / 1000, txref: '123', amount: 150, currency: 'RWF', payment_account: '250788318046' },
      'test-salt',
    ),
  );
  assert.equal(calls[0].headers?.Authorization, undefined);
});

test('requestPayment rejects amounts below the minimum without calling MVend', async () => {
  const { svc, calls } = service(() => ({ status_code: 100 }));
  const result = await svc.requestPayment({ txref: '1', amount: 50, paymentAccount: '250788318046' });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'AMOUNT_BELOW_MINIMUM');
  assert.equal(calls.length, 0);
});

test('requests fail fast when credentials are missing', async () => {
  const { svc, calls } = service(() => ({ status_code: 100 }), { salt: '' });
  const result = await svc.getAccountBalance();
  assert.equal(result.error?.code, 'CONFIGURATION_ERROR');
  assert.equal(calls.length, 0);
});

test('status 104 is reported as a duplicate', async () => {
  const { svc } = service(() => ({ status_code: 104, response_errormsg: 'Duplicate Transaction ID.' }));
  const result = await svc.requestPayment({ txref: '1', amount: 100, paymentAccount: '250788318046' });
  assert.equal(result.success, false);
  assert.equal(result.duplicate, true);
  assert.equal(result.error?.code, 'MVEND_104');
});

test('other status codes become MVEND_<code> errors', async () => {
  const { svc } = service(() => ({ status_code: 99, response_errormsg: 'currency is not allowed' }));
  const result = await svc.makePayment({ txref: '1', amount: 100, creditAccount: '250788318046' });
  assert.equal(result.success, false);
  assert.equal(result.duplicate, undefined);
  assert.equal(result.error?.code, 'MVEND_99');
  assert.equal(result.error?.message, 'currency is not allowed');
});

test('makePayment and rollback hash their specific fields', async () => {
  const { svc, calls } = service(() => ({ status_code: 100 }));
  await svc.makePayment({ txref: '7', amount: 200, creditAccount: '250788318046', narration: 'refund' });
  await svc.rollback('7', '8');

  const credit = calls[0].body;
  assert.equal(credit.requesttype, 'makepayment');
  assert.equal(credit.creditaccount, '250788318046');
  assert.equal(credit.narration, 'refund');
  assert.equal(
    credit.integrity_hash,
    computeIntegrityHash(
      { timestamp: NOW / 1000, txref: '7', amount: 200, currency: 'RWF', creditaccount: '250788318046' },
      'test-salt',
    ),
  );

  const rollback = calls[1].body;
  assert.equal(rollback.requesttype, 'rollback');
  assert.equal(rollback.rollback_txref, '8');
  assert.equal(
    rollback.integrity_hash,
    computeIntegrityHash({ timestamp: NOW / 1000, txref: '7', rollback_txref: '8' }, 'test-salt'),
  );
});

test('getTransactionStatus normalises the documented response', async () => {
  const { svc, calls } = service(() => ({
    status_code: 100,
    response_errormsg: 'Successful',
    txref: '238909123',
    status: 'New',
    paymentref: null,
    data: { transaction_amount: '2000.0000', transaction_status: 'Successful', paymentref: 306568 },
  }));
  const result = await svc.getTransactionStatus('238909123');

  assert.equal(calls[0].body.requesttype, 'gettransactionstatus');
  assert.equal(
    calls[0].body.integrity_hash,
    computeIntegrityHash({ timestamp: NOW / 1000, txref: '238909123' }, 'test-salt'),
  );
  assert.equal(result.success, true);
  assert.equal(result.status?.status, PaymentStatus.SUCCESSFUL);
  assert.equal(result.status?.rawStatus, 'Successful');
  assert.equal(result.status?.amount, 2000);
  assert.equal(result.status?.paymentRef, '306568');
});

test('transport timeouts are ambiguous and DNS failures are unreachable', async () => {
  const timeout = Object.assign(new Error('timeout of 60000ms exceeded'), { code: 'ECONNABORTED' });
  const dns = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });

  const a = await service(() => timeout).svc.requestPayment({ txref: '1', amount: 100, paymentAccount: '2507' });
  const b = await service(() => dns).svc.requestPayment({ txref: '1', amount: 100, paymentAccount: '2507' });

  assert.equal(a.error?.code, MVEND_TIMEOUT);
  assert.equal(b.error?.code, PROVIDER_UNREACHABLE);
});

test('token auth fetches and caches a token when enabled', async () => {
  const { svc, calls } = service(
    (call) => (call.url === '/auth/user/token' ? { token: 'abc' } : { status_code: 100 }),
    { useTokenAuth: true, authString: 'secret' },
  );
  await svc.getAccountBalance();
  await svc.getAccountBalance();

  assert.deepEqual(
    calls.map((c) => c.url),
    ['/auth/user/token', '/mpay/requestpayment', '/mpay/requestpayment'],
  );
  assert.deepEqual(calls[0].body, { app_key: 'MERCPAY', auth_string: 'secret' });
  assert.equal(calls[1].headers?.Authorization, 'Token abc');
});
