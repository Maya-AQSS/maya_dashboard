import { Button } from '@maya/shared-ui-react'
import { useLocale } from '../../../shared/i18n'

function ApplicationsToggleButton({ showAll, onToggle }) {
  const { t } = useLocale()
  return (
    <Button variant="primary" size="sm" onClick={onToggle}>
      {showAll ? t('applications.viewFavoritesOnly') : t('applications.viewAll')}
    </Button>
  )
}

export default ApplicationsToggleButton
