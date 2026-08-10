import { useState } from 'react'
import { Box, Text, Tooltip } from '@mantine/core'

const ShipPathPanelButton = ({
  icon,
  label,
  disabled,
  active = false,
  onClick,
  fullWidth = false,
  singleLineLabel = false,
  compact = false,
  iconOnly = false,
  horizontal = false,
  lightweight = false,
}) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const isHighlighted = hovered || active

  const button = (
    <Box
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? label : undefined}
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
        width: iconOnly ? (fullWidth ? 'auto' : 44) : fullWidth ? '100%' : 102,
        height: lightweight ? 40 : iconOnly || horizontal ? 44 : compact ? 56 : 72,
        flexShrink: iconOnly && !fullWidth ? 0 : undefined,
        flex: iconOnly && fullWidth ? '1 1 0' : undefined,
        border: lightweight
          ? `1px solid ${active ? '#0094FF' : hovered ? '#4C5070' : '#393C56'}`
          : active
            ? '1px solid #8ED2FF'
            : '1px solid transparent',
        borderRadius: 4,
        background: lightweight
          ? disabled
            ? 'rgba(255, 255, 255, 0.02)'
            : active
              ? 'rgba(0, 148, 255, 0.16)'
              : hovered
                ? '#2D3048'
                : 'rgba(255, 255, 255, 0.04)'
          : disabled
            ? '#2A2D3E'
            : isHighlighted
              ? 'linear-gradient(180deg, #0078CC -59.18%, #0A2A4A 100.54%) padding-box, linear-gradient(180deg, #0078CC, #0A2A4A) border-box'
              : 'linear-gradient(180deg, #0094FF -59.18%, #0D335C 100.54%) padding-box, linear-gradient(180deg, #0094FF, #0D335C) border-box',
        backgroundClip:
          lightweight || disabled ? 'border-box' : 'padding-box, border-box',
        boxShadow: lightweight
          ? active
            ? '0 0 0 1px rgba(0, 148, 255, 0.3)'
            : 'none'
          : disabled
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
          flexDirection: horizontal ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: horizontal ? 8 : compact ? 4 : 8,
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
        {!iconOnly && (
          <Text
            style={{
              fontSize: horizontal ? 9.5 : 10,
              color: '#fff',
              fontWeight: active ? 700 : 500,
              textAlign: 'center',
              lineHeight: '12px',
              minHeight: singleLineLabel ? 0 : 24,
              maxWidth: horizontal ? 'calc(100% - 24px)' : singleLineLabel ? '100%' : 84,
              display: singleLineLabel ? 'block' : '-webkit-box',
              WebkitLineClamp: singleLineLabel ? 'unset' : 2,
              WebkitBoxOrient: singleLineLabel ? 'unset' : 'vertical',
              whiteSpace: singleLineLabel ? 'nowrap' : 'normal',
              overflow: 'hidden',
              textOverflow: singleLineLabel ? 'ellipsis' : 'clip',
            }}
          >
            {label}
          </Text>
        )}
      </Box>
    </Box>
  )

  return iconOnly ? (
    <Tooltip label={label} withArrow openDelay={200} zIndex={3000}>
      {button}
    </Tooltip>
  ) : (
    button
  )
}

export default ShipPathPanelButton
