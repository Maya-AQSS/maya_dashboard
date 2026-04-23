import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationsBell({ token }) {
  const { notifications, unread, loading, onMarkRead, onMarkAllRead } = useNotifications({ token })
  const [open, setOpen] = useState(false)

  return (
    <div className="notifications-bell" style={{ position: 'relative' }}>
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
          className="notifications-bell__panel"
          style={{
            position: 'absolute', right: 0, top: '100%', minWidth: 340,
            maxHeight: 400, overflowY: 'auto', background: 'var(--ui-card, #fff)',
            border: '1px solid var(--ui-border, #e5e7eb)', borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: 8, zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
            <strong>Notificaciones</strong>
            {unread > 0 && (
              <button type="button" onClick={onMarkAllRead} style={{ fontSize: 12 }}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {loading && <p style={{ padding: 12 }}>Cargando…</p>}

          {!loading && notifications.length === 0 && (
            <p style={{ padding: 12, color: 'var(--text-muted, #6b7280)' }}>
              No tienes notificaciones.
            </p>
          )}

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {notifications.map((n) => (
              <li
                key={n.id}
                style={{
                  padding: 10,
                  borderTop: '1px solid var(--ui-border, #e5e7eb)',
                  background: n.read_at ? 'transparent' : 'rgba(59,130,246,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 14 }}>{n.title}</strong>
                  <small style={{ color: 'var(--text-muted, #6b7280)' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
                <p style={{ margin: '4px 0 6px', fontSize: 13 }}>{n.body}</p>
                {!n.read_at && (
                  <button type="button" onClick={() => onMarkRead(n.id)} style={{ fontSize: 12 }}>
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
