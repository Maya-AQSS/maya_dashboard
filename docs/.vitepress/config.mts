import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';  // Necesario para diagramas C4/Mermaid

export default withMermaid(
  defineConfig({
    title: "Maya Dashboard",
    description: "Panel Central del Trabajador CEEDCV — React 19 + Vite 7 · Laravel 13 API · Keycloak OIDC · PostgreSQL · WebSockets en tiempo real.",
    lang: 'es-ES',

    // Para GitHub Pages
    base: '/maya-dashboard/',
    srcDir: './src',

    ignoreDeadLinks: true,

    mermaid: {
      theme: 'dark'
    },

    themeConfig: {
      nav: [
        { text: 'Inicio', link: '/' },
        { text: 'Épicas y Features', link: '/1_epics_and_features' },
        { text: 'Backlog', link: '/backlog/F-09.1_monorepo-docker-compose' },
        { text: 'Auditoría', link: '/AUDIT_LOG' },
      ],

      sidebar: [
        // ── Documentación del proyecto ──────────────────────────────────────
        {
          text: '📋 Proyecto',
          items: [
            { text: '📖 Descripción del Proyecto', link: '/0_descripcion_proyecto' },
            { text: '🎯 Épicas y Features', link: '/1_epics_and_features' },
            { text: '🏛️ Arquitectura y Riesgos (STRIDE)', link: '/2_architecture_risks' },
            { text: '📐 Diagramas C4 Model', link: '/3_c4_diagrams' },
            { text: '📋 Registro de Auditoría', link: '/AUDIT_LOG' },
          ]
        },

        // ── Backlog agrupado por CATEGORÍA UNIVERSAL ────────────────────────
        // Orden: 🖥️ UI → ⚙️ Logic → 🗄️ Data → 🔌 Integration
        //      → 🏗️ Infrastructure → 🔒 Security → 📊 Observability → 🛠️ DX
        {
          text: '🖥️ UI / Presentation',
          collapsed: false,
          items: [
            { text: 'F-02.1 — Layout Base Dashboard', link: '/backlog/F-02.1_layout-base-dashboard' },
            { text: 'F-02.2 — Alerta Fichaje Pendiente', link: '/backlog/F-02.2_alerta-fichaje-pendiente' },
            { text: 'F-02.3 — Grid de Widgets MVP', link: '/backlog/F-02.3_grid-widgets-mvp' },
            { text: 'F-02.4 — Responsividad Vista Compacta', link: '/backlog/F-02.4_responsividad-vista-compacta' },
            { text: 'F-03.4 — Widget de Notificaciones', link: '/backlog/F-03.4_widget-notificaciones' },
            { text: 'F-04.3 — Widget de Fichajes', link: '/backlog/F-04.3_widget-fichajes' },
            { text: 'F-05.3 — Widget Calendario Outlook', link: '/backlog/F-05.3_widget-calendario-outlook' },
            { text: 'F-06.1 — Sidebar Colapsable', link: '/backlog/F-06.1_sidebar-colapsable' },
            { text: 'F-06.4 — Página de Herramientas', link: '/backlog/F-06.4_pagina-herramientas' },
            { text: 'F-07.1 — Perfil — Vista y Edición', link: '/backlog/F-07.1_perfil-vista-edicion' },
            { text: 'F-08.2 — Vista Historial de Acciones', link: '/backlog/F-08.2_vista-historial-acciones' },
          ]
        },
        {
          text: '⚙️ Logic / Business',
          collapsed: false,
          items: [
            { text: 'F-03.2 — Gestión de Notificaciones', link: '/backlog/F-03.2_gestion-notificaciones' },
            { text: 'F-04.2 — Acciones de Fichaje (UX)', link: '/backlog/F-04.2_acciones-fichaje-ux' },
            { text: 'F-06.2 — CRUD de Herramientas', link: '/backlog/F-06.2_crud-tools' },
            { text: 'F-06.3 — Gestión de Favoritos', link: '/backlog/F-06.3_gestion-favoritos' },
            { text: 'F-07.3 — Edición IBAN con Validación', link: '/backlog/F-07.3_edicion-iban-validacion' },
          ]
        },
        {
          text: '🗄️ Data',
          collapsed: false,
          items: [
            { text: 'F-01.3 — FDW Sincronización de Usuario', link: '/backlog/F-01.3_fdw-sincronizacion-usuario' },
            { text: 'F-07.2 — Gestión de Matrículas', link: '/backlog/F-07.2_gestion-matriculas' },
          ]
        },
        {
          text: '🔌 Integration',
          collapsed: false,
          items: [
            { text: 'F-03.1 — Endpoint Inserción de Notificaciones', link: '/backlog/F-03.1_endpoint-insercion-notificaciones' },
            { text: 'F-03.3 — Notificaciones Urgentes (WebSocket)', link: '/backlog/F-03.3_notificaciones-urgentes-websocket' },
            { text: 'F-04.1 — Odoo Adapter (Mock)', link: '/backlog/F-04.1_odoo-adapter-mock' },
            { text: 'F-05.1 — Calendar Provider Interface', link: '/backlog/F-05.1_calendar-provider-interface' },
          ]
        },
        {
          text: '🏗️ Infrastructure',
          collapsed: false,
          items: [
            { text: 'F-09.1 — Monorepo + Docker Compose', link: '/backlog/F-09.1_monorepo-docker-compose' },
            { text: 'F-09.2 — Keycloak Setup Local', link: '/backlog/F-09.2_keycloak-local-setup' },
          ]
        },
        {
          text: '🔒 Security',
          collapsed: false,
          items: [
            { text: 'F-01.1 — OIDC Frontend (PKCE)', link: '/backlog/F-01.1_oidc-frontend' },
            { text: 'F-01.2 — JWT Backend Laravel (JWKS)', link: '/backlog/F-01.2_jwt-backend-laravel' },
            { text: 'F-01.4 — Persistencia de Sesión Frontend', link: '/backlog/F-01.4_persistencia-sesion-frontend' },
            { text: 'F-05.2 — Microsoft Auth (Identity Brokering)', link: '/backlog/F-05.2_microsoft-auth-identity-brokering' },
          ]
        },
        {
          text: '📊 Observability',
          collapsed: false,
          items: [
            { text: 'F-08.1 — Audit Log (spatie/activitylog)', link: '/backlog/F-08.1_audit-log-activitylog' },
            { text: 'F-08.3 — Logs de Sistema (RabbitMQ)', link: '/backlog/F-08.3_logs-sistema-rabbitmq' },
          ]
        },
        {
          text: '🛠️ DX / Tooling',
          collapsed: false,
          items: [
            { text: 'F-09.3 — i18n Frontend (ES / VA / EN)', link: '/backlog/F-09.3_i18n-frontend' },
            { text: 'F-09.4 — TypeScript + Tailwind + Tokens Odoo', link: '/backlog/F-09.4_typescript-tailwind-tokens' },
          ]
        },
      ],

      socialLinks: [
        { icon: 'github', link: 'https://github.com/Maya-AQSS/maya-dashboard' }
      ],

      footer: {
        message: 'Maya Dashboard — Panel Central del Trabajador CEEDCV',
        copyright: 'Copyright © 2026 — Generado con Extractor de Requisitos Autónomo'
      },

      search: {
        provider: 'local'
      },

      editLink: {
        pattern: 'https://github.com/Maya-AQSS/maya-dashboard/edit/main/docs/:path',
        text: 'Editar esta página en GitHub'
      },

      lastUpdated: {
        text: 'Última actualización',
        formatOptions: {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      }
    }
  })
)
