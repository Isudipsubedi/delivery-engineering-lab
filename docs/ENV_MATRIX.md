# Environment Matrix

| Environment | Git Branch | VM Path | Compose Project | Host Port (temp) | Nginx (planned) | Purpose |
|-------------|------------|---------|-----------------|-------------------|-----------------|---------|
| dev | dev | /opt/delivery-engineering-lab/dev | learnstack-dev | 8081 | dev.* or IP:8081 | Active development |
| staging | staging | /opt/delivery-engineering-lab/staging | learnstack-staging | 8082 | staging.* or IP:8082 | Release candidate / QA-like |
| prod | main | /opt/delivery-engineering-lab/prod | learnstack-prod | 8083 (initial) / 80,443 | prod/domain or IP:80 | Production |

App name: learnstack (React + Node/Express + PostgreSQL)
