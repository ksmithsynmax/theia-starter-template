import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import { Bookmark, Star01, XClose, Anchor } from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import ShipIcon from '../custom-icons/ShipIcon'
import PolygonIcon from '../custom-icons/PolygonIcon'

const NAV_WIDTH = 386

const RING_DEFAULTS = {
  color: '#FFFFFF',
  lineStyle: 'solid',
  fill: true,
  fillOpacity: 0.2,
  borderWidth: 2.5,
  size: 36,
}

const RING_SIZE_MIN = 24
const RING_SIZE_MAX = 64

// Preset swatches for the customizable ring marker.
const RING_SWATCHES = [
  '#FFFFFF',
  '#0094FF',
  '#34D399',
  '#FFCF5C',
  '#F87171',
  '#C084FC',
]

// Two save-to-bookmarks treatments to compare. Bookmarks elsewhere uses a star
// to save, so proto1 keeps that consistent; proto2 keeps the bookmark glyph.
const SAVE_VARIANTS = {
  proto1: {
    Icon: Star01,
    addLabel: 'Bookmark',
    removeLabel: 'Remove bookmark',
    activeColor: '#FFCF5C',
  },
  proto2: {
    Icon: Bookmark,
    addLabel: 'Save',
    removeLabel: 'Remove',
    activeColor: '#0094FF',
  },
}

function ForYouSecondaryNav({
  isOpen,
  onOpen,
  onClose,
  currentPath,
  active = false,
  prototype = 'proto1',
  markerMode = 'pin',
  ringConfig,
  onRingConfigChange,
  onShipSelect,
  onPortSelect,
}) {
  const {
    forYouItems,
    dismissForYouItem,
    favoriteShipIds,
    favoritePorts,
    bookmarkedShapes,
    toggleFavoriteShip,
    toggleFavoritePort,
    addBookmarkedShape,
    removeShape,
  } = useShipContext()
  const [expandHovered, setExpandHovered] = useState(false)
  const [collapseHovered, setCollapseHovered] = useState(false)

  const isForYouView = currentPath === '/for-you' || active
  const saveVariant = SAVE_VARIANTS[prototype] || SAVE_VARIANTS.proto1
  const SaveIcon = saveVariant.Icon

  const ring = ringConfig || RING_DEFAULTS
  const ringSize = (() => {
    const n = Number(ring.size)
    if (!Number.isFinite(n)) return RING_DEFAULTS.size
    return Math.min(RING_SIZE_MAX, Math.max(RING_SIZE_MIN, n))
  })()
  const updateRing = (patch) => {
    onRingConfigChange?.({ ...ring, ...patch })
  }
  const showRingCustomizer = markerMode === 'ring'

  const isBookmarked = (item) => {
    if (item.kind === 'ship') return favoriteShipIds.includes(item.shipId)
    if (item.kind === 'port')
      return favoritePorts.some((port) => port.id === item.portId)
    if (item.kind === 'shape')
      return bookmarkedShapes.some((shape) => shape.id === item.id)
    return false
  }

  const handleBookmarkToggle = (item) => {
    if (item.kind === 'ship') {
      toggleFavoriteShip(item.shipId)
    } else if (item.kind === 'port') {
      toggleFavoritePort({ id: item.portId, name: item.name, flag: item.flag })
    } else if (item.kind === 'shape') {
      if (isBookmarked(item)) {
        removeShape(item.id)
      } else {
        addBookmarkedShape({
          id: item.id,
          name: item.name,
          coordinates: item.geometry?.coordinates?.[0] || [],
        })
      }
    }
  }

  const handleRowClick = (item) => {
    if (item.kind === 'ship') {
      onShipSelect?.(item)
    } else if (item.kind === 'port') {
      onPortSelect?.(item)
    }
  }

  return (
    <Box
      style={{
        height: '100%',
        width: isOpen && isForYouView ? NAV_WIDTH : isForYouView ? 32 : 0,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isForYouView ? '1px solid #393c56' : 'none',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && isForYouView && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{ position: 'absolute', right: 0, top: 12, cursor: 'pointer', zIndex: 10 }}
        >
          <ExpandButton backgroundColor={expandHovered ? '#4C5070' : '#393C56'} />
        </Box>
      )}

      {isOpen && isForYouView && (
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
          width: NAV_WIDTH,
          minWidth: NAV_WIDTH,
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
            flexDirection: 'column',
            justifyContent: 'center',
            borderBottom: '1px solid #393C56',
            height: 50,
            padding: '0 20px',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14 }}>For You</Text>
        </Box>

        <Box style={{ padding: '12px 20px 8px' }}>
          <Text style={{ color: '#888F9E', fontSize: 12, lineHeight: '16px' }}>
            Tailored to you from what you follow and view. Mute anything that
            isn&apos;t relevant.
          </Text>
        </Box>

        {showRingCustomizer && (
          <Box style={{ padding: '4px 12px 8px' }}>
            <Box
              style={{
                background: '#24263C',
                border: '1px solid #393C56',
                borderRadius: 4,
                padding: 8,
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Box
                  style={{
                    width: RING_SIZE_MAX,
                    height: RING_SIZE_MAX,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(() => {
                    const dim = ringSize
                    const center = dim / 2
                    const bw = ring.borderWidth ?? 2.5
                    return (
                      <svg
                        width={dim}
                        height={dim}
                        viewBox={`0 0 ${dim} ${dim}`}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx={center}
                          cy={center}
                          r={Math.max(0, center - bw)}
                          fill={ring.color}
                          fillOpacity={ring.fill ? ring.fillOpacity : 0}
                          stroke={ring.color}
                          strokeWidth={bw}
                          strokeDasharray={
                            ring.lineStyle === 'dashed' ? '5 4' : undefined
                          }
                        />
                      </svg>
                    )
                  })()}
                </Box>
                <Box>
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}
                  >
                    Ring style
                  </Text>
                  <Text style={{ color: '#888F9E', fontSize: 11 }}>
                    Customize how curated items appear on the map.
                  </Text>
                </Box>
              </Box>

              <Text
                style={{
                  color: '#8D93A8',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Color
              </Text>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                {RING_SWATCHES.map((swatch) => {
                  const isActive =
                    String(ring.color).toLowerCase() === swatch.toLowerCase()
                  return (
                    <Box
                      key={swatch}
                      component="button"
                      type="button"
                      title={swatch}
                      aria-label={swatch}
                      onClick={() => updateRing({ color: swatch })}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: swatch,
                        cursor: 'pointer',
                        padding: 0,
                        border: isActive
                          ? '2px solid #FFFFFF'
                          : '2px solid #393C56',
                        boxShadow: isActive ? '0 0 0 1px #006CD7' : 'none',
                      }}
                    />
                  )
                })}
                <Box
                  component="input"
                  type="color"
                  value={ring.color}
                  onChange={(event) =>
                    updateRing({ color: event.currentTarget.value })
                  }
                  title="Custom color"
                  style={{
                    width: 22,
                    height: 22,
                    padding: 0,
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
              </Box>

              <Box style={{ marginBottom: 12 }}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{ color: '#8D93A8', fontSize: 11, fontWeight: 600 }}
                  >
                    Size
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                    {ringSize}px
                  </Text>
                </Box>
                <Box
                  component="input"
                  type="range"
                  min={RING_SIZE_MIN}
                  max={RING_SIZE_MAX}
                  step={1}
                  value={ringSize}
                  onChange={(event) =>
                    updateRing({ size: Number(event.currentTarget.value) })
                  }
                  style={{ width: '100%', accentColor: '#006CD7' }}
                />
              </Box>

              <Text
                style={{
                  color: '#8D93A8',
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Line
              </Text>
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  border: '1px solid #393C56',
                  borderRadius: 4,
                  background: '#0A0E19',
                  padding: 2,
                  marginBottom: 12,
                }}
              >
                {[
                  { id: 'solid', label: 'Solid' },
                  { id: 'dashed', label: 'Dashed' },
                ].map(({ id, label }) => {
                  const isActive = ring.lineStyle === id
                  return (
                    <Box
                      key={id}
                      component="button"
                      type="button"
                      onClick={() => updateRing({ lineStyle: id })}
                      style={{
                        border: 'none',
                        borderRadius: 3,
                        background: isActive ? '#24263C' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#A4ABBE',
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '4px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </Box>
                  )
                })}
              </Box>

              <Box style={{ marginBottom: 12 }}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{ color: '#8D93A8', fontSize: 11, fontWeight: 600 }}
                  >
                    Border width
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                    {ring.borderWidth ?? 2.5}px
                  </Text>
                </Box>
                <Box
                  component="input"
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={ring.borderWidth ?? 2.5}
                  onChange={(event) =>
                    updateRing({
                      borderWidth: Number(event.currentTarget.value),
                    })
                  }
                  style={{ width: '100%', accentColor: '#006CD7' }}
                />
              </Box>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: ring.fill ? 10 : 0,
                }}
              >
                <Text
                  style={{ color: '#8D93A8', fontSize: 11, fontWeight: 600 }}
                >
                  Fill
                </Text>
                <Box
                  component="button"
                  type="button"
                  role="switch"
                  aria-checked={ring.fill}
                  onClick={() => updateRing({ fill: !ring.fill })}
                  style={{
                    position: 'relative',
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    background: ring.fill ? '#006CD7' : '#393C56',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Box
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: ring.fill ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transition: 'left 0.15s ease',
                    }}
                  />
                </Box>
              </Box>

              {ring.fill && (
                <Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ color: '#8D93A8', fontSize: 11 }}>
                      Fill opacity
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 11 }}>
                      {Math.round((ring.fillOpacity ?? 0) * 100)}%
                    </Text>
                  </Box>
                  <Box
                    component="input"
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((ring.fillOpacity ?? 0) * 100)}
                    onChange={(event) =>
                      updateRing({
                        fillOpacity: Number(event.currentTarget.value) / 100,
                      })
                    }
                    style={{ width: '100%', accentColor: '#006CD7' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Box
          className="no-scrollbar"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 12px 16px' }}
        >
          {forYouItems.length === 0 ? (
            <Box style={{ padding: '24px 8px', textAlign: 'center' }}>
              <Text style={{ color: '#888F9E', fontSize: 13 }}>
                You&apos;re all caught up.
              </Text>
            </Box>
          ) : (
            forYouItems.map((item) => {
              const bookmarked = isBookmarked(item)
              const clickable = item.kind === 'ship' || item.kind === 'port'
              return (
                <Box
                  key={item.id}
                  onClick={clickable ? () => handleRowClick(item) : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: 8,
                    background: '#24263C',
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    marginBottom: 4,
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  <Box
                    style={{
                      position: 'relative',
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: 4,
                      background: '#181926',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.kind === 'ship' && (
                      <ShipIcon style={{ width: 18, height: 18 }} />
                    )}
                    {item.kind === 'port' && (
                      <Anchor style={{ width: 18, height: 18, color: '#fff' }} />
                    )}
                    {item.kind === 'shape' && (
                      <PolygonIcon style={{ width: 18, height: 18 }} />
                    )}
                    {item.kind === 'ship' && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -3,
                          right: -3,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          border: '2px solid #24263C',
                        }}
                      />
                    )}
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                        {item.flag ? ` ${item.flag}` : ''}
                      </Text>
                    </Box>
                    <Text style={{ color: '#888F9E', fontSize: 12, marginTop: 2 }}>
                      {item.reason}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Box
                      component="button"
                      type="button"
                      title={bookmarked ? saveVariant.removeLabel : saveVariant.addLabel}
                      onClick={(event) => {
                        event.stopPropagation()
                        handleBookmarkToggle(item)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <SaveIcon
                        size={15}
                        color={bookmarked ? saveVariant.activeColor : '#888F9E'}
                        style={bookmarked ? { fill: saveVariant.activeColor } : undefined}
                      />
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      title="Mute"
                      onClick={(event) => {
                        event.stopPropagation()
                        dismissForYouItem(item.id)
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <XClose size={15} color="#888F9E" />
                    </Box>
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default ForYouSecondaryNav
