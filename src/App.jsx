import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { ShipProvider } from './context/ShipContext'
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
import PasswordGate from './pages/PasswordGate'
import './App.css'

const AUTH_STORAGE_KEY = 'theia.password.unlocked'

function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })

  const handleUnlock = () => {
    setIsUnlocked(true)
    window.localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }

  return (
    <ShipProvider>
      <BrowserRouter>
        <Routes>
          {isUnlocked ? (
            <>
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
              <Route
                path="/login"
                element={<Navigate to="/myships" replace />}
              />
            </>
          ) : (
            <>
              <Route
                path="/login"
                element={<PasswordGate onUnlock={handleUnlock} />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ShipProvider>
  )
}

export default App
