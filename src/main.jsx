import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './auth/AuthContext'
import { AppKitProvider } from './lib/reown/appkitConfig'
import './lib/polyfills/svgAttributePatch'
import { ToastProvider } from './components/ui/ToastProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider />
    <BrowserRouter>
      <AppKitProvider>
        <AuthProvider>
          <NavigationProvider>
            <App />
          </NavigationProvider>
        </AuthProvider>
      </AppKitProvider>
    </BrowserRouter>
  </StrictMode>,
)
