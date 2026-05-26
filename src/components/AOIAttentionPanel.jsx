import { useEffect, useState } from 'react'
import { Box, Text } from '@mantine/core'
import { Trash02, XClose } from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'

const PRIORITY_DOT_FLASH_MS = 700

const severityColor = {
  high: '#F75349',
  medium: '#FF9A3D',
  low: '#00A3E3',
}

function AOIAttentionPanel({ mockupVersion = 'version1' }) {
  const [isPriorityDotFlashOn, setIsPriorityDotFlashOn] = useState(true)
  const [hoveredShipId, setHoveredShipId] = useState(null)
  const [showDismissed, setShowDismissed] = useState(false)
  const {
    attentionFeedItems,
    dismissedAttentionItems,
    attentionReasonCounts,
    attentionPanelOpen,
    setAttentionPanelOpen,
    selectDetection,
    openShipTab,
    setDetailPanelOpen,
    activeDetectionId,
    panelFocusDetectionId,
    dismissAttentionShip,
    restoreAttentionShip,
    clearDismissedAttention,
  } = useShipContext()
  const isVersion2 = mockupVersion === 'version2'

  useEffect(() => {
    if (isVersion2) {
      setIsPriorityDotFlashOn(true)
      return undefined
    }
    const flashTimer = window.setInterval(() => {
      setIsPriorityDotFlashOn((prev) => !prev)
    }, PRIORITY_DOT_FLASH_MS)
    return () => window.clearInterval(flashTimer)
  }, [isVersion2])

  if (!attentionPanelOpen) return null

  const topItems = attentionFeedItems
  const reasonEntries = Object.entries(attentionReasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
  const panelTitle =
    mockupVersion === 'version2' ? 'Recommended for You' : 'Critical'

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
          {!isVersion2 && (
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
          )}
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
            {panelTitle}
          </Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <XClose
            size={16}
            color="#FFFFFF"
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
          {topItems.map((item) => {
            const latestDetectionId = item?.latestDetection?.id
            const isActive =
              latestDetectionId != null &&
              String(latestDetectionId) ===
                String(panelFocusDetectionId ?? activeDetectionId)

            return (
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
                border: isActive ? '1px solid #006CD7' : '1px solid #393C56',
                borderRadius: 4,
                padding: '8px 10px',
                cursor: 'pointer',
                background: isActive
                  ? 'rgba(0, 108, 215, 0.16)'
                  : hoveredShipId === item.shipId
                    ? '#181926'
                    : '#24263C',
                transition: 'background 120ms ease, border-color 120ms ease',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                  {item.shipName}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!isVersion2 && (
                    <Text
                      style={{
                        color: severityColor[item.severity] || '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {item.severity.toUpperCase()}
                    </Text>
                  )}
                  <Box
                    onClick={(event) => {
                      event.stopPropagation()
                      if (item?.shipId != null && item?.latestDetection?.id != null) {
                        dismissAttentionShip(item)
                      }
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      background: '#181926',
                      border: '1px solid #393C56',
                    }}
                    title="Dismiss until new event"
                    aria-label="Dismiss from critical list"
                  >
                    <XClose size={12} color="#FFFFFF" />
                  </Box>
                </Box>
              </Box>
              <Text style={{ color: '#A4ABBE', fontSize: 11 }}>
                {item.signalLabels.join(', ')} • {item.eventCount} event
                {item.eventCount === 1 ? '' : 's'}
              </Text>
            </Box>
            )
          })}
        </Box>
        <Box
          onClick={() => {
            if (dismissedAttentionItems.length > 0) {
              setShowDismissed((prev) => !prev)
            }
          }}
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid #393C56',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: dismissedAttentionItems.length > 0 ? 'pointer' : 'default',
            opacity: dismissedAttentionItems.length > 0 ? 1 : 0.7,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash02 size={14} color="#A4ABBE" />
            <Text style={{ color: '#DDE2F0', fontSize: 11, fontWeight: 600 }}>
              Dismissed
            </Text>
            <Box
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 999,
                background: '#F75349',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
              }}
            >
              {dismissedAttentionItems.length}
            </Box>
          </Box>
          {dismissedAttentionItems.length > 0 && (
            <Text style={{ color: '#A4ABBE', fontSize: 10 }}>
              {showDismissed ? 'Hide' : 'Show'}
            </Text>
          )}
        </Box>
        {showDismissed && dismissedAttentionItems.length > 0 && (
          <Box style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {dismissedAttentionItems.map((item) => (
              <Box
                key={`dismissed-${item.shipId}`}
                style={{
                  border: '1px solid #393C56',
                  borderRadius: 4,
                  padding: '6px 8px',
                  background: '#181926',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: '#A4ABBE', fontSize: 11 }}>{item.shipName}</Text>
                <Text
                  onClick={(event) => {
                    event.stopPropagation()
                    restoreAttentionShip(item.shipId)
                  }}
                  style={{
                    color: '#006CD7',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Restore
                </Text>
              </Box>
            ))}
            <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
              <Text
                onClick={(event) => {
                  event.stopPropagation()
                  clearDismissedAttention()
                }}
                style={{
                  color: '#A4ABBE',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Clear dismissed
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AOIAttentionPanel
