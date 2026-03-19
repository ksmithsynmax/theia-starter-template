import { useState } from 'react'
import { Box, Button, PasswordInput, Text, Title } from '@mantine/core'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'theia'

const PasswordGate = ({ onUnlock }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password === APP_PASSWORD) {
      setError('')
      onUnlock?.()
      return
    }

    setError('Incorrect password')
  }

  return (
    <Box className="password-gate">
      <Box
        component="form"
        className="password-gate-card"
        onSubmit={handleSubmit}
      >
        <Title order={3} style={{ color: '#fff', marginBottom: 6 }}>
          Enter Password
        </Title>
        <Text style={{ color: '#8D95AA', fontSize: 12, marginBottom: 14 }}>
          Please enter the password to continue.
        </Text>
        <PasswordInput
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder="Password"
          styles={{
            input: {
              background: '#181926',
              color: '#fff',
              border: '1px solid #393C56',
            },
          }}
        />
        {error && (
          <Text style={{ color: '#FF6B6B', fontSize: 12, marginTop: 10 }}>
            {error}
          </Text>
        )}
        <Button
          type="submit"
          style={{
            marginTop: 16,
            width: '100%',
            background: '#0094FF',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Unlock
        </Button>
      </Box>
    </Box>
  )
}

export default PasswordGate
