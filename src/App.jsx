import './App.css'
import AppLayout from './components/AppLayout'
import { MarketDataProvider } from './context/MarketDataContext'

export default function App() {
  return (
    <MarketDataProvider>
      <AppLayout />
    </MarketDataProvider>
  )
}
