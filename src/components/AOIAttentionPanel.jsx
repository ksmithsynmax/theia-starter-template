import { useEffect, useState } from 'react'
import { Box, Text } from '@mantine/core'
import { XClose } from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'

const PRIORITY_DOT_FLASH_MS = 700

const severityColor = {
  high: '#F75349',
  medium: '#FF9A3D',
  low: '#00A3E3',
}

function AOIAttentionPanel() {
  const [isPriorityDotFlashOn, setIsPriorityDotFlashOn] = useState(true)
  const [hoveredShipId, setHoveredShipId] = useState(null)
  const {
    attentionFeedItems,
    attentionReasonCounts,
    attentionPanelOpen,
    setAttentionPanelOpen,
    selectDetection,
    openShipTab,
    setDetailPanelOpen,
  } = useShipContext()

  useEffect(() => {
    const flashTimer = window.setInterval(() => {
      setIsPriorityDotFlashOn((prev) => !prev)
    }, PRIORITY_DOT_FLASH_MS)
    return () => window.clearInterval(flashTimer)
  }, [])

  if (!attentionPanelOpen) return null

  const topItems = attentionFeedItems.slice(0, 5)
  const reasonEntries = Object.entries(attentionReasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <Box
      style={{
        position: 'absolute',
        top: 24,
        right: 82,
        width: 340,
        maxHeight: 420,
        overflow: 'hidden',
        background: '#181926',
        border: '1px solid #393C56',
        borderRadius: 4,
        zIndex: 5,
        pointerEvents: 'auto',
      }}
    >
      <Box
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #393C56',
          background: '#24263C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: isPriorityDotFlashOn
                ? '#F75349'
                : 'rgba(247, 83, 73, 0.32)',
              boxShadow: isPriorityDotFlashOn
                ? '0 0 0 2px rgba(247, 83, 73, 0.24)'
                : 'none',
              flexShrink: 0,
              transition: 'all 160ms ease',
            }}
          />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
            Critical
          </Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <XClose
            size={16}
            color="#A4ABBE"
            style={{ cursor: 'pointer' }}
            onClick={() => setAttentionPanelOpen(false)}
          />
        </Box>
      </Box>
      <Box
        style={{
          padding: '10px 14px',
          maxHeight: 420 - 52,
          overflowY: 'auto',
        }}
      >
        <Text style={{ color: '#E8EBF2', fontSize: 12, marginBottom: 8 }}>
          {attentionFeedItems.length} vessel
          {attentionFeedItems.length === 1 ? '' : 's'} need attention
        </Text>
        <Box
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          {reasonEntries.map(([label, count]) => (
            <Box
              key={label}
              style={{
                borderRadius: 999,
                padding: '2px 8px',
                background: '#24263C',
                border: '1px solid #393C56',
                color: '#DDE2F0',
                fontSize: 11,
              }}
            >
              {label} ({count})
            </Box>
          ))}
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {topItems.map((item) => (
            <Box
              key={item.shipId}
              onMouseEnter={() => setHoveredShipId(item.shipId)}
              onMouseLeave={() => setHoveredShipId(null)}
              onClick={() => {
                if (item.latestDetection) {
                  selectDetection(item.latestDetection, {
                    source: 'attention',
                    allowTabSwitch: true,
                  })
                } else if (item.shipId) {
                  openShipTab({ shipId: item.shipId })
                }
                setDetailPanelOpen(true)
              }}
              style={{
                border: '1px solid #393C56',
                borderRadius: 4,
                padding: '8px 10px',
                cursor: 'pointer',
                background:
                  hoveredShipId === item.shipId ? '#181926' : '#24263C',
                transition: 'background 120ms ease',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // marginBottom: 4,
                  // gap: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                  {item.shipName}
                </Text>
                <Text
                  style={{
                    color: severityColor[item.severity] || '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {item.severity.toUpperCase()}
                </Text>
              </Box>
              <Text style={{ color: '#A4ABBE', fontSize: 11 }}>
                {item.signalLabels.join(', ')} • {item.eventCount} event
                {item.eventCount === 1 ? '' : 's'}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default AOIAttentionPanel
