import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'

const ROUTE_SECONDARY_NAV_DEFAULT_WIDTH = 320
const ROUTE_SECONDARY_TITLES = {
  '/events': 'Events',
  '/ports': 'Ports',
  '/tip-cue': 'Tip & Cue',
  '/webcams': 'Webcams',
  '/osint': 'OSINT',
  '/alerts': 'Alerts',
  '/similarsearch': 'Similar Search',
  '/polygons': 'Polygons',
}

function RouteSecondaryNav({ isOpen, onOpen, onClose, currentPath }) {
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const title = ROUTE_SECONDARY_TITLES[currentPath] || 'Section'

  return (
    <Box
      style={{
        width: isOpen ? ROUTE_SECONDARY_NAV_DEFAULT_WIDTH : 32,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #393c56',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ExpandButton
            backgroundColor={expandHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      {isOpen && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton
            backgroundColor={collapseHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      <Box
        style={{
          width: ROUTE_SECONDARY_NAV_DEFAULT_WIDTH,
          minWidth: ROUTE_SECONDARY_NAV_DEFAULT_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #393C56',
            padding: '0 16px',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600 }}>
            {title}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default RouteSecondaryNav
