import { createContext, useContext, useState } from 'react'

const SidebarWidthContext = createContext()

export function SidebarWidthProvider({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(200) // initial width

  return (
    <SidebarWidthContext.Provider value={{ sidebarWidth, setSidebarWidth }}>
      {children}
    </SidebarWidthContext.Provider>
  )
}

export function useSidebarWidth() {
  const context = useContext(SidebarWidthContext)
  if (!context) {
    throw new Error('useSidebarWidth must be used within SidebarWidthProvider')
  }
  return context
}
