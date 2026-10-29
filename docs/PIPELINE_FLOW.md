# CI/CD Pipeline Flow

This document explains how code moves from a laptop to the three environments on
the VPS, and which file is responsible for each step.

## 1. The big picture

```
feature/* ──PR──▶ dev ──PR──▶ staging ──PR──▶ main
                    │            │               │
             cd-dev.yml    cd-staging.yml    cd-prod.yml
                    │            │           (manual approval)
                    ▼            ▼               ▼
          /opt/.../dev   /opt/.../staging   /opt/.../prod
             :8081            :8082            :8083 (then :80/:443)
```

One codebase, three long-lived branches, three isolated stacks. The branch is the
promotion mechanism: a commit reaches production only after passing through
`dev` and `staging`.

## 2. What happens on every pull request (CI)

`.github/workflows/ci.yml` runs for PRs targeting `dev`, `staging`, or `main`:

1. **Backend tests** - `npm ci && npm test` in `apps/backend`.
2. **Frontend build** - `npm ci && npm run build` in `apps/frontend`.
3. **Docker build** - builds both images to prove the Dockerfiles work.

If any job fails, the PR cannot be merged (enable branch protection to enforce it).
No environment is touched by CI.

## 3. What happens when a branch is updated (CD)

Each branch has its own deploy workflow and its own GitHub Environment:

| Trigger | Workflow | GitHub Environment | VM directory | Host port |
|---|---|---|---|---|
| push to `dev` | `cd-dev.yml` | `dev` | `/opt/delivery-engineering-lab/dev` | 8081 |
| push to `staging` | `cd-staging.yml` | `staging` | `/opt/delivery-engineering-lab/staging` | 8082 |
| push to `main` | `cd-prod.yml` | `production` (approval) | `/opt/delivery-engineering-lab/prod` | 8083 |

Every deploy workflow does the same three things:

1. SSH into the VPS using the `VM_*` secrets.
2. Run `scripts/deploy.sh <env>` inside the environment's checkout.
3. Fail the workflow if the health check does not pass.

`scripts/deploy.sh` then:

1. Fetches and hard-resets the checkout to the branch that owns the environment
   (`dev` -> `dev`, `staging` -> `staging`, `prod` -> `main`).
2. Runs `docker compose --env-file .env -f infra/compose/docker-compose.<env>.yml up -d --build`.
3. Waits for `http://127.0.0.1:<port>/api/health` to return 200.
4. Prints container status and logs and exits non-zero if health never succeeds.

Because each environment has a different Compose project name, only that
environment's containers, network, and volume are rebuilt. Dev, staging, and prod
never share a database or a Docker network.

## 4. Isolation model

| Concern | dev | staging | prod |
|---|---|---|---|
| Compose project | `learnstack-dev` | `learnstack-staging` | `learnstack-prod` |
| Compose file | `docker-compose.dev.yml` | `docker-compose.staging.yml` | `docker-compose.prod.yml` |
| Docker network | `learnstack-dev-net` | `learnstack-staging-net` | `learnstack-prod-net` |
| Docker volume | `learnstack-dev-db-data` | `learnstack-staging-db-data` | `learnstack-prod-db-data` |
| `.env` | dev password | staging password | prod password |
| App env | `dev` | `staging` | `production` |

The `.env` file lives only on the VM (or locally). It is git-ignored; only
`.env.example` is committed.

## 5. Promotion workflow

```bash
# 1. Build a feature
git checkout dev
git pull
git checkout -b feature/add-something
# ...commit...
git push -u origin feature/add-something
# Open a PR: feature/add-something -> dev

# 2. After merge to dev, cd-dev deploys automatically.
# 3. Verify on dev, then promote:
#    Open a PR: dev -> staging
# 4. After merge to staging, cd-staging deploys automatically.
# 5. Verify on staging, then promote:
#    Open a PR: staging -> main
# 6. After merge to main, cd-prod waits for approval, then deploys.
```

## 6. One-time GitHub setup

Create the repository, then configure:

**Branches**

- `main` exists; create `dev` and `staging` from it.
- Protect `main` (and ideally `staging`): require PRs and passing CI.

**Environments** (`Settings -> Environments`)

- `dev` - no protection rules.
- `staging` - optional required reviewers.
- `production` - required reviewers (this is the approval gate).

**Repository secrets** (used by all deploy workflows)

- `VM_HOST` - IP or hostname of the VPS.
- `VM_USER` - SSH user, e.g. `ubuntu` or `deploy`.
- `VM_SSH_KEY` - private key whose public key is in the VM user's `authorized_keys`.
- `VM_SSH_PORT` - optional, defaults to 22.

**Environment variables**

- `APP_URL` in each environment (shown in the Actions UI), e.g.
  `http://203.0.113.10:8081`, `http://203.0.113.10:8082`,
  `https://example.com`.

## 7. First deploy on a new VPS

```bash
# On the VPS, with Docker + Compose plugin installed:
REPO_URL=git@github.com:<you>/delivery-engineering-lab.git \
  bash scripts/bootstrap-vm.sh

# Edit each environment's DB password:
nano /opt/delivery-engineering-lab/dev/.env
nano /opt/delivery-engineering-lab/staging/.env
nano /opt/delivery-engineering-lab/prod/.env

# Seed the first deploy manually:
bash /opt/delivery-engineering-lab/dev/scripts/deploy.sh dev
```

After that, pushes to each branch drive deployments automatically.

## 8. Run the whole stack locally

```bash
cp .env.example .env
docker compose -f infra/compose/docker-compose.dev.yml up --build
```

- Frontend: <http://localhost:8081>
- Backend direct: <http://localhost:3001/api/health>
- Database: only reachable inside the `learnstack-dev-net` network.

## 9. Where each piece lives

| Path | Purpose |
|---|---|
| `apps/backend` | Express API, `/api/health`, `/api/users` |
| `apps/frontend` | React/Vite UI, built and served by Nginx |
| `database/schema.sql`, `database/seed.sql` | Postgres init scripts |
| `infra/compose` | One Compose stack per environment |
| `infra/nginx` | Optional VPS-level Nginx server blocks |
| `scripts/deploy.sh` | Branch sync + Compose rebuild + health check |
| `scripts/bootstrap-vm.sh` | One-time VM checkout setup |
| `.github/workflows` | CI plus one CD workflow per branch |

## 10. Why build on the VM instead of pushing images to a registry?

The lab intentionally starts with the simplest flow: the VM pulls the branch and
runs `docker compose up --build`. It needs no registry credentials and shows the
whole path in one place.

The production upgrade path is: build and tag images once in CI, push to GHCR,
then have the VM pull the exact image tag instead of rebuilding. The workflow
shape stays the same; only the middle step changes.
