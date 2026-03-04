import { useState, useEffect, useRef } from 'react'
import { Box, Text, Button, Checkbox } from '@mantine/core'
import { ChevronDown, ChevronUp, Check, InfoCircle } from '@untitledui/icons'
import KeyValuePair from '../KeyValuePair'
import stsSatImage from '../../assets/HAfSz3HbAAA34GM.jpeg'
import shipSatImage from '../../assets/Baniyas_27-July-2021_WV2_single-ship.jpg'
import shipSatImage2 from '../../assets/e92d7378215156c8a7c8c4c73d773963c71bd6b1-1920x1080.avif'
import shipIllustration from '../../assets/ShipIllustration.png'

const shipImages = [shipSatImage, shipSatImage2]

let skipWarningModal = false

const formatEta = (raw) => {
  if (!raw || raw === 'No info') return 'No info'
  try {
    const d = new Date(raw.replace(' UTC', 'Z'))
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    )
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
  isLatest,
  onSelect,
  onSwitchToLatest,
  onViewStsShips,
  aisInfo = {},
  partnerAisInfo,
  synMaxInfo,
  detectionType,
  selectedCard,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [stsModalOpen, setStsModalOpen] = useState(false)
  const [selectModalOpen, setSelectModalOpen] = useState(false)
  const [switchToLatestModalOpen, setSwitchToLatestModalOpen] = useState(false)
  const [dontShowChecked, setDontShowChecked] = useState(false)
  const cardRef = useRef(null)

  const modalSuppressed = () => skipWarningModal

  useEffect(() => {
    if (selected) {
      setExpanded(true)
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selected])

  // Collapse all non-selected cards when selection changes
  useEffect(() => {
    if (!selected) setExpanded(false)
  }, [selectedCard])

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
              onClick={() => {
                if (modalSuppressed()) {
                  onSelect?.()
                  onViewStsShips?.()
                } else {
                  setStsModalOpen(true)
                }
              }}
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
              {[
                { info: aisInfo, img: stsSatImage },
                { info: partnerAisInfo || aisInfo, img: shipIllustration },
              ].map((ship, idx) => (
                <Box key={idx} style={idx > 0 ? { marginTop: 24 } : undefined}>
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
                      {idx === 0 ? 'SynMax derived info' : 'AIS derived info'}
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
                      src={ship.img}
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
                      <KeyValuePair keyName="Latitude" value={ship.info.latitude || 'No info'} />
                      <KeyValuePair keyName="Longitude" value={ship.info.longitude || 'No info'} />
                      <KeyValuePair keyName="Width" value={ship.info.width || 'No info'} />
                      <KeyValuePair keyName="Length" value={ship.info.length || 'No info'} />
                      <KeyValuePair keyName="Ship Type" value={ship.info.shipType || 'No info'} />
                      <KeyValuePair keyName="Build Year" value={ship.info.buildYear || 'No info'} />
                      <KeyValuePair keyName="Heading" value={ship.info.heading || 'No info'} />
                      <KeyValuePair keyName="Draft" value={ship.info.draft || 'No info'} />
                      <KeyValuePair keyName="Avg. Speed" value={ship.info.avgSpeed || 'No info'} />
                      <KeyValuePair keyName="Max Speed" value={ship.info.maxSpeed || 'No info'} />
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
                    <KeyValuePair keyName="Latest Speed" value={ship.info.latestSpeed || 'No info'} />
                    <KeyValuePair keyName="Destination" value={ship.info.destination || 'No info'} />
                    <KeyValuePair keyName="ETA" value={formatEta(ship.info.eta)} />
                  </Box>
                </Box>
              ))}
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
                This will update the map and ship positions to{' '}
                <b>
                  <span style={{ color: '#fff' }}>
                    {date?.replace(/\s\d{2}:\d{2}$/, '')}
                  </span>
                </b>
                {' '}and open the Ship-to-Ship tab. You can return to today's view using the calendar in the header.
              </Text>
              <Checkbox
                checked={dontShowChecked}
                onChange={(e) => setDontShowChecked(e.currentTarget.checked)}
                label="Don't show this again"
                styles={{
                  label: { color: '#898f9d', fontSize: 13 },
                  input: { backgroundColor: dontShowChecked ? '#0094FF' : 'transparent', borderColor: dontShowChecked ? '#0094FF' : '#393C56' },
                }}
                style={{ marginBottom: 20 }}
              />
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  onClick={() => { setStsModalOpen(false); setDontShowChecked(false) }}
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
                    if (dontShowChecked) skipWarningModal = true
                    setStsModalOpen(false)
                    setDontShowChecked(false)
                    onSelect?.()
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
            onClick={() => {
              if (selected) {
                onSelect?.()
              } else if (isLatest) {
                setSwitchToLatestModalOpen(true)
              } else if (modalSuppressed()) {
                onSelect?.()
              } else {
                setSelectModalOpen(true)
              }
            }}
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
                {synMaxInfo ? 'SynMax derived info' : 'AIS derived info'}
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

            {synMaxInfo ? (
              <>
                <Box style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={shipImages[0]}
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
                    <KeyValuePair keyName="Object ID" value={synMaxInfo.objectId || 'No info'} />
                    <KeyValuePair keyName="Ship Subtype" value={synMaxInfo.shipSubtype || 'No info'} />
                    <KeyValuePair keyName="Image Source" value={synMaxInfo.imageSource || 'No info'} />
                    <KeyValuePair keyName="Status" value={synMaxInfo.status || 'No info'} />
                    <KeyValuePair keyName="Latitude" value={synMaxInfo.latitude || 'No info'} />
                    <KeyValuePair keyName="Longitude" value={synMaxInfo.longitude || 'No info'} />
                    <KeyValuePair keyName="Heading" value={synMaxInfo.heading || 'No info'} />
                    <KeyValuePair keyName="Ship Length" value={synMaxInfo.shipLength || 'No info'} />
                    <KeyValuePair keyName="Ship Width" value={synMaxInfo.shipWidth || 'No info'} />
                    <KeyValuePair keyName="Ship Type" value={synMaxInfo.shipType || 'No info'} />
                  </Box>
                </Box>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr',
                    gap: '0 12px',
                    marginTop: 12,
                  }}
                >
                  <KeyValuePair keyName="Image Captured Time" value={synMaxInfo.imageCapturedTime || 'No info'} />
                </Box>

                {/* AIS derived info section — shown for Light detections */}
                {detectionType === 'light' && (
                  <>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 24,
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
                        src={shipIllustration}
                        alt="Ship illustration"
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
                        <KeyValuePair keyName="Latitude" value={aisInfo.latitude || 'No info'} />
                        <KeyValuePair keyName="Longitude" value={aisInfo.longitude || 'No info'} />
                        <KeyValuePair keyName="Width" value={aisInfo.width || 'No info'} />
                        <KeyValuePair keyName="Length" value={aisInfo.length || 'No info'} />
                        <KeyValuePair keyName="Ship Type" value={aisInfo.shipType || 'No info'} />
                        <KeyValuePair keyName="Build Year" value={aisInfo.buildYear || 'No info'} />
                        <KeyValuePair keyName="Heading" value={aisInfo.heading || 'No info'} />
                        <KeyValuePair keyName="Draft" value={aisInfo.draft || 'No info'} />
                        <KeyValuePair keyName="Avg. Speed" value={aisInfo.avgSpeed || 'No info'} />
                        <KeyValuePair keyName="Max Speed" value={aisInfo.maxSpeed || 'No info'} />
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
                      <KeyValuePair keyName="Latest Speed" value={aisInfo.latestSpeed || 'No info'} />
                      <KeyValuePair keyName="Destination" value={aisInfo.destination || 'No info'} />
                      <KeyValuePair keyName="ETA" value={formatEta(aisInfo.eta)} />
                    </Box>
                  </>
                )}
              </>
            ) : (
              <>
                <Box style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={shipIllustration}
                    alt="Ship illustration"
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
                    <KeyValuePair keyName="Latitude" value={aisInfo.latitude || 'No info'} />
                    <KeyValuePair keyName="Longitude" value={aisInfo.longitude || 'No info'} />
                    <KeyValuePair keyName="Width" value={aisInfo.width || 'No info'} />
                    <KeyValuePair keyName="Length" value={aisInfo.length || 'No info'} />
                    <KeyValuePair keyName="Ship Type" value={aisInfo.shipType || 'No info'} />
                    <KeyValuePair keyName="Build Year" value={aisInfo.buildYear || 'No info'} />
                    <KeyValuePair keyName="Heading" value={aisInfo.heading || 'No info'} />
                    <KeyValuePair keyName="Draft" value={aisInfo.draft || 'No info'} />
                    <KeyValuePair keyName="Avg. Speed" value={aisInfo.avgSpeed || 'No info'} />
                    <KeyValuePair keyName="Max Speed" value={aisInfo.maxSpeed || 'No info'} />
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
                  <KeyValuePair keyName="Latest Speed" value={aisInfo.latestSpeed || 'No info'} />
                  <KeyValuePair keyName="Destination" value={aisInfo.destination || 'No info'} />
                  <KeyValuePair keyName="ETA" value={formatEta(aisInfo.eta)} />
                </Box>
              </>
            )}
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
              This will update the map and ship positions to{' '}
              <b>
                <span style={{ color: '#fff' }}>
                  {date?.replace(/\s\d{2}:\d{2}$/, '')}
                </span>
              </b>
              . You can return to today's view using the calendar in the header.
            </Text>
            <Checkbox
              checked={dontShowChecked}
              onChange={(e) => setDontShowChecked(e.currentTarget.checked)}
              label="Don't show this again"
              styles={{
                label: { color: '#898f9d', fontSize: 13 },
                input: { backgroundColor: 'transparent', borderColor: '#393C56' },
              }}
              style={{ marginBottom: 20 }}
            />
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                onClick={() => { setSelectModalOpen(false); setDontShowChecked(false) }}
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
                  if (dontShowChecked) skipWarningModal = true
                  setSelectModalOpen(false)
                  setDontShowChecked(false)
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

      {switchToLatestModalOpen && (
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
          onClick={() => setSwitchToLatestModalOpen(false)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1B1D2E',
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
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Switch to Latest Event?
            </Text>
            <Text
              style={{
                color: '#898f9d',
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              You are currently viewing a historical detection. Switching will update the map and timeline to show the most recent event for this ship.
            </Text>
            <Box
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="subtle"
                onClick={() => setSwitchToLatestModalOpen(false)}
                styles={{
                  root: {
                    color: '#898f9d',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    '&:hover': { background: '#24263C' },
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSwitchToLatestModalOpen(false)
                  if (onSwitchToLatest) {
                    onSwitchToLatest()
                  } else {
                    onSelect?.()
                  }
                }}
                styles={{
                  root: {
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 16px',
                    background: '#0094FF',
                    borderRadius: 4,
                    '&:hover': { background: '#0080DD' },
                  },
                }}
              >
                Switch to Latest
              </Button>
            </Box>
          </Box>
        </Box>
      )}

    </Box>
  )
}

export default EventTimelineCard
