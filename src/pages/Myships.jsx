import { useState, useEffect, useRef } from 'react'
import { Box, Text, Title } from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import flagImg from '../assets/flag.png'
import { File02, Star01, Copy02, XClose } from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LighShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import UnattributedIcon from '../custom-icons/UnattributedIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
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
  const { shipTabs, activeShipTab, setActiveShipTab, closeShipTab, openStsTab, selectedDetectionId, setSelectedDetectionId } = useShipContext()
  const [tabState, setTabState] = useState({})
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [activeStsShip, setActiveStsShip] = useState(0)
  const cardRefs = useRef({})
  const scrollContainerRef = useRef(null)

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
    if (selectedDetectionId != null) {
      updateTabState('selectedCard', selectedDetectionId)
      setFlashEnabled(true)
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

  const derivedLatestEvent = latestDetection ? eventLabel[latestDetection.type] || latestDetection.type : null
  const isLatest = !selectedCard || selectedCard === latestDetection?.id

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
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
                {tab.type === 'sts' ? <STSIcon style={{ width: 16, height: 16 }} /> : <ShipIcon style={{ width: 16, height: 16 }} />}
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
              background: '#24263C',
              borderBottom: '1px solid #393C56',
            }}
          />
        </Box>
      </Box>

      {activeShip && (
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
                <STSIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
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
                <img
                  src={flagImg}
                  alt="Flag"
                  style={{
                    width: 24,
                    height: 18,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
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
              <KeyValuePair keyName="IMO" value={activeShip.imo} />
              <KeyValuePair keyName="MMSI" value={activeShip.mmsi} />
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
                value={activeShip.shipId}
              />
              <Copy02
                style={{ color: '#fff', width: 16, height: 16, cursor: 'pointer' }}
                onClick={() => navigator.clipboard.writeText(activeShip.shipId)}
              />
            </Box>
            <ShipDetailsPanel
              selectedEvent={selectedDetection}
              isLatest={isLatest}
              eventLabel={eventLabel[selectedDetection?.type] || ''}
              onSwitchToLatest={() => { setFlashEnabled(true); updateTabState('selectedCard', null) }}
              flashEnabled={flashEnabled}
            />
          </Box>
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
                    'sts-ais': <STSIcon style={{ height: 14 }} />,
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
                        onSelect={() => { setFlashEnabled(true); updateTabState('selectedCard', selectedCard === det.id ? null : det.id) }}
                        onViewStsShips={det.stsPartner ? () => openStsTab(det.shipId, det.stsPartner) : undefined}
                        aisInfo={activeShip.aisInfo}
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
        </Box>
      )}
    </Box>
  )
}

export default Myships
