# Maya Dashboard — Informe de Análisis
>
> Generado: 2026-03-31 | Rama analizada: `develop`

---

## Resumen ejecutivo

| Área | Estado |
| --- | --- |
| Stack | React 19 + Vite 7 + Tailwind 4 — moderno y bien elegido |
| Arquitectura | Feature-driven, patrones sólidos, buena separación |
| Production-ready | ❌ NO — auth en memoria, APIs mockeadas, sin backend |
| Seguridad | 3 CRITICAL · 6 HIGH · 4 MEDIUM · 3 LOW |
| Calidad de código | 6 CRITICAL · 8 HIGH · 7 MEDIUM · 5 LOW |
| Tests | Parciales — utilities cubiertas, hooks y páginas sin tests |

---

## 1. Análisis general

### Stack tecnológico

| Tecnología | Versión | Estado |
| --- | --- | --- |
| React | 19.2.0 | ✅ Último |
| React Router | 7.13.1 | ✅ Con lazy loading |
| Vite | 7.3.1 | ✅ Último |
| Tailwind CSS | 4.2.1 | ✅ Con dark mode |
| Vitest + Testing Library | 4.1.0 | ✅ Setup correcto |
| TypeScript | ❌ Ausente | Gap importante |

### Arquitectura

El proyecto usa **feature-driven architecture** — código organizado por dominio (auth, tools, profile) con cada feature auto-contenida (api/, components/, hooks/, pages/, lib/).

**Fortalezas:**

- Custom hooks bien extraídos (`useLogin`, `useToolsData`, `useAuth`)
- Data mappers desacoplan el backend del frontend (`userMapper`, `toolMapper`)
- i18n para 3 idiomas (ES, EN, valenciano)
- HTML semántico y ARIA labels

**Deuda técnica principal:**

- `main` branch con 28 líneas — todo el trabajo real está en `develop`
- Sin TypeScript — refactoring arriesgado
- Sin capa API real — todo es mock con delays hardcodeados
- Auth en memoria — se pierde al recargar

---

## 2. Revisión de seguridad

### 🔴 CRITICAL

#### SEC-1: Auth solo en memoria — sin persistencia ni tokens

**Archivos:** `src/app/auth/AuthProvider.jsx`, `src/app/auth/RequireAuth.jsx`

El usuario solo se almacena en `useState`. Se pierde al recargar. No hay JWT, cookies ni sesión real. El guard `RequireAuth` es bypasseable desde DevTools.

```jsx
// PROBLEMA: auth perdida en F5
const [user, setUser] = useState(null)

// FIX: inicializar desde localStorage + validar en backend
const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  } catch { return null }
})
```

---

#### SEC-2: Mock auth acepta cualquier credencial

**Archivos:** `src/features/auth/api/authApi.js`, `src/features/auth/data/userData.js`

`loginApi()` retorna siempre el mismo usuario hardcodeado. Cualquier email/password funciona. El usuario mock queda expuesto en el bundle.

**Fix:** Implementar backend real con validación de credenciales, bcrypt/argon2 para passwords, y respuesta con token seguro.

---

#### SEC-3: PII en estado del cliente sin cifrar

**Archivos:** `src/features/profile/pages/ProfilePage.jsx`, `src/features/profile/api/profileApi.js`

DNI, teléfono, dirección postal almacenados en `useState` sin cifrar. `profileApi.js` muta directamente el objeto `USER` global con `Object.assign()`.

```js
// PROBLEMA: mutación directa de datos sensibles
Object.assign(USER, apiUpdates)

// FIX: nunca mutar estado global; enviar solo al backend via HTTPS
await fetch('/api/profile', { method: 'PATCH', body: JSON.stringify(updates), credentials: 'include' })
```

---

### 🟠 HIGH

#### SEC-4: Sin protección CSRF

**Archivos:** `src/features/auth/components/LoginForm.jsx`, `src/features/profile/pages/ProfilePage.jsx`

Ninguna operación de cambio de estado incluye token CSRF.

**Fix:** Cookies `SameSite=Strict` en backend + token CSRF de doble submit o basado en sesión.

---

#### SEC-5: Campo `role` editable por el usuario

**Archivo:** `src/features/profile/pages/ProfilePage.jsx`

El campo `role` es un `<FormField>` editable. Un usuario puede cambiarse a "Admin" desde el frontend.

**Fix:** Eliminar `role` del formulario editable. Mostrarlo como solo lectura. El backend debe rechazar cualquier cambio de rol que no venga de un endpoint de administración protegido.

---

#### SEC-6: Control de acceso solo en cliente

**Archivo:** `src/app/auth/RequireAuth.jsx`

Las rutas protegidas solo verifican si `user` existe en memoria. Las llamadas directas a la API no están protegidas. No hay validación server-side en ningún endpoint.

**Fix:** Cada endpoint de backend debe validar el token y los permisos. El cliente solo es UX.

---

#### SEC-7: Stack traces expuestos en consola

**Archivo:** `src/shared/components/GlobalErrorBoundary.jsx`

`componentDidCatch` llama `console.error(error, errorInfo)` sin distinguir entorno. En producción esto expone la estructura interna del código.

```js
// FIX
componentDidCatch(error, errorInfo) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error, errorInfo)
  } else {
    logToErrorService({ message: error.message }) // Sentry, etc.
  }
}
```

---

#### SEC-8: Sin Content Security Policy

**Archivo:** `index.html`

No hay headers CSP. Vulnerable a inyección de scripts inline y carga de recursos de terceros.

**Fix:** Añadir CSP en headers del servidor (`default-src 'self'`, `script-src 'self'`, etc.) o en `vite.config.js` para el servidor de desarrollo.

---

#### SEC-9: Sin validación de contraseña en registro

**Archivos:** `src/features/auth/components/RegisterForm.jsx`, `src/features/auth/api/authApi.js`

Solo verifica que los campos no estén vacíos. No hay requisitos de complejidad. El backend (cuando exista) debe aplicar: mínimo 12 caracteres, mayúsculas, números, especiales.

---

### 🟡 MEDIUM

#### SEC-10: Sin configuración CORS

**Archivo:** `vite.config.js`

No hay proxy ni configuración CORS para desarrollo. El backend de producción debe configurar `Access-Control-Allow-Origin` específico (nunca `*` con credenciales).

---

#### SEC-11: Sin rate limiting en formularios de auth

**Archivos:** `src/features/auth/hooks/useLogin.js`, `useRegister.js`

No hay debounce ni throttle en el cliente. El backend debe aplicar rate limiting (ej: máx 5 intentos por IP en 15 min, respuesta 429).

---

#### SEC-12: Dependencias sin instalar

**Archivo:** `package.json`

Múltiples dependencias no instaladas (`react-router-dom`, `tailwindcss`, `vitest`, etc.). Ejecutar `npm install && npm audit fix`.

---

### 🔵 LOW

#### SEC-13: Atributos `autoComplete` faltantes

**Archivo:** `src/features/profile/pages/ProfilePage.jsx`

Campos de dirección sin `autoComplete="street-address"`, `autoComplete="postal-code"`, etc.

---

## 3. Revisión de código

### 🔴 CRITICAL

#### CODE-1: Auth sin persistencia entre recargas

*(Ver SEC-1 — mismo problema, impacto doble)*

---

#### CODE-2: Stale closure en `useToolsData` al cambiar idioma

**Archivo:** `src/features/tools/hooks/useToolsData.js`

El hook usa `tRef.current` para capturar la función `t`. Si el idioma cambia mientras hay una operación async en curso, el mensaje de error aparecerá en el idioma incorrecto.

**Fix:** Almacenar la clave i18n del error (no el texto traducido) y traducir en el render:

```js
setError(errorKey) // Guardar 'tools.errorLoad', no el texto traducido
// En el return: error: error ? t(error) : null
```

---

#### CODE-3: Race condition en `toggleToolFavorite`

**Archivos:** `src/features/tools/api/toolsApi.js`, `src/features/tools/hooks/useToolsData.js`

`toolsApi.js` muta directamente `tool.is_favorite` en el array global. Con toggles rápidos consecutivos el estado se corrompe.

**Fix:** Update optimista + rollback en error:

```js
const originalTools = tools
setTools(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
try {
  const updated = await toggleToolFavorite(id)
  setTools(prev => prev.map(t => t.id === updated.id ? { ...t, isFavorite: updated.isFavorite } : t))
} catch {
  setTools(originalTools) // Rollback
}
```

---

#### CODE-4: Bug en paginación móvil con búsqueda activa

**Archivo:** `src/features/tools/pages/ToolsListPage.jsx`

`mobilePageItems` siempre corta desde índice 0. Con búsqueda activa y página > 1, muestra los mismos items que la página 1.

```js
// PROBLEMA
const mobilePageItems = visibleTools.slice(0, mobileEndIndex)

// FIX
const mobileStartIndex = (currentPageSafe - 1) * pageSize
const mobilePageItems = visibleTools.slice(mobileStartIndex, Math.min(mobileStartIndex + pageSize, visibleTools.length))
```

---

#### CODE-5: Sin Error Boundary por ruta

**Archivo:** `src/app/router.jsx`

Las rutas lazy-loaded no tienen Error Boundary individual. Un error en una ruta tumba toda la aplicación.

**Fix:** Envolver cada lazy component en un Error Boundary o añadir manejo de error en el import dinámico.

---

#### CODE-6: Bug en `LocaleProvider` — `t` no actualiza al cambiar locale

**Archivo:** `src/shared/i18n/LocaleProvider.jsx`

El `useMemo` que computa el `value` con la función `t` no incluye `locale` en sus dependencias, por lo que las traducciones no se actualizan al cambiar el idioma.

```js
// FIX: añadir locale a las dependencias
const value = useMemo(() => { ... }, [locale, setLocale])
```

---

### 🟠 HIGH

#### CODE-7: Validación de `phone` falla en campo opcional

**Archivo:** `src/features/profile/lib/profileValidation.js`

El campo `phone` puede dejarse vacío pero la validación lo trata como requerido. Los usuarios no pueden guardar el perfil sin teléfono.

---

#### CODE-8: `error` no se limpia al reintentar login

**Archivos:** `src/features/auth/hooks/useLogin.js`, `useRegister.js`

El error del intento anterior persiste brevemente al reintentar. Añadir `setError(null)` al inicio de `checkLogin`.

---

#### CODE-9: Formulario de perfil no se deshabilita al guardar

**Archivo:** `src/features/profile/pages/ProfilePage.jsx`

Mientras `saving === true`, los campos siguen editables. El usuario puede modificar datos durante el guardado y perder la actualización.

```jsx
// FIX
<fieldset disabled={saving}>
  {/* todos los campos */}
</fieldset>
```

---

#### CODE-10: `aria-describedby` apunta a ID incorrecto

**Archivo:** `src/shared/components/FormField.jsx`

`aria-describedby` apunta a `error-${name}` pero el `<span>` de error tiene `id={name}`. Los lectores de pantalla no anuncian los errores.

```jsx
// FIX: alinear IDs
const errorId = `field-error-${name}`
// En el input: aria-describedby={hasError ? errorId : undefined}
// En el span: id={errorId}
```

---

#### CODE-11: `profileLabel` en Navbar puede ser vacío/null

**Archivo:** `src/shared/components/Navbar.jsx`

Si `user.name` y `user.surname` son null, `profileLabel` queda vacío.

```js
// FIX
const profileLabel = [user.name, user.surname].filter(Boolean).join(' ').trim() || t('nav.guest')
```

---

#### CODE-12: Botones sin `type="button"` explícito

**Archivos:** varios componentes

Botones dentro de formularios sin `type="button"` tienen `type="submit"` por defecto y pueden enviar el formulario accidentalmente.

---

#### CODE-13: Mobile menu no se cierra al hacer click en página actual

**Archivo:** `src/shared/components/Navbar.jsx`

Si el usuario está en `/tools` y hace click en el link de tools, el menú móvil no se cierra.

---

#### CODE-14: `RegisterForm` no limpia error de confirmación al coincidir passwords

**Archivo:** `src/features/auth/components/RegisterForm.jsx`

El mensaje "passwords no coinciden" no desaparece en tiempo real cuando el usuario corrige la confirmación.

---

### 🟡 MEDIUM

#### CODE-15: Filtrado no preserva el orden de los resultados

**Archivo:** `src/features/tools/lib/toolsListView.js`

`buildVisibleTools` filtra y luego ordena, pero el orden podría no ser el esperado en algunos casos.

---

#### CODE-16: `useMemo` con dependencias incompletas en `ToolsListPage`

**Archivo:** `src/features/tools/pages/ToolsListPage.jsx`

El segundo `useMemo` no incluye `isMobile` aunque la lógica de paginación depende de él.

---

#### CODE-17: `toolMapper` sin null-checks

**Archivo:** `src/features/tools/api/toolMapper.js`

El mapper no tiene fallbacks para campos null del API. Si el backend devuelve campos opcionales como null, hay riesgo de runtime errors.

---

#### CODE-18: `GlobalErrorBoundary` redirige a la misma URL al recargar

**Archivo:** `src/shared/components/GlobalErrorBoundary.jsx`

Si el error está en el componente raíz, recargar la misma URL entra en bucle. Debería redirigir a `/login`.

---

#### CODE-19: Lógica de paginación difícil de testear

**Archivo:** `src/features/tools/lib/toolsListView.js`

`pageNumbersToDisplay` usa Sets y operaciones complejas sin tests para casos límite (página 1, última página, 1 sola página).

---

### 🔵 LOW

#### CODE-20: Código muerto — `useState` sin usar en `main` branch

**Archivo:** `src/App.jsx` (main branch)

`const [count, setCount] = useState(0)` declarado pero nunca usado.

---

#### CODE-21: `prevConfirmOpen` ref nunca leído en `ToolsCard`

**Archivo:** `src/features/tools/components/ToolsCard.jsx`

Ref creado y actualizado pero su valor nunca se lee.

---

#### CODE-22: Variable `linkClass` inconsistente en Navbar

**Archivo:** `src/shared/components/Navbar.jsx`

`linkClass` se usa en desktop pero mobile tiene estilos distintos inline. Extraer `desktopLinkClass` y `mobileLinkClass`.

---

#### CODE-23: `useAuth` lanza error sin contexto de debugging

**Archivo:** `src/app/auth/useAuth.js`

El error al usar `useAuth` fuera del provider no indica dónde falta el `<AuthProvider>`.

---

#### CODE-24: Sin alias de paths en Vite

**Archivo:** `vite.config.js`

Imports como `../../../shared/i18n` son frágiles. Configurar `@/` como alias de `src/`:

```js
resolve: { alias: { '@': '/src' } }
```

---

## 4. Gaps de testing

| Área sin cobertura | Impacto |
| --- | --- |
| `useLogin`, `useRegister`, `useToolsData` | Alto — lógica crítica sin tests |
| `authApi`, `toolsApi`, `profileApi` | Alto — comportamiento de API sin verificar |
| Persistencia de auth en localStorage | Alto — bug CODE-1 no detectado |
| Hooks con cambio de locale durante async | Medio — race condition CODE-2 |
| Paginación móvil con búsqueda activa | Medio — bug CODE-4 no detectado |
| E2E: login → tools → favorito | Alto — flujo crítico sin cobertura |

---

## 5. Roadmap de fixes

### Fase 1 — Crítico (antes de producción)

| ID | Fix |
| --- | --- |
| SEC-1 / CODE-1 | Persistencia de auth (localStorage + backend real) |
| SEC-2 | Reemplazar mock auth con backend real |
| SEC-3 | Eliminar PII del estado del cliente |
| SEC-5 | Quitar campo `role` del formulario editable |
| CODE-3 | Fix race condition en toggleFavorite |
| CODE-4 | Fix bug de paginación móvil |
| CODE-6 | Fix `t` no actualiza al cambiar locale |

### Fase 2 — Alta prioridad (próximo sprint)

| ID | Fix |
| --- | --- |
| SEC-4 | CSRF protection en formularios |
| SEC-8 | Content Security Policy |
| CODE-2 | Fix stale closure en useToolsData |
| CODE-5 | Error Boundaries por ruta |
| CODE-9 | Deshabilitar formulario durante guardado |
| CODE-10 | Fix `aria-describedby` en FormField |

### Fase 3 — Deuda técnica

| ID | Fix |
| --- | --- |
| SEC-9 | Requisitos de contraseña + validación en backend |
| CODE-8 | Limpiar error al reintentar |
| CODE-11 | Null safety en profileLabel |
| CODE-15/16 | Refactor filtrado y memoización |
| CODE-24 | Alias de paths en Vite |
| — | Añadir TypeScript progresivamente |
| — | Tests para hooks y APIs |
| — | E2E con Playwright para flujos críticos |

---

## 6. Conteo total de issues

| Severidad | Seguridad | Código | Total |
| --- | --- | --- | --- |
| 🔴 CRITICAL | 3 | 6 | 9 |
| 🟠 HIGH | 6 | 8 | 14 |
| 🟡 MEDIUM | 4 | 7 | 11 |
| 🔵 LOW | 3 | 5 | 8 |
| **Total** | **16** | **26** | **42** |
