import { useState } from 'react'
import { Box, Text, Title } from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import flagImg from '../assets/flag.png'
import { File02, Star01, Copy02, XClose } from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LighShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
import ShipIcon from '../custom-icons/ShipIcon'
import ShipDetailsPanel from '../components/ShipDetails/ShipDetailsPanel'
import EventTimelineCard from '../components/ShipDetails/EventTimelineCard'

const detailTabs = [
  'Event Timeline',
  'Sat. Imagery Timeline',
  'Ship Information',
]

function Myships() {
  const [shipTabs, setShipTabs] = useState([
    { id: 'invictus', name: 'Invictus' },
  ])
  const [activeShipTab, setActiveShipTab] = useState('invictus')
  const [activeDetailTab, setActiveDetailTab] = useState(0)
  const [selectedCard, setSelectedCard] = useState(null)

  const closeShipTab = (id) => {
    const updated = shipTabs.filter((t) => t.id !== id)
    setShipTabs(updated)
    if (activeShipTab === id && updated.length > 0) {
      setActiveShipTab(updated[0].id)
    }
  }

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
                onClick={() => setActiveShipTab(tab.id)}
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
              Invictus
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
          <KeyValuePair keyName="Latest Event" value="AIS" />
          <KeyValuePair keyName="IMO" value="9819870" />
          <KeyValuePair keyName="MMSI" value="311000686" />
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
            value="f8f6a2c9-9c04-777e-ecc4-6bcf114315ac"
          />
          <Copy02
            style={{ color: '#fff', width: 16, height: 16, cursor: 'pointer' }}
            onClick={() =>
              navigator.clipboard.writeText(
                'f8f6a2c9-9c04-777e-ecc4-6bcf114315ac'
              )
            }
          />
        </Box>
        <ShipDetailsPanel />
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
          <EventTimelineCard
            date="Oct 25, 2025 09:53"
            event="AIS"
            icon={<AisIcon style={{ height: 14 }} />}
            selected={selectedCard === 0}
            onSelect={() => setSelectedCard(selectedCard === 0 ? null : 0)}
          />
          <EventTimelineCard
            variant="port"
            date="Oct 25, 2025 09:53 UTC"
            port="IMMINGHAM"
            status="Ongoing"
            duration="0h 0m"
          />
          <EventTimelineCard
            date="Oct 24, 2025 07:43"
            event="Light"
            icon={<LightShipIcon style={{ height: 14 }} />}
            selected={selectedCard === 2}
            onSelect={() => setSelectedCard(selectedCard === 2 ? null : 2)}
          />
          <EventTimelineCard
            variant="flag"
            date="Oct 24, 2025 06:43 UTC"
            newFlag="Turkey 🇹🇷"
            previousFlag="China 🇨🇳"
          />
          <EventTimelineCard
            date="Oct 23, 2025 14:21"
            event="Dark"
            icon={<DarkShipIcon style={{ height: 14 }} />}
            selected={selectedCard === 4}
            onSelect={() => setSelectedCard(selectedCard === 4 ? null : 4)}
          />
          <EventTimelineCard
            date="Oct 23, 2025 10:05"
            event="Spoofing"
            icon={<SpoofingIcon style={{ height: 14 }} />}
            selected={selectedCard === 5}
            onSelect={() => setSelectedCard(selectedCard === 5 ? null : 5)}
          />
          <EventTimelineCard
            variant="sts"
            date="Oct 22, 2025 07:43 UTC"
            event="STS (Light)"
            icon={<STSIcon style={{ height: 14 }} />}
            selected={selectedCard === 6}
            onSelect={() => setSelectedCard(selectedCard === 6 ? null : 6)}
          />
          <EventTimelineCard
            date="Oct 21, 2025 08:12"
            event="Dark"
            icon={<DarkShipIcon style={{ height: 14 }} />}
            selected={selectedCard === 7}
            onSelect={() => setSelectedCard(selectedCard === 7 ? null : 7)}
          />
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
  )
}

export default Myships
