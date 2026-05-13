# Maya Dashboard — Contexto del proyecto

## Qué es este proyecto
Panel de control principal del ecosistema Maya (CEEDCV). Sirve como punto de entrada
para los usuarios, agrega widgets de distintos servicios y actúa como SSO relay para
apps server-rendered (patrón `?return_to=<url>` + `?session_token=<jwt>`).
- **Backend**: Laravel 13 / PHP 8.4
- **Frontend**: React 19 + Vite + TypeScript
- **IdP**: Keycloak 24 (realm `maya`)
- **BD**: PostgreSQL 17
- **Colas**: RabbitMQ (worker dedicado: `notifications:consume` + `alerts:consume`)

## Infraestructura
- Reverse proxy: **Traefik latest**
- Red Docker compartida: `maya_network`
- Script de arranque: `./up.sh` (no usar `docker compose up` directamente)
- Servicios: `backend` (API HTTP), `worker` (consumers AMQP), `scheduler` (`schedule:run` cada 60s para `alerts:evaluate`), `frontend`

## Accesos locales (vía Traefik)
- Frontend:  http://dashboard.maya.test
- Backend:   http://dashboard-api.maya.test/api/v1
- Keycloak:  http://keycloak.maya.test
- Traefik:   http://localhost:8888/dashboard/

## Patrón SSO relay
El dashboard autentica con Keycloak y puede redirigir a otras apps con un JWT de sesión:
- App server-rendered redirige aquí con `?return_to=<url>`
- `ReturnToHandler` en `App.tsx` detecta el param y añade `?session_token=<jwt>` al retorno
- Solo se permite redirect a dominios `*.localhost` (ver `isAllowedReturnUrl`)

## Paquetes compartidos
- `maya-shared-auth-laravel`: middleware JWT/JWKS (Composer path en `../infra/packages/`)
- `maya-shared-auth-react`: hooks/componentes Keycloak auth (npm file: en `../infra/packages/`)
- Symlink `../packages → ../infra/packages` para compatibilidad

## Guías importantes
- `../maya_authorization/docs/src/new-app-guide.md` — requisitos para nuevas apps
- `../maya_authorization/docs/src/architecture.md` — arquitectura del sistema
- `../infra/RUNBOOK.md` — runbook del ecosistema (arranque, URLs, verificación)
