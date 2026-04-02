#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# up.sh — Script de arranque de Maya Dashboard (frontend-only)
#
# Uso:
#   ./up.sh            Arranca el servicio frontend
#   ./up.sh --build    Fuerza rebuild de imagen
#   ./up.sh down       Para el servicio
#   ./up.sh logs       Sigue los logs
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ─── Colores ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[maya-dashboard]${NC} $*"; }
success() { echo -e "${GREEN}[maya-dashboard]${NC} $*"; }
warn()    { echo -e "${YELLOW}[maya-dashboard]${NC} $*"; }

# ─── Cargar .env ─────────────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
    warn ".env no encontrado — copiando desde .env.example"
    cp .env.example .env
fi
set -a; source .env; set +a

# ─── Subcomandos rápidos ──────────────────────────────────────────────────────
case "${1:-}" in
    down)
        info "Parando el servicio..."
        docker compose down
        exit 0
        ;;
    logs)
        docker compose logs -f "${@:2}"
        exit 0
        ;;
    ps|status)
        docker compose ps
        exit 0
        ;;
esac

# ─── Verificar y levantar infra compartida ───────────────────────────────────
INFRA_SCRIPT="${MAYA_INFRA_DIR:-$SCRIPT_DIR/../infra}/ensure-running.sh"
if [[ -f "$INFRA_SCRIPT" ]]; then
    bash "$INFRA_SCRIPT"
else
    warn "Script de infra no encontrado en: $INFRA_SCRIPT"
    warn "Clona el repo de infra al mismo nivel o define MAYA_INFRA_DIR=/ruta/a/infra"
    exit 1
fi

# ─── Flags extra ─────────────────────────────────────────────────────────────
EXTRA_FLAGS=()
[[ "${1:-}" == "--build" ]] && EXTRA_FLAGS+=("--build")

# ─── Levantar servicio ───────────────────────────────────────────────────────
info "Levantando frontend..."
docker compose up -d ${EXTRA_FLAGS[@]+"${EXTRA_FLAGS[@]}"}

# ─── URLs de acceso ───────────────────────────────────────────────────────────
echo ""
success "Dashboard listo. Accesos disponibles:"
echo -e "  ${GREEN}Dashboard:${NC}         http://dashboard.localhost"
echo -e "  ${GREEN}Keycloak:${NC}          http://keycloak.localhost"
echo -e "  ${GREEN}Traefik dashboard:${NC}  http://localhost:8888"
echo ""
echo -e "  ${YELLOW}Acceso directo (sin Traefik):${NC}"
echo -e "    Frontend:  http://localhost:${FRONTEND_PORT:-5175}"
echo ""
