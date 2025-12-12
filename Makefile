.PHONY: dev-up dev-down prod-up prod-down clean build restart-backend restart-bot restart-frontend prod-restart-backend prod-restart-bot prod-restart-frontend

dev-up:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml up --build -d

dev-down:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml down

prod-up:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml up --build -d

prod-down:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml down

build:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml build

clean:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml down -v
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml down -v
	docker system prune -f

logs-dev:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml logs -f

logs-prod:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml logs -f

restart-backend:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml restart backend

restart-bot:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml restart bot

restart-frontend:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml restart frontend

prod-restart-backend:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml restart backend

prod-restart-bot:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml restart bot

prod-restart-frontend:
	docker compose --env-file .env -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml restart frontend