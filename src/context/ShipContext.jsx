import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { ships, detections as seedDetections } from '../data/mockData'
import {
  SHIP_FILTER_DEFAULTS,
  SHIP_FILTER_TO_DETECTION_TYPES,
  SHIP_FILTERED_TYPE_IDS,
} from '../constants/shipFilters'

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
  const [shipFilters, setShipFilters] = useState(SHIP_FILTER_DEFAULTS)
  const [showLegendOnMap, setShowLegendOnMap] = useState(false)

  const openShipTab = useCallback((detection) => {
    if (!detection?.shipId) return
    const ship = ships[detection.shipId]
    if (!ship) return

    setShipTabs((prev) => {
      if (prev.some((tab) => tab.id === ship.id)) return prev
      return [...prev, { id: ship.id, name: ship.name }]
    })
    setActiveShipTab(ship.id)
    if (detection.id != null) {
      setSelectedDetectionId(detection.id)
    }
  }, [])

  const openStsTab = useCallback((shipId, partnerShipId, detectionType = 'sts', detectionId = null) => {
    const ship = ships[shipId]
    const partner = ships[partnerShipId]
    if (!ship || !partner) return

    const stsTabId = `sts-${shipId}-${partnerShipId}`
    setShipTabs((prev) => {
      if (prev.some((tab) => tab.id === stsTabId)) return prev
      // Add STS tab but keep existing ship tabs so user can switch back
      return [
        ...prev,
        {
          id: stsTabId,
          name: 'Ship-to-Ship',
          type: 'sts',
          stsType: detectionType,
          shipIds: [shipId, partnerShipId],
        },
      ]
    })
    setActiveShipTab(stsTabId)
    if (detectionId) setSelectedDetectionId(detectionId)
  }, [])

  const selectDetection = useCallback(
    (detection, options = {}) => {
      if (!detection?.id) return
      const { source = 'unknown', allowTabSwitch = true } = options
      const isStsDetection =
        (detection.type === 'sts' || detection.type === 'sts-ais') &&
        Boolean(detection.stsPartner)

      if (allowTabSwitch) {
        if (isStsDetection) {
          openStsTab(
            detection.shipId,
            detection.stsPartner,
            detection.type,
            detection.id
          )
        } else {
          openShipTab(detection)
        }
      } else {
        setSelectedDetectionId(detection.id)
      }

      // Keep map focus and panel focus aligned with the same chosen detection.
      setActiveDetectionId(detection.id)
      setPreviewDetectionId(null)
      setPanelFocusDetectionId(detection.id)

      if (source === 'map') {
        setDetailPanelOpen(true)
      }
    },
    [openShipTab, openStsTab]
  )

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

  const setShipFilterChecked = useCallback((filterId, isChecked) => {
    setShipFilters((prev) => ({ ...prev, [filterId]: isChecked }))
  }, [])

  const setShipFiltersBulk = useCallback((updates) => {
    setShipFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetShipFilters = useCallback(() => {
    setShipFilters(SHIP_FILTER_DEFAULTS)
    setShowLegendOnMap(false)
  }, [])

  const enabledDetectionTypes = useMemo(() => {
    const enabled = new Set()
    SHIP_FILTERED_TYPE_IDS.forEach((filterId) => {
      if (!shipFilters[filterId]) return
      const mappedTypes = SHIP_FILTER_TO_DETECTION_TYPES[filterId] || []
      mappedTypes.forEach((type) => enabled.add(type))
    })
    return enabled
  }, [shipFilters])

  const filteredRuntimeDetections = useMemo(() => {
    if (enabledDetectionTypes.size === 0) return []
    return runtimeDetections.filter((detection) =>
      enabledDetectionTypes.has(detection.type)
    )
  }, [runtimeDetections, enabledDetectionTypes])

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
        selectDetection,
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
        shipFilters,
        setShipFilterChecked,
        setShipFiltersBulk,
        resetShipFilters,
        showLegendOnMap,
        setShowLegendOnMap,
        enabledDetectionTypes,
        filteredRuntimeDetections,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
