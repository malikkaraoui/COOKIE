import './App.css'
import AppLayout from './components/AppLayout'
import { MarketDataProvider } from './context/MarketDataContext'
import { SelectedTokensProvider } from './context/SelectedTokensContext'

export default function App() {
  return (
    <MarketDataProvider>
      <SelectedTokensProvider>
        <AppLayout />
      </SelectedTokensProvider>
    </MarketDataProvider>
  )
}
