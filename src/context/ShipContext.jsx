import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { ships, detections as seedDetections } from '../data/mockData'
import {
  SHIP_FILTER_DEFAULTS,
  SHIP_FILTER_TO_DETECTION_TYPES,
  SHIP_FILTERED_TYPE_IDS,
} from '../constants/shipFilters'

const ShipContext = createContext()
const DAY_IN_MS = 24 * 60 * 60 * 1000

const ATTENTION_SIGNAL_TYPE_MAP = {
  dark: ['dark'],
  spoofing: ['spoofing'],
  sts: ['sts', 'sts-ais'],
  light: ['light'],
}

const ATTENTION_SIGNAL_LABELS = {
  dark: 'Dark',
  spoofing: 'Spoofing',
  sts: 'STS',
  light: 'Light',
}

const getAttentionSeverity = (events) => {
  const types = new Set(events.map((event) => event.type))
  if (types.has('spoofing')) return 'high'
  if (types.has('dark') || types.has('sts') || types.has('sts-ais')) return 'medium'
  return 'low'
}

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
  const [alertPreviewAreas, setAlertPreviewAreas] = useState([])
  const [attentionSetupOpen, setAttentionSetupOpen] = useState(false)
  const [attentionConfigured, setAttentionConfigured] = useState(false)
  const [attentionDismissed, setAttentionDismissed] = useState(false)
  const [attentionAois, setAttentionAois] = useState([])
  const [attentionSignals, setAttentionSignals] = useState({
    dark: true,
    spoofing: true,
    sts: false,
    light: false,
  })
  const [attentionSensitivity, setAttentionSensitivity] = useState('medium_high')
  const [attentionLookbackDays, setAttentionLookbackDays] = useState(14)
  const [attentionPinOnMap, setAttentionPinOnMap] = useState(true)
  const [attentionShowOnLogin, setAttentionShowOnLogin] = useState(true)
  const [attentionLinkAlerts, setAttentionLinkAlerts] = useState(false)
  const [attentionPanelOpen, setAttentionPanelOpen] = useState(true)

  // Port specific state
  const [activePortLevel, setActivePortLevel] = useState('Port Details')
  const [selectedTerminal, setSelectedTerminal] = useState(null)
  const [selectedBerth, setSelectedBerth] = useState(null)

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

  const openPortTab = useCallback((port) => {
    if (!port?.id) return

    setShipTabs((prev) => {
      if (prev.some((tab) => tab.id === port.id)) return prev
      return [...prev, { id: port.id, type: 'port', name: port.name, flag: port.flag }]
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

  const openAttentionSetup = useCallback(() => {
    setAttentionSetupOpen(true)
  }, [])

  const closeAttentionSetup = useCallback(() => {
    setAttentionSetupOpen(false)
  }, [])

  const saveAttentionSetup = useCallback(() => {
    setAttentionConfigured(true)
    setAttentionDismissed(false)
    setAttentionSetupOpen(false)
  }, [])

  const skipAttentionSetup = useCallback(() => {
    setAttentionDismissed(true)
    setAttentionSetupOpen(false)
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

  const attentionFeedItems = useMemo(() => {
    const activeSignalKeys = Object.entries(attentionSignals)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)
    if (!activeSignalKeys.length) return []

    const activeTypes = new Set(
      activeSignalKeys.flatMap((key) => ATTENTION_SIGNAL_TYPE_MAP[key] || [])
    )
    const latestDetectionTs = runtimeDetections.reduce((latestTs, detection) => {
      const ts = new Date(detection.date).getTime()
      if (!Number.isFinite(ts)) return latestTs
      return Math.max(latestTs, ts)
    }, 0)
    const lookbackWindowMs =
      Math.max(1, Number(attentionLookbackDays) || 14) * DAY_IN_MS

    const qualifyingDetections = runtimeDetections.filter((detection) => {
      if (!activeTypes.has(detection.type)) return false
      const ts = new Date(detection.date).getTime()
      if (!Number.isFinite(ts)) return false
      return latestDetectionTs - ts <= lookbackWindowMs
    })

    const byShip = qualifyingDetections.reduce((acc, detection) => {
      if (!detection.shipId || !ships[detection.shipId]) return acc
      const shipId = detection.shipId
      const current = acc[shipId] || {
        shipId,
        shipName: ships[shipId].name,
        events: [],
      }
      current.events.push(detection)
      acc[shipId] = current
      return acc
    }, {})

    return Object.values(byShip)
      .map((entry) => {
        const events = [...entry.events].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        const severity = getAttentionSeverity(events)
        const signalLabels = Array.from(
          new Set(
            events.map((event) => {
              const matchedSignal = Object.keys(ATTENTION_SIGNAL_TYPE_MAP).find(
                (signalKey) =>
                  ATTENTION_SIGNAL_TYPE_MAP[signalKey].includes(event.type)
              )
              return ATTENTION_SIGNAL_LABELS[matchedSignal] || event.type
            })
          )
        )
        const severityRank =
          severity === 'high' ? 3 : severity === 'medium' ? 2 : 1
        return {
          shipId: entry.shipId,
          shipName: entry.shipName,
          events,
          latestDetection: events[0],
          severity,
          severityRank,
          signalLabels,
          eventCount: events.length,
        }
      })
      .sort((a, b) => {
        if (a.severityRank !== b.severityRank) {
          return b.severityRank - a.severityRank
        }
        return (
          new Date(b.latestDetection?.date || 0).getTime() -
          new Date(a.latestDetection?.date || 0).getTime()
        )
      })
  }, [attentionSignals, runtimeDetections, attentionLookbackDays])

  const attentionReasonCounts = useMemo(() => {
    return attentionFeedItems.reduce((acc, item) => {
      item.signalLabels.forEach((label) => {
        acc[label] = (acc[label] || 0) + 1
      })
      return acc
    }, {})
  }, [attentionFeedItems])

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
        attentionSetupOpen,
        attentionConfigured,
        attentionDismissed,
        attentionAois,
        setAttentionAois,
        attentionSignals,
        setAttentionSignals,
        attentionSensitivity,
        setAttentionSensitivity,
        attentionLookbackDays,
        setAttentionLookbackDays,
        attentionPinOnMap,
        setAttentionPinOnMap,
        attentionShowOnLogin,
        setAttentionShowOnLogin,
        attentionLinkAlerts,
        setAttentionLinkAlerts,
        attentionPanelOpen,
        setAttentionPanelOpen,
        openAttentionSetup,
        closeAttentionSetup,
        saveAttentionSetup,
        skipAttentionSetup,
        attentionFeedItems,
        attentionReasonCounts,
        enabledDetectionTypes,
        filteredRuntimeDetections,
        activePortLevel,
        setActivePortLevel,
        selectedTerminal,
        setSelectedTerminal,
        selectedBerth,
        setSelectedBerth,
      }}
    >
      {children}
    </ShipContext.Provider>
  )
}

export function useShipContext() {
  return useContext(ShipContext)
}
