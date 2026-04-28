import { WidgetGrid as SharedWidgetGrid, type LayoutItem } from '@maya/shared-dashboard-react'
import { useLocale } from '../../../shared/i18n'
import { WIDGET_REGISTRY } from '../widgets/registry'

interface Props {
  layout: LayoutItem[]
  onLayoutChange: (next: LayoutItem[]) => void
  editable: boolean
  onRemoveWidget: (widgetId: string) => void
}

function WidgetGrid({ layout, onLayoutChange, editable, onRemoveWidget }: Props) {
  const { t } = useLocale()
  return (
    <SharedWidgetGrid
      registry={WIDGET_REGISTRY}
      layout={layout}
      onLayoutChange={onLayoutChange}
      editable={editable}
      onRemoveWidget={onRemoveWidget}
      t={t}
    />
  )
}

export default WidgetGrid
