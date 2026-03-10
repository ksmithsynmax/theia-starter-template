import React, { useState } from 'react'
import { Box, Menu, Text } from '@mantine/core'
import {
  Plus,
  Grid01,
  Bell02,
  User03,
  Edit01,
  SearchMd,
  Calendar,
  RefreshCcw01,
  BarChart01,
  ChevronDown,
  Save01,
  XClose,
} from '@untitledui/icons'

import TheiaLogo from '../assets/TheiaLogo.svg'

const TopNav = () => {
  const [selectedVersion, setSelectedVersion] = useState('Version A')
  const [toastMessage, setToastMessage] = useState('Version A')
  const [versionMenuOpened, setVersionMenuOpened] = useState(false)
  const versionMenuWidth = 180
  const versionDescriptions = {
    'Version A':
      'Timeline-first layout with a full sanctions summary block for quick context.',
    'Version B':
      'Timeline-first layout with compact summary styling and event badges for faster scanning.',
    'Version C':
      'Progressive-disclosure timeline with lean default rows and expandable secondary details.',
  }

  const handleVersionSelect = (version) => {
    setSelectedVersion(version)
    setToastMessage(version)
    const key = version.split(' ').pop()
    window.dispatchEvent(
      new CustomEvent('version-testing-change', {
        detail: { version, key },
      })
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <Box
        style={{
          backgroundColor: '#181926',
          display: 'flex',
          alignItems: 'stretch',
          height: 58,
        }}
      >
        <Box
          style={{
            padding: '0 24px',
            borderRight: '1px solid #393C56',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <img src={TheiaLogo} alt="Theia Logo" />
        </Box>
        <Box
          component="button"
          type="button"
          className="topnav-icon-btn"
          style={{ borderRight: '1px solid #393C56', height: '100%' }}
        >
          <Grid01 color="white" size={20} />
        </Box>
        <Box component="button" type="button" className="topnav-station">
          <Text variant="body1" c="#fff">
            Untitled Station
          </Text>
        </Box>
        <Box
          component="button"
          type="button"
          className="topnav-icon-btn"
          style={{ height: '100%' }}
        >
          <Plus color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        {/* <Box component="button" type="button" className="topnav-icon-btn">
          <Bell02 color="white" size={20} />
        </Box>
        <Box component="button" type="button" className="topnav-icon-btn">
          <User03 color="white" size={20} />
        </Box> */}
        <Box style={{ height: '100%', display: 'flex', alignItems: 'center', marginRight: 12 }}>
          <Menu
            shadow="md"
            width={versionMenuWidth}
            opened={versionMenuOpened}
            onChange={setVersionMenuOpened}
          >
            <Menu.Target>
              <Box
                component="button"
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  width: versionMenuWidth,
                  background: '#0085E6',
                  border: '1px solid #0085E6',
                  borderRadius: 4,
                  padding: '0 12px',
                  cursor: 'pointer',
                }}
              >
                <Text variant="body1" c="#fff" style={{ fontWeight: 600 }}>
                  Version Testing
                </Text>
                <ChevronDown
                  color="white"
                  size={18}
                  style={{
                    transform: versionMenuOpened ? 'rotate(180deg)' : 'none',
                  }}
                />
              </Box>
            </Menu.Target>
            <Menu.Dropdown
              style={{
                background: '#24263C',
                border: '1px solid #4D5171',
                borderRadius: 4,
                padding: 8,
              }}
            >
              {['Version A', 'Version B', 'Version C'].map((version) => (
                <Menu.Item
                  key={version}
                  onClick={() => handleVersionSelect(version)}
                  style={{
                    color: version === selectedVersion ? '#0094FF' : '#fff',
                    background:
                      version === selectedVersion ? '#1F4978' : 'transparent',
                    borderRadius: 4,
                    margin: 0,
                    padding: '8px 14px',
                    fontSize: 14,
                  }}
                >
                  {version}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Box>
      <Box
        style={{
          backgroundColor: '#24263C',
          display: 'flex',
          alignItems: 'center',
          height: '50px',
          // padding: '24px',
        }}
      >
        <Box
          component="button"
          type="button"
          className="topnav-toolbar-btn topnav-toolbar-btn--no-hover"
          style={{ marginRight: '16px' }}
        >
          <Text variant="body1" c="#fff" style={{ marginRight: '8px' }}>
            Untitled Stations
          </Text>
          <Edit01 color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <SearchMd color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ marginLeft: '8px' }}>
            Search
          </Text>
        </Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <Calendar color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ margin: '0 8px' }}>
            Live
          </Text>
          <RefreshCcw01 color="white" size={20} />
        </Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <BarChart01 color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ margin: '0 8px' }}>
            Ships in view: 2541
          </Text>
          <ChevronDown color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <Save01 color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ marginLeft: '8px' }}>
            Saved
          </Text>
        </Box>
      </Box>
      {toastMessage && (
        <Box
          style={{
            position: 'absolute',
            right: 20,
            top: 120,
            zIndex: 10,
            background: '#24263C',
            border: '1px solid #393C56',
            borderRadius: 4,
            padding: '14px 18px 16px 18px',
            minWidth: 300,
            maxWidth: 360,
          }}
        >
          <Box
            style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
          >
            <Text
              style={{ color: '#fff', fontSize: 16, fontWeight: 700, flex: 1 }}
            >
              {toastMessage}
            </Text>
            <Box
              component="button"
              type="button"
              onClick={() => setToastMessage('')}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <XClose color="#C3C7D4" size={18} />
            </Box>
          </Box>
          <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 1.4 }}>
            {versionDescriptions[toastMessage] ||
              'Prototype version updated.'}
          </Text>
        </Box>
      )}
    </div>
  )
}

export default TopNav
