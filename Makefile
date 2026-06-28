.PHONY: install up down restart logs shell-backend shell-frontend migrate seed test lint worker horizon

# ─── Setup inicial ────────────────────────────────────────────
install:
	@echo ">>> Construyendo imágenes..."
	docker compose build
	@echo ">>> Levantando servicios..."
	docker compose up -d
	@echo ">>> Esperando PostgreSQL..."
	docker compose exec backend bash -c "until php artisan db:show 2>/dev/null; do sleep 2; done"
	@echo ">>> Generando APP_KEY..."
	docker compose exec backend php artisan key:generate --force
	@echo ">>> Ejecutando migraciones..."
	docker compose exec backend php artisan migrate --force
	@echo ">>> Ejecutando seeders..."
	docker compose exec backend php artisan db:seed --force
	@echo ">>> Instalando dependencias frontend..."
	docker compose exec frontend npm install
	@echo ""
	@echo "✓ Maya Dashboard listo en:"
	@echo "  Frontend → http://maya_dashboard.localhost"
	@echo "  API      → http://maya_dashboard_api.localhost"

# ─── Ciclo de vida ────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-worker:
	docker compose logs -f worker

logs-scheduler:
	docker compose logs -f scheduler

# ─── Shells ───────────────────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh

# ─── Base de datos ────────────────────────────────────────────
migrate:
	docker compose exec backend php artisan migrate

migrate-fresh:
	docker compose exec backend php artisan migrate:fresh --seed

seed:
	docker compose exec backend php artisan db:seed

# ─── Tests ────────────────────────────────────────────────────
test:
	docker compose exec backend env APP_ENV=testing DB_CONNECTION=sqlite DB_DATABASE=:memory: DB_URL= php artisan test

test-backend:
	docker compose exec backend env APP_ENV=testing DB_CONNECTION=sqlite DB_DATABASE=:memory: DB_URL= php artisan test --coverage --min=80

test-frontend:
	docker compose exec frontend npm run test

# ─── Linting ──────────────────────────────────────────────────
lint:
	docker compose exec backend ./vendor/bin/pint
	docker compose exec frontend npx biome check --write ./src

# ─── Horizon (queue monitor) ─────────────────────────────────
horizon:
	docker compose exec backend php artisan horizon

horizon-status:
	docker compose exec backend php artisan horizon:status

# ─── Utilidades ───────────────────────────────────────────────
key-generate:
	docker compose exec backend php artisan key:generate --force

route-list:
	docker compose exec backend php artisan route:list --path=api

cache-clear:
	docker compose exec backend php artisan cache:clear
	docker compose exec backend php artisan config:clear
	docker compose exec backend php artisan route:clear
