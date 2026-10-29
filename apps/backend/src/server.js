import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { pool } from './db.js';
import { buildHealthPayload } from './health.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const appEnv = process.env.APP_ENV || 'local';

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  let db = 'down';
  try {
    await pool.query('SELECT 1');
    db = 'up';
  } catch (err) {
    console.error('[health] database check failed:', err.message);
  }

  const payload = buildHealthPayload({ appEnv, db });
  res.status(payload.status === 'ok' ? 200 : 503).json(payload);
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'learnstack',
    env: appEnv,
    version: process.env.APP_VERSION || 'dev',
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error('[users] query failed:', err.message);
    res.status(500).json({ error: 'database_error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[learnstack:${appEnv}] backend listening on ${port}`);
});
