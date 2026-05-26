import { useState, useRef, useCallback } from 'react'
import useDashboardLayout, { DEFAULT_LAYOUT } from '../../dashboard-layout/hooks/useDashboardLayout'

type LayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}
type Layout = LayoutItem[]
import {
  DashboardEditToggleButton,
  DashboardEditToolbar,
  DashboardSkeleton,
  WidgetGrid,
  type SkeletonBlock,
} from '@ceedcv-maya/shared-dashboard-react'
import { WIDGET_REGISTRY } from '../widgets/registry'
import { PageTitle, useToast } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'

const SKELETON_BLOCKS: SkeletonBlock[] = [
  { colSpanClasses: 'col-span-12 sm:col-span-6', heightClass: 'h-48' },
  { colSpanClasses: 'col-span-12 sm:col-span-6', heightClass: 'h-48' },
  { colSpanClasses: 'col-span-12', heightClass: 'h-32' },
]

function DashboardPage() {
  const { layout, loading, saveLayout, resetToDefault } = useDashboardLayout()
  const { hasPermission } = useUserProfile()
  const canEditLayout = hasPermission(DASHBOARD_PERMISSIONS.dashboardUpdate)
  const [editable, setEditable] = useState(false)
  const [draftLayout, setDraftLayout] = useState<Layout | null>(null)
  const snapshotRef = useRef<Layout | null>(null)
  const { show: showToast } = useToast()
  const { t } = useLocale()

  const activeLayout = editable ? (draftLayout ?? layout) : layout

  const handleToggleEdit = useCallback(() => {
    if (!canEditLayout) return
    setEditable((prev) => {
      if (prev) {
        setDraftLayout(null)
        return false
      }
      snapshotRef.current = layout as Layout
      setDraftLayout(layout as Layout)
      return true
    })
  }, [canEditLayout, layout])

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

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    if (!editable) return
    setDraftLayout(newLayout)
  }, [editable])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setDraftLayout((prev) => ((prev ?? (layout as Layout)).filter((item) => item.i !== widgetId)))
  }, [layout])

  const handleAddWidget = useCallback((widgetId: string) => {
    const def = WIDGET_REGISTRY[widgetId as keyof typeof WIDGET_REGISTRY]
    if (!def) return
    const current = (draftLayout ?? layout) as Layout
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
      setDraftLayout(DEFAULT_LAYOUT as Layout)
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
        title={t('nav.dashboard')}
        image={{ src: '/dashboard-header.png', alt: t('nav.dashboard') }}
        actions={
          canEditLayout && editable ? (
            <DashboardEditToolbar
              layout={activeLayout}
              registry={WIDGET_REGISTRY}
              t={t}
              onSave={handleSave}
              onCancel={handleCancel}
              onReset={handleReset}
              onAddWidget={handleAddWidget}
              labels={{
                save: t('actions.save'),
                cancel: t('actions.cancel'),
                reset: t('actions.reset'),
                addWidget: t('dashboard.addWidget'),
              }}
            />
          ) : canEditLayout ? (
            <DashboardEditToggleButton editable={editable} onToggle={handleToggleEdit} />
          ) : null
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
