import { useState, useRef, useCallback, useEffect } from 'react'
import useDashboardLayout, { DEFAULT_LAYOUT } from '../../dashboard-layout/hooks/useDashboardLayout'
import { WIDGET_REGISTRY } from '../widgets/registry'
import WidgetGrid from '../components/WidgetGrid'
import DashboardEditControls from '../components/DashboardEditControls'
import { useTopbarActions } from '../../../shared/context/TopbarActionsContext'

function DashboardPage() {
  const { layout, loading, saveLayout, resetToDefault } = useDashboardLayout()
  const [editable, setEditable] = useState(false)
  const [draftLayout, setDraftLayout] = useState(null)
  const snapshotRef = useRef(null)
  const { setActions } = useTopbarActions()

  const activeLayout = editable ? (draftLayout ?? layout) : layout

  const handleToggleEdit = useCallback(() => {
    snapshotRef.current = layout
    setDraftLayout(layout)
    setEditable(true)
  }, [layout])

  const handleSave = useCallback(async () => {
    await saveLayout(draftLayout ?? layout)
    setEditable(false)
    setDraftLayout(null)
  }, [saveLayout, draftLayout, layout])

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
    setDraftLayout(DEFAULT_LAYOUT)
    await resetToDefault()
    setEditable(false)
    setDraftLayout(null)
  }, [resetToDefault])

  useEffect(() => {
    if (loading) return
    setActions(
      <DashboardEditControls
        layout={activeLayout}
        editable={editable}
        onToggleEdit={handleToggleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAddWidget={handleAddWidget}
        onReset={handleReset}
      />
    )
    return () => setActions(null)
  }, [loading, activeLayout, editable, handleToggleEdit, handleSave, handleCancel, handleAddWidget, handleReset, setActions])

  if (loading) {
    return <div className="p-6 text-gray-500 dark:text-odoo-dark-muted text-sm">Cargando...</div>
  }

  return (
    <div className="p-4 sm:p-6">
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
