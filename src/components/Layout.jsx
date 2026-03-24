import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { Box } from '@mantine/core'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import { useShipContext } from '../context/ShipContext'
import SecondaryNav from './SecondaryNav'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [secondaryNavOpen, setSecondaryNavOpen] = useState(false)
  const [collapseBtnHovered, setCollapseBtnHovered] = useState(false)
  const [expandSecNavHovered, setExpandSecNavHovered] = useState(false)
  const [expandPanelHovered, setExpandPanelHovered] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { openShipTab, openStsTab, shipTabs } = useShipContext()

  useEffect(() => {
    if (shipTabs.length === 0) setPanelOpen(false)
  }, [shipTabs])

  const handleDetectionClick = useCallback(
    (detection) => {
      if (
        (detection.type === 'sts' || detection.type === 'sts-ais') &&
        detection.stsPartner
      ) {
        openStsTab(
          detection.shipId,
          detection.stsPartner,
          detection.type,
          detection.id
        )
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
        setSecondaryNavOpen((prev) => !prev)
      } else {
        setSecondaryNavOpen(true)
        navigate(to)
      }
    },
    [location.pathname, navigate]
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const isMyShips = location.pathname === '/myships'
  const showPanelExpand = !panelOpen && isMyShips
  const slidePanelClass = panelOpen ? 'slide-panel--open' : (isMyShips ? 'slide-panel--collapsed' : '')

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

          <SecondaryNav
            isOpen={secondaryNavOpen}
            onOpen={() => setSecondaryNavOpen(true)}
            onClose={() => setSecondaryNavOpen(false)}
            currentPath={location.pathname}
          />

          <Box
            className={`slide-panel ${slidePanelClass}`}
          >
            {showPanelExpand && (
              <Box
                onClick={() => setPanelOpen(true)}
                onMouseEnter={() => setExpandPanelHovered(true)}
                onMouseLeave={() => setExpandPanelHovered(false)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 71,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10,
                }}
              >
                <ExpandButton
                  backgroundColor={expandPanelHovered ? '#4C5070' : '#393C56'}
                />
              </Box>
            )}

            {panelOpen && (
              <Box onClick={closePanel} style={{ position: 'relative' }}>
                <Box
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 71,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                  onMouseEnter={() => setCollapseBtnHovered(true)}
                  onMouseLeave={() => setCollapseBtnHovered(false)}
                >
                  <CollapseButton
                    backgroundColor={collapseBtnHovered ? '#4C5070' : '#393C56'}
                  />
                </Box>
              </Box>
            )}
            
            <Box className="slide-panel-content" style={{ minWidth: 500, opacity: panelOpen ? 1 : 0, transition: 'opacity 0.2s ease' }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
