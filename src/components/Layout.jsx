import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { Box } from '@mantine/core'
import { ChevronLeft } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import CollapseButton from '../custom-icons/CollapseButton'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavClick = useCallback(
    (to) => {
      if (location.pathname === to) {
        setPanelOpen((prev) => !prev)
      } else {
        setPanelOpen(true)
        navigate(to)
      }
    },
    [location.pathname, navigate]
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftNav onNavClick={handleNavClick} />
        <Box className={`slide-panel ${panelOpen ? 'slide-panel--open' : ''}`}>
          <Box onClick={closePanel} style={{ position: "relative"}}>
            <Box style={{ position: "absolute", right: 0, top: 8,  cursor: "pointer" }}>
              <CollapseButton  />
            </Box>
          </Box>
          <Box className="slide-panel-content">
            <Outlet />
          </Box>
        </Box>
        <Box component="main" style={{ flex: 1 }}>
          {/* Map content will go here */}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
