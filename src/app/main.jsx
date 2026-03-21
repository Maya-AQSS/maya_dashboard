import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LocaleProvider } from '../shared/i18n'
import { AuthProvider } from './auth/AuthContext.jsx'
import GlobalErrorBoundary from '../shared/components/GlobalErrorBoundary.jsx'

import '../shared/styles/globals.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <GlobalErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GlobalErrorBoundary>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
)
