import React, { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Button,
  Tooltip,
  Collapse,
  TextInput,
  Select,
  Progress,
} from '@mantine/core'
import { Copy02, ChevronDown, RefreshCcw01 } from '@untitledui/icons'
import flagIcon from '../assets/flag.png'

const FuturePathPanel = ({ ship }) => {
  const [copied, setCopied] = useState(false)
  const [parametersOpen, setParametersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            setIsLoading(false)
            setShowResults(true)
            return 100
          }
          return p + 2 // 100% / 50 steps = 2% per 100ms = 5 seconds total
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  if (!ship) return null

  const displayShipId =
    ship.shipId || ship.synMaxInfo?.objectId
      ? (ship.shipId || ship.synMaxInfo.objectId).length > 25
        ? `${(ship.shipId || ship.synMaxInfo.objectId).substring(0, 25)}...`
        : ship.shipId || ship.synMaxInfo.objectId
      : 'No info'

  const handleCopy = () => {
    const idToCopy = ship.shipId || ship.synMaxInfo?.objectId
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewClick = () => {
    setIsLoading(true)
    setShowResults(false)
    setProgress(0)
  }

  const handleCancelClick = () => {
    setIsLoading(false)
    setShowResults(false)
    setProgress(0)
  }

  if (isLoading) {
    return (
      <Box style={{ padding: '32px 24px' }}>
        <Progress
          value={progress}
          size="sm"
          radius="xl"
          style={{ marginBottom: 24, backgroundColor: '#24263C' }}
          styles={{
            section: { backgroundColor: '#fff' },
          }}
        />
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14 }}>
            {Math.round(progress)}% Fetching data...
          </Text>
          <Button
            variant="outline"
            onClick={handleCancelClick}
            style={{
              borderColor: '#fff',
              color: '#fff',
              height: 36,
              padding: '0 16px',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    )
  }

  if (showResults) {
    return (
      <Box style={{ padding: 20 }}>
        {/* Ship Info Card */}
        <Box
          style={{
            background: '#24263C',
            borderRadius: 4,
            padding: 16,
            border: '1px solid #393C56',
            marginBottom: 24,
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

        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 24 }}>
          Drag slider to view ship's predicted future path.
        </Text>

        <Box>
          <Box
            style={{
              position: 'relative',
              height: 6,
              background: '#24263C',
              borderRadius: 3,
              marginBottom: 32,
              marginTop: 16,
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '18%',
                background: '#0094ff',
                borderRadius: 3,
              }}
            />
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '18%',
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'grab',
              }}
            />
          </Box>

          <Box style={{ display: 'flex', gap: 24, paddingBottom: 8 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box style={{ width: 14, height: 14, borderRadius: 3, background: '#DC3124' }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Most likely</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box style={{ width: 14, height: 14, borderRadius: 3, background: '#712519' }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Likely</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box style={{ width: 14, height: 14, borderRadius: 3, background: 'transparent', border: '1px solid #DC3124' }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Possible</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    )
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
        style={{
          border: '1px solid #393C56',
          borderRadius: 4,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setParametersOpen((o) => !o)}
          style={{
            background: '#24263C',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14 }}>Parameters</Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Box
              onClick={(e) => {
                e.stopPropagation()
                // Handle reset
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <RefreshCcw01 style={{ color: '#fff', width: 14, height: 14 }} />
              <Text style={{ color: '#fff', fontSize: 12 }}>Reset</Text>
            </Box>
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
        </Box>
        <Collapse in={parametersOpen}>
          <Box style={{ padding: '16px', background: '#181926' }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>
                Edit parameters to change predictions:
              </Text>
              <Box
                onClick={() => {
                  // Handle reset
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <RefreshCcw01
                  style={{ color: '#fff', width: 14, height: 14 }}
                />
                <Text style={{ color: '#fff', fontSize: 12 }}>Reset</Text>
              </Box>
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px 20px',
                marginBottom: 24,
              }}
            >
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Latitude
                </Text>
                <TextInput
                  defaultValue="20.687742"
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Longitude
                </Text>
                <TextInput
                  defaultValue="108.135544"
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Speed
                </Text>
                <TextInput
                  defaultValue="0"
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Length
                </Text>
                <TextInput
                  defaultValue="127"
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Heading
                </Text>
                <TextInput
                  defaultValue="51"
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
                  Ship Type
                </Text>
                <Select
                  defaultValue="Cargo"
                  data={['Cargo', 'Tanker', 'Passenger', 'Fishing']}
                  rightSection={
                    <ChevronDown
                      style={{ width: 16, height: 16, color: '#fff' }}
                    />
                  }
                  styles={{
                    input: {
                      background: '#0A0E19',
                      borderColor: '#424750',
                      color: '#fff',
                      fontSize: 12,
                    },
                    dropdown: {
                      background: '#24263C',
                      borderColor: '#393C56',
                    },
                    item: {
                      color: '#fff',
                      '&[data-hovered]': {
                        backgroundColor: '#393C56',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <Button
                variant="outline"
                style={{
                  borderColor: '#fff',
                  color: '#fff',
                  height: 36,
                  fontWeight: 500,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: '#fff',
                  color: '#fff',
                  height: 36,
                  fontWeight: 500,
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

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
          onClick={handleViewClick}
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
