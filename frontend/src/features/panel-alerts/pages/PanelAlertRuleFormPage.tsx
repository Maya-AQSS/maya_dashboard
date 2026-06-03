import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { PageTitle, useToast } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { usePanelAlertRules } from '../hooks/usePanelAlertRules'
import { PanelAlertRuleForm } from '../components/PanelAlertRuleForm'
import type { CreatePanelAlertRuleInput, PanelAlertRule } from '../types/panelAlert'

export default function PanelAlertRuleFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isCreate = !id
  const { t } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const { hasPermission } = useUserProfile()
  const location = useLocation()

  const canCreate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesCreate)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesUpdate)
  const canPerform = isCreate ? canCreate : canUpdate

  const [loading, setLoading] = useState(false)
  const [initial, setInitial] = useState<PanelAlertRule | null>(null)

  // Fetch all rules to find the one we're editing (since API has no GET by ID)
  const { rules, loading: rulesLoading } = usePanelAlertRules(
    { enabled: !isCreate && !location.state?.record }
  )

  // Use record from location.state (preferred), or search in rules list
  useEffect(() => {
    if (isCreate) {
      setInitial(null)
      return
    }

    const stateRecord = (location.state as any)?.record as PanelAlertRule | undefined
    if (stateRecord) {
      setInitial(stateRecord)
      return
    }

    // Search in rules list (only if not loading)
    if (!rulesLoading) {
      const found = rules.find(r => String(r.id) === id)
      if (found) {
        setInitial(found)
      } else if (id) {
        // Record not found, redirect
        navigate('/panel-alerts?tab=rules', { replace: true })
      }
    }
  }, [id, isCreate, location.state, rules, rulesLoading, navigate])

  const { onCreate, onUpdate } = usePanelAlertRules()

  const handleSubmit = async (data: CreatePanelAlertRuleInput) => {
    setLoading(true)
    try {
      if (isCreate) {
        await onCreate(data)
        toast({ tone: 'success', title: t('panelAlerts.createSuccess') })
      } else {
        await onUpdate({ id: Number(id), data })
        toast({ tone: 'success', title: t('panelAlerts.updateSuccess') })
      }
      navigate('/panel-alerts?tab=rules', { replace: true })
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
          title={isCreate ? t('panelAlerts.newRule') : t('panelAlerts.editRule')}
          onBack={() => navigate('/panel-alerts?tab=rules')}
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
        title={isCreate ? t('panelAlerts.newRule') : t('panelAlerts.editRule')}
        onBack={() => navigate('/panel-alerts?tab=rules')}
        backLabel={t('actions.back')}
      />

      <div className="mt-6 max-w-2xl">
        <div className="rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card p-6">
          <PanelAlertRuleForm
            initial={initial}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/panel-alerts?tab=rules')}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
