import { createContext, useContext, useState, useCallback } from 'react'
import { ships, detections as seedDetections } from '../data/mockData'

const ShipContext = createContext()

export function ShipProvider({ children }) {
  const [shipTabs, setShipTabs] = useState([])
  const [favoriteShipIds, setFavoriteShipIds] = useState([])
  const [activeShipTab, setActiveShipTab] = useState(null)
  const [openMapToolPanelsByTab, setOpenMapToolPanelsByTab] = useState({})
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedDetectionId, setSelectedDetectionId] = useState(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [mapDate, setMapDate] = useState(todayStr)
  const [activeDetectionId, setActiveDetectionId] = useState(null)
  const [previewDetectionId, setPreviewDetectionId] = useState(null)
  const [panelFocusDetectionId, setPanelFocusDetectionId] = useState(null)
  const [runtimeDetections, setRuntimeDetections] = useState(seedDetections)

  const openShipTab = useCallback((detection) => {
    const ship = ships[detection.shipId]
    if (!ship) return

    const existing = shipTabs.find((t) => t.id === ship.id)
    if (existing) {
      setActiveShipTab(ship.id)
      setSelectedDetectionId(detection.id)
    } else {
      setShipTabs((prev) => [...prev, { id: ship.id, name: ship.name }])
      setActiveShipTab(ship.id)
      setSelectedDetectionId(detection.id)
    }
  }, [shipTabs])

  const openStsTab = useCallback((shipId, partnerShipId, detectionType = 'sts', detectionId = null) => {
    const ship = ships[shipId]
    const partner = ships[partnerShipId]
    if (!ship || !partner) return

    const stsTabId = `sts-${shipId}-${partnerShipId}`
    const existing = shipTabs.find((t) => t.id === stsTabId)
    if (existing) {
      setActiveShipTab(stsTabId)
    } else {
      // Add STS tab but keep existing ship tabs so user can switch back
      setShipTabs((prev) => [
        ...prev,
        { id: stsTabId, name: 'Ship-to-Ship', type: 'sts', stsType: detectionType, shipIds: [shipId, partnerShipId] },
      ])
      setActiveShipTab(stsTabId)
    }
    if (detectionId) setSelectedDetectionId(detectionId)
  }, [shipTabs])

  const closeShipTab = useCallback((id) => {
    setShipTabs((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      if (id === activeShipTab && updated.length > 0) {
        setActiveShipTab(updated[0].id)
      } else if (updated.length === 0) {
        setActiveShipTab(null)
        setDetailPanelOpen(false)
      }
      return updated
    })
  }, [activeShipTab])

  const closeAllTabs = useCallback(() => {
    setShipTabs([])
    setActiveShipTab(null)
    setDetailPanelOpen(false)
    setOpenMapToolPanelsByTab({})
  }, [])

  const toggleMapToolPanel = useCallback((toolId) => {
    if (!toolId) return
    setOpenMapToolPanelsByTab((prev) => {
      // Use a special global key for tools that should persist across tabs
      const globalTools = prev['__global__'] || []
      const nextGlobalTools = globalTools.includes(toolId)
        ? globalTools.filter((id) => id !== toolId)
        : [...globalTools, toolId]
      return { ...prev, ['__global__']: nextGlobalTools }
    })
  }, [])

  const closeMapToolPanel = useCallback((toolId) => {
    if (!toolId) return
    setOpenMapToolPanelsByTab((prev) => {
      const globalTools = prev['__global__'] || []
      if (!globalTools.includes(toolId)) return prev
      const nextGlobalTools = globalTools.filter((id) => id !== toolId)
      return { ...prev, ['__global__']: nextGlobalTools }
    })
  }, [])

  const toggleFavoriteShip = useCallback((shipId) => {
    if (!shipId) return
    setFavoriteShipIds((prev) =>
      prev.includes(shipId)
        ? prev.filter((id) => id !== shipId)
        : [...prev, shipId]
    )
  }, [])

  return (
    <ShipContext.Provider
      value={{
        shipTabs,
        favoriteShipIds,
        activeShipTab,
        setActiveShipTab,
        openMapToolPanelsByTab,
        toggleMapToolPanel,
        closeMapToolPanel,
        toggleFavoriteShip,
        openShipTab,
        openStsTab,
        closeShipTab,
        closeAllTabs,
        detailPanelOpen,
        setDetailPanelOpen,
        selectedDetectionId,
        setSelectedDetectionId,
        mapDate,
        setMapDate,
        activeDetectionId,
        setActiveDetectionId,
        previewDetectionId,
        setPreviewDetectionId,
        panelFocusDetectionId,
        setPanelFocusDetectionId,
        runtimeDetections,
        setRuntimeDetections,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
