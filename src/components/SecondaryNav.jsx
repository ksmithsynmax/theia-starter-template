import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, Button } from '@mantine/core'
import { Star01 } from '@untitledui/icons'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import { ships } from '../data/mockData'
import { useShipContext } from '../context/ShipContext'

const SECONDARY_NAV_DEFAULT_WIDTH = 386
const SECONDARY_NAV_MIN_WIDTH = 340
const SECONDARY_NAV_MAX_WIDTH = 720

const SecondaryNav = ({ isOpen, onOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('My Ships')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [navWidth, setNavWidth] = useState(SECONDARY_NAV_DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(SECONDARY_NAV_DEFAULT_WIDTH)
  const { shipTabs, favoriteShipIds } = useShipContext()

  const recentlyViewedRows = shipTabs
    .filter((tab) => tab.type !== 'sts')
    .map((tab) => ships[tab.id])
    .filter(Boolean)
    .map((ship) => ({
      id: ship.id,
      name: ship.name || 'No info',
      flag: ship.flag || '-',
      type: ship.shipType || ship.aisInfo?.shipType || 'No info',
      port: ship.aisInfo?.destination || 'No info',
      event: ship.latestEvent || 'No info',
    }))
  const myShipRows = favoriteShipIds
    .map((shipId) => ships[shipId])
    .filter(Boolean)
    .map((ship) => ({
      id: ship.id,
      name: ship.name || 'No info',
      flag: ship.flag || '-',
      type: ship.shipType || ship.aisInfo?.shipType || 'No info',
      port: ship.aisInfo?.destination || 'No info',
      event: ship.latestEvent || 'No info',
    }))

  useEffect(() => {
    if (!isResizing) return undefined

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - resizeStartXRef.current
      const nextWidth = Math.max(
        SECONDARY_NAV_MIN_WIDTH,
        Math.min(
          SECONDARY_NAV_MAX_WIDTH,
          resizeStartWidthRef.current + deltaX
        )
      )
      setNavWidth(nextWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <Box
      style={{
        width: isOpen ? navWidth : 32,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: isResizing ? 'none' : 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #393c56',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ExpandButton
            backgroundColor={expandHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      {isOpen && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton
            backgroundColor={collapseHovered ? '#4C5070' : '#393C56'}
          />
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
        {/* Header Tabs */}
        <Box
          style={{
            display: 'flex',
            borderBottom: '1px solid #393C56',
            height: 50,
          }}
        >
          <Box
            onClick={() => setActiveTab('My Ships')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom:
                activeTab === 'My Ships' ? '2px solid #fff' : 'none',
              color: activeTab === 'My Ships' ? '#fff' : '#888F9E',
              fontWeight: activeTab === 'My Ships' ? 600 : 400,
              fontSize: 14,
            }}
          >
            My Ships
          </Box>
          <Box
            onClick={() => setActiveTab('Recently Viewed')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom:
                activeTab === 'Recently Viewed' ? '2px solid #fff' : 'none',
              color: activeTab === 'Recently Viewed' ? '#fff' : '#888F9E',
              fontWeight: activeTab === 'Recently Viewed' ? 600 : 400,
              fontSize: 14,
            }}
          >
            Recently Viewed
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'My Ships' && (
            <>
              {myShipRows.length === 0 ? (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                      marginBottom: 24,
                    }}
                  >
                    Add ships to this list by:
                  </Text>

                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 32,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                        maxWidth: 200,
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Select any ship and click the star button in its detail
                      panel
                    </Text>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 4,
                      }}
                    >
                      <Star01 style={{ color: '#fff', width: 20, height: 20 }} />
                      <Text style={{ color: '#888F9E', fontSize: 14 }}>→</Text>
                      <Star01
                        style={{
                          color: '#F7C948',
                          width: 20,
                          height: 20,
                          fill: '#F7C948',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 32,
                    }}
                  >
                    <Box style={{ flex: 1, height: 1, background: '#393C56' }} />
                    <Text
                      style={{
                        color: '#888F9E',
                        fontSize: 12,
                        margin: '0 16px',
                      }}
                    >
                      or
                    </Text>
                    <Box style={{ flex: 1, height: 1, background: '#393C56' }} />
                  </Box>

                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14,
                      marginBottom: 24,
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    Upload a file with MMSIs or IMOs to add multiple ships
                  </Text>

                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Text
                        style={{
                          color: '#888F9E',
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        Accepted file types:
                      </Text>
                      <Text style={{ color: '#888F9E', fontSize: 12 }}>
                        .csv, .xls, .xlsx
                      </Text>
                    </Box>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: '#393C56',
                        color: '#fff',
                        background: 'transparent',
                        height: 36,
                        padding: '0 24px',
                        fontWeight: 500,
                      }}
                    >
                      Upload
                    </Button>
                  </Box>
                </>
              ) : (
                <Box
                  style={{
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'transparent',
                  }}
                >
                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(0, 1.2fr) 56px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr)',
                      columnGap: 10,
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: '#24263C',
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Name
                    </Text>
                    <Text
                      style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}
                    >
                      Flag
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Type
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Port
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Event
                    </Text>
                  </Box>
                  {myShipRows.map((row, idx) => (
                    <Box
                      key={row.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'minmax(0, 1.2fr) 56px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr)',
                        columnGap: 10,
                        alignItems: 'center',
                        padding: '8px',
                        borderTop: idx === 0 ? 'none' : '1px solid #393C56',
                        background: '#181926',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={row.name}
                      >
                        {row.name}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 14,
                          lineHeight: 1.2,
                          textAlign: 'center',
                        }}
                      >
                        {row.flag}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={row.type}
                      >
                        {row.type}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={row.port}
                      >
                        {row.port}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 12,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={row.event}
                      >
                        {row.event}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}

          {activeTab === 'Recently Viewed' && (
            <Box
              style={{
                width: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                background: 'transparent',
              }}
            >
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(0, 1.2fr) 56px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr)',
                  columnGap: 10,
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: '#24263C',
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Name
                </Text>
                <Text
                  style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}
                >
                  Flag
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Type
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Port
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Event
                </Text>
              </Box>

              {recentlyViewedRows.length === 0 ? (
                <Box
                  style={{
                    padding: '14px 12px',
                    background: '#181926',
                  }}
                >
                  <Text
                    style={{
                      color: '#8D95AA',
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    No recently viewed ships yet. Select a ship on the map to
                    populate this list.
                  </Text>
                </Box>
              ) : (
                recentlyViewedRows.map((row, idx) => (
                  <Box
                    key={row.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(0, 1.2fr) 56px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr)',
                      columnGap: 10,
                      alignItems: 'center',
                      padding: '8px',
                      borderTop: idx === 0 ? 'none' : '1px solid #393C56',
                      background: '#181926',
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.name}
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        lineHeight: 1.2,
                        textAlign: 'center',
                      }}
                    >
                      {row.flag}
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.2,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.type}
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.2,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.port}
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.2,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.event}
                    </Text>
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>
      </Box>
      {isOpen && (
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

export default SecondaryNav
