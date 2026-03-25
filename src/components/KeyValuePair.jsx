import React from 'react'
import { Box, Text, Title } from '@mantine/core'

const KeyValuePair = ({ keyName, value }) => {
  const isPrimitiveValue =
    typeof value === 'string' || typeof value === 'number'

  return (
    <Box>
      <Text style={{ 
        color: '#888F9E', 
        fontSize: '12px', 
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginBottom: '2px'
      }}>
        {keyName}
      </Text>
      {isPrimitiveValue ? (
        <Text
          size="sm"
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
