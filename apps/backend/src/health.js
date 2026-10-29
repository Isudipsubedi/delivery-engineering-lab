export function buildHealthPayload({ appEnv, db }) {
  return {
    status: db === 'up' ? 'ok' : 'degraded',
    app: 'learnstack',
    env: appEnv,
    db,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
