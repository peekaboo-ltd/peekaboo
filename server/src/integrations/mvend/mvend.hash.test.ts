import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIntegrityString, computeIntegrityHash } from './mvend.hash';

test('buildIntegrityString concatenates fields in the documented order', () => {
  // Values from the "Request Payment (Debit)" example in the MVend docs.
  assert.equal(
    buildIntegrityString({
      payment_account: '250788318046',
      currency: 'RWF',
      amount: 100,
      txref: 201912081617005,
      timestamp: 1575814648,
    }),
    '1575814648201912081617005100RWF250788318046',
  );
});

test('buildIntegrityString uses empty strings for missing fields', () => {
  assert.equal(buildIntegrityString({ timestamp: 1, txref: 'a' }), '1a');
  assert.equal(
    buildIntegrityString({ timestamp: 1, txref: 'a', rollback_txref: 'b' }),
    '1ab',
  );
  assert.equal(
    buildIntegrityString({ timestamp: 1, txref: 'a', amount: '200', creditaccount: '2507' }),
    '1a2002507',
  );
});

test('computeIntegrityHash is HMAC-SHA256 hex keyed with the salt', () => {
  // Reference vector produced with:
  //   printf '%s' '1575814648201912081617005100RWF250788318046' | openssl dgst -sha256 -hmac test-salt
  assert.equal(
    computeIntegrityHash(
      {
        timestamp: 1575814648,
        txref: '201912081617005',
        amount: 100,
        currency: 'RWF',
        payment_account: '250788318046',
      },
      'test-salt',
    ),
    '8b098a2a840f0185db9819b6f83519b2a626396343d9a26ebe9e8ee6f2097365',
  );
});
