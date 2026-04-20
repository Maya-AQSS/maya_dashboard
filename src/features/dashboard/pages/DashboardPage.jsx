// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, delta, colorClass }) {
  return (
    <div className={`rounded-lg border p-5 shadow-card ${colorClass}`}>
      <p className="text-xs uppercase tracking-wide font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {delta && (
        <p className="text-xs mt-1 opacity-60">{delta}</p>
      )}
    </div>
  )
}

// ─── Sección principal ─────────────────────────────────────────
function MainContent() {
  const kpis = [
    { label: 'Usuarios activos',  value: '—', delta: 'vs. mes anterior',  colorClass: 'bg-odoo-purple/10 dark:bg-odoo-purple/40 text-odoo-purple-d dark:text-white border-odoo-purple/20 dark:border-odoo-purple/50' },
    { label: 'Ingresos',          value: '—', delta: 'vs. mes anterior',  colorClass: 'bg-odoo-teal/10 dark:bg-odoo-teal/40 text-odoo-teal-d dark:text-white border-odoo-teal/20 dark:border-odoo-teal/50' },
    { label: 'Tickets abiertos',  value: '—', delta: 'pendientes',        colorClass: 'bg-warning-light dark:bg-warning-dark/50 text-warning-dark dark:text-white border-warning/20 dark:border-warning/50' },
    { label: 'Errores críticos',  value: '—', delta: 'últimas 24h',       colorClass: 'bg-danger-light dark:bg-danger-dark/50 text-danger-dark dark:text-white border-danger/20 dark:border-danger/50' },
  ]

  const recentActivity = [
    { id: 1, user: 'Sistema', action: 'Esperando datos de la API', time: 'Ahora',    status: 'info' },
  ]

  const statusBadge = {
    success: 'bg-success-light dark:bg-success-dark/30 text-success-dark dark:text-success-light',
    warning: 'bg-warning-light dark:bg-warning-dark/30 text-warning-dark dark:text-warning-light',
    danger:  'bg-danger-light dark:bg-danger-dark/30 text-danger-dark dark:text-danger-light',
    info:    'bg-info-light dark:bg-info-dark/30 text-info-dark dark:text-info-light',
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Actividad reciente */}
      <div className="bg-ui-card dark:bg-ui-dark-card rounded-lg border border-ui-border dark:border-ui-dark-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-ui-border-l dark:border-ui-dark-border-l flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
            Actividad reciente
          </h2>
          <button className="text-xs text-text-link dark:text-text-dark-link hover:underline">
            Ver todo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-ui-body dark:bg-ui-dark-card">
              <tr>
                {['Usuario', 'Acción', 'Hora', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border-l dark:divide-ui-dark-border-l">
              {recentActivity.map((row) => (
                <tr key={row.id} className="hover:bg-odoo-purple/[0.02] dark:hover:bg-odoo-dark-purple/[0.05] transition-colors">
                  <td className="px-4 py-3 text-sm text-text-primary dark:text-text-dark-primary font-medium">{row.user}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{row.action}</td>
                  <td className="px-4 py-3 text-sm text-text-muted dark:text-text-dark-muted">{row.time}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── DashboardPage (content only — layout handled by AppLayout) ───
function DashboardPage() {
  return <MainContent />
}

export default DashboardPage