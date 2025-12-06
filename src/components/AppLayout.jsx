import { Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import Page1 from '../pages/page1'
import Page2 from '../pages/page2'
import LaMarmite from '../pages/LaMarmite'
import BouillonDeLegumes from '../pages/BouillonDeLegumes'
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
            {/* redirection par défaut vers épicerie fine */}
            <Route path="/" element={<Navigate to="/epicerie-fine" replace />} />

            {/* Routes canoniques en kebab-case */}
            <Route path="/epicerie-fine" element={<Page1 />} />
            <Route path="/ma-cuisine" element={<Page2 />} />
            <Route path="/la-marmite" element={<LaMarmite />} />
            <Route path="/bouillon-de-legumes" element={<BouillonDeLegumes />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/stripe" element={<StripePage />} />
            <Route path="/stripe-success" element={<StripeSuccessPage />} />
            <Route path="/stripe-cancel" element={<StripeCancelPage />} />

            {/* Compatibilité ascendante : anciennes URLs PascalCase */}
            <Route path="/ÉpicerieFine" element={<Navigate to="/epicerie-fine" replace />} />
            <Route path="/MaCuisine" element={<Navigate to="/ma-cuisine" replace />} />
            <Route path="/LaMarmite" element={<Navigate to="/la-marmite" replace />} />
            <Route path="/BouillonDeLegumes" element={<Navigate to="/bouillon-de-legumes" replace />} />
            <Route path="/Stripe" element={<Navigate to="/stripe" replace />} />
            <Route path="/StripeSuccess" element={<Navigate to="/stripe-success" replace />} />
            <Route path="/StripeCancel" element={<Navigate to="/stripe-cancel" replace />} />
            <Route path="/Profile" element={<Navigate to="/profile" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
