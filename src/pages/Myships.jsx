import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, Title, Loader, Menu } from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import {
  File02,
  Star01,
  Copy02,
  XClose,
  ChevronDown,
  List,
} from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LighShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import UnattributedIcon from '../custom-icons/UnattributedIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
import STSAisIcon from '../custom-icons/STSAisIcon'
import ShipIcon from '../custom-icons/ShipIcon'
import ShipDetailsPanel from '../components/ShipDetails/ShipDetailsPanel'
import EventTimelineCard from '../components/ShipDetails/EventTimelineCard'
import { useShipContext } from '../context/ShipContext'
import { ships, detections } from '../data/mockData'

const detailTabs = [
  'Event Timeline',
  'Sat. Imagery Timeline',
  'Ship Information',
]

function Myships() {
  const {
    shipTabs,
    activeShipTab,
    setActiveShipTab,
    closeShipTab,
    closeAllTabs,
    openShipTab,
    openStsTab,
    selectedDetectionId,
    setSelectedDetectionId,
    mapDate,
    setMapDate,
    setActiveDetectionId,
  } = useShipContext()
  const [tabState, setTabState] = useState({})
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [activeStsShip, setActiveStsShip] = useState(0)
  const [loading, setLoading] = useState(false)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const [overflowRight, setOverflowRight] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)
  const loadedTabsRef = useRef(new Set())
  const cardRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const tabScrollRef = useRef(null)
  const prevMapDateRef = useRef(mapDate)

  const updateOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setOverflowLeft(el.scrollLeft > 0)
    setOverflowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    updateOverflow()
    el.addEventListener('scroll', updateOverflow)
    const ro = new ResizeObserver(updateOverflow)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateOverflow)
      ro.disconnect()
    }
  }, [updateOverflow, shipTabs])

  useEffect(() => {
    if (mapDate === prevMapDateRef.current) return
    prevMapDateRef.current = mapDate
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (mapDate === todayStr && activeShipTab) {
      const tab = shipTabs.find((t) => t.id === activeShipTab)
      const shipId = tab?.type === 'sts' ? tab.shipIds[0] : activeShipTab
      const latest = detections
        .filter((d) => d.shipId === shipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setFlashEnabled(true)
      setActiveDetectionId(null)
      setTabState((prev) => ({
        ...prev,
        [activeShipTab]: {
          ...prev[activeShipTab],
          selectedCard: latest?.id ?? null,
        },
      }))
    }
  }, [mapDate, activeShipTab, setActiveDetectionId])

  const currentTabState = tabState[activeShipTab] || {
    selectedCard: null,
    activeDetailTab: 0,
  }
  const selectedCard = currentTabState.selectedCard
  const activeDetailTab = currentTabState.activeDetailTab

  const updateTabState = (key, value) => {
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: {
        ...prev[activeShipTab],
        selectedCard: prev[activeShipTab]?.selectedCard ?? null,
        activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0,
        [key]: value,
      },
    }))
  }

  useEffect(() => {
    if (!activeShipTab) return
    if (loadedTabsRef.current.has(activeShipTab)) return
    setLoading(true)
    const currentTab = activeShipTab
    const timer = setTimeout(() => {
      loadedTabsRef.current.add(currentTab)
      setLoading(false)
      // Auto-select: use the clicked detection from map if set, otherwise pick the latest
      const shipTab = shipTabs.find((t) => t.id === currentTab)
      const shipId = shipTab?.type === 'sts' ? shipTab.shipIds[0] : currentTab
      const shipDetections = detections
        .filter((d) => d.shipId === shipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      const targetId =
        selectedDetectionId &&
        shipDetections.some((d) => d.id === selectedDetectionId)
          ? selectedDetectionId
          : shipDetections[0]?.id
      if (targetId) {
        updateTabState('selectedCard', targetId)
        if (selectedDetectionId) setSelectedDetectionId(null)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [activeShipTab])

  useEffect(() => {
    if (selectedDetectionId != null) {
      updateTabState('selectedCard', selectedDetectionId)
      setSelectedDetectionId(null)
    }
  }, [selectedDetectionId, setSelectedDetectionId])

  useEffect(() => {
    if (
      selectedCard != null &&
      cardRefs.current[selectedCard] &&
      scrollContainerRef.current
    ) {
      const card = cardRefs.current[selectedCard]
      const container = scrollContainerRef.current
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const padding = 20

      if (cardRect.top < containerRect.top + padding) {
        container.scrollTo({
          top:
            container.scrollTop + (cardRect.top - containerRect.top) - padding,
          behavior: 'smooth',
        })
      } else if (cardRect.bottom > containerRect.bottom - padding) {
        container.scrollTo({
          top:
            container.scrollTop +
            (cardRect.bottom - containerRect.bottom) +
            padding,
          behavior: 'smooth',
        })
      }
    }
  }, [selectedCard])

  const activeTab = shipTabs.find((t) => t.id === activeShipTab)
  const isStsTab = activeTab?.type === 'sts'

  const activeShipId = isStsTab
    ? activeTab.shipIds[activeStsShip]
    : activeShipTab
  const activeShip = activeShipId ? ships[activeShipId] : null
  const stsPartnerShipId = isStsTab
    ? activeTab.shipIds[activeStsShip === 0 ? 1 : 0]
    : null
  const activeShipDetections = activeShipId
    ? detections
        .filter((d) => d.shipId === activeShipId)
        .sort((a, b) => {
          if (isStsTab) {
            const aIsSts = a.stsPartner === stsPartnerShipId
            const bIsSts = b.stsPartner === stsPartnerShipId
            if (aIsSts && !bIsSts) return -1
            if (bIsSts && !aIsSts) return 1
          }
          return new Date(b.date) - new Date(a.date)
        })
    : []

  const latestDetection = activeShipDetections[0] || null

  useEffect(() => {
    if (!activeShipTab || !activeShipDetections.length) return
    const latestId = activeShipDetections[0]?.id
    if (!latestId) return
    const validSelection =
      selectedCard && activeShipDetections.some((d) => d.id === selectedCard)
    if (!validSelection) {
      updateTabState('selectedCard', latestId)
    }
  }, [activeShipTab, activeShipDetections, selectedCard])
  const isStsUnattributed =
    isStsTab && activeTab?.stsType === 'sts' && activeStsShip === 1
  const isUnattributed = activeShip?.id === 'unknown' || isStsUnattributed
  const selectedDetection = selectedCard
    ? activeShipDetections.find((d) => d.id === selectedCard) || latestDetection
    : latestDetection

  const eventLabel = {
    ais: 'AIS',
    light: 'Light',
    dark: 'Dark',
    spoofing: 'Spoofing',
    sts: 'STS (Light)',
    'sts-ais': 'STS (AIS)',
    unattributed: 'Unattributed',
  }

  const handleSwitchToLatest = () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setFlashEnabled(true)
    setMapDate(todayStr)
    setActiveDetectionId(null)

    if (isStsTab && activeTab) {
      const currentShipId = activeTab.shipIds[activeStsShip]
      const existingSingleShipTab = shipTabs.find(
        (t) => t.id === currentShipId && t.type !== 'sts'
      )
      if (existingSingleShipTab) {
        setTabState((prev) => ({
          ...prev,
          [currentShipId]: {
            ...prev[currentShipId],
            selectedCard: latestDetection?.id ?? null,
            activeDetailTab: prev[currentShipId]?.activeDetailTab ?? 0,
          },
        }))
        setActiveShipTab(currentShipId)
      } else if (latestDetection) {
        openShipTab(latestDetection)
      } else {
        updateTabState('selectedCard', latestDetection?.id ?? null)
        setActiveShipTab(activeShipTab)
      }
    } else {
      updateTabState('selectedCard', latestDetection?.id ?? null)
      setActiveShipTab(activeShipTab)
    }
  }

  const eventColorMap = {
    ais: '#00EB6C',
    light: '#00A3E3',
    dark: '#FFA500',
    spoofing: '#FF6D99',
    unattributed: '#F75349',
    sts: '#00A3E3',
    'sts-ais': '#00EB6C',
  }

  const eventIconMap = {
    ais: <AisIcon style={{ height: 14 }} />,
    light: <LightShipIcon style={{ height: 14 }} />,
    dark: <DarkShipIcon style={{ height: 14 }} />,
    spoofing: <SpoofingIcon style={{ height: 14 }} />,
    sts: <STSIcon style={{ height: 14 }} />,
    'sts-ais': <STSAisIcon style={{ height: 14 }} />,
    unattributed: <UnattributedIcon style={{ height: 14 }} />,
  }

  const stsHeaderType = isStsTab
    ? activeStsShip === 0
      ? 'light'
      : activeTab.stsType === 'sts-ais'
        ? 'ais'
        : null
    : null
  const headerType = isStsUnattributed
    ? 'unattributed'
    : stsHeaderType || latestDetection?.type

  const derivedLatestEvent = headerType ? (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {eventIconMap[headerType]}
      {eventLabel[headerType] || headerType}
    </Box>
  ) : null
  const isLatest =
    !selectedCard || selectedDetection?.id === latestDetection?.id

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {overflowLeft && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderRight: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(90deg)',
              }}
            />
          </Box>
        )}
        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {overflowLeft && (
            <Box
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 40,
                background:
                  'linear-gradient(to right, #24263C, rgba(36, 38, 60, 0))',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}
          {overflowRight && (
            <Box
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 40,
                background:
                  'linear-gradient(to left, #24263C, rgba(36, 38, 60, 0))',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}
          <Box
            ref={tabScrollRef}
            className="tab-scroll"
            style={{
              display: 'flex',
              flex: 1,
            }}
          >
            {shipTabs.map((tab) => {
              const isActive = activeShipTab === tab.id
              return (
                <Box
                  key={tab.id}
                  onClick={() => {
                    setFlashEnabled(false)
                    setActiveStsShip(0)
                    setActiveShipTab(tab.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 50,
                    padding: '0 12px',
                    cursor: 'pointer',
                    borderRight: '1px solid #393C56',
                    borderBottom: isActive ? 'none' : '1px solid #393C56',
                    background: isActive ? '#181926' : '#24263C',
                    position: 'relative',
                    zIndex: isActive ? 1 : 0,
                    marginBottom: isActive ? -1 : 0,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.type === 'sts' ? (
                    tab.stsType === 'sts-ais' ? (
                      <STSAisIcon style={{ width: 16, height: 16 }} />
                    ) : (
                      <STSIcon style={{ width: 16, height: 16 }} />
                    )
                  ) : (
                    <ShipIcon style={{ width: 16, height: 16 }} />
                  )}
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {tab.name}
                  </Text>
                  {isActive && (
                    <XClose
                      onClick={(e) => {
                        e.stopPropagation()
                        closeShipTab(tab.id)
                      }}
                      style={{
                        color: '#898f9d',
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                      }}
                    />
                  )}
                </Box>
              )
            })}
            <Box
              style={{
                flex: 1,
                height: 50,
                background: '#24263C',
                borderBottom: '1px solid #393C56',
              }}
            />
          </Box>
        </Box>
        {overflowRight && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderLeft: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(-90deg)',
              }}
            />
          </Box>
        )}
        <Menu position="bottom-end" withinPortal opened={menuOpened} onChange={setMenuOpened}>
          <Menu.Target>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 50,
                cursor: 'pointer',
                background: '#24263C',
                borderBottom: '1px solid #393C56',
                borderLeft: '1px solid #393C56',
                flexShrink: 0,
              }}
            >
              <List style={{ color: '#898f9d', width: 18, height: 18 }} />
            </Box>
          </Menu.Target>
          <Menu.Dropdown
            styles={{
              dropdown: {
                background: '#1B1D2E',
                border: '1px solid #393C56',
                minWidth: 220,
                padding: 0,
              },
            }}
          >
            {/* Ships Section */}
            <Box
              style={{
                background: '#24263C',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#898f9d',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Ships
              </Text>
              {shipTabs.length > 0 && (
                <Text
                  onClick={() => { setMenuOpened(false); closeAllTabs() }}
                  style={{
                    color: '#F75349',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Close All
                </Text>
              )}
            </Box>
            {shipTabs.filter((t) => t.type !== 'sts').length > 0 ? (
              shipTabs
                .filter((t) => t.type !== 'sts')
                .map((tab, i, arr) => (
                  <React.Fragment key={tab.id}>
                    <Menu.Item
                      onClick={() => {
                        setFlashEnabled(false)
                        setActiveStsShip(0)
                        setActiveShipTab(tab.id)
                      }}
                      leftSection={
                        <ShipIcon style={{ width: 14, height: 14 }} />
                      }
                      styles={{
                        item: {
                          color: '#fff',
                          fontSize: 12,
                          padding: '12px 16px',
                          background:
                            activeShipTab === tab.id
                              ? '#393C56'
                              : 'transparent',
                          borderRadius: 0,
                        },
                        itemLabel: { color: '#fff' },
                      }}
                    >
                      {tab.name}
                    </Menu.Item>
                    {i < arr.length - 1 && (
                      <Box
                        style={{
                          height: 1,
                          background: '#393C56',
                          margin: 0,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))
            ) : (
              <Text
                style={{ color: '#555', fontSize: 12, padding: '12px 16px' }}
              >
                No ships open
              </Text>
            )}
            {/* Ship-to-Ship: only show section when there are STS tabs */}
            {shipTabs.some((t) => t.type === 'sts') && (
              <>
                <Box
                  style={{
                    background: '#24263C',
                    padding: '12px 16px',
                    marginTop: 0,
                  }}
                >
                  <Text
                    style={{
                      color: '#898f9d',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Ship-to-Ship
                  </Text>
                </Box>
                {shipTabs
                  .filter((t) => t.type === 'sts')
                  .map((tab, i, arr) => (
                    <React.Fragment key={tab.id}>
                      <Menu.Item
                        onClick={() => {
                          setFlashEnabled(false)
                          setActiveStsShip(0)
                          setActiveShipTab(tab.id)
                        }}
                        leftSection={
                          tab.stsType === 'sts-ais' ? (
                            <STSAisIcon style={{ width: 14, height: 14 }} />
                          ) : (
                            <STSIcon style={{ width: 14, height: 14 }} />
                          )
                        }
                        styles={{
                          item: {
                            color: '#fff',
                            fontSize: 12,
                            padding: '12px 16px',
                            background:
                              activeShipTab === tab.id
                                ? '#393C56'
                                : 'transparent',
                            borderRadius: 0,
                          },
                          itemLabel: { color: '#fff' },
                        }}
                      >
                        {tab.name}
                      </Menu.Item>
                      {i < arr.length - 1 && (
                        <Box
                          style={{
                            height: 1,
                            background: '#393C56',
                            margin: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Box>

      {activeShip && loading && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Loader color="#fff" size="md" />
        </Box>
      )}

      {activeShip && !loading && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {isStsTab &&
            (() => {
              const [sid1, sid2] = activeTab.shipIds
              const s1 = ships[sid1]
              const s2 = ships[sid2]
              if (!s1 || !s2) return null
              const latest1 = detections
                .filter((d) => d.shipId === sid1)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latest2 = detections
                .filter((d) => d.shipId === sid2)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const color1 =
                activeTab.stsType === 'sts'
                  ? eventColorMap.light
                  : eventColorMap[latest1?.type] || '#393C56'
              const color2 =
                activeTab.stsType === 'sts'
                  ? eventColorMap.unattributed
                  : eventColorMap[latest2?.type] || '#393C56'
              const pill = (s, idx) => {
                const isActive = activeStsShip === idx
                return (
                  <Box
                    key={s.id}
                    onClick={() => setActiveStsShip(idx)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 4,
                      border: isActive
                        ? '2px solid #0094FF'
                        : '1px solid #393C56',
                      background: isActive
                        ? 'rgba(0, 148, 255, 0.1)'
                        : '#24263C',
                      cursor: 'pointer',
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
                    >
                      {s.name}
                    </Text>
                    {s.flag && <Text style={{ fontSize: 16 }}>{s.flag}</Text>}
                  </Box>
                )
              }
              return (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px 0px 20px',
                  }}
                >
                  {pill(s1, 0)}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 2,
                      flexShrink: 0,
                      height: 20,
                    }}
                  >
                    <Box
                      style={{
                        width: 8,
                        height: 20,
                        backgroundColor: color1,
                      }}
                    />
                    <Box
                      style={{
                        width: 8,
                        height: 20,
                        backgroundColor: color2,
                      }}
                    />
                  </Box>
                  {pill(s2, 1)}
                </Box>
              )
            })()}
          <Box style={{ padding: '20px' }}>
            <Box style={{ display: 'flex', marginBottom: '16px' }}>
              <Box
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <Title order={4} style={{ color: 'white' }}>
                  {activeShip.name}
                </Title>
                {activeShip.flag && (
                  <Text style={{ fontSize: 18 }}>{activeShip.flag}</Text>
                )}
              </Box>
              <Box style={{ flex: 1 }}></Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginRight: 24,
                }}
              >
                <File02 style={{ color: '#fff', width: 20, height: 20 }} />
                <AlertIcon style={{ color: '#fff', width: 20, height: 20 }} />
                <Star01 style={{ color: '#fff', width: 20, height: 20 }} />
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: '64px', marginBottom: '8px' }}>
              <KeyValuePair keyName="Latest Event" value={derivedLatestEvent} />
              <KeyValuePair keyName="IMO" value={activeShip.imo || 'No info'} />
              <KeyValuePair
                keyName="MMSI"
                value={activeShip.mmsi || 'No info'}
              />
            </Box>
            <Box
              style={{
                display: 'flex',
                alignItems: 'end',
                gap: 8,
                marginBottom: '16px',
              }}
            >
              <KeyValuePair
                keyName="SynMax Ship ID"
                value={activeShip.shipId || 'No info'}
              />
              {activeShip.shipId && (
                <Copy02
                  style={{
                    color: '#fff',
                    width: 16,
                    height: 16,
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    navigator.clipboard.writeText(activeShip.shipId)
                  }
                />
              )}
            </Box>
            {!isUnattributed && (
              <ShipDetailsPanel
                selectedEvent={selectedDetection}
                isLatest={isLatest}
                eventLabel={eventLabel[selectedDetection?.type] || ''}
                onSwitchToLatest={handleSwitchToLatest}
                flashEnabled={flashEnabled}
              />
            )}
          </Box>
          {isUnattributed ? (
            <Box style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <ShipDetailsPanel
                selectedEvent={selectedDetection}
                isLatest
                eventLabel={
                  isStsUnattributed
                    ? 'Unattributed'
                    : eventLabel[latestDetection?.type] || ''
                }
                onSwitchToLatest={() => {}}
                flashEnabled={false}
                unattributed
              />
              <Box style={{ marginTop: 8 }} />
              <EventTimelineCard
                date={latestDetection?.date}
                event={
                  isStsUnattributed
                    ? 'Unattributed'
                    : eventLabel[latestDetection?.type] || latestDetection?.type
                }
                icon={<UnattributedIcon style={{ height: 14 }} />}
                selected
                onSelect={() => {}}
                aisInfo={{}}
                synMaxInfo={
                  activeShip.synMaxInfo ||
                  (isStsUnattributed
                    ? {
                        objectId: 'N/A',
                        imageCapturedTime: latestDetection?.date || 'No info',
                        imageSource: 'Planet Scope',
                        status: 'Preview',
                        latitude: activeShip.aisInfo?.latitude || 'No info',
                        longitude: activeShip.aisInfo?.longitude || 'No info',
                        heading: activeShip.aisInfo?.heading || 'No info',
                        shipLength: activeShip.aisInfo?.length || 'No info',
                        shipWidth: activeShip.aisInfo?.width || 'No info',
                        shipType: activeShip.aisInfo?.shipType || 'No info',
                        shipSubtype: 'Unassigned',
                      }
                    : undefined)
                }
              />
            </Box>
          ) : (
            <>
              <Box
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #393C56',
                  flexShrink: 0,
                }}
              >
                {detailTabs.map((tab, i) => (
                  <Box
                    key={tab}
                    onClick={() => updateTabState('activeDetailTab', i)}
                    style={{
                      flex: 1,
                      padding: '12px 10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderBottom:
                        activeDetailTab === i
                          ? '2px solid #fff'
                          : '2px solid transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: activeDetailTab === i ? 700 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab}
                    </Text>
                  </Box>
                ))}
              </Box>
              <Box
                ref={scrollContainerRef}
                style={{ flex: 1, overflowY: 'auto' }}
              >
                {activeDetailTab === 0 && (
                  <Box
                    style={{
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {activeShipDetections.map((det) => {
                      const stsLightIcon = (
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'stretch',
                            gap: 2,
                          }}
                        >
                          <Box
                            style={{
                              width: 6,
                              height: 14,
                              backgroundColor: eventColorMap.light,
                            }}
                          />
                          <Box
                            style={{
                              width: 6,
                              height: 14,
                              backgroundColor: eventColorMap.unattributed,
                            }}
                          />
                        </Box>
                      )
                      const stsAisIcon = (
                        <Box
                          style={{
                            display: 'flex',
                            alignItems: 'stretch',
                            gap: 2,
                          }}
                        >
                          <Box
                            style={{
                              width: 6,
                              height: 14,
                              backgroundColor: eventColorMap.ais,
                            }}
                          />
                          <Box
                            style={{
                              width: 6,
                              height: 14,
                              backgroundColor: eventColorMap.light,
                            }}
                          />
                        </Box>
                      )
                      const iconMap = {
                        ais: <AisIcon style={{ height: 14 }} />,
                        light: <LightShipIcon style={{ height: 14 }} />,
                        dark: <DarkShipIcon style={{ height: 14 }} />,
                        spoofing: <SpoofingIcon style={{ height: 14 }} />,
                        sts: stsLightIcon,
                        'sts-ais': stsAisIcon,
                        unattributed: (
                          <UnattributedIcon style={{ height: 14 }} />
                        ),
                      }
                      return (
                        <Box
                          key={det.id}
                          ref={(el) => {
                            cardRefs.current[det.id] = el
                          }}
                        >
                          <EventTimelineCard
                            date={det.date}
                            event={eventLabel[det.type] || det.type}
                            icon={iconMap[det.type]}
                            variant={
                              det.type === 'sts' || det.type === 'sts-ais'
                                ? 'sts'
                                : undefined
                            }
                            selected={selectedCard === det.id}
                            selectedCard={selectedCard}
                            isLatest={det.id === latestDetection?.id}
                            onSwitchToLatest={handleSwitchToLatest}
                            onSelect={() => {
                              const isDeselecting = selectedCard === det.id
                              setFlashEnabled(true)

                              // On STS tab, selecting a non-STS event navigates to ship tab
                              if (
                                isStsTab &&
                                !isDeselecting &&
                                !det.stsPartner
                              ) {
                                openShipTab(det)
                                const parsed = new Date(det.date)
                                setMapDate(
                                  `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
                                )
                                setActiveDetectionId(det.id)
                                return
                              }

                              const latestId = activeShipDetections[0]?.id
                              updateTabState(
                                'selectedCard',
                                isDeselecting ? (latestId ?? det.id) : det.id
                              )
                              if (!isDeselecting) {
                                const parsed = new Date(det.date)
                                setMapDate(
                                  `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
                                )
                                setActiveDetectionId(det.id)
                              } else {
                                setActiveDetectionId(null)
                              }
                            }}
                            onViewStsShips={
                              det.stsPartner
                                ? () =>
                                    openStsTab(
                                      det.shipId,
                                      det.stsPartner,
                                      det.type,
                                      det.id
                                    )
                                : undefined
                            }
                            aisInfo={activeShip.aisInfo}
                            partnerAisInfo={
                              det.stsPartner
                                ? ships[det.stsPartner]?.aisInfo
                                : undefined
                            }
                            shipName={activeShip.name}
                            partnerName={
                              det.stsPartner
                                ? ships[det.stsPartner]?.name
                                : undefined
                            }
                            synMaxInfo={det.type === 'light' || det.type === 'dark' ? activeShip.synMaxInfo : undefined}
                            detectionType={det.type}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                )}
                {activeDetailTab === 1 && (
                  <Box style={{ padding: 20 }}>
                    <Title order={4} style={{ color: '#fff' }}>
                      Sat. Imagery Timeline
                    </Title>
                  </Box>
                )}
                {activeDetailTab === 2 && (
                  <Box style={{ padding: 20 }}>
                    <Title order={4} style={{ color: '#fff' }}>
                      Ship Information
                    </Title>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Myships
