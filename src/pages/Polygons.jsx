import { Box, Text } from '@mantine/core'

function Polygons() {
  return (
    <Box style={{ padding: '20px' }}>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 36,
          fontWeight: 600,
          lineHeight: 1.15,
          marginBottom: 8,
        }}
      >
        Polygons
      </Text>
      <Text style={{ color: '#8D93A8', fontSize: 14, lineHeight: '20px' }}>
        Polygon tools are temporarily hidden.
      </Text>
    </Box>
  )
}

export default Polygons
