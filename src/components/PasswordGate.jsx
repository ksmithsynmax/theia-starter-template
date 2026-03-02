import { useState } from 'react'
import { Box, PasswordInput, Button, Text } from '@mantine/core'

const PASSWORD = 'TheiaProductTesting'

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('theia-auth') === 'true'
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value === PASSWORD) {
      sessionStorage.setItem('theia-auth', 'true')
      setAuthenticated(true)
    } else {
      setError(true)
    }
  }

  if (authenticated) return children

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#111326',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{
          background: '#24263C',
          border: '1px solid #393C56',
          borderRadius: 8,
          padding: 32,
          width: 380,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <Text style={{ color: '#898f9d', fontSize: 13 }}>
          Enter password to continue
        </Text>
        <PasswordInput
          value={value}
          onChange={(e) => { setValue(e.currentTarget.value); setError(false) }}
          placeholder="Password"
          error={error ? 'Incorrect password' : undefined}
          autoFocus
          styles={{
            input: {
              background: '#181926',
              border: '1px solid #393C56',
              color: '#fff',
            },
            innerInput: {
              color: '#fff',
            },
            visibilityToggle: {
              color: '#898f9d',
              '&:hover': { color: '#fff' },
            },
            wrapper: { width: '100%' },
            root: { width: '100%' },
          }}
        />
        <Button
          type="submit"
          fullWidth
          style={{
            backgroundColor: '#0094FF',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 14,
            transform: 'none',
          }}
        >
          Enter
        </Button>
      </Box>
    </Box>
  )
}
