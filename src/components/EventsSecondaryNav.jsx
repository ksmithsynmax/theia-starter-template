import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import { ships } from '../data/mockData'
import { useShipContext } from '../context/ShipContext'

const EVENTS_SECONDARY_NAV_DEFAULT_WIDTH = 386

function EventsSecondaryNav({ isOpen, onOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('My Events')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const { shipTabs, runtimeDetections } = useShipContext()

  const recentShips = shipTabs
    .filter((tab) => tab.type !== 'sts')
    .map((tab) => ships[tab.id])
    .filter(Boolean)

  const getLatestDateForShip = (shipId) => {
    const matching = runtimeDetections.filter((d) => d.shipId === shipId)
    if (matching.length === 0) return 'No info'
    const latest = matching.reduce((acc, curr) =>
      new Date(curr.date) > new Date(acc.date) ? curr : acc
    )
    return latest.date || 'No info'
  }

  const rows = recentShips.map((ship) => ({
    id: ship.id,
    event: ship.latestEvent || 'No info',
    ship: ship.name || 'No info',
    flag: ship.flag || '-',
    date: getLatestDateForShip(ship.id),
  }))

  const isMyEvents = activeTab === 'My Events'
  const tableRows = isMyEvents ? [] : rows

  return (
    <Box
      style={{
        width: isOpen ? EVENTS_SECONDARY_NAV_DEFAULT_WIDTH : 32,
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
          width: EVENTS_SECONDARY_NAV_DEFAULT_WIDTH,
          minWidth: EVENTS_SECONDARY_NAV_DEFAULT_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box
          style={{
            display: 'flex',
            borderBottom: '1px solid #393C56',
            height: 50,
          }}
        >
          <Box
            onClick={() => setActiveTab('My Events')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: isMyEvents ? '2px solid #fff' : 'none',
              color: isMyEvents ? '#fff' : '#888F9E',
              fontWeight: isMyEvents ? 600 : 400,
              fontSize: 14,
            }}
          >
            My Events
          </Box>
          <Box
            onClick={() => setActiveTab('Recently Viewed')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: !isMyEvents ? '2px solid #fff' : 'none',
              color: !isMyEvents ? '#fff' : '#888F9E',
              fontWeight: !isMyEvents ? 600 : 400,
              fontSize: 14,
            }}
          >
            Recently Viewed
          </Box>
        </Box>

        <Box style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 56px minmax(0, 1fr)',
              columnGap: 10,
              alignItems: 'center',
              padding: '6px 10px',
              background: '#24263C',
              borderRadius: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>Event</Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>Ship</Text>
            <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>
              Flag
            </Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>Date</Text>
          </Box>

          {tableRows.length === 0 ? (
            <Box style={{ padding: '14px 12px', background: '#181926' }}>
              <Text style={{ color: '#8D95AA', fontSize: 12, lineHeight: 1.4 }}>
                {isMyEvents
                  ? 'No events yet. Select a ship event on the map to populate this list.'
                  : 'No recently viewed events yet. Select a ship event on the map to populate this list.'}
              </Text>
            </Box>
          ) : (
            tableRows.map((row, idx) => (
              <Box
                key={`${activeTab}-${row.id}-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(0, 1fr) minmax(0, 1fr) 56px minmax(0, 1fr)',
                  columnGap: 10,
                  alignItems: 'center',
                  padding: '8px',
                  borderTop: idx === 0 ? 'none' : '1px solid #393C56',
                  background: '#181926',
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.event}
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.ship}
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}>
                  {row.flag}
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {row.date}
                </Text>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default EventsSecondaryNav
