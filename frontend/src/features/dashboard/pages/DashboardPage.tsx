import { useState, useRef, useCallback } from 'react'
import useDashboardLayout, { DEFAULT_LAYOUT } from '../../dashboard-layout/hooks/useDashboardLayout'
import {
  DashboardEditToggleButton,
  DashboardEditToolbar,
  DashboardSkeleton,
  WidgetGrid,
  type SkeletonBlock,
} from '@maya/shared-dashboard-react'
import { WIDGET_REGISTRY } from '../widgets/registry'
import { PageTitle, useToast } from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'

const SKELETON_BLOCKS: SkeletonBlock[] = [
  { colSpanClasses: 'col-span-12 sm:col-span-6', heightClass: 'h-48' },
  { colSpanClasses: 'col-span-12 sm:col-span-6', heightClass: 'h-48' },
  { colSpanClasses: 'col-span-12', heightClass: 'h-32' },
]

function DashboardPage() {
  const { layout, loading, saveLayout, resetToDefault } = useDashboardLayout()
  const [editable, setEditable] = useState(false)
  const [draftLayout, setDraftLayout] = useState(null)
  const snapshotRef = useRef(null)
  const { show: showToast } = useToast()
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
      showToast({ title: t('dashboard.savedSuccess'), tone: 'success' })
    } catch {
      showToast({ title: t('dashboard.savedError'), tone: 'danger' })
    }
  }, [saveLayout, draftLayout, layout, showToast, t])

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
      showToast({ title: t('dashboard.resetSuccess'), tone: 'info' })
    } catch {
      showToast({ title: t('dashboard.savedError'), tone: 'danger' })
    }
  }, [resetToDefault, showToast, t])

  if (loading) {
    return <DashboardSkeleton blocks={SKELETON_BLOCKS} />
  }

  return (
    <>
      <PageTitle
        title={t('dashboard.title')}
        actions={
          editable ? (
            <DashboardEditToolbar
              layout={activeLayout}
              registry={WIDGET_REGISTRY}
              t={t}
              onSave={handleSave}
              onCancel={handleCancel}
              onReset={handleReset}
              onAddWidget={handleAddWidget}
              labels={{
                save: t('dashboard.save'),
                cancel: t('dashboard.cancel'),
                reset: t('dashboard.resetLayout'),
                addWidget: t('dashboard.addWidget'),
              }}
            />
          ) : (
            <DashboardEditToggleButton editable={editable} onToggle={handleToggleEdit} />
          )
        }
      />

      <WidgetGrid
        registry={WIDGET_REGISTRY}
        layout={activeLayout}
        onLayoutChange={handleLayoutChange}
        editable={editable}
        onRemoveWidget={handleRemoveWidget}
        t={t}
      />
    </>
  )
}

export default DashboardPage
