# Maya Dashboard

Panel web (*dashboard*) para que usuarios autenticados consulten un catálogo de herramientas, marquen favoritas y gestionen sus datos personales. Incluye búsqueda, paginación (escritorio) y carga progresiva en móvil, rutas protegidas, página 404 y manejo global de errores de render.

**Stack:** React 19 · Vite · React Router · Tailwind CSS v4 · i18n propio (es · en · va).

> En la versión actual la autenticación y los datos de herramientas/perfil son **mock** (sin API real).

## Puesta en marcha

```bash
npm install
npm run dev
```

Por defecto: `http://localhost:5173` (Vite puede proponer otro puerto si 5173 está ocupado).

```bash
npm run build    # producción en dist/
npm run preview  # sirve dist/ en local
npm run lint
```

## Documentación

Manuales de **instalación** y **usuario** (con capturas): carpeta **`docs/`** del repositorio (`manual_instalacion.md`, `manual_usuario.md` y `img/`).

## Estructura principal

- `src/app` — router, layout, autenticación (contexto y rutas protegidas)
- `src/features` — `auth`, `tools`, `profile`
- `src/shared` — componentes compartidos, estilos, i18n
