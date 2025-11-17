import { useResizableSidebar } from '../hooks/useResizableSidebar'

export default function Sidebar() {
  const { width, isResizing, startResizing } = useResizableSidebar({
    min: 200,
    max: 420,
    initial: 260,
  })

  return (
    <>
      <nav className="sidebar" style={{ width }}>
        NAVIGATION
      </nav>

      <div
        className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
        onMouseDown={startResizing}
      />
    </>
  )
}
