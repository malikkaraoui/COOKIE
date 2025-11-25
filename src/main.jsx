import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { NavigationProvider } from './context/NavigationContext'
import { AuthProvider } from './auth/AuthContext'

console.log('Environnement:', import.meta.env)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
