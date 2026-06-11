import { useState } from 'react'
import { Box, Text } from '@mantine/core'
import { Bookmark, Star01, XClose } from '@untitledui/icons'
import { useShipContext } from '../context/ShipContext'
import { FOR_YOU_KIND_LABELS } from '../data/forYouData'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'

const NAV_WIDTH = 386

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
  prototype = 'proto1',
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

  const isForYouView = currentPath === '/for-you'
  const saveVariant = SAVE_VARIANTS[prototype] || SAVE_VARIANTS.proto1
  const SaveIcon = saveVariant.Icon

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
                    gap: 10,
                    padding: '10px 8px',
                    borderBottom: '1px solid #23263B',
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
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
                        {item.flag ? `${item.flag} ` : ''}
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: '#888F9E',
                          fontSize: 10,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                        }}
                      >
                        {FOR_YOU_KIND_LABELS[item.kind] || ''}
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
