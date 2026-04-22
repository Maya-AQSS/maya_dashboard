# Maya Dashboard

Panel de administración principal del ecosistema **Maya (CEEDCV)**.

Frontend con React 19 + Vite 7, conectado a las APIs del ecosistema Maya vía Keycloak (OIDC).

## Stack

- React 19 + Vite 7
- Docker (Node 22-alpine)
- Traefik (reverse proxy compartido)

## Prerequisitos

- Docker Engine 20.10+
- Docker Compose v2+
- Repo `infra/` clonado al mismo nivel que este proyecto

## Infraestructura compartida

Traefik y Keycloak **no** están en este proyecto — viven en el repo `infra/`, compartido por todo el ecosistema Maya. El script `up.sh` los levanta automáticamente si no están corriendo.

### Clonar infra

Clona el repo de infra **al mismo nivel** que este proyecto:

```bash
git clone <url-repo-infra> ../infra
```

Resultado esperado:

```text
~/desarrollo/
├── infra/               ← repo infra
├── maya_authorization/
├── maya-dms/
├── log-management-dashboard/
└── maya-dashboard/      ← este proyecto
```

Si tienes infra en otra ubicación, usa la variable de entorno:

```bash
MAYA_INFRA_DIR=/ruta/absoluta/a/infra ./up.sh
```

## Instalación

```bash
git clone <repository-url>
cd maya-dashboard
./up.sh --build
```

El script `up.sh` se encarga de todo automáticamente:

- Copia `.env.example` → `.env` si no existe
- Levanta la infra compartida (Traefik, Keycloak, PostgreSQL, Redis, RabbitMQ)
- Construye y levanta el contenedor frontend

> Solo necesitas editar `.env` si quieres cambiar las URLs de las APIs o el client ID de Keycloak.

## Arranque diario

```bash
./up.sh
```

Para parar:

```bash
./up.sh down
```

Otros subcomandos:

```bash
./up.sh logs            # seguir logs
./up.sh ps              # ver estado del contenedor
./up.sh --build         # reconstruir imagen
```

## URLs de acceso

| Servicio | URL (vía Traefik) | URL directa |
| --- | --- | --- |
| Dashboard | <http://dashboard.localhost> | <http://localhost:5175> |
| Keycloak | <http://keycloak.localhost> | <http://localhost:8180> |
| Traefik dashboard | <http://localhost:8888> | — |

## Variables de entorno

El `.env` se crea automáticamente desde `.env.example`. Variables disponibles:

```env
VITE_API_URL=http://api.localhost              # API de maya_authorization
VITE_KEYCLOAK_URL=http://keycloak.localhost    # Keycloak IdP
VITE_KEYCLOAK_REALM=maya                       # Realm de Keycloak
VITE_KEYCLOAK_CLIENT_ID=maya-dashboard         # Client ID en Keycloak
VITE_APP_KEY=<app-key-maquina-registrada>      # X-App-Key para catálogo de apps
FRONTEND_PORT=5175                             # Puerto host directo
```

## Desarrollo local sin Docker

Si prefieres desarrollo sin Docker:

```bash
npm install
npm run dev
```

## Arquitectura

```text
infra/
  Traefik (:80, :8888) ──── enruta *.localhost
  Keycloak (:8180)      ──── IdP compartido del ecosistema

maya-dashboard/
  Frontend (:5175) ──→ API (api.localhost) vía Keycloak tokens
```

El contenedor se conecta a la red Docker `maya_network` (compartida).
