import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Page1 from '../pages/page1'
import Page2 from '../pages/page2'
import LaMarmite from '../pages/LaMarmite'
import ProfilePage from '../pages/ProfilePage'
import StripePage from '../pages/StripePage.jsx';
import StripeSuccessPage from '../pages/StripeSuccessPage.jsx';
import StripeCancelPage from '../pages/StripeCancelPage.jsx';


export default function AppLayout() {
  return (
    <div className="app">
      <Topbar />

      <div className="layout">
        <Sidebar />

        <main className="page">
          <Routes>
            {/* redirection par défaut vers Épicerie fine */}
            <Route path="/" element={<Navigate to="/ÉpicerieFine" replace />} />
            <Route path="/ÉpicerieFine" element={<Page1 />} />
            <Route path="/MaCuisine" element={<Page2 />} />
            <Route path="/LaMarmite" element={<LaMarmite />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/Stripe" element={<StripePage />} />
            <Route path="/stripe-success" element={<StripeSuccessPage />} />
            <Route path="/stripe-cancel" element={<StripeCancelPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
