import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { PageTitle, useToast } from '@ceedcv-maya/shared-ui-react'
import { useBackNavigation } from '@ceedcv-maya/shared-hooks-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { useNotificationRules } from '../hooks/useNotificationRules'
import { NotificationRuleForm } from '../components/NotificationRuleForm'
import type { CreateNotificationRuleInput, NotificationRule } from '../types/notificationRule'

export default function NotificationRuleFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isCreate = !id
  const { t } = useLocale()
  const { show: toast } = useToast()
  const location = useLocation()
  const { goBack } = useBackNavigation({ fallback: '/panel-alerts?tab=rules' })
  const { hasPermission } = useUserProfile()

  const canCreate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsCreate)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsUpdate)
  const canPerform = isCreate ? canCreate : canUpdate

  const [loading, setLoading] = useState(false)
  const [initial, setInitial] = useState<NotificationRule | null>(null)

  const { rules, loading: rulesLoading, onCreate, onUpdate } = useNotificationRules({
    enabled: !isCreate && !(location.state as { record?: NotificationRule } | null)?.record,
  })

  useEffect(() => {
    if (isCreate) { setInitial(null); return }

    const stateRecord = (location.state as { record?: NotificationRule } | null)?.record
    if (stateRecord) { setInitial(stateRecord); return }

    if (!rulesLoading) {
      const found = rules.find((r) => String(r.id) === id)
      if (found) setInitial(found)
      else if (id) goBack({ replace: true })
    }
  }, [id, isCreate, location.state, rules, rulesLoading, goBack])

  const handleSubmit = async (data: CreateNotificationRuleInput) => {
    setLoading(true)
    try {
      if (isCreate) {
        await onCreate(data)
        toast({ tone: 'success', title: t('scheduledRules.saveSuccess') })
      } else {
        await onUpdate({ id: Number(id), data })
        toast({ tone: 'success', title: t('scheduledRules.saveSuccess') })
      }
      goBack({ replace: true })
    } catch (err) {
      toast({ tone: 'danger', title: err instanceof Error ? err.message : t('scheduledRules.errorSave') })
    } finally {
      setLoading(false)
    }
  }

  const title = isCreate ? t('scheduledRules.newRule') : t('scheduledRules.editRule')

  if (!canPerform) {
    return (
      <>
        <PageTitle title={title} onBack={() => goBack()} backLabel={t('actions.back')} />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">{t('panelAlerts.noPermission')}</p>
      </>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle title={title} onBack={() => goBack()} backLabel={t('actions.back')} />
      <div className="mt-6">
        <div className="rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card p-6">
          <NotificationRuleForm
            initial={initial}
            onSubmit={handleSubmit}
            onCancel={() => goBack()}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
