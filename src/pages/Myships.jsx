import React from 'react'
import { Box, Text, Title } from '@mantine/core'
import { File02, Star01, Copy02, ChevronDown } from '@untitledui/icons'
import KeyValuePair from '../components/KeyValuePair'
import flagImg from '../assets/flag.png'
import AlertIcon from '../custom-icons/AlertIcon'

const Myships = () => {
  const [activeTab, setActiveTab] = React.useState('Sanction Details')
  const tabs = ['Event Timeline', 'Ownership', 'Sanction Details']

  return (
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
              Invictus
            </Title>

            <img src={flagImg} alt="flag" />
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
          <KeyValuePair keyName="Latest Event" value="Sanctioned" />
          <KeyValuePair keyName="IMO" value="9819870" />
          <KeyValuePair keyName="MMSI" value="331000686" />
          <KeyValuePair keyName="Object ID" value="No Info" />
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
            style={{
              color: '#fff',
              width: 16,
              height: 16,
              cursor: 'pointer',
            }}
            // onClick={() => navigator.clipboard.writeText(activeShip.shipId)}
          />
        </Box>
        <Box>
          <Text
            style={{ color: '#888F9E', fontSize: '10px', marginBottom: '6px' }}
          >
            Ship Tools
          </Text>

          <Box style={{ display: 'flex', marginBottom: '12px' }}>
            <Box
              style={{
                padding: '12px',
                background: '#393C56',
                borderRight: '1px solid #6B6D80',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                flex: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: '14px' }}>
                View extended path
              </Text>
            </Box>
            <Box
              style={{
                background: '#393C56',
                width: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
              }}
            >
              <ChevronDown style={{ color: '#fff', width: 20, height: 20 }} />
            </Box>
          </Box>
          <Text
            style={{ color: '#888F9E', fontSize: '10px', marginBottom: '6px' }}
          >
            Satellite Imagery Tools
          </Text>
          <Box style={{ display: 'flex' }}>
            <Box
              style={{
                padding: '12px',
                background: '#393C56',
                borderRight: '1px solid #6B6D80',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                flex: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: '14px' }}>
                View satellite imagery
              </Text>
            </Box>
            <Box
              style={{
                background: '#393C56',
                width: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
              }}
            >
              <ChevronDown style={{ color: '#fff', width: 20, height: 20 }} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          return (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '16px 8px',
                borderBottom: isActive
                  ? '2px solid #FFFFFF'
                  : '1px solid #393C56',
                cursor: 'pointer',
              }}
            >
              <Text
                style={{
                  color: isActive ? '#FFFFFF' : '#888F9E',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {tab}
              </Text>
            </Box>
          )
        })}
      </Box>
      <Box style={{ padding: '20px' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>
          {activeTab}
        </Text>
      </Box>
    </>
  )
}

export default Myships
