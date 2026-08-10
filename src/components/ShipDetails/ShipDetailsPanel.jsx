import { useState, useEffect, useRef } from 'react'
import { Box, Text, Checkbox, Radio, Group } from '@mantine/core'
import { ChevronUp, ChevronDown } from '@untitledui/icons'
import ShipPathPanelButton from './ShipPathPanelButton'
import ViewExtendedPathIcon from '../../custom-icons/ViewExtendedPathIcon'
import FuturePathPredictionIcon from '../../custom-icons/FuturePathPredictionIcon'
import ViewEstimatedLocationIcon from '../../custom-icons/ViewEstimatedLocationIcon'
import SatelliteIcon from '../../custom-icons/SatelliteIcon'
import SimilarSearchIcon from '../../custom-icons/SimilarSearchIcon'
import AlertIcon from '../../custom-icons/AlertIcon'
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
    <Box
      style={{ width: 6, height: 14, backgroundColor: eventColorMap.light }}
    />
    <Box
      style={{
        width: 6,
        height: 14,
        backgroundColor: eventColorMap.unattributed,
      }}
    />
  </Box>
)
const stsAisTwoBar = (
  <Box style={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
    <Box
      style={{ width: 6, height: 14, backgroundColor: eventColorMap.light }}
    />
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
  version = 'v1',
  selectedEvent,
  isLatest,
  eventLabel,
  eventIconOverride,
  flashEnabled,
  unattributed,
  onToolsVisibleChange,
  onToolAction,
  activeToolIds = [],
  compactHeader = false,
  hideHeader = false,
}) => {
  const eventType = selectedEvent?.type
  const usesIconToolbar =
    version === 'v6' || version === 'v8' || version === 'v9'
  const usesCompactButtons =
    version === 'v5' ||
    version === 'v6' ||
    version === 'v8' ||
    version === 'v9'
  const usesVersion2Experience =
    version === 'v2' ||
    version === 'v3' ||
    version === 'v4' ||
    version === 'v5' ||
    version === 'v6' ||
    version === 'v7' ||
    version === 'v11' ||
    version === 'v8' ||
    version === 'v9' ||
    version === 'v10'
  const flashColor =
    usesVersion2Experience
      ? '#0094FF'
      : unattributed
        ? eventColorMap.unattributed
        : eventColorMap[eventType] || null
  const flashOpacity = usesVersion2Experience ? 0.08 : 0.2
  const dateDisplay = selectedEvent ? selectedEvent.date : 'No event selected'

  const [flashing, setFlashing] = useState(false)
  const [toolsVisible, setToolsVisible] = useState(() => version !== 'v2')
  const [toolsToggleHovered, setToolsToggleHovered] = useState(false)
  const prevEventRef = useRef(selectedEvent?.id)

  const handleToolButtonClick = (toolId) => onToolAction?.(toolId)

  useEffect(() => {
    if (
      flashEnabled &&
      selectedEvent?.id &&
      selectedEvent.id !== prevEventRef.current
    ) {
      setFlashing(true)
      if (
        version !== 'v3' &&
        version !== 'v4' &&
        version !== 'v5' &&
        version !== 'v6' &&
        version !== 'v7' &&
        version !== 'v11' &&
        version !== 'v8' &&
        version !== 'v9' &&
        version !== 'v10'
      ) {
        setToolsVisible(false)
      }
      const timer = setTimeout(() => setFlashing(false), 600)
      prevEventRef.current = selectedEvent.id
      return () => clearTimeout(timer)
    }
    prevEventRef.current = selectedEvent?.id
  }, [selectedEvent?.id, flashEnabled, version])

  useEffect(() => {
    onToolsVisibleChange?.(toolsVisible)
  }, [toolsVisible, onToolsVisibleChange])

  useEffect(() => {
    setToolsVisible(version !== 'v2')
  }, [version])

  return (
    <Box
      data-ship-details-version={version}
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
            opacity: flashing ? flashOpacity : 0,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <Box style={{ position: 'relative', zIndex: 0 }}>
        {!hideHeader && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              borderBottom:
                compactHeader || toolsVisible ? '1px solid #393C56' : 'none',
            }}
          >
          <Box style={{ flex: 1 }}>
            {!compactHeader && (
              <Text style={{ color: '#898f9d', fontSize: 11 }}>
                Selected Event Tools
              </Text>
            )}
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {dateDisplay}
              </Text>
              {unattributed
                ? eventIconMap.unattributed
                : eventIconOverride || (eventType && eventIconMap[eventType])}
              {eventLabel && (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {eventLabel}
                </Text>
              )}
            </Box>
          </Box>
          {!compactHeader && (
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
                {usesVersion2Experience
                  ? toolsVisible
                    ? 'Hide Event Tools'
                    : 'Show Event Tools'
                  : toolsVisible
                    ? 'Hide Tools'
                    : 'Show Tools'}
              </Text>
              {toolsVisible ? (
                <ChevronUp style={{ color: '#fff', width: 14, height: 14 }} />
              ) : (
                <ChevronDown style={{ color: '#fff', width: 14, height: 14 }} />
              )}
            </Box>
          )}
          </Box>
        )}
        {(compactHeader || toolsVisible) && (
          <>
            <Box style={{ padding: '16px' }}>
              {!unattributed && (
                <Box
                  className="dark-controls"
                  style={{ display: 'flex', gap: 16, marginBottom: 12 }}
                >
                  <Checkbox
                    defaultChecked
                    label="Show AIS path"
                    size="xs"
                    radius={4}
                    color="#006CD7"
                    iconColor="#FFFFFF"
                    styles={{ input: { borderColor: '#888F9E' } }}
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
                style={{
                  marginTop: unattributed ? 0 : 8,
                  display: usesIconToolbar ? 'flex' : 'block',
                  gap: usesIconToolbar ? 6 : undefined,
                }}
              >
                <Box
                  style={{
                    display: usesIconToolbar ? 'contents' : 'flex',
                    gap: 6,
                    marginBottom: usesIconToolbar ? 0 : 6,
                  }}
                >
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="View Extended Path"
                    icon={<ViewExtendedPathIcon />}
                    disabled={unattributed}
                    active={activeToolIds.includes('extended-path')}
                    onClick={() => handleToolButtonClick('extended-path')}
                  />
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="Future Path Prediction"
                    icon={<FuturePathPredictionIcon />}
                    active={activeToolIds.includes('future-path-prediction')}
                    onClick={() =>
                      handleToolButtonClick('future-path-prediction')
                    }
                  />
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="View Estimated Location"
                    icon={<ViewEstimatedLocationIcon />}
                    disabled={unattributed}
                    active={activeToolIds.includes('estimated-location')}
                    onClick={() => handleToolButtonClick('estimated-location')}
                  />
                </Box>
                <Box
                  style={{
                    display: usesIconToolbar ? 'contents' : 'flex',
                    gap: 6,
                  }}
                >
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="Task Satellite Imagery"
                    icon={<SatelliteIcon />}
                    disabled={unattributed}
                    onClick={() => handleToolButtonClick('satellite-imagery')}
                  />
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="Search Similar Ship"
                    icon={<SimilarSearchIcon />}
                    disabled={unattributed}
                    onClick={() => handleToolButtonClick('search-similar-ship')}
                  />
                  <ShipPathPanelButton
                    fullWidth
                    iconOnly={usesIconToolbar}
                    lightweight={version === 'v8' || version === 'v9'}
                    compact={usesCompactButtons}
                    singleLineLabel={usesCompactButtons}
                    label="Create Ship Alert"
                    icon={<AlertIcon />}
                    disabled={unattributed}
                    onClick={() => handleToolButtonClick('create-ship-alert')}
                  />
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ShipDetailsPanel
