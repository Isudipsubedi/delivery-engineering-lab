# 01 - Local Restructure (Step 0)

## What we did
- Renamed repo folder to delivery-engineering-lab
- Created infra/, apps/, scripts/, docs/, .github/workflows/ to separate app code from infrastructure
- Moved frontend/ -> apps/frontend/
- Moved backend/ -> apps/backend/
- Updated README.md with exact project description
- Created pipelineflow/00_env_strategy.md

## Why
- Infra as Code mindset
- Clear separation for interviews/showcase
- Easier to write Dockerfiles and compose files
- pipelineflow/ acts as living revision notes

## Notes
Folder structure changed, existing files moved as is. No logic changed yet.
