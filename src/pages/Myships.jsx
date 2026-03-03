import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, Title, Loader, Menu } from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import { File02, Star01, Copy02, XClose, ChevronDown, List } from '@untitledui/icons'
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
  const { shipTabs, activeShipTab, setActiveShipTab, closeShipTab, closeAllTabs, openStsTab, selectedDetectionId, setSelectedDetectionId, mapDate, setMapDate, setActiveDetectionId } = useShipContext()
  const [tabState, setTabState] = useState({})
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [activeStsShip, setActiveStsShip] = useState(0)
  const [loading, setLoading] = useState(false)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const [overflowRight, setOverflowRight] = useState(false)
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
      const latest = detections.filter((d) => d.shipId === shipId).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setFlashEnabled(true)
      setActiveDetectionId(null)
      setTabState((prev) => ({
        ...prev,
        [activeShipTab]: { ...prev[activeShipTab], selectedCard: latest?.id ?? null },
      }))
    }
  }, [mapDate, activeShipTab, setActiveDetectionId])

  const currentTabState = tabState[activeShipTab] || { selectedCard: null, activeDetailTab: 0 }
  const selectedCard = currentTabState.selectedCard
  const activeDetailTab = currentTabState.activeDetailTab

  const updateTabState = (key, value) => {
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: { ...prev[activeShipTab], selectedCard: prev[activeShipTab]?.selectedCard ?? null, activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0, [key]: value },
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
      const shipDetections = detections.filter((d) => d.shipId === shipId).sort((a, b) => new Date(b.date) - new Date(a.date))
      const targetId = selectedDetectionId && shipDetections.some((d) => d.id === selectedDetectionId)
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
    if (selectedCard != null && cardRefs.current[selectedCard] && scrollContainerRef.current) {
      const card = cardRefs.current[selectedCard]
      const container = scrollContainerRef.current
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const padding = 20

      if (cardRect.top < containerRect.top + padding) {
        container.scrollTo({ top: container.scrollTop + (cardRect.top - containerRect.top) - padding, behavior: 'smooth' })
      } else if (cardRect.bottom > containerRect.bottom - padding) {
        container.scrollTo({ top: container.scrollTop + (cardRect.bottom - containerRect.bottom) + padding, behavior: 'smooth' })
      }
    }
  }, [selectedCard])

  const activeTab = shipTabs.find((t) => t.id === activeShipTab)
  const isStsTab = activeTab?.type === 'sts'

  const activeShipId = isStsTab ? activeTab.shipIds[activeStsShip] : activeShipTab
  const activeShip = activeShipId ? ships[activeShipId] : null
  const activeShipDetections = activeShipId
    ? detections.filter((d) => d.shipId === activeShipId).sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  const latestDetection = activeShipDetections[0] || null
  const isStsUnattributed = isStsTab && activeTab?.stsType === 'sts' && activeStsShip === 1
  const isUnattributed = activeShip?.synMaxInfo != null || isStsUnattributed
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

  const eventIconMap = {
    ais: <AisIcon style={{ height: 14 }} />,
    light: <LightShipIcon style={{ height: 14 }} />,
    dark: <DarkShipIcon style={{ height: 14 }} />,
    spoofing: <SpoofingIcon style={{ height: 14 }} />,
    sts: <STSIcon style={{ height: 14 }} />,
    'sts-ais': <STSAisIcon style={{ height: 14 }} />,
    unattributed: <UnattributedIcon style={{ height: 14 }} />,
  }

  const derivedLatestEvent = latestDetection ? (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {isStsUnattributed ? eventIconMap['unattributed'] : eventIconMap[latestDetection.type]}
      {isStsUnattributed ? 'Unattributed' : (eventLabel[latestDetection.type] || latestDetection.type)}
    </Box>
  ) : null
  const isLatest = !selectedCard || selectedDetection?.id === latestDetection?.id

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
            onClick={() => tabScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
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
            <ChevronDown style={{ color: '#898f9d', width: 16, height: 16, transform: 'rotate(90deg)' }} />
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
                background: 'linear-gradient(to right, #24263C, rgba(36, 38, 60, 0))',
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
                background: 'linear-gradient(to left, #24263C, rgba(36, 38, 60, 0))',
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
                onClick={() => { setFlashEnabled(false); setActiveStsShip(0); setActiveShipTab(tab.id) }}
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
                {tab.type === 'sts' ? (tab.stsType === 'sts-ais' ? <STSAisIcon style={{ width: 16, height: 16 }} /> : <STSIcon style={{ width: 16, height: 16 }} />) : <ShipIcon style={{ width: 16, height: 16 }} />}
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
            onClick={() => tabScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
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
            <ChevronDown style={{ color: '#898f9d', width: 16, height: 16, transform: 'rotate(-90deg)' }} />
          </Box>
        )}
        <Menu position="bottom-end" withinPortal>
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
          <Menu.Dropdown styles={{ dropdown: { background: '#24263C', border: '1px solid #393C56', minWidth: 200 } }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
              <Text style={{ color: '#898f9d', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Ships</Text>
              <Text
                onClick={closeAllTabs}
                style={{ color: '#F75349', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                Close All
              </Text>
            </Box>
            {shipTabs.filter((t) => t.type !== 'sts').map((tab) => (
              <Menu.Item
                key={tab.id}
                onClick={() => { setFlashEnabled(false); setActiveStsShip(0); setActiveShipTab(tab.id) }}
                leftSection={<ShipIcon style={{ width: 14, height: 14 }} />}
                styles={{ item: { color: '#fff', fontSize: 12, background: activeShipTab === tab.id ? '#393C56' : 'transparent' }, itemLabel: { color: '#fff' } }}
              >
                {tab.name}
              </Menu.Item>
            ))}
            {shipTabs.some((t) => t.type === 'sts') && (
              <>
                <Text style={{ color: '#898f9d', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', padding: '8px 12px 4px' }}>Ship-to-Ship</Text>
                {shipTabs.filter((t) => t.type === 'sts').map((tab) => (
                  <Menu.Item
                    key={tab.id}
                    onClick={() => { setFlashEnabled(false); setActiveStsShip(0); setActiveShipTab(tab.id) }}
                    leftSection={tab.stsType === 'sts-ais' ? <STSAisIcon style={{ width: 14, height: 14 }} /> : <STSIcon style={{ width: 14, height: 14 }} />}
                    styles={{ item: { color: '#fff', fontSize: 12, background: activeShipTab === tab.id ? '#393C56' : 'transparent' }, itemLabel: { color: '#fff' } }}
                  >
                    {tab.name}
                  </Menu.Item>
                ))}
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Box>

      {activeShip && loading && (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Loader color="#fff" size="md" />
        </Box>
      )}

      {activeShip && !loading && (
        <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {isStsTab && (() => {
            const [sid1, sid2] = activeTab.shipIds
            const s1 = ships[sid1]
            const s2 = ships[sid2]
            if (!s1 || !s2) return null
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
                    border: isActive ? '2px solid #0094FF' : '1px solid #393C56',
                    background: isActive ? 'rgba(0, 148, 255, 0.1)' : '#24263C',
                    cursor: 'pointer',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                    {s.name}
                  </Text>
                  {s.flag && <Text style={{ fontSize: 16 }}>{s.flag}</Text>}
                </Box>
              )
            }
            return (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
                {pill(s1, 0)}
                {activeTab.stsType === 'sts-ais' ? <STSAisIcon style={{ width: 20, height: 20, flexShrink: 0 }} /> : <STSIcon style={{ width: 20, height: 20, flexShrink: 0 }} />}
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
              <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <File02 style={{ color: '#fff', width: 20, height: 20 }} />
                <AlertIcon style={{ color: '#fff', width: 20, height: 20 }} />
                <Star01 style={{ color: '#fff', width: 20, height: 20 }} />
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: '64px', marginBottom: '8px' }}>
              <KeyValuePair keyName="Latest Event" value={derivedLatestEvent} />
              <KeyValuePair keyName="IMO" value={activeShip.imo || 'No info'} />
              <KeyValuePair keyName="MMSI" value={activeShip.mmsi || 'No info'} />
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
                  style={{ color: '#fff', width: 16, height: 16, cursor: 'pointer' }}
                  onClick={() => navigator.clipboard.writeText(activeShip.shipId)}
                />
              )}
            </Box>
            {!isUnattributed && (
              <ShipDetailsPanel
                selectedEvent={selectedDetection}
                isLatest={isLatest}
                eventLabel={eventLabel[selectedDetection?.type] || ''}
                onSwitchToLatest={() => {
                  setFlashEnabled(true)
                  updateTabState('selectedCard', latestDetection?.id ?? null)
                  setActiveDetectionId(null)
                  const today = new Date()
                  setMapDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
                }}
                flashEnabled={flashEnabled}
              />
            )}
          </Box>
          {isUnattributed ? (
            <Box style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <ShipDetailsPanel
                selectedEvent={selectedDetection}
                isLatest
                eventLabel={isStsUnattributed ? 'Unattributed' : (eventLabel[latestDetection?.type] || '')}
                onSwitchToLatest={() => {}}
                flashEnabled={false}
                unattributed
              />
              <Box style={{ marginTop: 8 }} />
              <EventTimelineCard
                date={latestDetection?.date}
                event={isStsUnattributed ? 'Unattributed' : (eventLabel[latestDetection?.type] || latestDetection?.type)}
                icon={<UnattributedIcon style={{ height: 14 }} />}
                selected
                onSelect={() => {}}
                aisInfo={{}}
                synMaxInfo={activeShip.synMaxInfo || (isStsUnattributed ? {
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
                } : undefined)}
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
              <Box ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto' }}>
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
                      const iconMap = {
                        ais: <AisIcon style={{ height: 14 }} />,
                        light: <LightShipIcon style={{ height: 14 }} />,
                        dark: <DarkShipIcon style={{ height: 14 }} />,
                        spoofing: <SpoofingIcon style={{ height: 14 }} />,
                        sts: <STSIcon style={{ height: 14 }} />,
                        'sts-ais': <STSAisIcon style={{ height: 14 }} />,
                        unattributed: <UnattributedIcon style={{ height: 14 }} />,
                      }
                      return (
                        <Box key={det.id} ref={(el) => { cardRefs.current[det.id] = el }}>
                          <EventTimelineCard
                            date={det.date}
                            event={eventLabel[det.type] || det.type}
                            icon={iconMap[det.type]}
                            variant={det.type === 'sts' || det.type === 'sts-ais' ? 'sts' : undefined}
                            selected={selectedCard === det.id}
                            onSelect={() => {
                              const isDeselecting = selectedCard === det.id
                              setFlashEnabled(true)
                              updateTabState('selectedCard', isDeselecting ? null : det.id)
                              if (!isDeselecting) {
                                const parsed = new Date(det.date)
                                setMapDate(`${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`)
                                setActiveDetectionId(det.id)
                              } else {
                                setActiveDetectionId(null)
                              }
                            }}
                            onViewStsShips={det.stsPartner ? () => openStsTab(det.shipId, det.stsPartner, det.type, det.id) : undefined}
                            aisInfo={activeShip.aisInfo}
                            partnerAisInfo={det.stsPartner ? ships[det.stsPartner]?.aisInfo : undefined}
                            shipName={activeShip.name}
                            partnerName={det.stsPartner ? ships[det.stsPartner]?.name : undefined}
                            synMaxInfo={activeShip.synMaxInfo}
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
