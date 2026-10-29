#!/usr/bin/env bash
# One-time VPS bootstrap: creates one checkout per environment.
#
# Usage:
#   REPO_URL=git@github.com:<you>/delivery-engineering-lab.git bash scripts/bootstrap-vm.sh
#
# Assumes Docker Engine + Compose plugin are installed and the current user can
# run Docker without sudo.
set -euo pipefail

REPO_URL="${REPO_URL:?Set REPO_URL, e.g. git@github.com:you/delivery-engineering-lab.git}"
ROOT="/opt/delivery-engineering-lab"

for env in dev staging prod; do
  case "$env" in
    dev) branch="dev" ;;
    staging) branch="staging" ;;
    prod) branch="main" ;;
  esac

  dest="$ROOT/$env"

  if [ ! -d "$dest/.git" ]; then
    echo "[bootstrap] cloning ${branch} -> ${dest}"
    sudo mkdir -p "$dest"
    sudo chown "$(id -u):$(id -g)" "$dest"
    git clone --branch "$branch" "$REPO_URL" "$dest"
  else
    echo "[bootstrap] ${dest} already exists, skipping clone"
  fi

  if [ ! -f "$dest/.env" ]; then
    cp "$dest/.env.example" "$dest/.env"
    echo "[bootstrap] created ${dest}/.env - edit DB_PASSWORD before deploying"
  fi
done

echo "[bootstrap] done. Next: edit each .env, then run bash scripts/deploy.sh dev"
