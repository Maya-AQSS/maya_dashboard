import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, PageTitle, Spinner, useToast } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../hooks/useNotification'
import { markNotificationRead } from '../api/notificationsApi'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 py-2 border-b border-ui-border-l dark:border-ui-dark-border-l last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary">
        {label}
      </dt>
      <dd className="text-sm text-text-primary dark:text-text-dark-primary">{value}</dd>
    </div>
  )
}

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const notifId = Number(id)
  const navigate = useNavigate()
  const { t } = useLocale()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: notification, isLoading, error } = useNotification(notifId)

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationRead(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification', notifId] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast({ tone: 'success', title: t('notifications.markReadSuccess') })
    },
    onError: () => toast({ tone: 'danger', title: t('notifications.markReadError') }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !notification) {
    return (
      <div className="max-w-[800px] mx-auto p-4">
        <p role="alert" className="text-danger text-sm">
          {t('notifications.loadError')}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/notifications')} className="mt-4">
          {t('notifications.backToList')}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>
          ← {t('notifications.backToList')}
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title={notification.title}
          subtitle={`#${notification.id} · ${notification.app} · ${notification.type}`}
        />
        {!notification.read_at && (
          <Button
            variant="outlineTeal"
            size="sm"
            disabled={markReadMutation.isPending}
            onClick={() => markReadMutation.mutate()}
          >
            {markReadMutation.isPending ? t('notifications.markingRead') : t('notifications.markRead')}
          </Button>
        )}
      </div>

      <Card>
        <dl>
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
            value={<Badge variant="neutral" size="sm">{notification.app}</Badge>}
          />
          <DetailRow
            label={t('notifications.fields.type')}
            value={<code className="font-mono text-xs">{notification.type}</code>}
          />
          {notification.body && (
            <DetailRow label={t('notifications.fields.body')} value={notification.body} />
          )}
          <DetailRow
            label={t('notifications.fields.channels')}
            value={
              <div className="flex flex-wrap gap-1">
                {notification.channels.map((ch) => (
                  <Badge key={ch} variant="neutral" size="sm">{ch}</Badge>
                ))}
              </div>
            }
          />
          <DetailRow
            label={t('notifications.fields.createdAt')}
            value={new Date(notification.created_at).toLocaleString()}
          />
          {notification.read_at && (
            <DetailRow
              label={t('notifications.fields.readAt')}
              value={new Date(notification.read_at).toLocaleString()}
            />
          )}
          {notification.message_id && (
            <DetailRow
              label={t('notifications.fields.messageId')}
              value={<code className="font-mono text-xs break-all">{notification.message_id}</code>}
            />
          )}
        </dl>
      </Card>

      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
            {t('notifications.fields.metadata')}
          </h3>
          <pre className="p-3 bg-ui-body dark:bg-ui-dark-bg rounded-md text-xs font-mono overflow-auto max-h-[400px] text-text-primary dark:text-text-dark-primary">
            {JSON.stringify(notification.metadata, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
