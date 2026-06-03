import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { PageTitle, useToast } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { usePanelAlerts } from '../hooks/usePanelAlerts'
import { PanelAlertForm } from '../components/PanelAlertForm'
import type { CreatePanelAlertInput, PanelAlert } from '../types/panelAlert'

export default function PanelAlertFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isCreate = !id
  const { t } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const { hasPermission } = useUserProfile()
  const location = useLocation()

  const canCreate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsCreate)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsUpdate)
  const canPerform = isCreate ? canCreate : canUpdate

  const [loading, setLoading] = useState(false)
  const [initial, setInitial] = useState<PanelAlert | null>(null)

  // Fetch all alerts to find the one we're editing (since API has no GET by ID)
  const { alerts, loading: alertsLoading } = usePanelAlerts(
    { page: 1, per_page: 100 },
    { enabled: !isCreate && !location.state?.record }
  )

  // Use record from location.state (preferred), or search in alerts list
  useEffect(() => {
    if (isCreate) {
      setInitial(null)
      return
    }

    const stateRecord = (location.state as any)?.record as PanelAlert | undefined
    if (stateRecord) {
      setInitial(stateRecord)
      return
    }

    // Search in alerts list (only if not loading)
    if (!alertsLoading) {
      const found = alerts.find(a => String(a.id) === id)
      if (found) {
        setInitial(found)
      } else if (id) {
        // Record not found, redirect
        navigate('/panel-alerts?tab=alerts', { replace: true })
      }
    }
  }, [id, isCreate, location.state, alerts, alertsLoading, navigate])

  const { onCreate, onUpdate } = usePanelAlerts({ page: 1, per_page: 100 })

  const handleSubmit = async (data: CreatePanelAlertInput) => {
    setLoading(true)
    try {
      if (isCreate) {
        await onCreate(data)
        toast({ tone: 'success', title: t('panelAlerts.createSuccess') })
      } else {
        await onUpdate({ id: Number(id), data })
        toast({ tone: 'success', title: t('panelAlerts.updateSuccess') })
      }
      navigate('/panel-alerts?tab=alerts', { replace: true })
    } catch {
      toast({ tone: 'danger', title: t('panelAlerts.createError') })
    } finally {
      setLoading(false)
    }
  }

  if (!canPerform) {
    return (
      <>
        <PageTitle
          title={isCreate ? t('panelAlerts.newAlert') : t('panelAlerts.editAlert')}
          onBack={() => navigate('/panel-alerts?tab=alerts')}
          backLabel={t('actions.back')}
        />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">
          {t('panelAlerts.noPermission')}
        </p>
      </>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageTitle
        title={isCreate ? t('panelAlerts.newAlert') : t('panelAlerts.editAlert')}
        onBack={() => navigate('/panel-alerts?tab=alerts')}
        backLabel={t('actions.back')}
      />

      <div className="mt-6">
        <div className="rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card p-6">
          <PanelAlertForm
            initial={initial}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/panel-alerts?tab=alerts')}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
