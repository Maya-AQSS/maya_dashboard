import { useState, useRef, useCallback } from 'react'
import useDashboardLayout, { DEFAULT_LAYOUT } from '../../dashboard-layout/hooks/useDashboardLayout'
import { DashboardEditToggleButton } from '@maya/shared-dashboard-react'
import { WIDGET_REGISTRY } from '../widgets/registry'
import WidgetGrid from '../components/WidgetGrid'
import DashboardEditToolbar from '../components/DashboardEditToolbar'
import { useToast } from '../../../shared/context/ToastContext'
import { useLocale } from '../../../shared/i18n'

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 grid grid-cols-12 gap-4 animate-pulse">
      <div className="col-span-12 sm:col-span-6 h-48 bg-ui-border-l dark:bg-ui-dark-border rounded-2xl" />
      <div className="col-span-12 sm:col-span-6 h-48 bg-ui-border-l dark:bg-ui-dark-border rounded-2xl" />
      <div className="col-span-12 h-32 bg-ui-border-l dark:bg-ui-dark-border rounded-2xl" />
    </div>
  )
}

function DashboardPage() {
  const { layout, loading, saveLayout, resetToDefault } = useDashboardLayout()
  const [editable, setEditable] = useState(false)
  const [draftLayout, setDraftLayout] = useState(null)
  const snapshotRef = useRef(null)
  const toast = useToast()
  const { t } = useLocale()

  const activeLayout = editable ? (draftLayout ?? layout) : layout

  const handleToggleEdit = useCallback(() => {
    setEditable((prev) => {
      if (prev) {
        setDraftLayout(null)
        return false
      }
      snapshotRef.current = layout
      setDraftLayout(layout)
      return true
    })
  }, [layout])

  const handleSave = useCallback(async () => {
    try {
      await saveLayout(draftLayout ?? layout)
      setEditable(false)
      setDraftLayout(null)
      toast.success(t('dashboard.savedSuccess'))
    } catch {
      toast.error(t('dashboard.savedError'))
    }
  }, [saveLayout, draftLayout, layout, toast, t])

  const handleCancel = useCallback(() => {
    setDraftLayout(null)
    setEditable(false)
  }, [])

  const handleLayoutChange = useCallback((newLayout) => {
    if (!editable) return
    setDraftLayout(newLayout)
  }, [editable])

  const handleRemoveWidget = useCallback((widgetId) => {
    setDraftLayout((prev) => (prev ?? layout).filter((item) => item.i !== widgetId))
  }, [layout])

  const handleAddWidget = useCallback((widgetId) => {
    const def = WIDGET_REGISTRY[widgetId]
    if (!def) return
    const current = draftLayout ?? layout
    const maxY = current.reduce((m, item) => Math.max(m, item.y + item.h), 0)
    setDraftLayout([...current, {
      i: widgetId,
      x: 0,
      y: maxY,
      w: def.defaultSize.w,
      h: def.defaultSize.h,
      minW: def.minSize.w,
      minH: def.minSize.h,
    }])
  }, [draftLayout, layout])

  const handleReset = useCallback(async () => {
    try {
      setDraftLayout(DEFAULT_LAYOUT)
      await resetToDefault()
      setEditable(false)
      setDraftLayout(null)
      toast.info(t('dashboard.resetSuccess'))
    } catch {
      toast.error(t('dashboard.savedError'))
    }
  }, [resetToDefault, toast, t])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div>
      {/* Botón de edición inline (antes vivía en el topbar). */}
      <div className="flex items-center justify-end mb-3">
        <DashboardEditToggleButton editable={editable} onToggle={handleToggleEdit} />
      </div>
      {editable && (
        <DashboardEditToolbar
          layout={activeLayout}
          onSave={handleSave}
          onCancel={handleCancel}
          onAddWidget={handleAddWidget}
          onReset={handleReset}
        />
      )}
      <WidgetGrid
        layout={activeLayout}
        onLayoutChange={handleLayoutChange}
        editable={editable}
        onRemoveWidget={handleRemoveWidget}
      />
    </div>
  )
}

export default DashboardPage
