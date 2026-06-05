import { type ReactNode, useMemo } from 'react'
import { EditorContentHtml, sanitizeEditorHtml } from '@ceedcv-maya/shared-editor-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Button, PageTitle, Spinner, formatDateTime, useToast } from '@ceedcv-maya/shared-ui-react'
import { useLocale, useNotificationText } from '@ceedcv-maya/shared-i18n-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { useNotification } from '../hooks/useNotification'
import { markNotificationRead } from '../api/notificationsApi'
import { notificationAppLabel } from '../appLabel'
import { resolveResourceTarget } from '../resolveResourceUrl'

function editorHtmlToPlainText(html: string): string {
  const safe = sanitizeEditorHtml(html)
  if (!safe) return ''
  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    el.innerHTML = safe
    return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  return safe.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-4 sm:p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card">
      <h2 className="m-0 mb-4 text-base font-semibold text-text-primary dark:text-text-dark-secondary">
        {title}
      </h2>
      {children}
    </div>
  )
}

function DetailDl({ children }: { children: ReactNode }) {
  return <dl className="m-0 flex flex-col gap-3">{children}</dl>
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3 items-baseline">
      <dt className="m-0 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
        {label}
      </dt>
      <dd className="m-0 text-base text-text-primary dark:text-text-dark-primary">{value}</dd>
    </div>
  )
}

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const notifId = id != null && /^\d+$/.test(id) ? Number(id) : undefined
  const navigate = useNavigate()
  const { t, dateLocale } = useLocale()
  const resolveText = useNotificationText()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { hasPermission } = useUserProfile()

  const canShow = hasPermission(DASHBOARD_PERMISSIONS.notificationsShow)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.notificationsUpdate)

  const { data: notification, isLoading, error } = useNotification(notifId, { enabled: canShow })

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationRead(notifId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', notifId!] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast({ tone: 'success', title: t('notifications.markReadSuccess') })
    },
    onError: () => toast({ tone: 'danger', title: t('notifications.markReadError') }),
  })

  const resolvedTitle = notification
    ? resolveText({ key: notification.title_key, fallback: notification.title, params: notification.params })
    : ''
  const resolvedBody = notification
    ? resolveText({ key: notification.body_key, fallback: notification.body ?? '', params: notification.params })
    : ''

  const pageTitle = useMemo(() => {
    if (!notification) return t('notifications.pageTitle')
    const plain = editorHtmlToPlainText(resolvedTitle) || editorHtmlToPlainText(resolvedBody)
    return plain || `#${notification.id}`
  }, [notification, t, resolvedTitle, resolvedBody])

  const messageHtml = resolvedBody || resolvedTitle

  if (!canShow) {
    return (
      <>
        <PageTitle title={t('notifications.pageTitle')} onBack={() => navigate('/notifications')} />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">
          {t('notifications.noPermission')}
        </p>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <PageTitle title={t('notifications.pageTitle')} onBack={() => navigate('/notifications')} />
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  if (error || !notification) {
    return (
      <>
        <PageTitle title={t('notifications.pageTitle')} onBack={() => navigate('/notifications')} />
        <p role="alert" className="text-danger text-sm">
          {t('notifications.loadError')}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/notifications')}
          className="mt-4"
        >
          {t('notifications.backToList')}
        </Button>
      </>
    )
  }

  const resourceTarget = resolveResourceTarget(notification.url, notification.target_app)

  return (
    <>
      <PageTitle
        title={pageTitle}
        subtitle={`#${notification.id} · ${notificationAppLabel(t, notification.app)} · ${notification.type}`}
        onBack={() => navigate('/notifications')}
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            {resourceTarget ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (resourceTarget.internal) navigate(resourceTarget.href)
                  else window.location.assign(resourceTarget.href)
                }}
              >
                {t('notifications.viewResource')}
              </Button>
            ) : null}
            {!notification.read_at && canUpdate ? (
              <Button
                variant="primary"
                size="sm"
                disabled={markReadMutation.isPending}
                onClick={() => markReadMutation.mutate()}
                className="w-full sm:w-auto"
              >
                {markReadMutation.isPending ? t('notifications.markingRead') : t('notifications.markRead')}
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="max-w-[600px] mx-auto flex flex-col gap-4 sm:gap-6">
        {messageHtml ? (
          <DetailSection title={t('notifications.detailMessage')}>
            <EditorContentHtml
              html={messageHtml}
              className="maya-editor-content text-base text-text-primary dark:text-text-dark-primary [&_p]:m-0 [&_p+p]:mt-2"
            />
          </DetailSection>
        ) : null}

        <DetailSection title={t('notifications.detailInfo')}>
          <DetailDl>
            <DetailRow
              label={t('notifications.fields.status')}
              value={
                notification.read_at ? (
                  <Badge variant="neutral" size="sm">{t('notifications.status.read')}</Badge>
                ) : (
                  <Badge variant="info" size="sm">{t('notifications.status.unread')}</Badge>
                )
              }
            />
            <DetailRow
              label={t('notifications.fields.app')}
              value={<Badge variant="neutral" size="sm">{notificationAppLabel(t, notification.app)}</Badge>}
            />
            <DetailRow
              label={t('notifications.fields.type')}
              value={<code className="font-mono text-sm">{notification.type}</code>}
            />
            <DetailRow
              label={t('notifications.fields.channels')}
              value={
                notification.channels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {notification.channels.map((ch) => (
                      <Badge key={ch} variant="neutral" size="sm">{ch}</Badge>
                    ))}
                  </div>
                ) : (
                  '—'
                )
              }
            />
            <DetailRow
              label={t('notifications.fields.createdAt')}
              value={formatDateTime(notification.created_at, dateLocale)}
            />
            {notification.read_at ? (
              <DetailRow
                label={t('notifications.fields.readAt')}
                value={formatDateTime(notification.read_at, dateLocale)}
              />
            ) : null}
            {notification.message_id ? (
              <DetailRow
                label={t('notifications.fields.messageId')}
                value={<code className="font-mono text-sm break-all">{notification.message_id}</code>}
              />
            ) : null}
          </DetailDl>
        </DetailSection>

        {notification.metadata && Object.keys(notification.metadata).length > 0 ? (
          <DetailSection title={t('notifications.fields.metadata')}>
            <pre className="m-0 p-3 rounded-md bg-ui-card dark:bg-ui-dark-bg border border-ui-border-l dark:border-ui-dark-border-l text-xs font-mono overflow-auto max-h-[400px] text-text-primary dark:text-text-dark-primary">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </DetailSection>
        ) : null}
      </section>
    </>
  )
}
