import { useState } from 'react'
import { Box, Text } from '@mantine/core'

const ShipPathPanelButton = ({ icon, label, disabled, active = false, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const isHighlighted = hovered || active

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation()
        if (!disabled) onClick?.()
      }}
      onMouseEnter={() => {
        if (!disabled) setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onMouseDown={() => {
        if (!disabled) setPressed(true)
      }}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 102,
        height: 72,
        border: active ? '1px solid #8ED2FF' : '1px solid transparent',
        borderRadius: 4,
        background: disabled
          ? '#2A2D3E'
          : isHighlighted
            ? 'linear-gradient(180deg, #0078CC -59.18%, #0A2A4A 100.54%) padding-box, linear-gradient(180deg, #0078CC, #0A2A4A) border-box'
            : 'linear-gradient(180deg, #0094FF -59.18%, #0D335C 100.54%) padding-box, linear-gradient(180deg, #0094FF, #0D335C) border-box',
        backgroundClip: disabled ? 'border-box' : 'padding-box, border-box',
        boxShadow: disabled
          ? 'none'
          : active
            ? '0 0 0 1px rgba(0, 148, 255, 0.55), 0 0 24px 0 rgba(0, 148, 255, 0.35)'
            : '0 0 20px 0 rgba(0, 0, 0, 0.25)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        textAlign: 'center',
        overflow: 'hidden',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {(pressed || active) && !disabled && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: active ? 'rgba(0, 148, 255, 0.24)' : 'rgba(0, 148, 255, 0.15)',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        />
      )}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#fff',
          opacity: disabled ? 0.3 : 1,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Text
          style={{
            fontSize: 10,
            color: '#fff',
            fontWeight: active ? 700 : 500,
            textAlign: 'center',
            lineHeight: '12px',
            minHeight: 24,
            maxWidth: 84,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {label}
        </Text>
      </Box>
    </Box>
  )
}

export default ShipPathPanelButton
