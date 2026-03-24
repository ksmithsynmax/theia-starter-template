import React, { useState } from 'react'
import { Box, Text, Button } from '@mantine/core'
import { Star01 } from '@untitledui/icons'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'

const SecondaryNav = ({ isOpen, onOpen, onClose, currentPath }) => {
  const [activeTab, setActiveTab] = useState('My Ships')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)

  const isMyShips = currentPath === '/myships'

  return (
    <Box
      style={{
        width: isOpen && isMyShips ? 386 : (isMyShips ? 32 : 0),
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isMyShips ? '1px solid #393c56' : 'none',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && isMyShips && (
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
          <ExpandButton backgroundColor={expandHovered ? '#4C5070' : '#393C56'} />
        </Box>
      )}

      {isOpen && isMyShips && (
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
          width: 386,
          minWidth: 386,
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
                  Select any ship and click the star button in its detail panel
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
                  style={{ color: '#888F9E', fontSize: 12, margin: '0 16px' }}
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
                    style={{ color: '#888F9E', fontSize: 12, marginBottom: 4 }}
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
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default SecondaryNav
