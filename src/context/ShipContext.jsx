import { createContext, useContext, useState, useCallback } from 'react'
import { ships } from '../data/mockData'

const ShipContext = createContext()

export function ShipProvider({ children }) {
  const [shipTabs, setShipTabs] = useState([])
  const [activeShipTab, setActiveShipTab] = useState(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedDetectionId, setSelectedDetectionId] = useState(null)

  const openShipTab = useCallback((detection) => {
    const ship = ships[detection.shipId]
    if (!ship) return

    const existing = shipTabs.find((t) => t.id === ship.id)
    if (existing) {
      setActiveShipTab(ship.id)
    } else {
      setShipTabs((prev) => [...prev, { id: ship.id, name: ship.name }])
      setActiveShipTab(ship.id)
    }
    setSelectedDetectionId(detection.id)
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

  return (
    <ShipContext.Provider
      value={{
        shipTabs,
        activeShipTab,
        setActiveShipTab,
        openShipTab,
        closeShipTab,
        detailPanelOpen,
        setDetailPanelOpen,
        selectedDetectionId,
        setSelectedDetectionId,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
