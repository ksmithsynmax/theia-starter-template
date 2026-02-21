import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { Box } from '@mantine/core'
import { ChevronLeft } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
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
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map />
        <Box style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%', pointerEvents: 'none' }}>
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
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
