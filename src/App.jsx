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
