import React, { useState, useEffect } from 'react'
import { Box, Text, TextInput, Button, Tooltip, Progress } from '@mantine/core'
import { Calendar, Clock, Copy02 } from '@untitledui/icons'
import flagIcon from '../assets/flag.png'

const ExtendedPathPanel = ({ ship, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval)
            setIsLoading(false)
            return 100
          }
          return p + 2 // 100% / 50 steps = 2% per 100ms = 5 seconds total
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  if (!ship) return null

  // Truncate SynMax Ship ID for display if needed
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

  const handleViewClick = () => {
    setIsLoading(true)
    setProgress(0)
  }

  const handleCancelClick = () => {
    setIsLoading(false)
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
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Form Fields */}
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
            Start Date
          </Text>
          <TextInput
            defaultValue="Jan 1, 2026"
            rightSection={
              <Calendar style={{ width: 16, height: 16, color: '#fff' }} />
            }
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
            End Date
          </Text>
          <TextInput
            defaultValue="Jan 7, 2026"
            rightSection={
              <Calendar style={{ width: 16, height: 16, color: '#fff' }} />
            }
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
            Start Hour
          </Text>
          <TextInput
            defaultValue="00:00 UTC"
            rightSection={
              <Clock style={{ width: 16, height: 16, color: '#fff' }} />
            }
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
            End Hour
          </Text>
          <TextInput
            defaultValue="00:00 UTC"
            rightSection={
              <Clock style={{ width: 16, height: 16, color: '#fff' }} />
            }
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
      </Box>

      {/* Submit Button */}
      <Button
        fullWidth
        onClick={handleViewClick}
        style={{
          background: '#0094ff',
          height: 40,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        View Extended Path
      </Button>
    </Box>
  )
}

export default ExtendedPathPanel
