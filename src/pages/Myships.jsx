import { useState, useEffect } from 'react'
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
  const { shipTabs, activeShipTab, setActiveShipTab, closeShipTab, selectedDetectionId, setSelectedDetectionId } = useShipContext()
  const [activeDetailTab, setActiveDetailTab] = useState(0)
  const [selectedCard, setSelectedCard] = useState(null)
  const [flashEnabled, setFlashEnabled] = useState(false)

  useEffect(() => {
    if (selectedDetectionId != null) {
      setSelectedCard(selectedDetectionId)
      setFlashEnabled(true)
      setSelectedDetectionId(null)
    }
  }, [selectedDetectionId, setSelectedDetectionId])

  const activeShip = activeShipTab ? ships[activeShipTab] : null
  const activeShipDetections = activeShipTab
    ? detections.filter((d) => d.shipId === activeShipTab).sort((a, b) => b.id - a.id)
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

  const isLatest = !selectedCard || selectedCard === latestDetection?.id

  return (
    <Box>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          // borderBottom: '1px solid #393C56',
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
                onClick={() => { setFlashEnabled(false); setActiveShipTab(tab.id) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRight: '1px solid #393C56',
                  background: isActive ? '#181926' : '#24263C',
                  position: 'relative',
                  zIndex: isActive ? 1 : 0,
                  marginBottom: isActive ? -1 : 0,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <ShipIcon style={{ width: 16, height: 16 }} />
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
        </Box>
      </Box>

      {activeShip && (
        <>
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
              <KeyValuePair keyName="Latest Event" value={activeShip.latestEvent} />
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
              onSwitchToLatest={() => { setFlashEnabled(true); setSelectedCard(null) }}
              flashEnabled={flashEnabled}
            />
          </Box>
          <Box
            style={{
              display: 'flex',
              borderBottom: '1px solid #393C56',
            }}
          >
            {detailTabs.map((tab, i) => (
              <Box
                key={tab}
                onClick={() => setActiveDetailTab(i)}
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
                  <EventTimelineCard
                    key={det.id}
                    date={det.date}
                    event={eventLabel[det.type] || det.type}
                    icon={iconMap[det.type]}
                    variant={det.type === 'sts' || det.type === 'sts-ais' ? 'sts' : undefined}
                    selected={selectedCard === det.id}
                    onSelect={() => { setFlashEnabled(true); setSelectedCard(selectedCard === det.id ? null : det.id) }}
                    aisInfo={activeShip.aisInfo}
                  />
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
        </>
      )}
    </Box>
  )
}

export default Myships
