import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LocaleProvider } from '../shared/i18n'
import { AuthProvider } from '@maya/shared-auth-react'
import { authService } from './authService.js'
import GlobalErrorBoundary from '../shared/components/GlobalErrorBoundary.jsx'

import '../shared/styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <GlobalErrorBoundary>
          <AuthProvider keycloak={authService.keycloak} enableLogging={import.meta.env.DEV}>
            <App />
          </AuthProvider>
        </GlobalErrorBoundary>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
