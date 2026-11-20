import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidCallbackToken } from './mvend.callback';

const TOKEN = 'k3y-'.repeat(8);

test('isValidCallbackToken accepts only the exact token', () => {
  assert.equal(isValidCallbackToken(TOKEN, TOKEN), true);
  assert.equal(isValidCallbackToken(`${TOKEN}x`, TOKEN), false);
  assert.equal(isValidCallbackToken('short', TOKEN), false);
});

test('isValidCallbackToken rejects when either side is empty', () => {
  assert.equal(isValidCallbackToken(undefined, TOKEN), false);
  assert.equal(isValidCallbackToken('', TOKEN), false);
  assert.equal(isValidCallbackToken(TOKEN, ''), false);
});
