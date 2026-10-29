# 07 - Basic Scaffold and Pipeline Flow

## What we created

- `apps/backend` - Express API with `/api/health`, `/api/info`, `/api/users`,
  a pure health-payload helper, and a `node:test` suite.
- `apps/frontend` - React + Vite UI that shows API health and the users table.
- `database/seed.sql` - two sample users for the lab.
- `infra/compose/docker-compose.{dev,staging,prod}.yml` - one isolated stack per
  environment (project name, network, volume, port, app env).
- `infra/nginx/{dev,staging,prod}.conf` - optional VPS-level reverse proxy blocks.
- `.github/workflows/ci.yml` - tests, frontend build, Docker builds on PRs.
- `.github/workflows/cd-{dev,staging,prod}.yml` - per-branch deploys via SSH.
- `scripts/deploy.sh` - fetch/reset branch, compose rebuild, health check.
- `scripts/bootstrap-vm.sh` - one-time clone of each branch into `/opt`.
- `.env.example`, `.gitattributes`, `docs/PIPELINE_FLOW.md`.

## Flow

feature/* -> dev -> staging -> main

- PR to any long-lived branch runs CI only.
- Push to `dev` deploys `/opt/.../dev` on port 8081.
- Push to `staging` deploys `/opt/.../staging` on port 8082.
- Push to `main` deploys `/opt/.../prod` on port 8083, but only after the
  `production` GitHub Environment approval.

## Key decisions

- **Branch per environment, not directory per environment inside one checkout.**
  Each VM directory is its own clone tracking its branch, so a deploy can reset
  hard without disturbing the others.
- **Build on the VM for now.** No registry credentials; the whole path is visible.
  Upgrade later by building/pushing to GHCR and pulling an image tag.
- **Compose project name per env.** Guarantees separate containers, networks, and
  volumes even though all three run on the same Docker daemon.
- **Health gate in the deploy script.** A workflow fails if the app does not come
  back healthy, so a bad deploy is visible immediately.
- **Standalone Compose files per env.** Slight duplication, but each file can be
  read top-to-bottom and matches the README command.

## Next steps

1. Create `dev` and `staging` branches and push all branches to GitHub.
2. Create GitHub Environments `dev`, `staging`, `production`; add required
   reviewers to `production`.
3. Add repository secrets `VM_HOST`, `VM_USER`, `VM_SSH_KEY` (and optional
   `VM_SSH_PORT`); set `APP_URL` per environment.
4. Bootstrap the VPS and set `DB_PASSWORD` in each `.env`.
5. Enable branch protection with CI as a required check.
6. Later: GHCR images, Nginx + certbot, database backups, and monitoring.
