import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHealthPayload } from '../src/health.js';

test('reports ok when the database is reachable', () => {
  const payload = buildHealthPayload({ appEnv: 'test', db: 'up' });

  assert.equal(payload.status, 'ok');
  assert.equal(payload.env, 'test');
  assert.equal(payload.db, 'up');
  assert.equal(payload.app, 'learnstack');
});

test('reports degraded when the database is unreachable', () => {
  const payload = buildHealthPayload({ appEnv: 'test', db: 'down' });

  assert.equal(payload.status, 'degraded');
});
