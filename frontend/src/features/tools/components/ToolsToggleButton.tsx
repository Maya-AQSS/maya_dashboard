import { Button } from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'

function ToolsToggleButton({ showAll, onToggle }) {
  const { t } = useLocale()
  return (
    <Button variant="primary" size="sm" onClick={onToggle}>
      {showAll ? t('tools.viewFavoritesOnly') : t('tools.viewAll')}
    </Button>
  )
}

export default ToolsToggleButton
