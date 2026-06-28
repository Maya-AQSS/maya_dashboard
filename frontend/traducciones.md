# Auditoría i18n — maya_dashboard (frontend)

## Resumen
- Archivos revisados: 84
- Archivos con strings sin traducir: 2
- Total de hallazgos: 14
- Paridad de locales (es/en/va): OK — 432 claves en `common.json` y 25 en `auth.json`, idénticas en los tres idiomas (sin claves huérfanas)
- Severidad global: low

> Nota: el frontend está muy bien internacionalizado. Todos los textos de cara al
> usuario se renderizan con `t()`/`useTranslation`/`useLocale`. Los 14 hallazgos NO
> son strings sin traducir reales: son **valores de respaldo (`defaultValue` / `|| 'texto'`)
> hardcodeados en español** que jamás llegan a renderizarse porque su clave i18n SÍ
> existe en los tres locales. Son deuda de higiene de código (cadenas muertas), no un
> gap funcional de i18n. Por eso la severidad global es `low`.

## Hallazgos por archivo

### src/features/profile/pages/ProfilePage.tsx
Respaldos en español hardcodeados con el operador `||`. La clave existe en es/en/va,
por lo que el respaldo nunca se muestra; debe eliminarse.

| Línea | String hardcodeado | Clave i18n sugerida |
|------|--------------------|---------------------|
| 357 | "Preferencias" (`t('userMenu.preferences') \|\| 'Preferencias'`) | common:userMenu.preferences (eliminar respaldo) |
| 359 | "Idioma" (`t('profile.language') \|\| 'Idioma'`) | common:profile.language (eliminar respaldo) |
| 485 | "Preferencias" (`t('userMenu.preferences') \|\| 'Preferencias'`) | common:userMenu.preferences (eliminar respaldo) |
| 489 | "Idioma" (`t('profile.language') \|\| 'Idioma'`) | common:profile.language (eliminar respaldo) |

### src/features/dashboard/widgets/DailyFichajesWidget.tsx
Respaldos en español en el parámetro `defaultValue` de `t()`. Todas las claves
`dashboard.fichaje.*` existen en los tres locales, por lo que el `defaultValue`
nunca se usa. Recomendado retirarlo. Además, la línea 509 reutiliza la clave
`dashboard.fichaje.dailyTitle` con un `defaultValue: 'Usuario'` que no le corresponde
(posible bug de clave equivocada).

| Línea | String hardcodeado | Clave i18n sugerida |
|------|--------------------|---------------------|
| 472 | "Fichar salida" | common:dashboard.fichaje.clockOutButton (eliminar defaultValue) |
| 473 | "Fichar" | common:dashboard.fichaje.clockInButton (eliminar defaultValue) |
| 494 | "Fichajes del día" | common:dashboard.fichaje.dailyTitle (eliminar defaultValue) |
| 509 | "Usuario" (clave errónea: usa `dailyTitle`) | crear/usar common:dashboard.fichaje.userFallback; corregir clave |
| 519 | "Total trabajado" | common:dashboard.fichaje.totalWorked (eliminar defaultValue) |
| 561 | "Fichando…" | common:dashboard.fichaje.clockingIn (eliminar defaultValue) |
| 562 | "Fichar" | common:dashboard.fichaje.clockInButton (eliminar defaultValue) |
| 597 | "Entrada" | common:dashboard.fichaje.entrada (eliminar defaultValue) |
| 623 | "Salida" | common:dashboard.fichaje.salida (eliminar defaultValue) |
| 675 | "Fichando…" | common:dashboard.fichaje.clockingIn (eliminar defaultValue) |

## Archivos revisados sin incidencias

Correctamente internacionalizados (usan `t()`/`useTranslation`/`useLocale` para todo el texto de usuario):
- src/App.tsx
- src/main.tsx
- src/components/ErrorFallback.tsx
- src/components/layout/navItems.tsx
- src/shared/pages/NotFoundPage.tsx
- src/features/applications/pages/ApplicationsListPage.tsx
- src/features/bookings/components/BookingDetailsPopover.tsx
- src/features/dashboard/pages/DashboardPage.tsx
- src/features/dashboard/widgets/BookingsWidget.tsx
- src/features/dashboard/widgets/UserAlertsWidget.tsx
- src/features/favorites/components/FavoritesList.tsx
- src/features/notifications/pages/NotificationsPage.tsx
- src/features/notifications/pages/NotificationDetailPage.tsx
- src/features/panel-alerts/components/AlertAudienceFields.tsx
- src/features/panel-alerts/components/NotificationRuleForm.tsx
- src/features/panel-alerts/components/PanelAlertForm.tsx
- src/features/panel-alerts/components/ScheduledRulesTab.tsx
- src/features/panel-alerts/components/SystemNotificationsTab.tsx
- src/features/panel-alerts/pages/NotificationRuleFormPage.tsx
- src/features/panel-alerts/pages/PanelAlertFormPage.tsx
- src/features/panel-alerts/pages/PanelAlertsPage.tsx
- src/features/profile/lib/profileSchema.ts (mensajes de validación Zod vía `t()`)

Sin texto de usuario (lógica/datos/tipos/API/hooks; no contienen cadenas de cara al usuario):
- src/api/auth.ts
- src/api/http.ts
- src/auth/oidcAdapter.ts
- src/components/layout/index.ts
- src/permissions.ts
- src/hooks/useDebounce.ts
- src/lib/dateUtils.ts
- src/lib/peerService.ts
- src/shared/hooks/useIsMobile.ts
- src/types/users.ts
- src/test/setup.ts
- src/features/alerts/api/attendanceReminderApi.ts
- src/features/alerts/hooks/useFichajeAlerts.ts (errores son claves i18n)
- src/features/alerts/hooks/useUserAlerts.ts
- src/features/alerts/types/alertItem.ts
- src/features/applications/api/applicationMapper.ts
- src/features/applications/api/applicationsApi.ts (errores son claves i18n)
- src/features/applications/hooks/useApplicationsData.ts
- src/features/bookings/api/bookingsApi.ts (errores son claves i18n)
- src/features/bookings/components/DashboardCalendar.tsx (presentacional; recibe `messages` ya traducidos)
- src/features/bookings/hooks/useBookings.ts
- src/features/bookings/types/booking.ts
- src/features/dashboard-layout/api/dashboardLayoutApi.ts (errores son claves i18n)
- src/features/dashboard-layout/hooks/useDashboardLayout.ts
- src/features/dashboard/widgets/registry.ts
- src/features/favorites/api/favoritesApi.ts (errores son claves i18n)
- src/features/favorites/context/FavoritesContext.tsx (solo error de invariante dev, no de usuario)
- src/features/fichaje/api/clockInApi.ts (errores son claves i18n)
- src/features/fichaje/hooks/useDailyFichajes.ts (errores son claves i18n)
- src/features/fichaje/lib/pairEntries.ts
- src/features/languages/api.ts (nombres de idioma `Español`/`Valencià`/`English` son endónimos; no se traducen)
- src/features/languages/types.ts
- src/features/languages/useLanguages.ts
- src/features/notifications/api/notificationsApi.ts
- src/features/notifications/appLabel.ts (resuelve etiqueta vía `t()` con fallback al slug técnico)
- src/features/notifications/hooks/useCriticalAlerts.ts
- src/features/notifications/hooks/useNotifications.ts
- src/features/notifications/hooks/useNotification.ts
- src/features/notifications/notificationI18n.ts
- src/features/notifications/resolveResourceUrl.ts
- src/features/notifications/types/notification.ts
- src/features/panel-alerts/api/notificationDefinitionsApi.ts
- src/features/panel-alerts/api/notificationRulesApi.ts
- src/features/panel-alerts/api/notificationSampleApi.ts
- src/features/panel-alerts/api/panelAlertsApi.ts
- src/features/panel-alerts/hooks/useNotificationDefinitions.ts
- src/features/panel-alerts/hooks/useNotificationRules.ts
- src/features/panel-alerts/hooks/usePanelAlerts.ts
- src/features/panel-alerts/types/alertAudience.ts
- src/features/panel-alerts/types/notificationRule.ts
- src/features/panel-alerts/types/panelAlert.ts
- src/features/panel-alerts/types/systemNotification.ts
- src/features/profile/api/academicContextApi.ts
- src/features/profile/api/employeeApi.ts
- src/features/profile/api/profileApi.ts
- src/features/user-profile/index.ts
- src/features/user-profile/UserProfileProvider.tsx

Notas sobre falsos positivos descartados (no son hallazgos):
- `placeholder="0 7 * * *"`, `"0 9 * * 1"`, `"120"`, `"https://..."`, `"ES76 2077 ..."`, `"1234ABC"`, `"0 7 * * *"`: ejemplos de formato técnico (cron, IBAN, matrícula, URL), no texto traducible.
- `throw new Error('User not authenticated')` (ApplicationsListPage:60) y `throw new Error('useFavoritesContext must be inside FavoritesProvider')` (FavoritesContext:160): mensajes de invariante de desarrollo, nunca mostrados al usuario final.
- El resto de `throw new Error('feature.errorLoad')` usan claves i18n como mensaje (resueltas aguas arriba con `t(error)`).

## Gaps de paridad de locales

Ninguno. Comparación de claves aplanadas:
- `common.json`: es=432, en=432, va=432 — conjuntos idénticos, 0 diferencias.
- `auth.json`: es=25, en=25, va=25 — conjuntos idénticos, 0 diferencias.

La diferencia de tamaño de archivo entre `es/common.json` (20829 B) y `en/common.json`
(19318 B) se debe únicamente a la longitud del texto traducido, no a claves faltantes.

## Recomendaciones

1. (LOW) Eliminar los respaldos en español hardcodeados de `DailyFichajesWidget.tsx`
   (10 ocurrencias) y `ProfilePage.tsx` (4 ocurrencias). Como las claves existen en los
   tres locales, `t('clave')` ya devuelve el texto correcto; los `defaultValue` / `|| '...'`
   son código muerto que, si la clave llegara a borrarse, mostraría español a usuarios
   en/va. Sustituir por la llamada simple `t('clave')`.
2. (LOW — posible bug) Corregir `DailyFichajesWidget.tsx:509`: usa la clave
   `dashboard.fichaje.dailyTitle` con `defaultValue: 'Usuario'`. La clave devuelve
   "Fichajes del día", no un nombre de usuario. Revisar si debería ser una clave nueva
   tipo `dashboard.fichaje.userFallback` o `values.user`.
3. (Preventivo) Añadir una regla de lint/CI que prohíba `defaultValue` literal y
   respaldos `|| 'texto'` en llamadas a `t()`, para que la traducción sea la única
   fuente de verdad y se mantenga la paridad de locales ya conseguida.
4. Mantener el patrón actual (excelente): texto de usuario siempre vía `t()`, errores
   propagados como claves i18n y resueltos en la capa de presentación, componentes
   presentacionales que reciben `messages` ya traducidos.
