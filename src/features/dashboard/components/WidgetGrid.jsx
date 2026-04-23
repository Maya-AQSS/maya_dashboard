import { useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useLocale } from '../../../shared/i18n'
import { WIDGET_REGISTRY } from '../widgets/registry'
import WidgetFrame from './WidgetFrame'

const ResponsiveGridLayout = WidthProvider(Responsive)

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const COLS = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }

function WidgetGrid({ layout, onLayoutChange, editable, onRemoveWidget }) {
  const { t } = useLocale()

  const validItems = layout.filter((item) => item.i in WIDGET_REGISTRY)

  const handleStop = useCallback((currentLayout) => {
    if (!editable) return
    const positionMap = Object.fromEntries(currentLayout.map((l) => [l.i, l]))
    const merged = layout.map((item) => {
      const pos = positionMap[item.i]
      return pos ? { ...item, x: pos.x, y: pos.y, w: pos.w, h: pos.h } : item
    })
    onLayoutChange(merged)
  }, [editable, layout, onLayoutChange])

  if (validItems.length === 0) {
    return (
      <p className="text-gray-500 dark:text-odoo-dark-muted text-sm text-center py-12">
        {t('dashboard.noWidgets')}
      </p>
    )
  }

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: validItems, md: validItems, sm: validItems }}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={60}
      margin={[16, 16]}
      isDraggable={editable}
      isResizable={editable}
      onDragStop={handleStop}
      onResizeStop={handleStop}
      draggableHandle=".widget-drag-handle"
    >
      {validItems.map((item) => {
        const def = WIDGET_REGISTRY[item.i]
        const WidgetComponent = def.component
        return (
          <div key={item.i}>
            <WidgetFrame
              title={t(def.titleKey)}
              editable={editable}
              onRemove={() => onRemoveWidget(item.i)}
            >
              {editable && (
                <div className="widget-drag-handle absolute inset-x-0 top-0 h-8 cursor-grab active:cursor-grabbing" />
              )}
              <WidgetComponent />
            </WidgetFrame>
          </div>
        )
      })}
    </ResponsiveGridLayout>
  )
}

export default WidgetGrid
