import { useState, useEffect, useRef } from 'react'
import { Box, Text, Checkbox, Radio, Group } from '@mantine/core'
import { ChevronUp, ChevronDown } from '@untitledui/icons'
import ShipPathPanelButton from './ShipPathPanelButton'
import ViewExtendedPathIcon from '../../custom-icons/ViewExtendedPathIcon'
import ViewPathPlaybackIcon from '../../custom-icons/ViewPathPlaybackIcon'
import FuturePathPredictionIcon from '../../custom-icons/FuturePathPredictionIcon'
import ViewEstimatedLocationIcon from '../../custom-icons/ViewEstimatedLocationIcon'
import SatelliteIcon from '../../custom-icons/SatelliteIcon'
import SimilarSearchIcon from '../../custom-icons/SimilarSearchIcon'
import AlertIcon from '../../custom-icons/AlertIcon'
import DownloadPathXLS from '../../custom-icons/DownloadPathXLS'
import AisIcon from '../../custom-icons/AisIcon'
import LightShipIcon from '../../custom-icons/LighShipIcon'
import DarkShipIcon from '../../custom-icons/DarkShipIcon'
import UnattributedIcon from '../../custom-icons/UnattributedIcon'
import SpoofingIcon from '../../custom-icons/SpoofingIcon'
import STSIcon from '../../custom-icons/STSIcon'

const eventColorMap = {
  ais: '#00EB6C',
  light: '#00A3E3',
  dark: '#FFA500',
  spoofing: '#FF6D99',
  unattributed: '#F75349',
  sts: '#00A3E3',
  'sts-ais': '#00EB6C',
}

const eventIconMap = {
  ais: <AisIcon style={{ height: 14 }} />,
  light: <LightShipIcon style={{ height: 14 }} />,
  dark: <DarkShipIcon style={{ height: 14 }} />,
  spoofing: <SpoofingIcon style={{ height: 14 }} />,
  sts: <STSIcon style={{ height: 14 }} />,
  'sts-ais': <STSIcon style={{ height: 14 }} />,
  unattributed: <UnattributedIcon style={{ height: 14 }} />,
}

const ShipDetailsPanel = ({ selectedEvent, isLatest, eventLabel, onSwitchToLatest, flashEnabled }) => {
  const eventType = selectedEvent?.type
  const flashColor = eventColorMap[eventType] || null
  const dateDisplay = selectedEvent
    ? `${selectedEvent.date}${isLatest ? ' (Latest)' : ''}`
    : 'No event selected'

  const [flashing, setFlashing] = useState(false)
  const [toolsVisible, setToolsVisible] = useState(true)
  const prevEventRef = useRef(selectedEvent?.id)

  useEffect(() => {
    if (flashEnabled && selectedEvent?.id && selectedEvent.id !== prevEventRef.current) {
      setFlashing(true)
      const timer = setTimeout(() => setFlashing(false), 600)
      prevEventRef.current = selectedEvent.id
      return () => clearTimeout(timer)
    }
    prevEventRef.current = selectedEvent?.id
  }, [selectedEvent?.id, flashEnabled])

  return (
    <Box
      style={{
        borderRadius: '4px',
        border: `1px solid ${flashing && flashColor ? flashColor : '#393C56'}`,
        background: '#24263C',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.5s ease-out',
      }}
    >
      {flashColor && (
        <Box
          key={selectedEvent?.id}
          style={{
            position: 'absolute',
            inset: 0,
            background: flashColor,
            opacity: flashing ? 0.2 : 0,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <Box style={{ position: 'relative', zIndex: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
          <Box style={{ flex: 1 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ color: '#898f9d', fontSize: 11 }}>Selected Event</Text>
              {!isLatest && (
                <>
                  <Text style={{ color: '#898f9d', fontSize: 11 }}>|</Text>
                  <Text
                    onClick={onSwitchToLatest}
                    style={{
                      color: '#0094FF',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Switch to Latest
                  </Text>
                </>
              )}
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {dateDisplay}
              </Text>
              {eventType && eventIconMap[eventType]}
              {eventLabel && (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {eventLabel}
                </Text>
              )}
            </Box>
          </Box>
          <Box
            onClick={() => setToolsVisible((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}
          >
            <Text style={{ color: '#898f9d', fontSize: 11 }}>
              {toolsVisible ? 'Hide Tools' : 'Show Tools'}
            </Text>
            {toolsVisible
              ? <ChevronUp style={{ color: '#898f9d', width: 14, height: 14 }} />
              : <ChevronDown style={{ color: '#898f9d', width: 14, height: 14 }} />
            }
          </Box>
        </Box>
        {toolsVisible && (
          <>
            <Box style={{ height: 1, background: '#393C56' }} />
            <Box style={{ padding: '16px' }}>
              <Box style={{ display: 'flex', gap: 16 }}>
                <Checkbox
                  defaultChecked
                  label="Show AIS path"
                  size="xs"
                  style={{ color: '#fff' }}
                />
                <Radio.Group name="favoriteFramework">
                  <Group>
                    <Radio
                      size="xs"
                      variant="outline"
                      value="Line"
                      label="Line"
                      style={{ color: '#fff' }}
                    />
                    <Radio
                      size="xs"
                      variant="outline"
                      value="AisSignal"
                      label="AIS Signal"
                      style={{ color: '#fff' }}
                    />
                  </Group>
                </Radio.Group>
              </Box>
              <Box
                style={{ display: 'flex', gap: 6, marginBottom: 6, marginTop: 16 }}
              >
                <ShipPathPanelButton
                  label="View Extended Path"
                  icon={<ViewExtendedPathIcon />}
                />
                <ShipPathPanelButton
                  label="View Path Playback"
                  icon={<ViewPathPlaybackIcon />}
                />
                <ShipPathPanelButton
                  label="Future Path Prediction"
                  icon={<FuturePathPredictionIcon />}
                />
                <ShipPathPanelButton
                  label="View Estimated Location"
                  icon={<ViewEstimatedLocationIcon />}
                />
              </Box>
              <Box style={{ display: 'flex', gap: 6 }}>
                <ShipPathPanelButton
                  label="Task Satellite Imagery"
                  icon={<SatelliteIcon />}
                />
                <ShipPathPanelButton
                  label="Search Similar Ship"
                  icon={<SimilarSearchIcon />}
                />
                <ShipPathPanelButton label="Create Ship Alert" icon={<AlertIcon />} />
                <ShipPathPanelButton
                  label="Download Path in XLS"
                  icon={<DownloadPathXLS />}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ShipDetailsPanel
