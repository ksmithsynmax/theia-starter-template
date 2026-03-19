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
import STSAisIcon from '../../custom-icons/STSAisIcon'

const eventColorMap = {
  ais: '#00EB6C',
  light: '#00A3E3',
  dark: '#FFA500',
  spoofing: '#FF6D99',
  unattributed: '#F75349',
  sts: '#00A3E3',
  'sts-ais': '#00EB6C',
}

const stsLightTwoBar = (
  <Box style={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
    <Box style={{ width: 6, height: 14, backgroundColor: eventColorMap.light }} />
    <Box style={{ width: 6, height: 14, backgroundColor: eventColorMap.unattributed }} />
  </Box>
)
const stsAisTwoBar = (
  <Box style={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
    <Box style={{ width: 6, height: 14, backgroundColor: eventColorMap.light }} />
    <Box style={{ width: 6, height: 14, backgroundColor: eventColorMap.ais }} />
  </Box>
)

const eventIconMap = {
  ais: <AisIcon style={{ height: 14 }} />,
  light: <LightShipIcon style={{ height: 14 }} />,
  dark: <DarkShipIcon style={{ height: 14 }} />,
  spoofing: <SpoofingIcon style={{ height: 14 }} />,
  sts: stsLightTwoBar,
  'sts-ais': stsAisTwoBar,
  unattributed: <UnattributedIcon style={{ height: 14 }} />,
}

const ShipDetailsPanel = ({
  selectedEvent,
  isLatest,
  eventLabel,
  eventIconOverride,
  flashEnabled,
  unattributed,
  onToolsVisibleChange,
}) => {
  const eventType = selectedEvent?.type
  const flashColor = unattributed ? eventColorMap.unattributed : (eventColorMap[eventType] || null)
  const dateDisplay = selectedEvent ? selectedEvent.date : 'No event selected'

  const [flashing, setFlashing] = useState(false)
  const [toolsVisible, setToolsVisible] = useState(true)
  const [toolsToggleHovered, setToolsToggleHovered] = useState(false)
  const [activeToolId, setActiveToolId] = useState(null)
  const prevEventRef = useRef(selectedEvent?.id)

  const handleToolButtonClick = (toolId) => {
    setActiveToolId((prev) => (prev === toolId ? null : toolId))
  }

  useEffect(() => {
    if (flashEnabled && selectedEvent?.id && selectedEvent.id !== prevEventRef.current) {
      setFlashing(true)
      setToolsVisible(false)
      const timer = setTimeout(() => setFlashing(false), 600)
      prevEventRef.current = selectedEvent.id
      return () => clearTimeout(timer)
    }
    prevEventRef.current = selectedEvent?.id
  }, [selectedEvent?.id, flashEnabled])

  useEffect(() => {
    onToolsVisibleChange?.(toolsVisible)
  }, [toolsVisible, onToolsVisibleChange])

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
            <Text style={{ color: '#898f9d', fontSize: 11, marginBottom: 4 }}>
              Selected Event Tools
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {dateDisplay}
              </Text>
              {(unattributed
                ? eventIconMap.unattributed
                : eventIconOverride || (eventType && eventIconMap[eventType]))}
              {eventLabel && (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {eventLabel}
                </Text>
              )}
            </Box>
          </Box>
          <Box
            onClick={() => setToolsVisible((v) => !v)}
            onMouseEnter={() => setToolsToggleHovered(true)}
            onMouseLeave={() => setToolsToggleHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flexShrink: 0,
              border: '1px solid #fff',
              borderRadius: 4,
              padding: '6px 10px',
              background: toolsToggleHovered
                ? 'rgba(255, 255, 255, 0.14)'
                : 'transparent',
              transition: 'background-color 120ms ease',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>
              {toolsVisible ? 'Hide Tools' : 'Show Tools'}
            </Text>
            {toolsVisible
              ? <ChevronUp style={{ color: '#fff', width: 14, height: 14 }} />
              : <ChevronDown style={{ color: '#fff', width: 14, height: 14 }} />
            }
          </Box>
        </Box>
        {toolsVisible && (
          <>
          <Box style={{ height: 1, background: '#393C56' }} />
          <Box style={{ padding: '16px' }}>
            {!unattributed && (
              <Box className="dark-controls" style={{ display: 'flex', gap: 16 }}>
                <Checkbox
                  defaultChecked
                  label="Show AIS path"
                  size="xs"
                />
                <Radio.Group name="favoriteFramework">
                  <Group>
                    <Radio
                      size="xs"
                      variant="outline"
                      value="Line"
                      label="Line"
                    />
                    <Radio
                      size="xs"
                      variant="outline"
                      value="AisSignal"
                      label="AIS Signal"
                    />
                  </Group>
                </Radio.Group>
              </Box>
            )}
            <Box
              style={{ display: 'flex', gap: 6, marginBottom: 6, marginTop: unattributed ? 0 : 16 }}
            >
              <ShipPathPanelButton
                label="View Extended Path"
                icon={<ViewExtendedPathIcon />}
                disabled={unattributed}
                active={activeToolId === 'extended-path'}
                onClick={() => handleToolButtonClick('extended-path')}
              />
              <ShipPathPanelButton
                label="View Path Playback"
                icon={<ViewPathPlaybackIcon />}
                disabled={unattributed}
                active={activeToolId === 'path-playback'}
                onClick={() => handleToolButtonClick('path-playback')}
              />
              <ShipPathPanelButton
                label="Future Path Prediction"
                icon={<FuturePathPredictionIcon />}
                active={activeToolId === 'future-path-prediction'}
                onClick={() => handleToolButtonClick('future-path-prediction')}
              />
              <ShipPathPanelButton
                label="View Estimated Location"
                icon={<ViewEstimatedLocationIcon />}
                disabled={unattributed}
                active={activeToolId === 'estimated-location'}
                onClick={() => handleToolButtonClick('estimated-location')}
              />
            </Box>
            <Box style={{ display: 'flex', gap: 6 }}>
              <ShipPathPanelButton
                label="Task Satellite Imagery"
                icon={<SatelliteIcon />}
                disabled={unattributed}
                active={activeToolId === 'satellite-imagery'}
                onClick={() => handleToolButtonClick('satellite-imagery')}
              />
              <ShipPathPanelButton
                label="Search Similar Ship"
                icon={<SimilarSearchIcon />}
                disabled={unattributed}
                active={activeToolId === 'search-similar-ship'}
                onClick={() => handleToolButtonClick('search-similar-ship')}
              />
              <ShipPathPanelButton
                label="Create Ship Alert"
                icon={<AlertIcon />}
                disabled={unattributed}
                active={activeToolId === 'create-ship-alert'}
                onClick={() => handleToolButtonClick('create-ship-alert')}
              />
              <ShipPathPanelButton
                label="Download Path in XLS"
                icon={<DownloadPathXLS />}
                disabled={unattributed}
                active={activeToolId === 'download-path-xls'}
                onClick={() => handleToolButtonClick('download-path-xls')}
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
