# 00 - Env Strategy: dev / staging / prod on one VPS

## Why three environments?
In real delivery engineering, we don't just deploy to 'production'. We promote code through stages to reduce risk. 
This lab mimics that: code goes dev -> staging -> prod with each stage being more strict and closer to actual production.

## Key Decisions
- Repo: delivery-engineering-lab
- App name: learnstack (React + Node/Express + Postgres)
- VM root: /opt/delivery-engineering-lab/
- Host ports: 8081(dev), 8082(staging), 8083(prod)
- Git flow: feature/* -> dev -> staging -> main
- Isolation: separate directories, separate docker compose projects, separate networks/volumes, separate .env

## VM Layout
/opt/delivery-engineing-lab/
├── dev/
├── staging/
└── prod/

Each with app/, deploy/, data/, logs/, .env

## Docker Isolation
COMPOSE_PROJECT_NAME: learnstack-dev / learnstack-staging / learnstack-prod
Containers: learnstack-<env>-<service>-1
Networks: learnstack-<env>-default
Volumes: learnstack-<env>-<volume>

## GitHub Environments
We'll use GitHub Environments (dev, staging, production) with protection rules later to show approval gates.

## Next
Step 1: Create these 3 directories on Ubuntu VM with proper ownership/permissions.
