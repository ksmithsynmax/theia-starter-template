import { useEffect, useRef, useState } from 'react'
import { Box, Text, Button, Tooltip, Popover } from '@mantine/core'
import {
  ChevronDown,
  ChevronUp,
  InfoCircle,
  Calendar,
  MarkerPin01,
} from '@untitledui/icons'
import KeyValuePair from '../KeyValuePair'
import stsSatImage from '../../assets/HAfSz3HbAAA34GM.jpeg'
import shipSatImage from '../../assets/Baniyas_27-July-2021_WV2_single-ship.jpg'
import shipSatImage2 from '../../assets/e92d7378215156c8a7c8c4c73d773963c71bd6b1-1920x1080.avif'
import shipIllustration from '../../assets/ShipIllustration.png'

const shipImages = [shipSatImage, shipSatImage2]
const PRIMARY_BUTTON_COLOR = '#006CD7'

export const EventToolsIcon = () => (
  <svg
    width="16"
    height="10"
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 6C3.5523 6 4 6.4477 4 7V9C4 9.5523 3.5523 10 3 10H1C0.4477 10 0 9.5523 0 9V7C0 6.4477 0.4477 6 1 6H3ZM9 6C9.5523 6 10 6.4477 10 7V9C10 9.5523 9.5523 10 9 10H7C6.4477 10 6 9.5523 6 9V7C6 6.4477 6.4477 6 7 6H9ZM15 6C15.5523 6 16 6.4477 16 7V9C16 9.5523 15.5523 10 15 10H13C12.4477 10 12 9.5523 12 9V7C12 6.4477 12.4477 6 13 6H15ZM3 0C3.5523 0 4 0.4477 4 1V3C4 3.5523 3.5523 4 3 4H1C0.4477 4 0 3.5523 0 3V1C0 0.4477 0.4477 0 1 0H3ZM9 0C9.5523 0 10 0.4477 10 1V3C10 3.5523 9.5523 4 9 4H7C6.4477 4 6 3.5523 6 3V1C6 0.4477 6.4477 0 7 0H9ZM15 0C15.5523 0 16 0.4477 16 1V3C16 3.5523 15.5523 4 15 4H13C12.4477 4 12 3.5523 12 3V1C12 0.4477 12.4477 0 13 0H15Z"
      fill="white"
    />
  </svg>
)

const CompactInfoList = ({ title, items }) => (
  <Box
    style={{
      minWidth: 0,
    }}
  >
    {title && (
      <Text
        style={{
          paddingBottom: 4,
          color: '#B7BCC8',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
    )}
    <Box>
      {items.map(({ label, value }, index) => (
        <Box
          key={label}
          style={{
            minHeight: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            borderTop:
              index > 0 ? '1px solid rgba(57, 60, 86, 0.7)' : 'none',
          }}
        >
          <Text style={{ color: '#898F9D', fontSize: 10, flexShrink: 0 }}>
            {label}
          </Text>
          <Text
            title={String(value)}
            style={{
              minWidth: 0,
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 500,
              textAlign: 'right',
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Text>
        </Box>
      ))}
    </Box>
  </Box>
)

const CompactInfoGrid = ({ title, items }) => (
  <Box style={{ minWidth: 0 }}>
    {title && (
      <Text
        style={{
          paddingBottom: 4,
          color: '#B7BCC8',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
    )}
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: 16,
      }}
    >
      {items.map(({ label, value, span }, index) => (
        <Box
          key={label}
          style={{
            minWidth: 0,
            minHeight: 24,
            gridColumn: span === 2 ? 'span 2' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            borderTop:
              index > 1 ? '1px solid rgba(57, 60, 86, 0.7)' : 'none',
          }}
        >
          <Text style={{ color: '#898F9D', fontSize: 10, flexShrink: 0 }}>
            {label}
          </Text>
          <Text
            title={String(value)}
            style={{
              minWidth: 0,
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 500,
              textAlign: 'right',
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Text>
        </Box>
      ))}
    </Box>
  </Box>
)

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

const formatSpoofingDate = (raw) => {
  if (!raw) return 'No info'
  try {
    const d = new Date(raw)
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' | ' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0') +
      ':' +
      String(d.getSeconds()).padStart(2, '0')
    )
  } catch {
    return raw
  }
}

const addHours = (raw, hours) => {
  if (!raw) return 'No info'
  try {
    const d = new Date(raw)
    d.setHours(d.getHours() + hours)
    return formatSpoofingDate(d)
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
  onGoToDate,
  isPreviewed,
  onTogglePreview,
  onViewStsShips,
  aisInfo = {},
  partnerAisInfo,
  synMaxInfo,
  detectionType,
  stsHeroNode,
  showViewEventLocation = true,
  compactActions = false,
  locationActive = false,
  onToggleLocation,
  onActivate,
  showDateContext = true,
  squareImages = false,
  compactListLayout = false,
  showEventToolsButton = false,
  eventToolsContent,
  eventToolsScrollCloseDelay = 400,
  onEventToolsButtonClick,
  eventToolsButtonActive = false,
}) => {
  const [isSelectedCollapsed, setIsSelectedCollapsed] = useState(false)
  const [detailsHovered, setDetailsHovered] = useState(false)
  const [goToDateHovered, setGoToDateHovered] = useState(false)
  const [cardHovered, setCardHovered] = useState(false)
  const [eventToolsOpen, setEventToolsOpen] = useState(false)
  const expanded = Boolean(isPreviewed || (selected && !isSelectedCollapsed))
  const cardRef = useRef(null)

  const handlePreviewToggle = () => {
    if (selected && !isPreviewed) {
      setIsSelectedCollapsed((prev) => !prev)
      return
    }
    onTogglePreview?.()
  }

  useEffect(() => {
    if (selected) {
      setIsSelectedCollapsed(false)
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selected])

  useEffect(() => {
    if (!eventToolsOpen) return
    const closeOnScroll = () => setEventToolsOpen(false)
    const timer = setTimeout(() => {
      window.addEventListener('scroll', closeOnScroll, true)
    }, eventToolsScrollCloseDelay)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [eventToolsOpen, eventToolsScrollCloseDelay])

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
        <Text style={{ color: '#898f9d', fontSize: 12, marginBottom: 8 }}>
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
        onClick={compactActions ? onActivate : undefined}
        onMouseEnter={() => compactActions && setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
        style={{
          position: 'relative',
          border: selected
            ? '2px solid #0094FF'
            : `1px solid ${cardHovered ? '#4C5070' : '#393C56'}`,
          borderRadius: 4,
          background: cardHovered ? '#2D3048' : '#24263C',
          scrollMarginTop: 80,
          overflow: 'hidden',
          cursor: compactActions && onActivate ? 'pointer' : undefined,
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
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#898f9d', fontSize: 12 }}>{date}</Text>
              {compactActions && showDateContext && (
                <>
                  <Text style={{ color: '#898f9d', fontSize: 12 }}>|</Text>
                  {onGoToDate ? (
                    <Calendar
                      onClick={(event) => {
                        event.stopPropagation()
                        onGoToDate()
                      }}
                      style={{
                        width: 16,
                        height: 16,
                        color: PRIMARY_BUTTON_COLOR,
                        cursor: 'pointer',
                      }}
                    />
                  ) : (
                    <Text style={{ color: '#898f9d', fontSize: 12 }}>
                      On selected date
                    </Text>
                  )}
                </>
              )}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {icon}
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                {event}
              </Text>
            </Box>
          </Box>
          <Box
            onClick={(event) => event.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {showEventToolsButton && onActivate && onEventToolsButtonClick && (
              <Box
                title="Open event tools"
                onClick={() => {
                  // Toggle: if the panel is already showing this (selected)
                  // card, close it but leave the card active. Otherwise make
                  // this card active and open the panel on it.
                  if (eventToolsButtonActive && selected) {
                    onEventToolsButtonClick(false)
                  } else {
                    onActivate()
                    onEventToolsButtonClick(true)
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  // Only light up blue on the card whose event is actually
                  // loaded in the popped-out panel. Gating on `selected` (not
                  // just the global "panel is open" flag) stops every card's
                  // Tools button from highlighting at once.
                  background:
                    eventToolsButtonActive && selected ? '#006CD7' : '#30334D',
                  cursor: 'pointer',
                }}
              >
                <EventToolsIcon />
              </Box>
            )}
            {showEventToolsButton &&
              onActivate &&
              eventToolsContent &&
              !onEventToolsButtonClick && (
              <Popover
                opened={eventToolsOpen}
                onChange={setEventToolsOpen}
                position="top-end"
                offset={{ mainAxis: 24, crossAxis: 92 }}
                withinPortal
                shadow="xl"
                zIndex={2000}
              >
                <Popover.Target>
                  <Box
                    title="Open event tools"
                    onClick={() => {
                      onActivate()
                      setEventToolsOpen((current) => !current)
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      background: eventToolsOpen ? '#006CD7' : '#30334D',
                      cursor: 'pointer',
                    }}
                  >
                    <EventToolsIcon />
                  </Box>
                </Popover.Target>
                <Popover.Dropdown
                  p={8}
                  style={{
                    width: 460,
                    background: '#181926',
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                    overflow: 'visible',
                  }}
                >
                  <Box
                    style={{
                      position: 'absolute',
                      right: 100,
                      bottom: -7,
                      width: 14,
                      height: 14,
                      background: '#181926',
                      borderRight: '1px solid #393C56',
                      borderBottom: '1px solid #393C56',
                      transform: 'rotate(45deg)',
                    }}
                  />
                  {eventToolsContent}
                </Popover.Dropdown>
              </Popover>
            )}
            {!selected && showViewEventLocation && (
              <Button
                size="xs"
                onClick={() => {
                  onSelect?.()
                  onViewStsShips?.()
                }}
                style={{
                  backgroundColor: PRIMARY_BUTTON_COLOR,
                  border: `1px solid ${PRIMARY_BUTTON_COLOR}`,
                  color: '#fff',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 12,
                  height: 32,
                  padding: '0 12px',
                  transform: 'none',
                }}
              >
                View Event Location
              </Button>
            )}
            {compactActions && onSelect && (
              <Tooltip label="Show on map" withArrow color="#0D0F17">
                <Box
                  onClick={() => {
                    if (onToggleLocation) onToggleLocation()
                    else {
                      onSelect?.()
                      onViewStsShips?.()
                    }
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: `1px solid ${locationActive ? PRIMARY_BUTTON_COLOR : '#393C56'}`,
                    background: locationActive
                      ? PRIMARY_BUTTON_COLOR
                      : '#30334D',
                    cursor: 'pointer',
                  }}
                >
                  <MarkerPin01 style={{ color: '#fff', width: 18, height: 18 }} />
                </Box>
              </Tooltip>
            )}
            {!compactActions && selected && onGoToDate && (
              <Button
                size="xs"
                onClick={onGoToDate}
                onMouseEnter={() => setGoToDateHovered(true)}
                onMouseLeave={() => setGoToDateHovered(false)}
                leftSection={<Calendar style={{ width: 14, height: 14 }} />}
                style={{
                  color: '#fff',
                  border: '1px solid #fff',
                  backgroundColor: goToDateHovered
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'transparent',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 12,
                  height: 32,
                  padding: '0 12px',
                  transform: 'none',
                }}
                styles={{
                  root: {
                    '&:active': {
                      transform: 'none',
                    },
                  },
                }}
              >
                Go to Date
              </Button>
            )}
            <Box
              onClick={handlePreviewToggle}
              onMouseEnter={() => setDetailsHovered(true)}
              onMouseLeave={() => setDetailsHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: compactActions ? 0 : 6,
                padding: compactActions ? 0 : '0 10px',
                minWidth: 32,
                height: 32,
                border: compactActions ? 'none' : '1px solid #fff',
                borderRadius: 4,
                cursor: 'pointer',
                background: detailsHovered
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'transparent',
              }}
            >
              {!compactActions && (
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                  {expanded ? 'Hide Details' : 'Show Details'}
                </Text>
              )}
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
                <Box
                  key={idx}
                  style={
                    idx > 0
                      ? { marginTop: squareImages ? 12 : 24 }
                      : undefined
                  }
                >
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

                  {squareImages && compactListLayout ? (
                    <>
                      {idx === 0 ? (
                        <>
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                            }}
                          >
                            <Box style={{ width: 180, flexShrink: 0 }}>
                              {stsHeroNode || (
                                <img
                                  src={ship.img}
                                  alt="Ship-to-ship satellite imagery"
                                  style={{
                                    width: 180,
                                    height: 180,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              )}
                            </Box>
                            <Box
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: 'grid',
                                gap: 8,
                              }}
                            >
                              <CompactInfoList
                                items={[
                                  {
                                    label: 'Coordinates',
                                    value: `${ship.info.latitude || 'No info'}, ${ship.info.longitude || 'No info'}`,
                                  },
                                  {
                                    label: 'Heading',
                                    value: ship.info.heading || 'No info',
                                  },
                                  {
                                    label: 'Type',
                                    value: ship.info.shipType || 'No info',
                                  },
                                  {
                                    label: 'Dimensions',
                                    value: `${ship.info.length || 'No info'} × ${ship.info.width || 'No info'}`,
                                  },
                                  {
                                    label: 'Draft',
                                    value: ship.info.draft || 'No info',
                                  },
                                  {
                                    label: 'Built',
                                    value: ship.info.buildYear || 'No info',
                                  },
                                  {
                                    label: 'Latest',
                                    value: ship.info.latestSpeed || 'No info',
                                  },
                                ]}
                              />
                            </Box>
                          </Box>
                          <CompactInfoGrid
                            items={[
                              {
                                label: 'Average',
                                value: ship.info.avgSpeed || 'No info',
                              },
                              {
                                label: 'Destination',
                                value: ship.info.destination || 'No info',
                              },
                              {
                                label: 'Maximum',
                                value: ship.info.maxSpeed || 'No info',
                              },
                              {
                                label: 'ETA',
                                value: formatEta(ship.info.eta),
                              },
                            ]}
                          />
                        </>
                      ) : (
                        <CompactInfoGrid
                          items={[
                            {
                              label: 'Latitude',
                              value: ship.info.latitude || 'No info',
                            },
                            {
                              label: 'Longitude',
                              value: ship.info.longitude || 'No info',
                            },
                            {
                              label: 'Heading',
                              value: ship.info.heading || 'No info',
                            },
                            {
                              label: 'Type',
                              value: ship.info.shipType || 'No info',
                            },
                            {
                              label: 'Length',
                              value: ship.info.length || 'No info',
                            },
                            {
                              label: 'Width',
                              value: ship.info.width || 'No info',
                            },
                            {
                              label: 'Draft',
                              value: ship.info.draft || 'No info',
                            },
                            {
                              label: 'Built',
                              value: ship.info.buildYear || 'No info',
                            },
                            {
                              label: 'Average',
                              value: ship.info.avgSpeed || 'No info',
                            },
                            {
                              label: 'Maximum',
                              value: ship.info.maxSpeed || 'No info',
                            },
                            {
                              label: 'Destination',
                              value: ship.info.destination || 'No info',
                            },
                            {
                              label: 'ETA',
                              value: formatEta(ship.info.eta),
                            },
                            {
                              label: 'Latest',
                              value: ship.info.latestSpeed || 'No info',
                              span: 2,
                            },
                          ]}
                        />
                      )}
                    </>
                  ) : (
                    <>
                  <Box style={{ display: 'flex', gap: 12 }}>
                    {idx === 0 && stsHeroNode ? (
                        stsHeroNode
                      ) : (
                        <img
                          src={ship.img}
                          alt="Ship-to-ship satellite imagery"
                          style={{
                            width: 180,
                            height: squareImages ? 180 : 206,
                            borderRadius: 4,
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      )}

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
                      {!squareImages && (
                        <>
                          <KeyValuePair keyName="Avg. Speed" value={ship.info.avgSpeed || 'No info'} />
                          <KeyValuePair keyName="Max Speed" value={ship.info.maxSpeed || 'No info'} />
                        </>
                      )}
                    </Box>
                  </Box>

                  {squareImages ? (
                    <>
                      {idx > 0 ? (
                        <>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '180px 1fr 1fr',
                              gap: '0 12px',
                              marginTop: 12,
                            }}
                          >
                            <KeyValuePair keyName="Latest Speed" value={ship.info.latestSpeed || 'No info'} />
                            <KeyValuePair keyName="Avg. Speed" value={ship.info.avgSpeed || 'No info'} />
                            <KeyValuePair keyName="Max Speed" value={ship.info.maxSpeed || 'No info'} />
                          </Box>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '180px 1fr 1fr',
                              gap: '0 12px',
                              marginTop: 12,
                            }}
                          >
                            <KeyValuePair keyName="Destination" value={ship.info.destination || 'No info'} />
                            <KeyValuePair keyName="ETA" value={formatEta(ship.info.eta)} />
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '180px 1fr 1fr',
                              gap: '0 12px',
                              marginTop: 12,
                            }}
                          >
                            <KeyValuePair keyName="Latest Speed" value={ship.info.latestSpeed || 'No info'} />
                            <KeyValuePair keyName="Avg. Speed" value={ship.info.avgSpeed || 'No info'} />
                            <KeyValuePair keyName="Max Speed" value={ship.info.maxSpeed || 'No info'} />
                          </Box>
                          <Box
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '180px 1fr 1fr',
                              gap: '0 12px',
                              marginTop: 12,
                            }}
                          >
                            <KeyValuePair keyName="Destination" value={ship.info.destination || 'No info'} />
                            <KeyValuePair keyName="ETA" value={formatEta(ship.info.eta)} />
                          </Box>
                        </>
                      )}
                    </>
                  ) : (
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
                  )}
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

      </Box>
    )
  }

  if (variant === 'flag') {
    return (
      <Box
        onClick={compactActions ? onActivate : undefined}
        style={{
          border: '1px solid #393C56',
          borderRadius: 4,
          background: '#24263C',
          padding: 12,
        }}
      >
        <Text style={{ color: '#898f9d', fontSize: 12, marginBottom: 8 }}>
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
      onClick={compactActions ? onActivate : undefined}
      onMouseEnter={() => compactActions && setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        position: 'relative',
        border: selected
          ? '2px solid #0094FF'
          : `1px solid ${cardHovered ? '#4C5070' : '#393C56'}`,
        borderRadius: 4,
        background: cardHovered ? '#2D3048' : '#24263C',
        overflow: 'hidden',
        scrollMarginTop: 80,
        cursor: compactActions && onActivate ? 'pointer' : undefined,
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
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#898f9d', fontSize: 12 }}>{date}</Text>
            {compactActions && showDateContext && (
              <>
                <Text style={{ color: '#898f9d', fontSize: 12 }}>|</Text>
                {onGoToDate ? (
                  <Calendar
                    onClick={(event) => {
                      event.stopPropagation()
                      onGoToDate()
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      color: PRIMARY_BUTTON_COLOR,
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <Text style={{ color: '#898f9d', fontSize: 12 }}>
                    On selected date
                  </Text>
                )}
              </>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {icon}
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              {event}
            </Text>
          </Box>
        </Box>
        <Box
          onClick={(event) => event.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {showEventToolsButton && onActivate && onEventToolsButtonClick && (
            <Box
              title="Open event tools"
              onClick={() => {
                if (eventToolsButtonActive && selected) {
                  onEventToolsButtonClick(false)
                } else {
                  onActivate()
                  onEventToolsButtonClick(true)
                }
              }}
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background:
                  eventToolsButtonActive && selected ? '#006CD7' : '#30334D',
                cursor: 'pointer',
              }}
            >
              <EventToolsIcon />
            </Box>
          )}
          {showEventToolsButton &&
            onActivate &&
            eventToolsContent &&
            !onEventToolsButtonClick && (
            <Popover
              opened={eventToolsOpen}
              onChange={setEventToolsOpen}
              position="top-end"
              offset={{ mainAxis: 24, crossAxis: 92 }}
              withinPortal
              shadow="xl"
              zIndex={2000}
            >
              <Popover.Target>
                <Box
                  title="Open event tools"
                  onClick={() => {
                    onActivate()
                      setEventToolsOpen((current) => !current)
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                      background: eventToolsOpen ? '#006CD7' : '#30334D',
                    cursor: 'pointer',
                  }}
                >
                  <EventToolsIcon />
                </Box>
              </Popover.Target>
              <Popover.Dropdown
                p={8}
                style={{
                  width: 460,
                  background: '#181926',
                  border: '1px solid #393C56',
                  borderRadius: 4,
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                  overflow: 'visible',
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    right: 100,
                    bottom: -7,
                    width: 14,
                    height: 14,
                    background: '#181926',
                    borderRight: '1px solid #393C56',
                    borderBottom: '1px solid #393C56',
                    transform: 'rotate(45deg)',
                  }}
                />
                {eventToolsContent}
              </Popover.Dropdown>
            </Popover>
          )}
          {!selected && showViewEventLocation && (
            <Button
              size="xs"
              onClick={() => {
                onSelect?.()
              }}
              style={{
                backgroundColor: PRIMARY_BUTTON_COLOR,
                border: `1px solid ${PRIMARY_BUTTON_COLOR}`,
                color: '#fff',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
                height: 32,
                padding: '0 12px',
                transform: 'none',
              }}
            >
              View Event Location
            </Button>
          )}
          {compactActions && onSelect && (
            <Tooltip label="Show on map" withArrow color="#0D0F17">
              <Box
                onClick={() =>
                  onToggleLocation ? onToggleLocation() : onSelect?.()
                }
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  border: `1px solid ${locationActive ? PRIMARY_BUTTON_COLOR : '#393C56'}`,
                  background: locationActive
                    ? PRIMARY_BUTTON_COLOR
                    : '#30334D',
                  cursor: 'pointer',
                }}
              >
                <MarkerPin01 style={{ color: '#fff', width: 18, height: 18 }} />
              </Box>
            </Tooltip>
          )}
          {!compactActions && selected && onGoToDate && (
            <Button
              size="xs"
              onClick={onGoToDate}
              onMouseEnter={() => setGoToDateHovered(true)}
              onMouseLeave={() => setGoToDateHovered(false)}
              leftSection={<Calendar style={{ width: 14, height: 14 }} />}
              style={{
                color: '#fff',
                border: '1px solid #fff',
                backgroundColor: goToDateHovered
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'transparent',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
                height: 32,
                padding: '0 12px',
                transform: 'none',
              }}
              styles={{
                root: {
                  '&:active': {
                    transform: 'none',
                  },
                },
              }}
            >
              Go to Date
            </Button>
          )}
          <Box
            onClick={handlePreviewToggle}
            onMouseEnter={() => setDetailsHovered(true)}
            onMouseLeave={() => setDetailsHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: compactActions ? 0 : 6,
              padding: compactActions ? 0 : '0 10px',
              minWidth: 32,
              height: 32,
              border: compactActions ? 'none' : '1px solid #fff',
              borderRadius: 4,
              cursor: 'pointer',
              background: detailsHovered
                ? 'rgba(255, 255, 255, 0.14)'
                : 'transparent',
            }}
          >
            {!compactActions && (
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                {expanded ? 'Hide Details' : 'Show Details'}
              </Text>
            )}
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

            {/* Time window section for dark detections */}
            {detectionType === 'dark' && synMaxInfo && (
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 12,
                  background: '#1B1D2E',
                  border: '1px solid #393C56',
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                <KeyValuePair keyName="Start time" value={formatSpoofingDate(date)} />
                <KeyValuePair keyName="End time" value={addHours(date, 3)} />
              </Box>
            )}

            {synMaxInfo ? (
              <>
                <Box style={{ display: 'flex', gap: 12 }}>
                  <img
                    src={shipImages[0]}
                    alt="Ship satellite imagery"
                    style={{
                      width: 180,
                      height: squareImages ? 180 : 206,
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
                          height: squareImages ? 180 : 206,
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
                      height: squareImages ? 180 : 206,
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

    </Box>
  )
}

export default EventTimelineCard
