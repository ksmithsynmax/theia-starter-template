import { useState } from 'react'
import { Box, Text, Button } from '@mantine/core'
import { ChevronDown, ChevronUp, Check, InfoCircle } from '@untitledui/icons'
import KeyValuePair from '../KeyValuePair'

const EventTimelineCard = ({ date, event }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box
      style={{
        border: '1px solid #393C56',
        borderRadius: 4,
        background: '#24263C',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
        }}
      >
        <Box>
          <Text style={{ color: '#898f9d', fontSize: 12 }}>{date}</Text>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
            {event}
          </Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="xs"
            leftSection={expanded ? <Check style={{ width: 14, height: 14 }} /> : null}
            style={{
              backgroundColor: expanded ? 'transparent' : '#0094FF',
              border: expanded ? '1px solid #393C56' : 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 14,
              padding: '8px 12px',
              transform: 'none',
            }}
          >
            {expanded ? 'Selected' : 'Select'}
          </Button>
          <Box
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: '1px solid #393C56',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {expanded ? (
              <ChevronUp style={{ color: '#fff', width: 16, height: 16 }} />
            ) : (
              <ChevronDown style={{ color: '#fff', width: 16, height: 16 }} />
            )}
          </Box>
        </Box>
      </Box>

      <Box
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <Box style={{ overflow: 'hidden' }}>
          <Box style={{ padding: '0 12px 12px' }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                AIS derived info
              </Text>
              <InfoCircle
                style={{ color: '#898f9d', width: 14, height: 14 }}
              />
              <Box
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#393C56',
                }}
              />
            </Box>

            <Box style={{ display: 'flex', gap: 12 }}>
              <Box
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 4,
                  background: '#1a1c2e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ color: '#898f9d', fontSize: 12 }}>
                  Ship Illustration
                </Text>
              </Box>

              <Box
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px 16px',
                }}
              >
                <KeyValuePair keyName="Latitude" value="24.119738" />
                <KeyValuePair keyName="Longitude" value="32.149799" />
                <KeyValuePair keyName="Width" value="227" />
                <KeyValuePair keyName="Length" value="314" />
                <KeyValuePair keyName="Ship Type" value="Tanker" />
                <KeyValuePair keyName="Build Year" value="No info" />
                <KeyValuePair keyName="Heading" value="227" />
                <KeyValuePair keyName="Draft" value="5.9m" />
                <KeyValuePair keyName="Avg. Speed" value="6.9" />
                <KeyValuePair keyName="Max Speed" value="8.4" />
              </Box>
            </Box>

            <Box
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
              }}
            >
              <KeyValuePair
                keyName="Latest Speed"
                value="8 (2024-10-18 09:03:46 UTC)"
              />
              <KeyValuePair keyName="Destination" value="No info" />
              <KeyValuePair keyName="ETA" value="No info" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default EventTimelineCard
