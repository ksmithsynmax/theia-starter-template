import { useEffect, useState } from 'react'
import { Box, Text, Checkbox } from '@mantine/core'
import { XClose } from '@untitledui/icons'

function MapLayersPanel({ onClose, portsChecked = false, onPortsCheckedChange }) {
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 })
  const [dragState, setDragState] = useState(null)

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
        width: 318,
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
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
          Map Layers
        </Text>
        <XClose
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onClose}
          color="white"
          size={18}
          style={{ cursor: 'pointer' }}
        />
      </Box>

      <Box style={{ padding: '14px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 42 }}>
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
      </Box>
    </Box>
  )
}

export default MapLayersPanel
