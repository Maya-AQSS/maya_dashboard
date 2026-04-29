import { Link } from'react-router-dom'
import { useAuth } from'@maya/shared-auth-react'
import { useLocale } from'../i18n'

function NotFoundPage() {
 const { user } = useAuth()
 const { t } = useLocale()
 const targetPath = user ?'/tools' :'/login'
 const actionLabel = user ? t('layout.notFoundBackDashboard') : t('layout.notFoundGoLogin')

 return (<div className="min-h-screen flex items-center justify-center bg-surface px-6">
 <div className="w-full max-w-[560px] rounded-2xl border border-outline bg-surface-container-low px-8 py-10 text-center shadow-[0_18px_25px_-10px_rgba(17,24,39,0.2),0_4px_8px_-2px_rgba(17,24,39,0.08)] dark:shadow-none">
 <p className="text-5xl font-semibold text-primary m-0">404</p>
 <h1 className="mt-4 mb-2 text-2xl font-semibold text-on-surface">
 {t('layout.notFoundTitle')}
 </h1>
 <p className="m-0 text-sm sm:text-base text-on-surface-variant">
 {t('layout.notFoundDescription')}
 </p>
 <Link
 to={targetPath}
 className="inline-flex items-center justify-center mt-6 py-2.5 px-5 rounded-full border-none bg-primary !text-on-primary visited:!text-on-primary text-sm font-semibold no-underline cursor-pointer transition hover:bg-primary-hover"
 >
 {actionLabel}
 </Link>
 </div>
 </div>
 )
}

export default NotFoundPage
