import { createContext, useContext, useState, useCallback } from 'react'
import { ships } from '../data/mockData'

const ShipContext = createContext()

export function ShipProvider({ children }) {
  const [shipTabs, setShipTabs] = useState([])
  const [activeShipTab, setActiveShipTab] = useState(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedDetectionId, setSelectedDetectionId] = useState(null)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [mapDate, setMapDate] = useState(todayStr)
  const [activeDetectionId, setActiveDetectionId] = useState(null)

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

  const openStsTab = useCallback((shipId, partnerShipId) => {
    const ship = ships[shipId]
    const partner = ships[partnerShipId]
    if (!ship || !partner) return

    const stsTabId = `sts-${shipId}-${partnerShipId}`
    const existing = shipTabs.find((t) => t.id === stsTabId)
    if (existing) {
      setActiveShipTab(stsTabId)
    } else {
      setShipTabs((prev) => [
        ...prev,
        { id: stsTabId, name: 'Ship-to-Ship', type: 'sts', shipIds: [shipId, partnerShipId] },
      ])
      setActiveShipTab(stsTabId)
    }
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
        openStsTab,
        closeShipTab,
        detailPanelOpen,
        setDetailPanelOpen,
        selectedDetectionId,
        setSelectedDetectionId,
        mapDate,
        setMapDate,
        activeDetectionId,
        setActiveDetectionId,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
