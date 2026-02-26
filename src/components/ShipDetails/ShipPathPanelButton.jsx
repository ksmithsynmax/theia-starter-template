import { Box, Text } from '@mantine/core'

const ShipPathPanelButton = ({ icon, label }) => {
  return (
    <Box
      style={{
        flex: 1,
        borderRadius: 6,
        padding: 2,
        background: 'linear-gradient(180deg, rgba(0, 148, 255, 0.35) 0%, rgba(13, 51, 92, 0.2) 100%)',
        cursor: 'pointer',
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 12,
          borderRadius: 4,
          height: 72,
          background:
            'linear-gradient(180deg, #0D335C 0%, #0870B8 100%)',
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Text
          style={{
            fontSize: 10,
            color: '#fff',
            textAlign: 'center',
            lineHeight: '12px',
            minHeight: 24,
            maxWidth: 60,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {label}
        </Text>
      </Box>
    </Box>
  )
}

export default ShipPathPanelButton
