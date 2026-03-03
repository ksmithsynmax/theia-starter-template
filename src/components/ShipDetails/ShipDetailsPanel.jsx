import { useState, useEffect, useRef } from 'react'
import { Box, Text, Checkbox, Radio, Group, Modal, Button, Loader } from '@mantine/core'
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

const eventIconMap = {
  ais: <AisIcon style={{ height: 14 }} />,
  light: <LightShipIcon style={{ height: 14 }} />,
  dark: <DarkShipIcon style={{ height: 14 }} />,
  spoofing: <SpoofingIcon style={{ height: 14 }} />,
  sts: <STSIcon style={{ height: 14 }} />,
  'sts-ais': <STSAisIcon style={{ height: 14 }} />,
  unattributed: <UnattributedIcon style={{ height: 14 }} />,
}

const ShipDetailsPanel = ({ selectedEvent, isLatest, eventLabel, onSwitchToLatest, flashEnabled, unattributed }) => {
  const eventType = selectedEvent?.type
  const flashColor = eventColorMap[eventType] || null
  const dateDisplay = selectedEvent
    ? `${selectedEvent.date}${isLatest ? ' (Latest)' : ''}`
    : 'No event selected'

  const [flashing, setFlashing] = useState(false)
  const [toolsVisible, setToolsVisible] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const prevEventRef = useRef(selectedEvent?.id)

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
                    onClick={() => setModalOpen(true)}
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
                />
                <ShipPathPanelButton
                  label="View Path Playback"
                  icon={<ViewPathPlaybackIcon />}
                  disabled={unattributed}
                />
                <ShipPathPanelButton
                  label="Future Path Prediction"
                  icon={<FuturePathPredictionIcon />}
                />
                <ShipPathPanelButton
                  label="View Estimated Location"
                  icon={<ViewEstimatedLocationIcon />}
                  disabled={unattributed}
                />
              </Box>
              <Box style={{ display: 'flex', gap: 6 }}>
                <ShipPathPanelButton
                  label="Task Satellite Imagery"
                  icon={<SatelliteIcon />}
                  disabled={unattributed}
                />
                <ShipPathPanelButton
                  label="Search Similar Ship"
                  icon={<SimilarSearchIcon />}
                  disabled={unattributed}
                />
                <ShipPathPanelButton label="Create Ship Alert" icon={<AlertIcon />} disabled={unattributed} />
                <ShipPathPanelButton
                  label="Download Path in XLS"
                  icon={<DownloadPathXLS />}
                  disabled={unattributed}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
      <Modal
        opened={modalOpen}
        onClose={() => { if (!switching) setModalOpen(false) }}
        withCloseButton={false}
        centered
        overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
        styles={{
          content: { background: '#1B1D2E', border: '1px solid #393C56', borderRadius: 8, maxWidth: 400 },
          body: { padding: 0 },
        }}
      >
        {!switching ? (
          <Box style={{ padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Switch to Latest Event?
            </Text>
            <Text style={{ color: '#898f9d', fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
              You are currently viewing a historical detection. Switching will update the map and timeline to show the most recent event for this ship.
            </Text>
            <Box style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="subtle"
                onClick={() => setModalOpen(false)}
                styles={{
                  root: { color: '#898f9d', fontSize: 13, fontWeight: 600, padding: '8px 16px', background: 'transparent', border: '1px solid #393C56', borderRadius: 4, '&:hover': { background: '#24263C' } },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSwitching(true)
                  setTimeout(() => {
                    onSwitchToLatest()
                    setSwitching(false)
                    setModalOpen(false)
                  }, 1500)
                }}
                styles={{
                  root: { fontSize: 13, fontWeight: 600, padding: '8px 16px', background: '#0094FF', borderRadius: 4, '&:hover': { background: '#0080DD' } },
                }}
              >
                Switch to Latest
              </Button>
            </Box>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
            <Loader color="#0094FF" size="md" />
            <Text style={{ color: '#898f9d', fontSize: 13 }}>Switching to latest event...</Text>
          </Box>
        )}
      </Modal>
    </Box>
  )
}

export default ShipDetailsPanel
