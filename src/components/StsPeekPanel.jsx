import React, { useMemo } from 'react'
import { Box, Text } from '@mantine/core'
import { XClose } from '@untitledui/icons'
import KeyValuePair from './KeyValuePair'
import { ships, detections as allDetections } from '../data/mockData'

const EVENT_COLOR = {
  ais: '#00EB6C',
  dark: '#FFA500',
  light: '#00A3E3',
  spoofing: '#FF6D99',
  sts: '#0094FF',
  'sts-ais': '#0094FF',
  unattributed: '#F75349',
}

const EVENT_LABEL = {
  ais: 'AIS',
  dark: 'Dark',
  light: 'Light',
  spoofing: 'Spoofing',
  sts: 'Ship-to-Ship',
  'sts-ais': 'Ship-to-Ship',
  unattributed: 'Unattributed',
}

// A lightweight "peek" at a detection clicked on the map while the analyst is in
// the STS transfer-network view. It slides in beside the network (which stays
// put) so a neighboring event can be inspected without losing context.
const StsPeekPanel = ({ detection, onClose, onViewFull, topOffset = 112 }) => {
  if (!detection) return null

  const ship = detection.shipId ? ships[detection.shipId] : null
  const isUnattributed = detection.type === 'unattributed' || !ship
  const color = EVENT_COLOR[detection.type] || '#8D93A8'
  const label = EVENT_LABEL[detection.type] || 'Detection'
  const title = isUnattributed ? 'Unattributed vessel' : ship.name

  // A quick "recent activity" glance so the analyst can triage without leaving
  // the network. This is summary text (last few detections), not the full
  // timeline widget, so it doesn't duplicate the timeline.
  const recent = useMemo(() => {
    if (!detection.shipId) return []
    return allDetections
      .filter((d) => String(d.shipId) === String(detection.shipId))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
  }, [detection.shipId])

  return (
    <Box
      style={{
        position: 'absolute',
        top: topOffset,
        right: 16,
        width: 340,
        maxHeight: `calc(100% - ${topOffset + 24}px)`,
        overflowY: 'auto',
        background: '#181926',
        border: '1px solid #393C56',
        borderRadius: 8,
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        zIndex: 40,
        pointerEvents: 'auto',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid #24263C',
        }}
      >
        <Box style={{ minWidth: 0 }}>
          <Text style={{ color: '#8B90A5', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Event peek
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </Text>
            {!isUnattributed && ship.flag && (
              <Text style={{ fontSize: 16 }}>{ship.flag}</Text>
            )}
          </Box>
        </Box>
        <Box
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 4,
            cursor: 'pointer',
            flexShrink: 0,
            color: '#8B90A5',
          }}
        >
          <XClose style={{ width: 16, height: 16 }} />
        </Box>
      </Box>

      <Box style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
          />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{label}</Text>
          {detection.date && (
            <Text style={{ color: '#8B90A5', fontSize: 12 }}>· {detection.date} UTC</Text>
          )}
        </Box>

        <Box style={{ display: 'flex', gap: 16 }}>
          {Number.isFinite(detection.lat) && (
            <Box style={{ flex: 1, minWidth: 0 }}>
              <KeyValuePair keyName="Latitude" value={`${detection.lat}°`} />
            </Box>
          )}
          {Number.isFinite(detection.lng) && (
            <Box style={{ flex: 1, minWidth: 0 }}>
              <KeyValuePair keyName="Longitude" value={`${detection.lng}°`} />
            </Box>
          )}
        </Box>

        {!isUnattributed && (
          <Box style={{ display: 'flex', gap: 16 }}>
            {ship.mmsi && (
              <Box style={{ flex: 1, minWidth: 0 }}>
                <KeyValuePair keyName="MMSI" value={ship.mmsi} />
              </Box>
            )}
            {ship.imo && (
              <Box style={{ flex: 1, minWidth: 0 }}>
                <KeyValuePair keyName="IMO" value={ship.imo} />
              </Box>
            )}
          </Box>
        )}

        {recent.length > 0 && (
          <Box>
            <Text
              style={{
                color: '#888F9E',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                marginBottom: 8,
              }}
            >
              Recent activity
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recent.map((d) => (
                <Box
                  key={d.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Box
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: EVENT_COLOR[d.type] || '#8D93A8',
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    style={{
                      color: '#D5D8E2',
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 92,
                    }}
                  >
                    {EVENT_LABEL[d.type] || 'Detection'}
                  </Text>
                  <Text
                    style={{
                      color: '#8B90A5',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {d.date} UTC
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {onViewFull && (
          <Box
            onClick={() => onViewFull(detection)}
            style={{
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px 12px',
              borderRadius: 6,
              border: '1px solid #006CD7',
              background: 'rgba(0, 108, 215, 0.1)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View full details →
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default StsPeekPanel
