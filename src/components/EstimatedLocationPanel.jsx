import React from 'react'
import { Box, Text, TextInput, Button } from '@mantine/core'
import { Calendar } from '@untitledui/icons'

const EstimatedLocationPanel = () => {
  return (
    <Box style={{ padding: 20 }}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto',
          gap: 16,
          alignItems: 'end',
        }}
      >
        <Box>
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
            Start Date
          </Text>
          <TextInput
            defaultValue="Mar 23, 2026"
            rightSection={
              <Calendar style={{ width: 16, height: 16, color: '#fff' }} />
            }
            styles={{
              input: {
                background: '#0A0E19',
                borderColor: '#424750',
                color: '#fff',
                fontSize: 12,
              },
            }}
          />
        </Box>
        <Box>
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 8 }}>
            End Date
          </Text>
          <TextInput
            defaultValue="Mar 23, 2026"
            rightSection={
              <Calendar style={{ width: 16, height: 16, color: '#fff' }} />
            }
            styles={{
              input: {
                background: '#0A0E19',
                borderColor: '#424750',
                color: '#fff',
                fontSize: 12,
              },
            }}
          />
        </Box>
        <Button
          style={{
            background: '#0094ff',
            height: 36,
            fontSize: 14,
            fontWeight: 500,
            padding: '0 24px',
          }}
        >
          View
        </Button>
      </Box>
    </Box>
  )
}

export default EstimatedLocationPanel
