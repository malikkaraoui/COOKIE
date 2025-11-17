import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="app">
      <Topbar />

      <div className="layout">
        <Sidebar />

        <main className="page">
          PAGE
        </main>
      </div>
    </div>
  )
}
