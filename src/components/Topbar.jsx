import { useResizablePanel } from '../hooks/useResizablePanel'
import LoginButton from '../auth/LoginButton'

export default function Topbar() {
  const { size: height, isResizing, startResizing, handleDoubleClick } = useResizablePanel({
    min: 60,
    max: 250,
    initial: 150,
    axis: 'y', // on redimensionne sur l'axe vertical
  })

  return (
    <>
      <header className="topbar" style={{ height }}>
        <div className="topbar-content">
          <span>TAP BAR</span>
          <LoginButton />
        </div>
      </header>

      <div
        className={`topbar-resizer ${isResizing ? 'is-resizing' : ''}`}
        onMouseDown={startResizing}
        onDoubleClick={handleDoubleClick}
        title="Double-clic pour réduire/étendre"
      />
    </>
  )
}
