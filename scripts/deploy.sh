#!/usr/bin/env bash
# Deploy one environment on the VPS.
#
# Usage (run from the environment checkout on the VM):
#   bash scripts/deploy.sh dev|staging|prod
#
# It syncs the checkout to the branch that owns the environment, then rebuilds
# and restarts only that environment's Compose project.
set -euo pipefail

ENV="${1:-}"

case "$ENV" in
  dev)
    BRANCH="dev"
    HEALTH_PORT="8081"
    ;;
  staging)
    BRANCH="staging"
    HEALTH_PORT="8082"
    ;;
  prod)
    BRANCH="main"
    HEALTH_PORT="8083"
    ;;
  *)
    echo "Usage: $0 <dev|staging|prod>" >&2
    exit 1
    ;;
esac

BASE_DIR="/opt/delivery-engineering-lab/${ENV}"
COMPOSE_FILE="infra/compose/docker-compose.${ENV}.yml"

cd "$BASE_DIR"

echo "[deploy] env=${ENV} branch=${BRANCH} dir=${BASE_DIR}"

git fetch origin --prune
git checkout -B "$BRANCH" "origin/$BRANCH"
git reset --hard "origin/$BRANCH"

if [ ! -f .env ]; then
  echo "[deploy] ERROR: ${BASE_DIR}/.env is missing. Copy .env.example and set DB_PASSWORD." >&2
  exit 1
fi

docker compose --env-file .env -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "[deploy] waiting for http://127.0.0.1:${HEALTH_PORT}/api/health"
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${HEALTH_PORT}/api/health" >/dev/null; then
    echo "[deploy] ${ENV} is healthy"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "[deploy] health check failed; recent container state:" >&2
docker compose --env-file .env -f "$COMPOSE_FILE" ps >&2 || true
docker compose --env-file .env -f "$COMPOSE_FILE" logs --tail=50 >&2 || true
exit 1
