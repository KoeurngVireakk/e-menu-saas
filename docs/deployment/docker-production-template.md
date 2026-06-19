# Docker Production Template

## Files

- `deploy/docker/Dockerfile.backend.example`
- `deploy/docker/Dockerfile.frontend.example`
- `deploy/docker/nginx.Dockerfile.example`
- `deploy/docker/nginx.frontend.conf.example`
- `deploy/docker/docker-compose.production.example.yml`

## Services

- `backend`: PHP-FPM Laravel app.
- `frontend`: Nginx static frontend.
- `mysql`: MySQL database.
- `redis`: cache/session/queue backend.
- `queue`: Laravel queue worker.
- `scheduler`: Laravel scheduler.
- `reverb`: WebSocket server.

## Usage

Copy examples before editing:

```bash
cp deploy/docker/docker-compose.production.example.yml deploy/docker/docker-compose.production.yml
cp deploy/docker/Dockerfile.backend.example deploy/docker/Dockerfile.backend
cp deploy/docker/Dockerfile.frontend.example deploy/docker/Dockerfile.frontend
```

Provide real environment values through server secrets or `.env` files excluded from Git.

## First Run

```bash
docker compose -f deploy/docker/docker-compose.production.yml build
docker compose -f deploy/docker/docker-compose.production.yml up -d mysql redis
docker compose -f deploy/docker/docker-compose.production.yml run --rm backend php artisan migrate --force
docker compose -f deploy/docker/docker-compose.production.yml up -d
```

## Important Notes

- Do not commit filled production `.env` files.
- Use external backups for MySQL volumes.
- Use a reverse proxy or load balancer with TLS in front of containers.
- Review persistent storage for `backend/storage`.
- Tune worker counts per CPU and memory.
- This template does not replace staging validation.
