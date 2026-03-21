import { Component } from 'react'
import { useLocale } from '../i18n'

class GlobalErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Traza en consola para depuración (desarrollo).
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('crash')
    window.location.assign(url.toString())
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] dark:bg-odoo-dark-bg px-6">
          <div className="w-full max-w-[560px] rounded-2xl border border-gray-200 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface px-8 py-10 text-center shadow-[0_18px_25px_-10px_rgba(17,24,39,0.2),0_4px_8px_-2px_rgba(17,24,39,0.08)] dark:shadow-none">
            <p className="text-4xl font-semibold text-odoo-primary m-0">Error</p>
            <h1 className="mt-4 mb-2 text-2xl font-semibold text-gray-900 dark:text-odoo-dark-text">
              {this.props.title}
            </h1>
            <p className="m-0 text-sm sm:text-base text-gray-600 dark:text-odoo-dark-muted">
              {this.props.description}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center mt-6 py-2.5 px-5 rounded-full border-none bg-odoo-primary !text-white text-sm font-semibold cursor-pointer transition hover:bg-odoo-primary-hover"
            >
              {this.props.reloadLabel}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function GlobalErrorBoundary({ children }) {
  const { t } = useLocale()

  return (
    <GlobalErrorBoundaryInner
      title={t('layout.errorBoundaryTitle')}
      description={t('layout.errorBoundaryDescription')}
      reloadLabel={t('layout.errorBoundaryReload')}
    >
      {children}
    </GlobalErrorBoundaryInner>
  )
}

export default GlobalErrorBoundary
