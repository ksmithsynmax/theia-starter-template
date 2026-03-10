import { useState } from 'react'
import { PasswordInput } from '@mantine/core'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Myships from './pages/Myships'
import Alerts from './pages/Alerts'
import Events from './pages/Events'
import TipCue from './pages/TipCue'
import SimilarSearch from './pages/SimilarSearch'
import Osint from './pages/Osint'
import Webcams from './pages/Webcams'
import Polygons from './pages/Polygons'
import Ports from './pages/Ports'
import './App.css'

function App() {
  const prototypePassword = import.meta.env.VITE_PROTOTYPE_PASSWORD
  const storageKey = 'theia-prototype-auth'
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(storageKey) === 'ok'
  )

  const handlePasswordSubmit = (event) => {
    event.preventDefault()

    if (!prototypePassword) {
      setPasswordError('Password is not configured.')
      return
    }

    if (passwordInput === prototypePassword) {
      sessionStorage.setItem(storageKey, 'ok')
      setIsAuthenticated(true)
      setPasswordError('')
      return
    }

    setPasswordError('Incorrect password.')
  }

  if (!isAuthenticated) {
    return (
      <div className="prototype-lock">
        <form className="prototype-lock-card" onSubmit={handlePasswordSubmit}>
          <p className="prototype-lock-title">Enter password to continue</p>
          <PasswordInput
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            placeholder="Password"
            visibilityToggleLabel={showPassword ? 'Hide password' : 'Show password'}
            visible={showPassword}
            onVisibilityChange={setShowPassword}
            styles={{
              input: {
                border: '1px solid #393C56',
                background: '#181926',
                color: '#ffffff',
                borderRadius: 4,
                fontSize: 14,
              },
              innerInput: {
                color: '#ffffff',
              },
              visibilityToggle: {
                color: '#8D95AA',
              },
            }}
          />
          {passwordError && (
            <p className="prototype-lock-error">{passwordError}</p>
          )}
          <button type="submit" className="prototype-lock-button">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/myships" replace />} />
          <Route path="myships" element={<Myships />} />
          <Route path="ports" element={<Ports />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="events" element={<Events />} />
          <Route path="tip-cue" element={<TipCue />} />
          <Route path="similarsearch" element={<SimilarSearch />} />
          <Route path="osint" element={<Osint />} />
          <Route path="webcams" element={<Webcams />} />
          <Route path="polygons" element={<Polygons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
