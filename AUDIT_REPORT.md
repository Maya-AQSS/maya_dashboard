# Audit — maya_dashboard

Generated: 2026-05-15
Auditor: maya-architecture-auditor

## Compliance summary

| Layer | Total checks | Passing | Failing |
|-------|-------------|---------|---------|
| Backend B1–B9 | 9 | 7 | 2 |
| Frontend F1–F5 | 5 | 3 | 2 |
| Events/Audit E1–E5 | 5 | 2 | 3 |

---

## Backend violations

### B4 — Service returns Eloquent model to controller (partial)

`app/Http/Resources/AlertRuleResource.php:22` — the resource performs a runtime
`instanceof AlertRule` guard and calls `AlertRuleDto::fromModel()` inside it. This
means `AlertRuleService::list()` returns `list<AlertRuleDto>` correctly, but the
resource is designed defensively to also accept a raw `AlertRule` model, suggesting
a previous code path that passed models is only partially closed. Severity: LOW
(guard exists, no actual model escapes at runtime today — flag for cleanup).

### B8 — Listing without pagination

`app/Http/Controllers/Api/V1/Alerts/AlertRuleController.php:19–24` (`index`) —
delegates to `AlertRuleService::list()` which calls `AlertRuleRepository::listOrderedBySlug()
→ AlertRule::query()->orderBy('slug')->get()`. Returns the entire `alert_rules` table
without pagination. In low-volume environments this is safe, but the pattern is
non-compliant and will degrade as rule count grows.

`app/Http/Controllers/Api/V1/Dashboard/ApplicationController.php:20–27` (`index`) —
delegates to `ApplicationService::listForUser()` → `ApplicationRepository::listActiveWithFavoriteFlag()
→ …->get()`. Returns all active applications for the user with no pagination.
Applications are master data and the list may be bounded in practice, but the same
structural concern applies.

`app/Http/Controllers/Api/V1/Dashboard/UserFavoriteApplicationController.php:23–28`
(`index`) — delegates to `UserFavoriteApplicationRepository::listForUser()` which
calls `$user->favoriteApplications()->get()`. No pagination.

---

## Frontend violations

### F1 — useEffect + useState + fetch triplet (SWR/TanStack Query not used)

`frontend/src/features/dashboard-layout/hooks/useDashboardLayout.ts:28–65` — uses
`useEffect` + `useState` + async `fetch` (via `getDashboardLayout`) to load the
dashboard layout. Should be replaced with a `useQuery` call from TanStack Query to
gain caching, deduplication, and error boundaries.

`frontend/src/features/favorites/context/FavoritesContext.tsx:28–47` — uses
`useEffect` + `useState` + `getFavorites(...)` call. The context wraps the data
fetch manually without SWR/TanStack Query. `add` and `remove` perform optimistic
updates with plain state, bypassing the query cache. Refactor to use `useQuery`
for initial load and `useMutation` for mutations.

### F3 — Implicit `any` in app code (strict mode is enabled)

`frontend/src/features/dashboard/widgets/DailyFichajesWidget.tsx` — numerous
helper functions and component props lack TypeScript types under `strict: true`,
producing implicit `any`:
- Line 7: `function toDateString(date)` — `date` is untyped.
- Line 14: `function isToday(date)` — `date` is untyped.
- Line 18: `function formatTime(timestamp)` — `timestamp` is untyped.
- Line 22: `function toTimeValue(timestamp)` — `timestamp` is untyped.
- Line 30: `function formatHours(ms)` — `ms` is untyped.
- Line 38: `function pairEntries(entries, selectedDate)` — both params untyped.
- Line 93: `function WeekDatePicker({ selectedDate, onSelect, dateLocale, t })` —
  no `interface WeekDatePickerProps` declared.
- Line 39: `const handleAction = (alert) =>` inside `UserAlertsWidget.tsx` — `alert`
  is untyped.

`frontend/src/features/dashboard/pages/DashboardPage.tsx:25–26` — `useState(null)`
for `draftLayout` and `snapshotRef = useRef(null)` without generic type annotation
(`useState<LayoutItem[] | null>(null)`).

`frontend/src/features/favorites/components/FavoritesList.tsx:7` — `function FavoriteCard({ fav, onRemove })` — both props are untyped.

---

## Eventos / Audit (E1–E5)

### E1 — Missing `#[ObservedBy]` attribute and missing observers for auditable models

**AlertRule**: Observer is registered via `AlertRule::observe(AlertRuleObserver::class)`
in `AppServiceProvider::boot()`, NOT via the `#[ObservedBy(AlertRuleObserver::class)]`
attribute on the model. This is a style non-compliance; functionally equivalent but
inconsistent with the required pattern.

**Alert**, **Notification**, **UserDashboardLayout**, **UserFavoriteApplication**:
None of these models have an Observer or `#[ObservedBy]` attribute. CRUD mutations
(acknowledge/resolve for Alert; markRead/markAllRead for Notification; upsert for
UserDashboardLayout; attach/detach for UserFavoriteApplication) produce no audit
trail. These are all auditable operations that should be covered.
Severity: HIGH — silent mutations with no forensic record.

### E1-sub — Observer does NOT wrap `AuditPublisher::publish()` in `DB::afterCommit()`

`app/Observers/AlertRuleObserver.php:40–88` — `created()`, `updated()`, and
`deleted()` call `$this->publish(...)` which calls `AuditPublisher::publish()`
directly, without `DB::afterCommit()`. If the surrounding write transaction is
rolled back (e.g., a constraint violation after the Observer fires), the audit
event will have been dispatched to RabbitMQ for a change that never persisted.
Severity: MEDIUM — potential phantom audit events on rollback.

### E2 — No domain Events in `app/Events/`

The `app/Events/` directory does not exist. Named business facts —
`AlertAcknowledged`, `AlertResolved`, `NotificationDismissed` — are not modelled
as domain Events implementing `Maya\Messaging\Contracts\AuditableEvent`. The
`AuditableEvent` interface and `RecordAuditableEvent` listener do NOT exist in
`maya-shared-messaging-laravel/src/Contracts/` (confirmed: only `MessagePublisher`
is present). These are prerequisite infrastructure items that must be created
before E2 can be implemented.
Severity: MEDIUM (prerequisite missing in shared package).

### E3 — Services do not call `AuditPublisher::publish()` directly (PASS)

`AlertIngestionService` and `NotificationIngestionService` do not call
`AuditPublisher`. Both delegate persistence to their repositories. No E3 violation
found.

### E4 — N/A (no domain Events exist, cannot evaluate Observer + Event co-existence)

### E5 — No Listeners in `app/Listeners/` (PASS)

The `app/Listeners/` directory does not exist. No duplication with a wildcard audit
listener.

### Security alert — `EvaluateAlertRules.php:48` raw SQL execution CONFIRMED STILL PRESENT

`app/Console/Commands/EvaluateAlertRules.php:48`:
```php
return DB::connection($logsConnection)->select($rule->query_sql);
```
`$rule->query_sql` is executed as raw SQL against the `pgsql_logs` connection.
The `SafeAlertQuery` validation rule (applied via `StoreAlertRuleRequest` and
`UpdateAlertRuleRequest`) provides API-boundary defense: it requires `SELECT` prefix,
bans write/DDL tokens, strips SQL comments before scanning, and rejects stacked
statements via `;`.

**Assessment**: The risk flagged on 2026-05-13 is PARTIALLY mitigated. The
`SafeAlertQuery` rule is substantive and thoughtfully designed (`pg_read_file`,
`dblink`, `pg_sleep` all banned; comment stripping prevents bypass). However the
defense is incomplete:
- The validation only runs on write operations (store/update). An alert rule stored
  before `SafeAlertQuery` was introduced, or one inserted directly via DB/migration,
  bypasses the check.
- The `pgsql_logs` DB role lockdown (referenced in the code comment) is the
  primary runtime guard — if that role has no write privileges and minimal function
  grants, the residual risk is low. Verify the role definition in
  `database/sql/log_mgmt_readonly_role.sql`.
- Consider adding a secondary validation pass inside `EvaluateAlertRules::handle()`
  (i.e., instantiate `SafeAlertQuery` and validate before execution) to close the
  pre-validation gap.
Severity: MEDIUM (defended at API layer, undefended for DB-inserted rules).

---

## Extraction candidates

### Already extracted but consumed locally (HIGH — fix immediately)

No violations of this class found. All shared packages (`@maya/shared-auth-react`,
`@maya/shared-ui-react`, `@maya/shared-i18n-react`, `@maya/shared-sidebar-react`,
`@maya/shared-layout-react`) are properly imported from packages. `HealthCheckController`
extends `AbstractHealthCheckController` from `maya-shared-http-laravel`.

### New candidates (cross-project evidence)

- `frontend/src/features/dashboard-layout/hooks/useDashboardLayout.ts` — all 5
  Maya frontends have a `DashboardPage` that loads a persisted layout. The hook
  pattern (load on mount, save on change) is likely duplicated. If other apps also
  call a dashboard-layout API endpoint, extract to a shared hook in
  `maya-shared-ui-react` or a new `maya-shared-dashboard-react` package.

- `frontend/src/shared/hooks/useIsMobile.ts` — not found in the other 4 projects'
  `frontend/src/` trees (grep returned no matches), but the pattern is generic
  enough to warrant inclusion in `maya-shared-layout-react` proactively if the
  package is already consumed by all apps (it is not currently imported here —
  `@maya/shared-layout-react` is in the tsconfig paths but not used in this file).

### Local-only patterns (no extraction needed)

- `frontend/src/features/alerts/` — alert bar with system + fichaje alerts is
  specific to dashboard as the SSO relay and notification hub.
- `frontend/src/features/fichaje/hooks/useDailyFichajes.ts` — fichaje widget is
  specific to this dashboard; currently a dev-only mock pending the real API.
- `backend/app/Console/Commands/EvaluateAlertRules.php` — alert rule evaluation
  against the logs DB connection is specific to this service's role.
- `backend/app/Rules/SafeAlertQuery.php` — domain-specific SQL safelist rule.

---

## Statistics

- Controllers audited: 7 (excluding base Controller)
- Services audited: 8 concrete implementations
- Repositories audited: 6 Eloquent + 6 contracts
- DTOs found: 9
- FormRequests found: 7
- Frontend components: 13 (`.tsx` files, excluding tests)
- Frontend hooks: 14 (`use*.ts` files)

---

## Notes

1. **AlertRuleController.index** returns all rules without pagination — acceptable
   for an admin-only endpoint with a small expected dataset, but should be converted
   to `->paginate()` for consistency with the architecture rule and future-proofing.

2. **NotificationController** has 5 public methods (`index`, `markRead`,
   `markAllRead`, `unreadCount` + constructor) — exactly at the B9 limit. Any
   future method addition will breach it; consider splitting at that point.

3. **DailyFichajesWidget.tsx** is the largest single TSX file at ~380 lines. It
   contains unrelated utility functions (`pairEntries`, `startOfWeek`, etc.) that
   should be extracted to a `fichaje/utils.ts` file, and `WeekDatePicker` should
   be its own component file. This will also resolve the F3 implicit-any violations
   by forcing explicit prop interfaces.

4. **FavoritesContext** uses `useEffect + fetch` for initial load and also drives
   cross-window notifications via `notifyFavoritesChanged()` from
   `@maya/shared-sidebar-react`. The correct refactor is `useQuery` for the load
   path + `useMutation` for add/remove, keeping the `notifyFavoritesChanged()` call
   in `onSuccess` of the mutations. This preserves the cross-window broadcast.

5. **Missing Observers prerequisite**: Before adding observers for `Alert`,
   `Notification`, `UserDashboardLayout`, and `UserFavoriteApplication`, the
   `AuditableEvent` contract and `RecordAuditableEvent` listener must first be
   added to `maya-shared-messaging-laravel`. This is a shared infrastructure task,
   not a dashboard-only fix.
