# GitHub Actions Deploy Template

MenuDIGI does not enable automatic production deployment in this module because production secrets and server access are not configured in the repository.

Use this as a future starting point after staging validation.

```yaml
name: Deploy Production

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            set -euo pipefail
            cd /var/www/menudigi/current
            git fetch --all --prune
            git checkout main
            git pull --ff-only origin main
            bash deploy/scripts/deploy.sh
```

## Required Secrets

- `PRODUCTION_HOST`
- `PRODUCTION_USER`
- `PRODUCTION_SSH_KEY`

## Notes

- Prefer a staging deployment first.
- Avoid storing `.env` values in workflow YAML.
- Use GitHub Environments with required reviewers.
- Do not claim remote CI/deploy success unless the run is checked.
