#!/usr/bin/env bash
# up.sh — Arranque de Maya Dashboard. Ver maya_infra/scripts/up-common.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVICE_LABEL="maya-dashboard"
BACKEND_CONTAINER="maya_dashboard_backend"
FRONTEND_URL="https://desarrollo-ceedcv-dashboard.192.168.2.1.nip.io"
BACKEND_API_URL="https://desarrollo-ceedcv-dashboard-api.192.168.2.1.nip.io/api/v1"
DEFAULT_BACKEND_PORT="8003"
DEFAULT_FRONTEND_PORT="5175"

setup_frontend_env() {
    upsert_env_var frontend/.env VITE_API_URL            "${VITE_API_URL:-https://desarrollo-ceedcv-dashboard-api.192.168.2.1.nip.io/api/v1}"
    upsert_env_var frontend/.env VITE_KEYCLOAK_URL       "${VITE_KEYCLOAK_URL:-https://keycloak.192.168.2.1.nip.io}"
    upsert_env_var frontend/.env VITE_KEYCLOAK_REALM     "${VITE_KEYCLOAK_REALM:-maya}"
    upsert_env_var frontend/.env VITE_KEYCLOAK_CLIENT_ID "${VITE_KEYCLOAK_CLIENT_ID:-maya-dashboard}"
    upsert_env_var frontend/.env VITE_DASHBOARD_API_URL  "${VITE_DASHBOARD_API_URL:-https://desarrollo-ceedcv-dashboard-api.192.168.2.1.nip.io}"
}

extra_traefik_urls() {
    echo -e "  ${CYAN}Worker + Scheduler:${NC} en ejecución (ver: ./up.sh logs worker scheduler)"
}

# shellcheck source=../maya_infra/scripts/up-common.sh
source "${MAYA_INFRA_DIR:-"$SCRIPT_DIR/../maya_infra"}/scripts/up-common.sh"
