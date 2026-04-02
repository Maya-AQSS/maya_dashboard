---
layout: home

hero:
  name: "Maya Dashboard"
  text: "Panel Central del Trabajador CEEDCV"
  tagline: "React 19 + Vite 7 · Laravel 13 API · Keycloak OIDC · PostgreSQL · WebSockets en tiempo real"
  actions:
    - theme: brand
      text: Épicas y Features
      link: /1_epics_and_features
    - theme: alt
      text: Ver Backlog
      link: /backlog/F-09.1_monorepo-docker-compose
    - theme: alt
      text: Ver en GitHub
      link: https://github.com/Maya-AQSS/maya-dashboard

features:
  - icon: 🔐
    title: Autenticación Centralizada (Keycloak OIDC)
    details: Login unificado mediante Authorization Code + PKCE. El backend valida tokens JWKS sin estado de sesión propio. Sincronización de perfil via FDW en producción.

  - icon: 🕐
    title: Gestión de Fichajes (Odoo)
    details: Registro de entrada/salida conectado a Odoo 19 mediante adaptador intercambiable. Alerta visual cuando el fichaje del día está pendiente. Modal de contingencia si Odoo no responde.

  - icon: 🔔
    title: Notificaciones en Tiempo Real
    details: Inserción via API autenticada con API Key e idempotencia por external_id. Entrega urgente por WebSocket (Laravel Reverb) en canales privados por usuario.

  - icon: 📅
    title: Widget de Calendario (Microsoft 365)
    details: Integración con Microsoft Graph via Identity Brokering (RFC 8693). Interfaz de CalendarProvider extensible a otros proveedores sin modificar el widget.

  - icon: 🧰
    title: Catálogo de Herramientas y Favoritos
    details: CRUD de herramientas corporativas accesible a todos los usuarios. Favoritos por usuario con reordenamiento drag & drop. Sidebar colapsable con acceso rápido.

  - icon: 📊
    title: Auditoría y Observabilidad
    details: Trazabilidad completa de acciones con spatie/laravel-activitylog (append-only, 1 año retención). Publicación de errores de sistema a RabbitMQ para observabilidad externa.
---
