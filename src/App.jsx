import { useEffect } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import { MarketDataProvider } from './providers/MarketDataProvider'
import { SelectedTokensProvider } from './context/SelectedTokensContext'
import { initializePriceNodes } from './lib/database/initFirebase'
import { cleanupOldPriceCache } from './lib/database/cleanupFirebase'
import { useBinancePrices } from './hooks/useBinancePrices'

export default function App() {
  // Polling automatique des prix Binance → Firebase
  useBinancePrices()

  // Initialiser les nœuds Firebase au démarrage
  useEffect(() => {
    initializePriceNodes()
    
    // Nettoyer les anciennes entrées (une seule fois)
    const hasCleanedUp = localStorage.getItem('firebase_cleanup_done')
    if (!hasCleanedUp) {
      cleanupOldPriceCache().then(() => {
        localStorage.setItem('firebase_cleanup_done', 'true')
      })
    }
  }, [])

  return (
    <MarketDataProvider>
      <SelectedTokensProvider>
        <AppLayout />
      </SelectedTokensProvider>
    </MarketDataProvider>
  )
}
