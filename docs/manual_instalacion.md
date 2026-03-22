# Manual de instalación — Maya Dashboard (frontend)

## 1. Introducción

Este documento describe cómo instalar y ejecutar en local el proyecto **Maya Dashboard**, una SPA desarrollada con **Vite**, **React 19** y **React Router**.

---

## 2. Requisitos previos

| Requisito | Versión recomendada |
|-----------|---------------------|
| **Node.js** | 18 o superior (20 LTS aconsejable) |
| **npm** | Incluido con Node |

Comprueba las versiones:

```bash
node -v
npm -v
```

---

## 3. Obtener el código

Si usas Git:

```bash
git clone <URL-del-repositorio> maya-dashboard
cd maya-dashboard
```

Si trabajas con un zip, descomprime y entra en la carpeta del proyecto.

---

## 4. Instalación de dependencias

En la raíz del proyecto (donde está `package.json`):

```bash
npm install
```

---

## 5. Ejecución en desarrollo

```bash
npm run dev
```

Vite mostrará una URL local, por ejemplo:

```text
http://localhost:5173/
```

**Puerto:** por defecto el proyecto está configurado en **5173** (`vite.config.js`). Si el puerto está ocupado, Vite propondrá otro (p. ej. 5174); usa siempre la URL que imprima la consola.

Abre esa URL en el navegador (Chrome, Firefox, Edge, etc.).

### Otros comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecuta la suite de pruebas (Vitest), una pasada. |
| `npm run test:watch` | Vitest en modo observación (útil en desarrollo). |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente el contenido de `dist/` (tras un `build`). |
| `npm run lint` | Ejecuta ESLint sobre el código fuente. |

---

## 6. Variables de entorno

En la versión actual **no es obligatorio** un fichero `.env` para arrancar: la autenticación y los datos de herramientas/perfil son **mock**.

---

## 7. Estructura del código

```text
maya-dashboard/
├── src/
│   ├── app/           # Router, layouts, auth (provider, rutas protegidas)
│   ├── features/      # Dominios: auth, tools, profile
│   └── shared/        # i18n, componentes compartidos, páginas comunes
├── index.html
├── vite.config.js
└── package.json
```

- **Internacionalización:** `src/shared/i18n/` (locales `es`, `en`, `va`).
- **Estilos:** Tailwind CSS v4 (configuración vía Vite).

---

## 8. Problemas frecuentes

### Puerto en uso

Cierra otras instancias de `npm run dev` o acepta el puerto alternativo que indique Vite.

### `ERR_CONNECTION_REFUSED` en el navegador

El servidor de desarrollo **no está en ejecución**. Vuelve a lanzar `npm run dev` y usa la URL que muestre la terminal.

### Errores al instalar dependencias

Borra `node_modules` y el lock si hace falta, y reinstala:

```bash
rm -rf node_modules
npm install
```

*(En Windows PowerShell puedes usar `Remove-Item -Recurse -Force node_modules`.)*

### Lint falla

Ejecuta `npm run lint` y corrige lo que indique la salida antes de integrar cambios.

### Fallan los tests (`npm run test`)

Revisa el mensaje de Vitest en consola (archivo y test concretos). Asegúrate de haber ejecutado `npm install` y de no tener cambios locales que rompan las aserciones.

---

## 9. Alcance técnico

- Rutas con **lazy loading** y **Suspense**.
- Ruta **404** y **error boundary** global.
- Autenticación simulada; datos de herramientas y perfil mock.
- **Pruebas automatizadas** con **Vitest** y Testing Library (`src/**/*.test.{js,jsx}`).
