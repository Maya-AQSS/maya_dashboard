import { useState } from 'react'

// ─── Íconos inline ───────────────────────────────────────────
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
)
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
)
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
)
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
)

// ─── Navegación ───────────────────────────────────────────────
const navItems = [
  { id: 'dashboard',  label: 'Dashboard',   icon: HomeIcon },
  { id: 'analytics',  label: 'Analíticas',  icon: ChartIcon },
  { id: 'usuarios',   label: 'Usuarios',    icon: UsersIcon },
  { id: 'ajustes',    label: 'Ajustes',     icon: SettingsIcon },
]

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-ui-sidebar dark:bg-ui-dark-bg flex flex-col z-[100] border-r border-white/10 dark:border-ui-dark-border">
      <div className="h-14 flex items-center px-5 border-b border-white/10 dark:border-ui-dark-border-l">
        <span className="text-lg font-bold text-white tracking-wide">Maya Dashboard</span>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              active === id
                ? 'bg-ui-sidebar-active dark:bg-odoo-dark-purple text-white'
                : 'text-white/60 hover:bg-ui-sidebar-hover dark:hover:bg-ui-dark-card hover:text-white/90'
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-white/40">Maya v1.0</p>
      </div>
    </aside>
  )
}

// ─── Topbar ──────────────────────────────────────────────────
function Topbar({ title, isDark, onToggle }) {
  return (
    <header className="h-14 bg-ui-topbar dark:bg-ui-dark-topbar shadow-topbar flex items-center justify-between px-6 z-[200]">
      <h1 className="text-md font-semibold text-text-primary dark:text-text-dark-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-ui-body dark:hover:bg-ui-dark-card text-text-secondary dark:text-text-dark-secondary transition-colors"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <div className="w-8 h-8 rounded-full bg-odoo-purple flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
      </div>
    </header>
  )
}

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

// ─── DashboardPage (root) ─────────────────────────────────────
function DashboardPage() {
  const [section, setSection] = useState('dashboard')
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (isDark) document.documentElement.classList.add('dark')

  const title = navItems.find((n) => n.id === section)?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-ui-body dark:bg-ui-dark-bg">
      <Sidebar active={section} onNav={setSection} />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar title={title} isDark={isDark} onToggle={toggleDark} />
        <main className="flex-1">
          {section === 'dashboard' && <MainContent />}
          {section !== 'dashboard' && (
            <div className="p-6">
              <div className="bg-ui-card dark:bg-ui-dark-card rounded-lg border border-ui-border dark:border-ui-dark-border shadow-card p-8 text-center">
                <p className="text-text-muted dark:text-text-dark-muted text-sm">
                  Módulo en construcción.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardPage