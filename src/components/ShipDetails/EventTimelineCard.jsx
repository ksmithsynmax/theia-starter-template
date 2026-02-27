import { useState, useEffect, useRef } from 'react'
import { Box, Text, Button, Tooltip } from '@mantine/core'
import { ChevronDown, ChevronUp, Check, InfoCircle } from '@untitledui/icons'
import KeyValuePair from '../KeyValuePair'
import stsSatImage from '../../assets/HAfSz3HbAAA34GM.jpeg'
import stsSatImage2 from '../../assets/b7305b3c008782765e2f14920270f2e7834f0f17.jpg'
import shipSatImage from '../../assets/Baniyas_27-July-2021_WV2_single-ship.jpg'
import shipSatImage2 from '../../assets/e92d7378215156c8a7c8c4c73d773963c71bd6b1-1920x1080.avif'

const shipImages = [shipSatImage, shipSatImage2]

const formatEta = (raw) => {
  if (!raw || raw === 'No info') return 'No info'
  try {
    const d = new Date(raw.replace(' UTC', 'Z'))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return raw
  }
}

const EventTimelineCard = ({
  date,
  event,
  variant = 'default',
  icon,
  port,
  status,
  duration,
  newFlag,
  previousFlag,
  selected,
  onSelect,
  onViewStsShips,
  aisInfo = {},
}) => {
  const [expanded, setExpanded] = useState(false)
  const [stsModalOpen, setStsModalOpen] = useState(false)
  const [selectModalOpen, setSelectModalOpen] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (selected) {
      setExpanded(true)
      // Wait for the card expand transition (250ms) to finish before scrolling
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selected])

  if (variant === 'port') {
    return (
      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 4,
          background: '#24263C',
          padding: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>
          {date}
        </Text>
        <Box style={{ display: 'flex', gap: 40 }}>
          <KeyValuePair keyName="Event" value="Port of Calls" />
          <KeyValuePair keyName="Port" value={port} />
          <KeyValuePair keyName="Status" value={status} />
          <KeyValuePair keyName="Duration" value={duration} />
        </Box>
      </Box>
    )
  }

  if (variant === 'sts') {
    return (
      <Box
        ref={cardRef}
        style={{
          position: 'relative',
          border: selected ? '2px solid #0094FF' : '1px solid #393C56',
          borderRadius: 4,
          background: '#24263C',
          scrollMarginTop: 16,
          overflow: 'hidden',
        }}
      >
        {selected && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 148, 255, 0.08)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        <Box
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
          }}
        >
          <Box>
            <Text style={{ color: '#898f9d', fontSize: 12 }}>{date}</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {icon}
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                {event}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              size="xs"
              onClick={() => setStsModalOpen(true)}
              leftSection={
                selected ? <Check style={{ width: 14, height: 14 }} /> : null
              }
              style={{
                backgroundColor: selected ? 'transparent' : '#0094FF',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 14,
                height: 32,
                padding: '0 12px',
                transform: 'none',
              }}
            >
              {selected ? 'Selected' : 'Select'}
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
                <img
                  src={stsSatImage}
                  alt="Ship-to-ship satellite imagery"
                  style={{
                    width: 180,
                    height: 206,
                    borderRadius: 4,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                <Box
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 16px',
                  }}
                >
                  <KeyValuePair
                    keyName="Latitude"
                    value={aisInfo.latitude || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Longitude"
                    value={aisInfo.longitude || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Width"
                    value={aisInfo.width || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Length"
                    value={aisInfo.length || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Ship Type"
                    value={aisInfo.shipType || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Build Year"
                    value={aisInfo.buildYear || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Heading"
                    value={aisInfo.heading || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Draft"
                    value={aisInfo.draft || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Avg. Speed"
                    value={aisInfo.avgSpeed || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Max Speed"
                    value={aisInfo.maxSpeed || 'No info'}
                  />
                </Box>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 1fr',
                  gap: '0 12px',
                  marginTop: 12,
                }}
              >
                <KeyValuePair
                  keyName="Latest Speed"
                  value={aisInfo.latestSpeed || 'No info'}
                />
                <KeyValuePair
                  keyName="Destination"
                  value={aisInfo.destination || 'No info'}
                />
                <Tooltip label={aisInfo.eta || 'No info'} position="top" withArrow>
                  <Box>
                    <KeyValuePair keyName="ETA" value={formatEta(aisInfo.eta)} />
                  </Box>
                </Tooltip>
              </Box>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 12,
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
                <img
                  src={stsSatImage2}
                  alt="Ship-to-ship satellite imagery"
                  style={{
                    width: 180,
                    height: 206,
                    borderRadius: 4,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                <Box
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px 16px',
                  }}
                >
                  <KeyValuePair
                    keyName="Latitude"
                    value={aisInfo.latitude || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Longitude"
                    value={aisInfo.longitude || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Width"
                    value={aisInfo.width || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Length"
                    value={aisInfo.length || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Ship Type"
                    value={aisInfo.shipType || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Build Year"
                    value={aisInfo.buildYear || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Heading"
                    value={aisInfo.heading || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Draft"
                    value={aisInfo.draft || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Avg. Speed"
                    value={aisInfo.avgSpeed || 'No info'}
                  />
                  <KeyValuePair
                    keyName="Max Speed"
                    value={aisInfo.maxSpeed || 'No info'}
                  />
                </Box>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 1fr',
                  gap: '0 12px',
                  marginTop: 12,
                }}
              >
                <KeyValuePair
                  keyName="Latest Speed"
                  value={aisInfo.latestSpeed || 'No info'}
                />
                <KeyValuePair
                  keyName="Destination"
                  value={aisInfo.destination || 'No info'}
                />
                <Tooltip label={aisInfo.eta || 'No info'} position="top" withArrow>
                  <Box>
                    <KeyValuePair keyName="ETA" value={formatEta(aisInfo.eta)} />
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        {stsModalOpen && (
          <Box
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setStsModalOpen(false)}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#24263C',
                border: '1px solid #393C56',
                borderRadius: 8,
                padding: 24,
                width: 420,
                maxWidth: '90vw',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                View Ships Involved in Ship-to-Ship Event
              </Text>
              <Text
                style={{
                  color: '#898f9d',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                This will open a new tab that contains all the ships involved in
                this ship-to-ship event, would you like to proceed?
              </Text>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    border: '1px solid #393C56',
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <Text style={{ color: '#898f9d', fontSize: 13 }}>
                  Don't show this again
                </Text>
              </Box>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  onClick={() => setStsModalOpen(false)}
                  style={{
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </Text>
                <Button
                  onClick={() => {
                    setStsModalOpen(false)
                    onViewStsShips?.()
                  }}
                  style={{
                    backgroundColor: '#0094FF',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '8px 24px',
                    transform: 'none',
                  }}
                >
                  Yes
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  if (variant === 'flag') {
    return (
      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 4,
          background: '#24263C',
          padding: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>
          {date}
        </Text>
        <Box style={{ display: 'flex', gap: 40 }}>
          <KeyValuePair keyName="Event" value="Flag change" />
          <KeyValuePair keyName="New Flag" value={newFlag} />
          <KeyValuePair keyName="Previous Flag" value={previousFlag} />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={cardRef}
      style={{
        position: 'relative',
        border: selected ? '2px solid #0094FF' : '1px solid #393C56',
        borderRadius: 4,
        background: '#24263C',
        overflow: 'hidden',
        scrollMarginTop: 16,
      }}
    >
      {selected && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 148, 255, 0.08)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <Box
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
        }}
      >
        <Box>
          <Text style={{ color: '#898f9d', fontSize: 12 }}>{date}</Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {icon}
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              {event}
            </Text>
          </Box>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="xs"
            onClick={() => selected ? onSelect?.() : setSelectModalOpen(true)}
            leftSection={
              selected ? <Check style={{ width: 14, height: 14 }} /> : null
            }
            style={{
              backgroundColor: selected ? 'transparent' : '#0094FF',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 14,
              padding: '8px 12px',
              transform: 'none',
            }}
          >
            {selected ? 'Selected' : 'Select'}
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
              <InfoCircle style={{ color: '#898f9d', width: 14, height: 14 }} />
              <Box
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#393C56',
                }}
              />
            </Box>

            <Box style={{ display: 'flex', gap: 12 }}>
              <img
                src={
                  shipImages[
                    date
                      ? date.charCodeAt(date.length - 1) % shipImages.length
                      : 0
                  ]
                }
                alt="Ship satellite imagery"
                style={{
                  width: 180,
                  height: 206,
                  borderRadius: 4,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <Box
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px 16px',
                }}
              >
                <KeyValuePair
                  keyName="Latitude"
                  value={aisInfo.latitude || 'No info'}
                />
                <KeyValuePair
                  keyName="Longitude"
                  value={aisInfo.longitude || 'No info'}
                />
                <KeyValuePair
                  keyName="Width"
                  value={aisInfo.width || 'No info'}
                />
                <KeyValuePair
                  keyName="Length"
                  value={aisInfo.length || 'No info'}
                />
                <KeyValuePair
                  keyName="Ship Type"
                  value={aisInfo.shipType || 'No info'}
                />
                <KeyValuePair
                  keyName="Build Year"
                  value={aisInfo.buildYear || 'No info'}
                />
                <KeyValuePair
                  keyName="Heading"
                  value={aisInfo.heading || 'No info'}
                />
                <KeyValuePair
                  keyName="Draft"
                  value={aisInfo.draft || 'No info'}
                />
                <KeyValuePair
                  keyName="Avg. Speed"
                  value={aisInfo.avgSpeed || 'No info'}
                />
                <KeyValuePair
                  keyName="Max Speed"
                  value={aisInfo.maxSpeed || 'No info'}
                />
              </Box>
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 1fr',
                gap: '0 12px',
                marginTop: 12,
              }}
            >
              <KeyValuePair
                keyName="Latest Speed"
                value={aisInfo.latestSpeed || 'No info'}
              />
              <KeyValuePair
                keyName="Destination"
                value={aisInfo.destination || 'No info'}
              />
              <Tooltip label={aisInfo.eta || 'No info'} position="top" withArrow>
                <Box>
                  <KeyValuePair keyName="ETA" value={formatEta(aisInfo.eta)} />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {selectModalOpen && (
        <Box
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectModalOpen(false)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#24263C',
              border: '1px solid #393C56',
              borderRadius: 8,
              padding: 24,
              width: 420,
              maxWidth: '90vw',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Warning
            </Text>
            <Text
              style={{
                color: '#898f9d',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              This will update the map and ship positions to {date?.replace(/\s\d{2}:\d{2}$/, '')}. You can return to today's view using the calendar in the header.
            </Text>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                onClick={() => setSelectModalOpen(false)}
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </Text>
              <Button
                onClick={() => {
                  setSelectModalOpen(false)
                  onSelect?.()
                }}
                style={{
                  backgroundColor: '#0094FF',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '8px 24px',
                  transform: 'none',
                }}
              >
                Yes
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default EventTimelineCard
