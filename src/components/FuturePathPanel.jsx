import React, { useState } from 'react'
import { Box, Text, Button, Tooltip, Collapse } from '@mantine/core'
import { Copy02, ChevronDown } from '@untitledui/icons'
import flagIcon from '../assets/flag.png'

const FuturePathPanel = ({ ship }) => {
  const [copied, setCopied] = useState(false)
  const [parametersOpen, setParametersOpen] = useState(false)

  if (!ship) return null

  const displayShipId = ship.shipId || ship.synMaxInfo?.objectId
    ? (ship.shipId || ship.synMaxInfo.objectId).length > 25
      ? `${(ship.shipId || ship.synMaxInfo.objectId).substring(0, 25)}...`
      : (ship.shipId || ship.synMaxInfo.objectId)
    : 'No info'

  const handleCopy = () => {
    const idToCopy = ship.shipId || ship.synMaxInfo?.objectId
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Box style={{ padding: 20 }}>
      {/* Ship Info Card */}
      <Box
        style={{
          background: '#24263C',
          borderRadius: 4,
          padding: 16,
          border: '1px solid #393C56',
          marginBottom: 20,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {ship.name || 'Unknown Ship'}
          </Text>
          <img
            src={flagIcon}
            alt="flag"
            style={{
              width: 24,
              height: 16,
              objectFit: 'cover',
              borderRadius: 2,
            }}
          />
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 2fr',
            gap: 16,
          }}
        >
          <Box>
            <Text style={{ color: '#888F9E', fontSize: 10, marginBottom: 4 }}>
              IMO
            </Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {ship.imo || ship.synMaxInfo?.imo || 'No info'}
            </Text>
          </Box>
          <Box>
            <Text style={{ color: '#888F9E', fontSize: 10, marginBottom: 4 }}>
              MMSI
            </Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {ship.mmsi || ship.synMaxInfo?.mmsi || 'No info'}
            </Text>
          </Box>
          <Box>
            <Text style={{ color: '#888F9E', fontSize: 10, marginBottom: 4 }}>
              SynMax Ship ID
            </Text>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayShipId}
              </Text>
              <Tooltip label={copied ? 'Copied!' : 'Copy ID'} withArrow>
                <Box
                  onClick={handleCopy}
                  style={{ display: 'flex', cursor: 'pointer', marginLeft: 8 }}
                >
                  <Copy02
                    style={{
                      color: '#fff',
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Parameters Accordion */}
      <Box
        onClick={() => setParametersOpen((o) => !o)}
        style={{
          background: '#24263C',
          border: '1px solid #393C56',
          borderRadius: 4,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14 }}>Parameters</Text>
        <ChevronDown
          style={{
            color: '#fff',
            width: 20,
            height: 20,
            transform: parametersOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
          }}
        />
      </Box>
      <Collapse in={parametersOpen}>
        <Box style={{ padding: '0 16px 24px 16px' }}>
          <Text style={{ color: '#888F9E', fontSize: 12 }}>
            Parameter settings will go here...
          </Text>
        </Box>
      </Collapse>

      {/* Footer Section */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, flex: 1, lineHeight: 1.4 }}>
          This action could take up to a few minutes to generate.
        </Text>
        <Button
          style={{
            background: '#0094ff',
            height: 40,
            fontSize: 14,
            fontWeight: 500,
            padding: '0 24px',
          }}
        >
          View Future Path Prediction
        </Button>
      </Box>
    </Box>
  )
}

export default FuturePathPanel
