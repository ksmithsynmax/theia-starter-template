import React from 'react'
import { Box, Text, Title } from '@mantine/core'

const KeyValuePair = ({ keyName, value }) => {
  return (
    <Box>
      <Text style={{ color: '#888F9E', fontSize: '10px' }}>{keyName}</Text>
      <Text size="xs" style={{ color: 'white' }}>
        {value}
      </Text>
    </Box>
  )
}

export default KeyValuePair
