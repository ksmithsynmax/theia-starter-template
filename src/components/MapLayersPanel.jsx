import { useEffect, useState } from 'react'
import { Box, Text, Checkbox, Switch, Select } from '@mantine/core'
import { ChevronDown, ChevronLeft, Sliders04, XClose } from '@untitledui/icons'
function MapLayersPanel({
  onClose,
  portsChecked = false,
  onPortsCheckedChange,
  portHoverCardEnabled = true,
  onPortHoverCardEnabledChange,
}) {
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 })
  const [dragState, setDragState] = useState(null)
  const [portSettingsOpen, setPortSettingsOpen] = useState(false)
  const [unwiredLayerChecks, setUnwiredLayerChecks] = useState({
    liveWebcams: false,
    exclusiveEconomicZone: false,
    submarineCables: false,
    coverage: false,
    highRiskAreas: false,
    aoiRestrictions: false,
  })
  const [selectedPortShipSizeClasses, setSelectedPortShipSizeClasses] = useState(
    'Handysize, Panamax, Aframax, Suezmax'
  )
  const [selectedPortCargoTypes, setSelectedPortCargoTypes] = useState(
    'LNG, Oil, Container, Bulk/Grain'
  )
  const handleUnwiredLayerToggle = (layerKey) => (event) => {
    const checked = event.currentTarget.checked
    setUnwiredLayerChecks((prev) => ({
      ...prev,
      [layerKey]: checked,
    }))
  }

  useEffect(() => {
    if (!dragState) return undefined

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY
      setPanelOffset({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      })
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState])

  return (
    <Box
      style={{
        position: 'absolute',
        right: 90,
        bottom: 24,
        width: 365,
        borderRadius: 4,
        border: '1px solid #393C56',
        background: '#181926',
        zIndex: 3,
        boxShadow: '0 16px 32px rgba(0,0,0,0.35)',
        pointerEvents: 'auto',
        overflow: 'hidden',
        transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)`,
      }}
    >
      <Box
        onMouseDown={(event) => {
          if (event.button !== 0) return
          event.preventDefault()
          setDragState({
            startX: event.clientX,
            startY: event.clientY,
            originX: panelOffset.x,
            originY: panelOffset.y,
          })
        }}
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2D314A',
          padding: '0 14px',
          cursor: dragState ? 'grabbing' : 'grab',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {portSettingsOpen && (
            <ChevronLeft
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => setPortSettingsOpen(false)}
              size={18}
              color="#A4ABBE"
              style={{
                cursor: 'pointer',
              }}
            />
          )}
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
            {portSettingsOpen ? 'Port Filters' : 'Map Layers'}
          </Text>
        </Box>
        <XClose
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onClose}
          color="white"
          size={18}
          style={{ cursor: 'pointer' }}
        />
      </Box>

      <Box style={{ padding: '14px' }}>
        {!portSettingsOpen ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.liveWebcams}
                onChange={handleUnwiredLayerToggle('liveWebcams')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>Live Webcams</Text>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.exclusiveEconomicZone}
                onChange={handleUnwiredLayerToggle('exclusiveEconomicZone')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>Exclusive Economic Zone</Text>
            </Box>

            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 36,
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Checkbox
                  checked={portsChecked}
                  onChange={(event) =>
                    onPortsCheckedChange?.(event.currentTarget.checked)
                  }
                  size="sm"
                  className="ship-filter-checkbox"
                />
                <Text style={{ color: '#fff', fontSize: 14 }}>Ports</Text>
              </Box>
              <Box
                role="button"
                aria-label="Port settings"
                onClick={() => setPortSettingsOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <Sliders04 size={15} color="#A4ABBE" />
              </Box>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.submarineCables}
                onChange={handleUnwiredLayerToggle('submarineCables')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>Submarine Cables</Text>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.coverage}
                onChange={handleUnwiredLayerToggle('coverage')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>Coverage</Text>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.highRiskAreas}
                onChange={handleUnwiredLayerToggle('highRiskAreas')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>High Risk Areas</Text>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', minHeight: 36, gap: 10 }}>
              <Checkbox
                checked={unwiredLayerChecks.aoiRestrictions}
                onChange={handleUnwiredLayerToggle('aoiRestrictions')}
                size="sm"
                className="ship-filter-checkbox"
              />
              <Text style={{ color: '#fff', fontSize: 14 }}>AOI Restrictions</Text>
            </Box>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 6 }}>
            <Box>
              <Text style={{ color: '#E8EBF2', fontSize: 13, marginBottom: 6 }}>
                Show ports with below ship size classes:
              </Text>
              <Select
                value={selectedPortShipSizeClasses}
                onChange={(value) => setSelectedPortShipSizeClasses(value || '')}
                data={[
                  'Handysize, Panamax, Aframax, Suezmax',
                  'Handysize, Panamax',
                  'Aframax, Suezmax',
                  'VLCC, ULCC',
                ]}
                rightSection={<ChevronDown size={14} color="#FFFFFF" />}
                styles={{
                  input: {
                    background: '#070B14',
                    borderColor: '#5A607E',
                    color: '#FFFFFF',
                    fontSize: 13,
                    height: 40,
                  },
                  dropdown: {
                    background: '#111326',
                    borderColor: '#393C56',
                  },
                  option: {
                    color: '#FFFFFF',
                  },
                }}
              />
            </Box>

            <Box>
              <Text style={{ color: '#E8EBF2', fontSize: 13, marginBottom: 6 }}>
                Show ports with below cargo/terminal types:
              </Text>
              <Select
                value={selectedPortCargoTypes}
                onChange={(value) => setSelectedPortCargoTypes(value || '')}
                data={[
                  'LNG, Oil, Container, Bulk/Grain',
                  'LNG, Oil',
                  'Container, Bulk/Grain',
                  'Dry Bulk, LPG',
                ]}
                rightSection={<ChevronDown size={14} color="#FFFFFF" />}
                styles={{
                  input: {
                    background: '#070B14',
                    borderColor: '#5A607E',
                    color: '#FFFFFF',
                    fontSize: 13,
                    height: 40,
                  },
                  dropdown: {
                    background: '#111326',
                    borderColor: '#393C56',
                  },
                  option: {
                    color: '#FFFFFF',
                  },
                }}
              />
            </Box>

            <Switch
              className="port-hover-card-switch"
              checked={portHoverCardEnabled}
              onChange={(event) =>
                onPortHoverCardEnabledChange?.(event.currentTarget.checked)
              }
              label="Show Port Summary Hover Card"
              color="#006CD7"
              size="sm"
              styles={{
                root: { display: 'flex', padding: '0' },
                body: { display: 'flex', alignItems: 'center', gap: 12 },
                track: {
                  border: 'none',
                  backgroundColor: portHoverCardEnabled ? '#006CD7' : '#393C56',
                },
                thumb: { border: 'none', backgroundColor: '#FFFFFF' },
                label: {
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  paddingLeft: 0,
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MapLayersPanel
