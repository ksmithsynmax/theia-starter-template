import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { Box } from '@mantine/core'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import { useShipContext } from '../context/ShipContext'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { openShipTab, openStsTab } = useShipContext()

  const handleDetectionClick = useCallback(
    (detection) => {
      if ((detection.type === 'sts' || detection.type === 'sts-ais') && detection.stsPartner) {
        openStsTab(detection.shipId, detection.stsPartner)
      } else {
        openShipTab(detection)
      }
      if (location.pathname !== '/myships') {
        navigate('/myships')
      }
      setPanelOpen(true)
    },
    [openShipTab, openStsTab, location.pathname, navigate]
  )

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
        <Map onDetectionClick={handleDetectionClick} />
        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <LeftNav onNavClick={handleNavClick} />
          <Box
            className={`slide-panel ${panelOpen ? 'slide-panel--open' : ''}`}
          >
            <Box onClick={closePanel} style={{ position: 'relative' }}>
              <Box
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 12,
                  cursor: 'pointer',
                }}
              >
                <CollapseButton />
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
