import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Box, ActionIcon } from '@mantine/core'
import { Plus, Minus } from '@untitledui/icons'
import TopNav from './TopNav'
import LeftNav from './LeftNav'
import Map from './Map'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipFilterIcon from '../custom-icons/ShipFilterIcon.svg'
import ShipFiltersPanel from './ShipFiltersPanel'
import { useShipContext } from '../context/ShipContext'
import SecondaryNav from './SecondaryNav'

function Layout() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [secondaryNavOpen, setSecondaryNavOpen] = useState(false)
  const [shipFiltersOpen, setShipFiltersOpen] = useState(false)
  const [collapseBtnHovered, setCollapseBtnHovered] = useState(false)
  const [expandPanelHovered, setExpandPanelHovered] = useState(false)
  const mapRef = useRef(null)
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
  const showPanelExpand = !panelOpen && shipTabs.length > 0
  const slidePanelClass = panelOpen ? 'slide-panel--open' : (shipTabs.length > 0 ? 'slide-panel--collapsed' : '')

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <Box style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <Map ref={mapRef} onDetectionClick={handleDetectionClick} />
        {shipFiltersOpen && (
          <ShipFiltersPanel onClose={() => setShipFiltersOpen(false)} />
        )}
        <Box
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            zIndex: 2,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <ActionIcon
              className="map-zoom-action-icon"
              variant="filled"
              aria-label="Zoom in"
              onClick={() => mapRef.current?.zoomIn()}
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#24263c',
                border: '1px solid #393C56',
                borderRadius: '4px 4px 0 0',
              }}
            >
              <Plus size={20} color="white" />
            </ActionIcon>
            <ActionIcon
              className="map-zoom-action-icon"
              variant="filled"
              aria-label="Zoom out"
              onClick={() => mapRef.current?.zoomOut()}
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#24263c',
                border: '1px solid #393C56',
                borderTop: '0',
                borderRadius: '0 0 4px 4px',
              }}
            >
              <Minus size={20} color="white" />
            </ActionIcon>
          </Box>
          <ActionIcon
            className="ship-filter-action-icon"
            variant="filled"
            aria-label="Ship filter"
            onClick={() => setShipFiltersOpen((prev) => !prev)}
            style={{
              width: 46,
              height: 46,
              backgroundColor: '#24263c',
              border: '1px solid #393C56',
              borderRadius: 4,
            }}
          >
            <img src={ShipFilterIcon} alt="" style={{ width: 20, height: 20 }} />
          </ActionIcon>
        </Box>
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

            <Box
              className="slide-panel-content"
              style={{
                minWidth: 500,
                opacity: panelOpen ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
