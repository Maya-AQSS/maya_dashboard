import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const STYLES = {
  success: 'bg-success-light dark:bg-success-dark/30 border-success/20 dark:border-success/50 text-success-dark dark:text-success-light',
  error: 'bg-danger-light dark:bg-danger-dark/30 border-danger/20 dark:border-danger/50 text-danger-dark dark:text-danger-light',
  info: 'bg-info-light dark:bg-info-dark/30 border-info/20 dark:border-info/50 text-info-dark dark:text-info-light',
  warning: 'bg-warning-light dark:bg-warning-dark/30 border-warning/20 dark:border-warning/50 text-warning-dark dark:text-warning-light',
}

const ICON_STYLES = {
  success: 'text-success dark:text-success-light',
  error: 'text-danger dark:text-danger-light',
  info: 'text-info dark:text-info-light',
  warning: 'text-warning-dark dark:text-warning-light',
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[500] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg text-sm font-medium animate-slide-up max-w-xs ${STYLES[t.type]}`}
          >
            <span className={`shrink-0 text-base font-bold ${ICON_STYLES[t.type]}`}>
              {ICONS[t.type]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 ml-1 opacity-50 hover:opacity-100 transition-opacity text-base leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
