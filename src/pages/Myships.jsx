import { useState } from 'react'
import { Box, Text, Title } from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import flagImg from '../assets/flag.png'
import { File02, Star01, Copy02 } from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import ShipDetailsPanel from '../components/ShipDetails/ShipDetailsPanel'
import EventTimelineCard from '../components/ShipDetails/EventTimelineCard'

const tabs = ['Event Timeline', 'Sat. Imagery Timeline', 'Ship Information']

function Myships() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box>
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
        {tabs.map((tab, i) => (
          <Box
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: '12px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              borderBottom:
                activeTab === i
                  ? '2px solid #fff'
                  : '2px solid transparent',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: activeTab === i ? 700 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </Text>
          </Box>
        ))}
      </Box>
      {activeTab === 0 && (
        <Box style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EventTimelineCard date="Oct 25, 2025 09:53" event="AIS" />
          <EventTimelineCard date="Oct 24, 2025 14:30" event="Port of Call" />
          <EventTimelineCard date="Oct 23, 2025 08:12" event="AIS" />
        </Box>
      )}
      {activeTab === 1 && (
        <Box style={{ padding: 20 }}>
          <Title order={4} style={{ color: '#fff' }}>
            Sat. Imagery Timeline
          </Title>
        </Box>
      )}
      {activeTab === 2 && (
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
