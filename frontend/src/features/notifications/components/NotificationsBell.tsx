import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationsBell({ token }) {
  const { notifications, unread, loading, onMarkRead, onMarkAllRead } = useNotifications({ token })
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => setOpen((v) => !v)}
        className="notifications-bell__trigger"
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="notifications-bell__badge" data-testid="unread-badge">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Lista de notificaciones"
          className="absolute right-0 top-full min-w-[340px] max-h-[400px] overflow-y-auto bg-ui-card dark:bg-ui-dark-card border border-ui-border dark:border-ui-dark-border rounded-lg shadow-dropdown p-2 z-[210]"
        >
          <div className="flex justify-between items-center px-2 py-1">
            <strong>Notificaciones</strong>
            {unread > 0 && (
              <button type="button" onClick={onMarkAllRead} className="text-sm text-odoo-purple hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading && <p className="p-3">Cargando…</p>}

          {!loading && notifications.length === 0 && (
            <p className="p-3 text-text-muted dark:text-text-dark-muted">
              No tienes notificaciones.
            </p>
          )}

          <ul className="list-none m-0 p-0">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-2.5 border-t border-ui-border dark:border-ui-dark-border ${n.read_at ? '' : 'bg-info-light/60 dark:bg-info-dark/10'}`}
              >
                <div className="flex justify-between gap-2">
                  <strong className="text-sm">{n.title}</strong>
                  <small className="text-text-muted dark:text-text-dark-muted">
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
                <p className="my-1 text-sm">{n.body}</p>
                {!n.read_at && (
                  <button type="button" onClick={() => onMarkRead(n.id)} className="text-sm text-odoo-purple hover:underline">
                    Marcar como leída
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
