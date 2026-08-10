import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text } from '@mantine/core'
import { Star01 } from '@untitledui/icons'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import { useShipContext } from '../context/ShipContext'
import { DataTable, getColumnsByTab } from './SecondaryNav'
import { resolvePortCoords } from '../data/portCoords'

const NAV_WIDTH = 386
const NAV_MIN_WIDTH = 386
const NAV_MAX_WIDTH = 760

// Dedicated "Ports" left-nav destination. Mirrors the Favorites nav chrome and
// reuses its working ports table (DataTable + getColumnsByTab) + row-click ->
// openPortTab flow, so ports get a first-class entry point instead of the map
// layer being the only way in.
const PortsSecondaryNav = ({
  isOpen,
  onOpen,
  onClose,
  active,
  onPortSelect,
  portsLayerVisible = false,
  onPortsLayerVisibleChange,
}) => {
  const { favoritePorts, shipTabs } = useShipContext()
  const [activeTab, setActiveTab] = useState('my-ports')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [navWidth, setNavWidth] = useState(NAV_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(NAV_WIDTH)

  useEffect(() => {
    if (!isResizing) return undefined
    const handleMouseMove = (event) => {
      const deltaX = event.clientX - resizeStartXRef.current
      setNavWidth(
        Math.max(
          NAV_MIN_WIDTH,
          Math.min(NAV_MAX_WIDTH, resizeStartWidthRef.current + deltaX)
        )
      )
    }
    const handleMouseUp = () => setIsResizing(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const favoritePortRows = useMemo(
    () =>
      (favoritePorts || []).map((port) => ({
        id: `favorite-port-row-${port.id}`,
        sourcePortId: String(port.id),
        name: port.name || 'No info',
        country: port.country || 'No info',
        activity: port.activity || 'No info',
        risk: port.risk || 'Monitoring',
        updatedAt: port.updatedAt || 'Just now',
      })),
    [favoritePorts]
  )

  const recentlyViewedPortRows = useMemo(
    () =>
      (shipTabs || [])
        .filter((tab) => tab?.type === 'port')
        .slice()
        .reverse()
        .map((tab, index) => ({
          id: `recent-port-${tab.id}-${index}`,
          sourcePortId: String(tab.id),
          name: tab.name || 'No info',
          country: tab.country || 'No info',
          activity: tab.activity || 'No info',
          risk: tab.risk || 'Monitoring',
          updatedAt: tab.updatedAt || 'Just now',
        })),
    [shipTabs]
  )

  const handleRowClick = (row) => {
    const resolved = resolvePortCoords({
      id: row.sourcePortId,
      name: row.name,
    })
    onPortSelect?.({
      id: resolved?.id || row.sourcePortId,
      name: resolved?.name || row.name,
      type: 'port',
    })
  }

  const tabs = [
    { id: 'my-ports', label: 'My Ports' },
    { id: 'recently-viewed', label: 'Recently Viewed' },
  ]

  return (
    <Box
      style={{
        width: isOpen && active ? navWidth : active ? 32 : 0,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: isResizing ? 'none' : 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: active ? '1px solid #393c56' : 'none',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && active && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{ position: 'absolute', right: 0, top: 12, cursor: 'pointer', zIndex: 10 }}
        >
          <ExpandButton backgroundColor={expandHovered ? '#4C5070' : '#393C56'} />
        </Box>
      )}

      {isOpen && active && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 12,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton backgroundColor={collapseHovered ? '#4C5070' : '#393C56'} />
        </Box>
      )}

      <Box
        style={{
          width: navWidth,
          minWidth: navWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box style={{ display: 'flex', borderBottom: '1px solid #393C56', height: 50 }}>
          {tabs.map((tab) => (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #fff' : 'none',
                color: activeTab === tab.id ? '#fff' : '#888F9E',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 14,
              }}
            >
              {tab.label}
            </Box>
          ))}
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 20px',
            borderBottom: '1px solid #393C56',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 500 }}>
            Show ports on map
          </Text>
          <Box
            role="switch"
            aria-checked={portsLayerVisible}
            onClick={() => onPortsLayerVisibleChange?.(!portsLayerVisible)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              padding: 2,
              cursor: 'pointer',
              flexShrink: 0,
              background: portsLayerVisible ? '#006cd7' : '#393C56',
              transition: 'background 0.15s ease',
              display: 'flex',
              justifyContent: portsLayerVisible ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#FFFFFF',
              }}
            />
          </Box>
        </Box>

        <Box style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'my-ports' &&
            (favoritePortRows.length === 0 ? (
              <PortsEmptyState />
            ) : (
              <DataTable
                rows={favoritePortRows}
                columns={getColumnsByTab('ports')}
                emptyMessage="No ports in this list yet."
                onRowClick={handleRowClick}
              />
            ))}

          {activeTab === 'recently-viewed' && (
            <DataTable
              rows={recentlyViewedPortRows}
              columns={getColumnsByTab('ports')}
              emptyMessage="No recently viewed ports yet."
              onRowClick={handleRowClick}
            />
          )}
        </Box>
      </Box>
      {isOpen && active && (
        <Box
          onMouseDown={(event) => {
            if (event.button !== 0) return
            resizeStartXRef.current = event.clientX
            resizeStartWidthRef.current = navWidth
            setIsResizing(true)
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 8,
            height: '100%',
            cursor: 'ew-resize',
            zIndex: 9,
          }}
        />
      )}
    </Box>
  )
}

const PortsEmptyState = () => (
  <Box>
    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
      Add ports to this list by:
    </Text>

    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Text style={{ color: '#888F9E', fontSize: 13, lineHeight: 1.5, maxWidth: 220 }}>
        Select any port and click the star button in its detail panel.
      </Text>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Star01 size={18} color="#888F9E" />
        <Text style={{ color: '#888F9E', fontSize: 13 }}>&rarr;</Text>
        <Star01 size={18} color="#F5B301" fill="#F5B301" />
      </Box>
    </Box>

    <Box style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <Box style={{ flex: 1, height: 1, background: '#393C56' }} />
      <Text style={{ color: '#888F9E', fontSize: 12 }}>or</Text>
      <Box style={{ flex: 1, height: 1, background: '#393C56' }} />
    </Box>

    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <Text style={{ color: '#888F9E', fontSize: 13, lineHeight: 1.5, maxWidth: 220 }}>
        Upload a file to add multiple ports at once.
      </Text>
      <Box
        component="button"
        type="button"
        style={{
          flexShrink: 0,
          height: 34,
          padding: '0 16px',
          borderRadius: 4,
          border: '1px solid #393C56',
          background: '#24263C',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Upload
      </Box>
    </Box>
  </Box>
)

export default PortsSecondaryNav
