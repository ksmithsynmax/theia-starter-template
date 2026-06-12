import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { ships, detections as seedDetections } from '../data/mockData'
import { forYouItems as seedForYouItems } from '../data/forYouData'
import {
  SHIP_FILTER_DEFAULTS,
  SHIP_FILTER_TO_DETECTION_TYPES,
  SHIP_FILTERED_TYPE_IDS,
} from '../constants/shipFilters'

const ShipContext = createContext()

export function ShipProvider({ children }) {
  const [shipTabs, setShipTabs] = useState([])
  const [favoriteShipIds, setFavoriteShipIds] = useState([])
  const [favoritePorts, setFavoritePorts] = useState([])
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
  const [alertPreviewAreas, setAlertPreviewAreas] = useState([])

  // Port specific state
  const [activePortLevel, setActivePortLevel] = useState('Port Details')
  const [selectedTerminal, setSelectedTerminal] = useState(null)
  const [selectedBerth, setSelectedBerth] = useState(null)

  // Shape drawing / bookmarked shapes state
  // shapeDrawMode: null | 'polygon' (active drawing tool on the map)
  // pendingShape: a freshly drawn geometry awaiting a name before saving
  // bookmarkedShapes: shapes saved to bookmarks
  const [shapeDrawMode, setShapeDrawMode] = useState(null)
  const [pendingShape, setPendingShape] = useState(null)
  const [bookmarkedShapes, setBookmarkedShapes] = useState([])
  // IDs of saved shapes currently shown on the map. Saved shapes are hidden by
  // default and re-shown by clicking their row in the bookmarks table.
  const [visibleShapeIds, setVisibleShapeIds] = useState([])

  // "For You" curated feed. Tailored by implicit signals (seeded for the
  // prototype). The only user control is reactive: dismiss/mute an item.
  const [dismissedForYouIds, setDismissedForYouIds] = useState([])

  const dismissForYouItem = useCallback((itemId) => {
    if (!itemId) return
    setDismissedForYouIds((prev) =>
      prev.includes(itemId) ? prev : [...prev, itemId]
    )
  }, [])

  const forYouItems = useMemo(
    () => seedForYouItems.filter((item) => !dismissedForYouIds.includes(item.id)),
    [dismissedForYouIds]
  )

  const showShape = useCallback((shapeId) => {
    if (!shapeId) return
    setVisibleShapeIds((prev) =>
      prev.includes(shapeId) ? prev : [...prev, shapeId]
    )
  }, [])

  const hideShape = useCallback((shapeId) => {
    if (!shapeId) return
    setVisibleShapeIds((prev) => prev.filter((id) => id !== shapeId))
  }, [])

  const toggleShapeVisibility = useCallback((shapeId) => {
    if (!shapeId) return
    setVisibleShapeIds((prev) =>
      prev.includes(shapeId)
        ? prev.filter((id) => id !== shapeId)
        : [...prev, shapeId]
    )
  }, [])

  const startShapeDraw = useCallback((type = 'polygon') => {
    setPendingShape(null)
    setShapeDrawMode(type)
  }, [])

  const cancelShapeDraw = useCallback(() => {
    setShapeDrawMode(null)
    setPendingShape(null)
  }, [])

  // Called by the map once the user finishes drawing a shape.
  const completeShapeDraw = useCallback((shape) => {
    if (!shape) return
    setShapeDrawMode(null)
    setPendingShape(shape)
  }, [])

  const saveShape = useCallback(
    (name) => {
      if (!pendingShape) return null
      const trimmedName = String(name || '').trim() || 'Untitled shape'
      const savedShape = {
        id: `shape-${Date.now()}`,
        name: trimmedName,
        createdAt: new Date().toISOString(),
        ...pendingShape,
      }
      setBookmarkedShapes((prev) => [...prev, savedShape])
      setVisibleShapeIds((prev) => [...prev, savedShape.id])
      setPendingShape(null)
      setShapeDrawMode(null)
      return savedShape
    },
    [pendingShape]
  )

  const removeShape = useCallback((shapeId) => {
    if (!shapeId) return
    setBookmarkedShapes((prev) => prev.filter((shape) => shape.id !== shapeId))
    setVisibleShapeIds((prev) => prev.filter((id) => id !== shapeId))
  }, [])

  // Add an already-formed shape (e.g. promoting a "For You" area) to bookmarks.
  const addBookmarkedShape = useCallback((shape) => {
    if (!shape?.id) return
    setBookmarkedShapes((prev) =>
      prev.some((existing) => existing.id === shape.id) ? prev : [...prev, shape]
    )
  }, [])

  const openShipTab = useCallback((detection) => {
    if (!detection?.shipId) return
    const ship = ships[detection.shipId]
    if (!ship) return

    // Ships and shapes are mutually exclusive on the map: opening a ship hides
    // any shapes currently shown.
    setVisibleShapeIds([])
    setShipTabs((prev) => {
      if (prev.some((tab) => tab.id === ship.id)) return prev
      return [...prev, { id: ship.id, name: ship.name }]
    })
    setActiveShipTab(ship.id)
    if (detection.id != null) {
      setSelectedDetectionId(detection.id)
    }
  }, [])

  const openPortTab = useCallback((port) => {
    if (!port?.id) return

    // Ports and shapes are mutually exclusive on the map.
    setVisibleShapeIds([])
    setShipTabs((prev) => {
      if (prev.some((tab) => tab.id === port.id)) return prev
      return [
        ...prev,
        {
          ...port,
          id: port.id,
          type: 'port',
          name: port.name,
          flag: port.flag,
        },
      ]
    })
    setActiveShipTab(port.id)
    setActivePortLevel('Port Details')
    setSelectedTerminal(null)
    setSelectedBerth(null)
    setDetailPanelOpen(true)
  }, [])

  const openStsTab = useCallback(
    (shipId, partnerShipId, detectionType = 'sts', detectionId = null) => {
      const ship = ships[shipId]
      const partner = ships[partnerShipId]
      if (!ship || !partner) return

      // Ships and shapes are mutually exclusive on the map.
      setVisibleShapeIds([])
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
    },
    []
  )

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

  const closeShipTab = useCallback(
    (id) => {
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
    },
    [activeShipTab]
  )

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

  // Dev helper: fill Favorites/Bookmarks with sample ships, ports, and shapes so
  // the panel doesn't have to be populated by hand every time while testing.
  const seedFavoritesForTesting = useCallback(() => {
    setFavoriteShipIds((prev) => {
      const merged = new Set(prev)
      ;['invictus', 'tiffani', 'celestine', 'wisdom-star'].forEach((id) =>
        merged.add(id)
      )
      return [...merged]
    })
    setFavoritePorts((prev) => {
      const samples = [
        { id: 'port-dubai', name: 'Dubai', flag: '\u{1F1E6}\u{1F1EA}' },
        { id: 'port-muscat', name: 'Muscat', flag: '\u{1F1F4}\u{1F1F2}' },
        { id: 'port-fujairah', name: 'Fujairah', flag: '\u{1F1E6}\u{1F1EA}' },
      ]
      const existing = new Set(prev.map((p) => p.id))
      return [...prev, ...samples.filter((p) => !existing.has(p.id))]
    })
    setBookmarkedShapes((prev) => {
      const now = new Date().toISOString()
      const samples = [
        {
          id: 'shape-hormuz',
          name: 'Strait of Hormuz watch',
          type: 'polygon',
          createdAt: now,
          coordinates: [
            [55.9, 26.1],
            [57.1, 26.1],
            [57.1, 27.0],
            [55.9, 27.0],
            [55.9, 26.1],
          ],
        },
        {
          id: 'shape-gulf-oman',
          name: 'Gulf of Oman box',
          type: 'polygon',
          createdAt: now,
          coordinates: [
            [58.5, 22.5],
            [61.5, 22.5],
            [61.5, 24.5],
            [58.5, 24.5],
            [58.5, 22.5],
          ],
        },
        {
          id: 'shape-arabian-sea',
          name: 'Arabian Sea zone',
          type: 'polygon',
          createdAt: now,
          coordinates: [
            [59.0, 15.0],
            [63.0, 15.0],
            [63.0, 18.0],
            [59.0, 18.0],
            [59.0, 15.0],
          ],
        },
      ]
      const existing = new Set(prev.map((s) => s.id))
      return [...prev, ...samples.filter((s) => !existing.has(s.id))]
    })
  }, [])

  const toggleFavoritePort = useCallback((port) => {
    if (!port?.id) return
    setFavoritePorts((prev) => {
      const alreadyFavorited = prev.some((favoritePort) => favoritePort.id === port.id)
      if (alreadyFavorited) {
        return prev.filter((favoritePort) => favoritePort.id !== port.id)
      }
      return [...prev, { ...port }]
    })
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
        favoritePorts,
        activeShipTab,
        setActiveShipTab,
        openMapToolPanelsByTab,
        toggleMapToolPanel,
        closeMapToolPanel,
        toggleFavoriteShip,
        toggleFavoritePort,
        seedFavoritesForTesting,
        openShipTab,
        openPortTab,
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
        alertPreviewAreas,
        setAlertPreviewAreas,
        enabledDetectionTypes,
        filteredRuntimeDetections,
        activePortLevel,
        setActivePortLevel,
        selectedTerminal,
        setSelectedTerminal,
        selectedBerth,
        setSelectedBerth,
        shapeDrawMode,
        pendingShape,
        bookmarkedShapes,
        visibleShapeIds,
        startShapeDraw,
        cancelShapeDraw,
        completeShapeDraw,
        saveShape,
        removeShape,
        addBookmarkedShape,
        showShape,
        hideShape,
        toggleShapeVisibility,
        forYouItems,
        dismissForYouItem,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
