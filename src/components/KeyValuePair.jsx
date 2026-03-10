import React from 'react'
import { Box, Text, Title } from '@mantine/core'

const KeyValuePair = ({ keyName, value }) => {
  const isPrimitiveValue =
    typeof value === 'string' || typeof value === 'number'

  return (
    <Box>
      <Text style={{ color: '#888F9E', fontSize: '10px', whiteSpace: 'nowrap' }}>
        {keyName}
      </Text>
      {isPrimitiveValue ? (
        <Text
          size="xs"
          style={{
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Text>
      ) : (
        <Box style={{ color: 'white' }}>{value}</Box>
      )}
    </Box>
  )
}

export default KeyValuePair
