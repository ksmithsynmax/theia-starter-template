import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Box,
  Text,
  Title,
  Loader,
  Menu,
  Tooltip,
  Checkbox,
  Modal,
  Button,
} from '@mantine/core'
import KeyValuePair from '../components/KeyValuePair'
import {
  File02,
  Star01,
  Copy02,
  XClose,
  ChevronDown,
  List,
  MarkerPin01,
} from '@untitledui/icons'
import AlertIcon from '../custom-icons/AlertIcon'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LighShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import UnattributedIcon from '../custom-icons/UnattributedIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
import STSAisIcon from '../custom-icons/STSAisIcon'
import ShipIcon from '../custom-icons/ShipIcon'
import EnlargeVerticalIcon from '../custom-icons/EnlargeVerticalIcon'
import ShipDetailsPanel from '../components/ShipDetails/ShipDetailsPanel'
import EventTimelineCard from '../components/ShipDetails/EventTimelineCard'
import { useShipContext } from '../context/ShipContext'
import { ships, detections } from '../data/mockData'
import satImageA from '../assets/HAfSz3HbAAA34GM.jpeg'
import satImageB from '../assets/Baniyas_27-July-2021_WV2_single-ship.jpg'
import satImageC from '../assets/b7305b3c008782765e2f14920270f2e7834f0f17.jpg'
import satImageD from '../assets/e92d7378215156c8a7c8c4c73d773963c71bd6b1-1920x1080.avif'

const detailTabs = [
  'Event Timeline',
  'Sat. Imagery Timeline',
  'Ship Information',
]
const GO_TO_DATE_WARNING_PREF_KEY = 'myships.skipGoToDateWarning'
const GO_TO_DATE_CONFIRM_DELAY_MS = 420
const GO_TO_DATE_MODAL_TRANSITION_MS = 220
const TIMELINE_MIN_HEIGHT = 260
const NEW_LAST_KNOWN_DOT_DELAY_MS = 20_000
const NEW_LAST_KNOWN_DOT_FLASH_MS = 700
const formatPrototypeDetectionDate = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`
}
const parseFiniteNumber = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
const getDetectionDateKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

// Keep drag-resize code for possible future re-enable.
const ENABLE_TIMELINE_DRAG = true
const SATELLITE_TIMELINE_IMAGES = [satImageA, satImageB, satImageC, satImageD]
const SHIP_OWNERSHIP = {
  invictus: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'Gard',
    member: 'No Info',
  },
  tiffani: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'NorthStandard',
    member: 'KHALID FARAJ SHIPPING',
  },
  celestine: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'Skuld',
    member: 'No Info',
  },
  'meridian-star': {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'West of England',
    member: 'No Info',
  },
  'wisdom-star': {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'NorthStandard',
    member: 'KHALID FARAJ SHIPPING',
  },
  unknown: {
    commercialOwner: 'No Info',
    effectiveOwner: 'No Info',
    financialOwner: 'No Info',
    technicalOwner: 'No Info',
    pniClub: 'No Info',
    member: 'No Info',
  },
}

const TIMELINE_CONTEXT_EVENTS = {
  invictus: [
    {
      id: 'invictus-port-1',
      variant: 'port',
      dateLabel: 'Mar 11, 2026 15:10',
      sortDate: '2026-03-11T15:10:00Z',
      port: 'IMMINGHAM',
      status: 'Ongoing',
      duration: '0h 0m',
    },
    {
      id: 'invictus-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 11, 2026 12:20',
      sortDate: '2026-03-11T12:20:00Z',
      newFlag: 'Turkey 🇹🇷',
      previousFlag: 'China 🇨🇳',
    },
  ],
  tiffani: [
    {
      id: 'tiffani-port-1',
      variant: 'port',
      dateLabel: 'Mar 12, 2026 18:00',
      sortDate: '2026-03-12T18:00:00Z',
      port: 'FUJAIRAH',
      status: 'Completed',
      duration: '16h 20m',
    },
    {
      id: 'tiffani-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 12, 2026 15:10',
      sortDate: '2026-03-12T15:10:00Z',
      newFlag: 'Liberia 🇱🇷',
      previousFlag: 'Panama 🇵🇦',
    },
  ],
  'wisdom-star': [
    {
      id: 'wisdom-port-1',
      variant: 'port',
      dateLabel: 'Mar 11, 2026 10:10',
      sortDate: '2026-03-11T10:10:00Z',
      port: 'JEBEL ALI',
      status: 'Ongoing',
      duration: '8h 10m',
    },
    {
      id: 'wisdom-flag-1',
      variant: 'flag',
      dateLabel: 'Mar 11, 2026 08:50',
      sortDate: '2026-03-11T08:50:00Z',
      newFlag: 'Marshall Islands 🇲🇭',
      previousFlag: 'Palau 🇵🇼',
    },
  ],
}

function Myships() {
  const {
    shipTabs,
    activeShipTab,
    setActiveShipTab,
    closeShipTab,
    closeAllTabs,
    openShipTab,
    openStsTab,
    selectedDetectionId,
    setSelectedDetectionId,
    mapDate,
    setMapDate,
    setActiveDetectionId,
    setPreviewDetectionId,
  } = useShipContext()
  const [tabState, setTabState] = useState({})
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [activeStsShip, setActiveStsShip] = useState(0)
  const [loading, setLoading] = useState(false)
  const [overflowLeft, setOverflowLeft] = useState(false)
  const [overflowRight, setOverflowRight] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)
  const [isResizingTimeline, setIsResizingTimeline] = useState(false)
  const [isDragHandleHovered, setIsDragHandleHovered] = useState(false)
  const [topSectionHeight, setTopSectionHeight] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [hoveredCopyField, setHoveredCopyField] = useState(null)
  const [hoveredSatelliteCardId, setHoveredSatelliteCardId] = useState(null)
  const [satSortByTab, setSatSortByTab] = useState({})
  const [newLastKnownDotByShip, setNewLastKnownDotByShip] = useState({})
  const [pendingLastKnownDetectionByShip, setPendingLastKnownDetectionByShip] =
    useState({})
  const [appliedLastKnownDetectionByShip, setAppliedLastKnownDetectionByShip] =
    useState({})
  const [isNewLastKnownDotFlashOn, setIsNewLastKnownDotFlashOn] = useState(true)
  const [isTopSummaryCollapsed, setIsTopSummaryCollapsed] = useState(false)
  const [hoveredTopAction, setHoveredTopAction] = useState(null)
  const [detailToolsVisible, setDetailToolsVisible] = useState(true)
  const [showGoToDateModal, setShowGoToDateModal] = useState(false)
  const [dontShowGoToDateAgain, setDontShowGoToDateAgain] = useState(false)
  const [skipGoToDateWarning, setSkipGoToDateWarning] = useState(false)
  const [pendingGoToDate, setPendingGoToDate] = useState(null)
  const [goToDateSubmitting, setGoToDateSubmitting] = useState(false)
  const [goToDateCancelHovered, setGoToDateCancelHovered] = useState(false)
  const [goToDateConfirmHovered, setGoToDateConfirmHovered] = useState(false)
  const loadedTabsRef = useRef(new Set())
  const cardRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const tabScrollRef = useRef(null)
  const prevMapDateRef = useRef(mapDate)
  const panelContainerRef = useRef(null)
  const topSectionRef = useRef(null)
  const topSummaryHeaderRef = useRef(null)
  const lastExpandedTopHeightRef = useRef(null)
  const copyFeedbackTimerRef = useRef(null)
  const goToDateTimerRef = useRef(null)
  const goToDateCloseTimerRef = useRef(null)
  const newLastKnownDotTimersRef = useRef({})
  const nextSimulatedDetectionIdRef = useRef(
    detections.reduce((maxId, d) => {
      const parsedId = Number(d.id)
      return Number.isFinite(parsedId) ? Math.max(maxId, parsedId) : maxId
    }, 0) + 1000
  )
  const allDetections = useMemo(
    () => [...Object.values(appliedLastKnownDetectionByShip), ...detections],
    [appliedLastKnownDetectionByShip]
  )

  const updateOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setOverflowLeft(el.scrollLeft > 0)
    setOverflowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const getMinTopHeight = useCallback(() => {
    const FALLBACK_MIN = 96
    if (!topSummaryHeaderRef.current || !topSectionRef.current)
      return FALLBACK_MIN

    const headerRect = topSummaryHeaderRef.current.getBoundingClientRect()
    const topSectionStyles = window.getComputedStyle(topSectionRef.current)
    const headerStyles = window.getComputedStyle(topSummaryHeaderRef.current)

    const paddingTop = parseFloat(topSectionStyles.paddingTop) || 0
    const paddingBottom = parseFloat(topSectionStyles.paddingBottom) || 0
    const marginBottom = parseFloat(headerStyles.marginBottom) || 0

    return Math.ceil(
      headerRect.height + paddingTop + paddingBottom + marginBottom
    )
  }, [])

  const getTopSectionBounds = useCallback(() => {
    if (!panelContainerRef.current) return null
    const rect = panelContainerRef.current.getBoundingClientRect()
    const maxTopHeight = Math.max(0, rect.height - TIMELINE_MIN_HEIGHT)
    const minTopHeight = Math.min(getMinTopHeight(), maxTopHeight)
    return { minTopHeight, maxTopHeight }
  }, [getMinTopHeight])

  const getPreferredExpandedTopHeight = useCallback(
    (minTopHeight, maxTopHeight) => {
      const naturalHeight = topSectionRef.current?.scrollHeight ?? maxTopHeight
      const preferredHeight = lastExpandedTopHeightRef.current ?? naturalHeight
      return Math.max(minTopHeight, Math.min(maxTopHeight, preferredHeight))
    },
    []
  )

  const applyGoToDate = useCallback(
    (dateKey, detectionId) => {
      const sourceDetection = allDetections.find((d) => d.id === detectionId)
      const sourceShipId = sourceDetection?.shipId
      const sourceType = sourceDetection?.type
      const shipDetectionsForDate = sourceShipId
        ? allDetections
            .filter(
              (d) =>
                d.shipId === sourceShipId &&
                getDetectionDateKey(d.date) === dateKey
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        : []
      const resolvedDetection =
        shipDetectionsForDate.find((d) => d.type === 'ais') ||
        shipDetectionsForDate.find((d) => d.type === sourceType) ||
        shipDetectionsForDate[0] ||
        sourceDetection
      const resolvedDetectionId = resolvedDetection?.id ?? detectionId

      setMapDate(dateKey)
      setPreviewDetectionId(null)
      if (activeShipTab) {
        setTabState((prev) => ({
          ...prev,
          [activeShipTab]: {
            ...prev[activeShipTab],
            selectedCard: resolvedDetectionId,
            previewCards: [],
            activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0,
          },
        }))
      }
      // Force refocus even if this detection is already active.
      setActiveDetectionId(null)
      window.setTimeout(() => {
        setActiveDetectionId(resolvedDetectionId)
      }, 0)
    },
    [
      activeShipTab,
      allDetections,
      setMapDate,
      setActiveDetectionId,
      setPreviewDetectionId,
    ]
  )

  const requestGoToDate = useCallback(
    (dateKey, detectionId, dateLabel) => {
      if (skipGoToDateWarning) {
        applyGoToDate(dateKey, detectionId)
        return
      }
      setDontShowGoToDateAgain(false)
      setPendingGoToDate({ dateKey, detectionId, dateLabel })
      setShowGoToDateModal(true)
    },
    [skipGoToDateWarning, applyGoToDate]
  )

  const closeGoToDateModal = useCallback((onClosed) => {
    setShowGoToDateModal(false)
    if (goToDateCloseTimerRef.current) {
      window.clearTimeout(goToDateCloseTimerRef.current)
    }
    goToDateCloseTimerRef.current = window.setTimeout(() => {
      setPendingGoToDate(null)
      setGoToDateSubmitting(false)
      onClosed?.()
      goToDateCloseTimerRef.current = null
    }, GO_TO_DATE_MODAL_TRANSITION_MS)
  }, [])

  useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    updateOverflow()
    el.addEventListener('scroll', updateOverflow)
    const ro = new ResizeObserver(updateOverflow)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateOverflow)
      ro.disconnect()
    }
  }, [updateOverflow, shipTabs])

  useEffect(() => {
    try {
      const pref = window.localStorage.getItem(GO_TO_DATE_WARNING_PREF_KEY)
      if (pref === 'true') setSkipGoToDateWarning(true)
    } catch {
      // Ignore storage access issues and default to showing warning.
    }
  }, [])

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        window.clearTimeout(copyFeedbackTimerRef.current)
      }
      if (goToDateTimerRef.current) {
        window.clearTimeout(goToDateTimerRef.current)
      }
      if (goToDateCloseTimerRef.current) {
        window.clearTimeout(goToDateCloseTimerRef.current)
      }
      Object.values(newLastKnownDotTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      newLastKnownDotTimersRef.current = {}
    }
  }, [])

  useEffect(() => {
    const flashTimer = window.setInterval(() => {
      setIsNewLastKnownDotFlashOn((prev) => !prev)
    }, NEW_LAST_KNOWN_DOT_FLASH_MS)
    return () => window.clearInterval(flashTimer)
  }, [])

  const handleCopyToClipboard = useCallback((value, fieldKey) => {
    if (!value) return
    navigator.clipboard.writeText(String(value)).catch(() => {
      // Ignore clipboard permission issues in prototype mode.
    })
    setCopiedField(fieldKey)
    if (copyFeedbackTimerRef.current) {
      window.clearTimeout(copyFeedbackTimerRef.current)
    }
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev))
      copyFeedbackTimerRef.current = null
    }, 1200)
  }, [])

  useEffect(() => {
    if (mapDate === prevMapDateRef.current) return
    prevMapDateRef.current = mapDate
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (mapDate === todayStr && activeShipTab) {
      const tab = shipTabs.find((t) => t.id === activeShipTab)
      const shipId = tab?.type === 'sts' ? tab.shipIds[0] : activeShipTab
      const latest = allDetections
        .filter((d) => d.shipId === shipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      setFlashEnabled(true)
      setActiveDetectionId(null)
      setPreviewDetectionId(null)
      setTabState((prev) => ({
        ...prev,
        [activeShipTab]: {
          ...prev[activeShipTab],
          selectedCard: latest?.id ?? null,
          previewCards: [],
        },
      }))
    }
  }, [
    mapDate,
    activeShipTab,
    allDetections,
    setActiveDetectionId,
    setPreviewDetectionId,
  ])

  const currentTabState = tabState[activeShipTab] || {
    selectedCard: null,
    previewCards: [],
    activeDetailTab: 0,
  }
  const selectedCard = currentTabState.selectedCard
  const previewCards = Array.isArray(currentTabState.previewCards)
    ? currentTabState.previewCards
    : currentTabState.previewCard != null
      ? [currentTabState.previewCard]
      : []
  const activeDetailTab = currentTabState.activeDetailTab
  const satTimelineSortOrder = satSortByTab[activeShipTab] ?? 'desc'

  const updateTabState = (key, value) => {
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: {
        ...prev[activeShipTab],
        selectedCard: prev[activeShipTab]?.selectedCard ?? null,
        previewCards: prev[activeShipTab]?.previewCards ?? [],
        activeDetailTab: prev[activeShipTab]?.activeDetailTab ?? 0,
        [key]: value,
      },
    }))
  }

  useEffect(() => {
    if (!activeShipTab) return
    if (loadedTabsRef.current.has(activeShipTab)) return
    setLoading(true)
    const currentTab = activeShipTab
    const timer = setTimeout(() => {
      loadedTabsRef.current.add(currentTab)
      setLoading(false)
      // Auto-select: use the clicked detection from map if set, otherwise pick the latest
      const shipTab = shipTabs.find((t) => t.id === currentTab)
      const shipId = shipTab?.type === 'sts' ? shipTab.shipIds[0] : currentTab
      const shipDetections = allDetections
        .filter((d) => d.shipId === shipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      const shouldHonorSelectedDetection = shipTab?.type !== 'sts'
      const stsPreferredDetectionId =
        shipTab?.type === 'sts'
          ? shipDetections.find((d) => d.stsPartner === shipTab.shipIds[1])?.id
          : null
      const targetId =
        shouldHonorSelectedDetection &&
        selectedDetectionId &&
        shipDetections.some((d) => d.id === selectedDetectionId)
          ? selectedDetectionId
          : stsPreferredDetectionId || shipDetections[0]?.id
      if (targetId) {
        updateTabState('selectedCard', targetId)
        updateTabState('previewCards', [])
        setActiveDetectionId(targetId)
        setPreviewDetectionId(null)
        if (selectedDetectionId) setSelectedDetectionId(null)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [activeShipTab, allDetections])

  useEffect(() => {
    if (selectedDetectionId != null) {
      const activeTabForSelection = shipTabs.find((t) => t.id === activeShipTab)
      const isCurrentTabSts = activeTabForSelection?.type === 'sts'
      if (isCurrentTabSts) {
        setSelectedDetectionId(null)
        return
      }
      updateTabState('selectedCard', selectedDetectionId)
      updateTabState('previewCards', [])
      setActiveDetectionId(selectedDetectionId)
      setPreviewDetectionId(null)
      setSelectedDetectionId(null)
    }
  }, [
    selectedDetectionId,
    setActiveDetectionId,
    setSelectedDetectionId,
    setPreviewDetectionId,
    shipTabs,
    activeShipTab,
  ])

  useEffect(() => {
    if (
      selectedCard != null &&
      cardRefs.current[selectedCard] &&
      scrollContainerRef.current
    ) {
      const card = cardRefs.current[selectedCard]
      const container = scrollContainerRef.current
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const padding = 20

      if (cardRect.top < containerRect.top + padding) {
        container.scrollTo({
          top:
            container.scrollTop + (cardRect.top - containerRect.top) - padding,
          behavior: 'smooth',
        })
      } else if (cardRect.bottom > containerRect.bottom - padding) {
        container.scrollTo({
          top:
            container.scrollTop +
            (cardRect.bottom - containerRect.bottom) +
            padding,
          behavior: 'smooth',
        })
      }
    }
  }, [selectedCard])

  useEffect(() => {
    if (!isResizingTimeline) return undefined

    const handleMouseMove = (e) => {
      if (!panelContainerRef.current) return
      const rect = panelContainerRef.current.getBoundingClientRect()
      const bounds = getTopSectionBounds()
      if (!bounds) return
      const pointerY = e.clientY - rect.top
      const { minTopHeight, maxTopHeight } = bounds
      const next = Math.max(minTopHeight, Math.min(maxTopHeight, pointerY))
      setTopSectionHeight(next)
    }

    const handleMouseUp = () => {
      const bounds = getTopSectionBounds()
      if (bounds && topSectionHeight != null) {
        const { minTopHeight, maxTopHeight } = bounds
        const preferredHeight = getPreferredExpandedTopHeight(
          minTopHeight,
          maxTopHeight
        )
        const snapPoints = [minTopHeight, preferredHeight, maxTopHeight]
        const snappedHeight = snapPoints.reduce((closest, candidate) => {
          if (
            Math.abs(candidate - topSectionHeight) <
            Math.abs(closest - topSectionHeight)
          ) {
            return candidate
          }
          return closest
        }, minTopHeight)
        const collapsed = Math.abs(snappedHeight - minTopHeight) <= 2
        setTopSectionHeight(snappedHeight)
        setIsTopSummaryCollapsed(collapsed)
        if (!collapsed) {
          lastExpandedTopHeightRef.current = snappedHeight
        }
      }
      setIsResizingTimeline(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isResizingTimeline,
    getTopSectionBounds,
    getPreferredExpandedTopHeight,
    topSectionHeight,
  ])

  useEffect(() => {
    if (topSectionHeight == null) return
    const bounds = getTopSectionBounds()
    if (!bounds) return
    const { minTopHeight, maxTopHeight } = bounds
    const clamped = Math.max(
      minTopHeight,
      Math.min(maxTopHeight, topSectionHeight)
    )
    if (clamped !== topSectionHeight) {
      setTopSectionHeight(clamped)
    }
  }, [topSectionHeight, getTopSectionBounds])

  useEffect(() => {
    if (topSectionHeight != null && !isTopSummaryCollapsed) {
      lastExpandedTopHeightRef.current = topSectionHeight
    }
  }, [topSectionHeight, isTopSummaryCollapsed])

  useEffect(() => {
    if (!topSectionRef.current) return
    topSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    // If tools are hidden after a drag-resize, release fixed height so
    // the timeline immediately moves up and no empty gap remains.
    if (!detailToolsVisible && !isTopSummaryCollapsed && !isResizingTimeline) {
      setTopSectionHeight(null)
      lastExpandedTopHeightRef.current = null
    }
  }, [detailToolsVisible, isTopSummaryCollapsed, isResizingTimeline])

  const handleTimelineResizeStart = (e) => {
    if (!ENABLE_TIMELINE_DRAG) return
    e.preventDefault()
    if (topSectionHeight == null && topSectionRef.current) {
      setTopSectionHeight(topSectionRef.current.getBoundingClientRect().height)
    }
    setIsTopSummaryCollapsed(false)
    setIsResizingTimeline(true)
  }

  const handleTopSummaryToggle = () => {
    const bounds = getTopSectionBounds()
    if (!bounds) {
      setIsTopSummaryCollapsed((v) => !v)
      return
    }
    const { minTopHeight, maxTopHeight } = bounds
    if (isTopSummaryCollapsed) {
      // Treat button expand as a reset to default, not a restore of partial drag.
      setTopSectionHeight(null)
      setIsTopSummaryCollapsed(false)
      lastExpandedTopHeightRef.current = null
      return
    }
    // Clear custom drag memory when collapsing via the button.
    lastExpandedTopHeightRef.current = null
    setTopSectionHeight(minTopHeight)
    setIsTopSummaryCollapsed(true)
  }

  const activeTab = shipTabs.find((t) => t.id === activeShipTab)
  const isStsTab = activeTab?.type === 'sts'
  const displayStsShipIds = isStsTab
    ? [
        activeTab.shipIds[0],
        activeTab.stsType === 'sts' ? 'unknown' : activeTab.shipIds[1],
      ]
    : null

  const activeShipId = isStsTab
    ? displayStsShipIds[activeStsShip]
    : activeShipTab
  const activeShip = activeShipId ? ships[activeShipId] : null
  const stsPartnerShipId = isStsTab
    ? activeTab.shipIds[activeStsShip === 0 ? 1 : 0]
    : null
  const activeShipDetections = activeShipId
    ? allDetections
        .filter((d) => d.shipId === activeShipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []
  const timelineDetections = activeShipDetections.filter(
    (d) => d.type !== 'ais'
  )
  const timelineContextEvents = activeShipId
    ? TIMELINE_CONTEXT_EVENTS[activeShipId] || []
    : []
  const timelineItems = [
    ...timelineDetections.map((detection) => ({
      kind: 'detection',
      id: detection.id,
      sortTs: Number.isNaN(new Date(detection.date).getTime())
        ? 0
        : new Date(detection.date).getTime(),
      detection,
    })),
    ...timelineContextEvents.map((event) => ({
      kind: 'context',
      id: event.id,
      sortTs: Number.isNaN(new Date(event.sortDate).getTime())
        ? 0
        : new Date(event.sortDate).getTime(),
      event,
    })),
  ].sort((a, b) => b.sortTs - a.sortTs)

  const latestDetection = activeShipDetections[0] || null
  const latestAisDetection =
    activeShipDetections.find((d) => d.type === 'ais') || null
  const latestCoordinateDetection =
    activeShipDetections.find(
      (d) =>
        typeof d?.lat === 'number' &&
        Number.isFinite(d.lat) &&
        typeof d?.lng === 'number' &&
        Number.isFinite(d.lng)
    ) || null
  const latestKnownLocationDetection =
    latestCoordinateDetection || latestAisDetection || latestDetection
  const hasPendingNewLastKnownData = Boolean(
    activeShipId && newLastKnownDotByShip[activeShipId]
  )
  const pendingLatestKnownDetection = activeShipId
    ? pendingLastKnownDetectionByShip[activeShipId] || null
    : null
  const hoverLastKnownDetection =
    hasPendingNewLastKnownData && pendingLatestKnownDetection
      ? pendingLatestKnownDetection
      : latestKnownLocationDetection
  const latestNonStsDetection = activeShipDetections.find(
    (d) => d.type !== 'sts' && d.type !== 'sts-ais'
  )

  useEffect(() => {
    if (!activeShipId) return
    if (newLastKnownDotByShip[activeShipId]) return
    if (pendingLastKnownDetectionByShip[activeShipId]) return
    if (newLastKnownDotTimersRef.current[activeShipId]) return

    newLastKnownDotTimersRef.current[activeShipId] = window.setTimeout(() => {
      const baseDetection =
        latestAisDetection || latestCoordinateDetection || latestDetection
      const fallbackLat = parseFiniteNumber(activeShip?.aisInfo?.latitude)
      const fallbackLng = parseFiniteNumber(activeShip?.aisInfo?.longitude)
      const nextSimulatedDetection = {
        id: nextSimulatedDetectionIdRef.current++,
        shipId: activeShipId,
        type: 'ais',
        lat:
          typeof baseDetection?.lat === 'number'
            ? baseDetection.lat
            : fallbackLat ?? 0,
        lng:
          typeof baseDetection?.lng === 'number'
            ? baseDetection.lng
            : fallbackLng ?? 0,
        date: formatPrototypeDetectionDate(new Date()),
      }
      setPendingLastKnownDetectionByShip((prev) => ({
        ...prev,
        [activeShipId]: nextSimulatedDetection,
      }))
      setNewLastKnownDotByShip((prev) => ({
        ...prev,
        [activeShipId]: true,
      }))
      delete newLastKnownDotTimersRef.current[activeShipId]
    }, NEW_LAST_KNOWN_DOT_DELAY_MS)
  }, [
    activeShipId,
    activeShip,
    latestAisDetection,
    latestCoordinateDetection,
    latestDetection,
    newLastKnownDotByShip,
    pendingLastKnownDetectionByShip,
  ])

  useEffect(() => {
    if (!activeShipTab || !activeShipDetections.length) return
    const preferredId = isStsTab
      ? activeShipDetections.find((d) => d.stsPartner === stsPartnerShipId)?.id
      : activeShipDetections[0]?.id
    if (!preferredId) return
    const validSelection =
      selectedCard && activeShipDetections.some((d) => d.id === selectedCard)
    if (!validSelection) {
      updateTabState('selectedCard', preferredId)
    }
  }, [
    activeShipTab,
    activeShipDetections,
    selectedCard,
    isStsTab,
    stsPartnerShipId,
  ])
  const isStsUnattributed =
    isStsTab && activeTab?.stsType === 'sts' && activeStsShip === 1
  const isUnattributed = activeShip?.id === 'unknown' || isStsUnattributed
  const canCopyImo = !isUnattributed && Boolean(activeShip?.imo)
  const canCopyMmsi = !isUnattributed && Boolean(activeShip?.mmsi)
  const canCopyShipId = !isUnattributed && Boolean(activeShip?.shipId)
  const selectedDetection = selectedCard
    ? activeShipDetections.find((d) => d.id === selectedCard) || latestDetection
    : latestDetection

  const eventLabel = {
    ais: 'AIS',
    light: 'Light',
    dark: 'Dark',
    spoofing: 'Spoofing',
    sts: 'Ship-to-Ship',
    'sts-ais': 'Ship-to-Ship',
    unattributed: 'Unattributed',
  }

  const navigateToDetection = (targetDetection) => {
    if (!targetDetection) return

    setFlashEnabled(true)
    setActiveDetectionId(targetDetection.id)
    setPreviewDetectionId(null)
    updateTabState('previewCards', [])

    if (isStsTab && activeTab) {
      const currentShipId = activeTab.shipIds[activeStsShip]
      const existingSingleShipTab = shipTabs.find(
        (t) => t.id === currentShipId && t.type !== 'sts'
      )

      if (existingSingleShipTab) {
        setTabState((prev) => ({
          ...prev,
          [currentShipId]: {
            ...prev[currentShipId],
            selectedCard: targetDetection.id,
            previewCards: [],
            activeDetailTab: prev[currentShipId]?.activeDetailTab ?? 0,
          },
        }))
        setActiveShipTab(currentShipId)
        return
      }

      openShipTab(targetDetection)
      return
    }

    updateTabState('selectedCard', targetDetection.id)
  }

  const handleShowLastKnownLocation = () => {
    const targetDetection =
      (hasPendingNewLastKnownData && pendingLatestKnownDetection) ||
      latestKnownLocationDetection ||
      latestDetection
    if (!targetDetection) return

    if (hasPendingNewLastKnownData && activeShipId && pendingLatestKnownDetection) {
      setAppliedLastKnownDetectionByShip((prev) => ({
        ...prev,
        [activeShipId]: pendingLatestKnownDetection,
      }))
      setPendingLastKnownDetectionByShip((prev) => ({
        ...prev,
        [activeShipId]: null,
      }))
    }

    // Keep this action responsive even when the target is already selected.
    setFlashEnabled(true)
    setPreviewDetectionId(null)
    updateTabState('previewCards', [])
    setActiveDetectionId(null)
    window.setTimeout(() => {
      setActiveDetectionId(targetDetection.id)
    }, 0)

    // Preserve STS tab behavior when jumping from a grouped tab.
    if (isStsTab && activeTab && !targetDetection.stsPartner) {
      openShipTab(targetDetection)
    }

    if (activeShipId) {
      setNewLastKnownDotByShip((prev) => ({
        ...prev,
        [activeShipId]: false,
      }))
    }
  }

  const eventColorMap = {
    ais: '#00EB6C',
    light: '#00A3E3',
    dark: '#FFA500',
    spoofing: '#FF6D99',
    unattributed: '#F75349',
    sts: '#00A3E3',
    'sts-ais': '#00EB6C',
  }

  const getLatestNonStsByShip = useCallback(
    (shipId) => {
      return allDetections
        .filter(
          (d) => d.shipId === shipId && d.type !== 'sts' && d.type !== 'sts-ais'
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    },
    [allDetections]
  )

  const getStsTabBarColors = useCallback(
    (tab) => {
      if (!tab || tab.type !== 'sts') return null
      const color1 = eventColorMap.light
      const color2 =
        tab.stsType === 'sts'
          ? eventColorMap.unattributed
          : eventColorMap.ais
      return [color1, color2]
    },
    []
  )

  const renderStsBars = useCallback((colors, size) => {
    if (!colors) return null
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: size.gap,
          flexShrink: 0,
          height: size.height,
        }}
      >
        <Box
          style={{
            width: size.width,
            height: size.height,
            backgroundColor: colors[0],
          }}
        />
        <Box
          style={{
            width: size.width,
            height: size.height,
            backgroundColor: colors[1],
          }}
        />
      </Box>
    )
  }, [])

  const getStsDetectionBarColors = useCallback(
    (det) => {
      if (!det || (det.type !== 'sts' && det.type !== 'sts-ais')) return null
      const leftType = 'light'
      const rightType = det.type === 'sts' ? 'unattributed' : 'ais'
      return [
        eventColorMap[leftType] || eventColorMap.light,
        eventColorMap[rightType] || eventColorMap.unattributed,
      ]
    },
    []
  )

  const renderStsTabIcon = useCallback(
    (tab, size = { width: 8, height: 20, gap: 2 }) => {
      const colors = getStsTabBarColors(tab)
      return renderStsBars(colors, size)
    },
    [getStsTabBarColors, renderStsBars]
  )
  const selectedStsIcon =
    isStsTab && activeTab
      ? renderStsTabIcon(activeTab, { width: 6, height: 14, gap: 2 })
      : undefined

  const isLatest =
    !selectedCard || selectedDetection?.id === latestDetection?.id
  const shouldShowLastKnownLocationButton = latestKnownLocationDetection != null
  const satelliteTimelineRows = activeShipDetections
    .filter((d) => ['light', 'dark', 'spoofing', 'ais'].includes(d.type))
    .sort((a, b) => {
      const aTs = new Date(a.date).getTime()
      const bTs = new Date(b.date).getTime()
      const safeA = Number.isNaN(aTs) ? 0 : aTs
      const safeB = Number.isNaN(bTs) ? 0 : bTs
      if (safeA !== safeB) {
        return satTimelineSortOrder === 'asc' ? safeA - safeB : safeB - safeA
      }
      const aId = Number(a.id) || 0
      const bId = Number(b.id) || 0
      return satTimelineSortOrder === 'asc' ? aId - bId : bId - aId
    })
    .slice(0, 8)
    .map((d, idx) => {
      const latValue =
        typeof d.lat === 'number'
          ? d.lat.toFixed(4)
          : activeShip?.aisInfo?.latitude || 'No info'
      const lonValue =
        typeof d.lng === 'number'
          ? d.lng.toFixed(4)
          : activeShip?.aisInfo?.longitude || 'No info'
      const parsedDate = new Date(d.date)
      const capturedTime = Number.isNaN(parsedDate.getTime())
        ? d.date
        : parsedDate.toISOString()
      return {
        id: `${activeShip?.id || 'ship'}-sat-${d.id}`,
        image:
          SATELLITE_TIMELINE_IMAGES[idx % SATELLITE_TIMELINE_IMAGES.length],
        capturedTime,
        latitude: latValue,
        longitude: lonValue,
        oid: 16100000 + d.id * 37,
      }
    })
  const ownershipInfo = SHIP_OWNERSHIP[activeShip?.id] || SHIP_OWNERSHIP.unknown
  const attributionRows = [
    {
      metric: 'Time',
      prediction: 'n/a',
      reference: 'n/a',
      difference: 'n/a',
      score: 'Mismatch',
      scoreColor: '#1B1D2D',
      scoreBg: '#FF533C',
    },
    {
      metric: 'Heading',
      prediction: activeShip?.synMaxInfo?.heading || 'n/a',
      reference: activeShip?.aisInfo?.heading || 'n/a',
      difference:
        activeShip?.synMaxInfo?.heading && activeShip?.aisInfo?.heading
          ? String(
              Math.abs(
                Number(activeShip.synMaxInfo.heading) -
                  Number(activeShip.aisInfo.heading)
              )
            )
          : 'n/a',
      score: 'Good',
      scoreColor: '#1B1D2D',
      scoreBg: '#85DB77',
    },
    {
      metric: 'Distance',
      prediction: 'n/a',
      reference: 'n/a',
      difference: 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
    {
      metric: 'Length',
      prediction: activeShip?.synMaxInfo?.shipLength || 'n/a',
      reference: activeShip?.aisInfo?.length || 'n/a',
      difference:
        activeShip?.synMaxInfo?.shipLength && activeShip?.aisInfo?.length
          ? String(
              Math.abs(
                Number(activeShip.synMaxInfo.shipLength) -
                  Number(activeShip.aisInfo.length)
              )
            )
          : 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
    {
      metric: 'Ship Type',
      prediction: activeShip?.synMaxInfo?.shipType || 'n/a',
      reference: activeShip?.aisInfo?.shipType || 'n/a',
      difference: 'n/a',
      score:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? 'Good'
          : 'Mismatch',
      scoreColor:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? '#1B1D2D'
          : '#1B1D2D',
      scoreBg:
        activeShip?.synMaxInfo?.shipType === activeShip?.aisInfo?.shipType
          ? '#85DB77'
          : '#FF533C',
    },
    {
      metric: 'Ship Sub-type',
      prediction: activeShip?.synMaxInfo?.shipSubtype || 'n/a',
      reference: activeShip?.aisInfo?.shipType || 'n/a',
      difference: 'n/a',
      score: 'Average',
      scoreColor: '#1B1D2D',
      scoreBg: '#FFCF5C',
    },
  ]

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {overflowLeft && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderRight: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(90deg)',
              }}
            />
          </Box>
        )}
        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {overflowLeft && (
            <Box
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 40,
                background:
                  'linear-gradient(to right, #24263C, rgba(36, 38, 60, 0))',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}
          {overflowRight && (
            <Box
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 40,
                background:
                  'linear-gradient(to left, #24263C, rgba(36, 38, 60, 0))',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          )}
          <Box
            ref={tabScrollRef}
            className="tab-scroll"
            style={{
              display: 'flex',
              flex: 1,
            }}
          >
            {shipTabs.map((tab) => {
              const isActive = activeShipTab === tab.id
              return (
                <Box
                  key={tab.id}
                  onClick={() => {
                    setFlashEnabled(false)
                    setActiveStsShip(0)
                    setActiveShipTab(tab.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 50,
                    padding: '0 12px',
                    cursor: 'pointer',
                    borderRight: '1px solid #393C56',
                    borderBottom: isActive ? 'none' : '1px solid #393C56',
                    background: isActive ? '#181926' : '#24263C',
                    position: 'relative',
                    zIndex: isActive ? 1 : 0,
                    marginBottom: isActive ? -1 : 0,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.type === 'sts' ? (
                    renderStsTabIcon(tab, { width: 7, height: 16, gap: 2 })
                  ) : (
                    <ShipIcon style={{ width: 16, height: 16 }} />
                  )}
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {tab.name}
                  </Text>
                  {isActive && (
                    <XClose
                      onClick={(e) => {
                        e.stopPropagation()
                        closeShipTab(tab.id)
                      }}
                      style={{
                        color: '#898f9d',
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                      }}
                    />
                  )}
                </Box>
              )
            })}
            <Box
              style={{
                flex: 1,
                height: 50,
                background: '#24263C',
                borderBottom: '1px solid #393C56',
              }}
            />
          </Box>
        </Box>
        {overflowRight && (
          <Box
            onClick={() =>
              tabScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 50,
              cursor: 'pointer',
              background: '#24263C',
              borderBottom: '1px solid #393C56',
              borderLeft: '1px solid #393C56',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              style={{
                color: '#898f9d',
                width: 16,
                height: 16,
                transform: 'rotate(-90deg)',
              }}
            />
          </Box>
        )}
        <Menu
          position="bottom-end"
          withinPortal
          opened={menuOpened}
          onChange={setMenuOpened}
        >
          <Menu.Target>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 50,
                cursor: 'pointer',
                background: '#24263C',
                borderBottom: '1px solid #393C56',
                borderLeft: '1px solid #393C56',
                flexShrink: 0,
              }}
            >
              <List style={{ color: '#898f9d', width: 18, height: 18 }} />
            </Box>
          </Menu.Target>
          <Menu.Dropdown
            styles={{
              dropdown: {
                background: '#1B1D2E',
                border: '1px solid #393C56',
                minWidth: 220,
                padding: 0,
              },
            }}
          >
            {/* Ships Section */}
            <Box
              style={{
                background: '#24263C',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#898f9d',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Ships
              </Text>
              {shipTabs.length > 0 && (
                <Text
                  onClick={() => {
                    setMenuOpened(false)
                    closeAllTabs()
                  }}
                  style={{
                    color: '#F75349',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Close All
                </Text>
              )}
            </Box>
            {shipTabs.filter((t) => t.type !== 'sts').length > 0 ? (
              shipTabs
                .filter((t) => t.type !== 'sts')
                .map((tab, i, arr) => (
                  <React.Fragment key={tab.id}>
                    <Menu.Item
                      onClick={() => {
                        setFlashEnabled(false)
                        setActiveStsShip(0)
                        setActiveShipTab(tab.id)
                      }}
                      leftSection={
                        <ShipIcon style={{ width: 14, height: 14 }} />
                      }
                      styles={{
                        item: {
                          color: '#fff',
                          fontSize: 12,
                          padding: '12px 16px',
                          background:
                            activeShipTab === tab.id
                              ? '#393C56'
                              : 'transparent',
                          borderRadius: 0,
                        },
                        itemLabel: { color: '#fff' },
                      }}
                    >
                      {tab.name}
                    </Menu.Item>
                    {i < arr.length - 1 && (
                      <Box
                        style={{
                          height: 1,
                          background: '#393C56',
                          margin: 0,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))
            ) : (
              <Text
                style={{ color: '#555', fontSize: 12, padding: '12px 16px' }}
              >
                No ships open
              </Text>
            )}
            {/* Ship-to-Ship: only show section when there are STS tabs */}
            {shipTabs.some((t) => t.type === 'sts') && (
              <>
                <Box
                  style={{
                    background: '#24263C',
                    padding: '12px 16px',
                    marginTop: 0,
                  }}
                >
                  <Text
                    style={{
                      color: '#898f9d',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Ship-to-Ship
                  </Text>
                </Box>
                {shipTabs
                  .filter((t) => t.type === 'sts')
                  .map((tab, i, arr) => (
                    <React.Fragment key={tab.id}>
                      <Menu.Item
                        onClick={() => {
                          setFlashEnabled(false)
                          setActiveStsShip(0)
                          setActiveShipTab(tab.id)
                        }}
                        leftSection={renderStsTabIcon(tab, {
                          width: 6,
                          height: 14,
                          gap: 2,
                        })}
                        styles={{
                          item: {
                            color: '#fff',
                            fontSize: 12,
                            padding: '12px 16px',
                            background:
                              activeShipTab === tab.id
                                ? '#393C56'
                                : 'transparent',
                            borderRadius: 0,
                          },
                          itemLabel: { color: '#fff' },
                        }}
                      >
                        {tab.name}
                      </Menu.Item>
                      {i < arr.length - 1 && (
                        <Box
                          style={{
                            height: 1,
                            background: '#393C56',
                            margin: 0,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Box>

      {activeShip && loading && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Loader color="#fff" size="md" />
        </Box>
      )}

      {activeShip && !loading && (
        <Box
          ref={panelContainerRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {isStsTab &&
            (() => {
              const [sid1, sid2] = displayStsShipIds
              const s1 = ships[sid1]
              const s2 = ships[sid2]
              if (!s1 || !s2) return null
              const latest1 = allDetections
                .filter((d) => d.shipId === sid1)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latest2 = allDetections
                .filter((d) => d.shipId === sid2)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latestNonSts1 = allDetections
                .filter(
                  (d) =>
                    d.shipId === sid1 &&
                    d.type !== 'sts' &&
                    d.type !== 'sts-ais'
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latestNonSts2 = allDetections
                .filter(
                  (d) =>
                    d.shipId === sid2 &&
                    d.type !== 'sts' &&
                    d.type !== 'sts-ais'
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const color1 =
                activeTab.stsType === 'sts'
                  ? eventColorMap[latestNonSts1?.type] ||
                    eventColorMap[latest1?.type] ||
                    eventColorMap.light
                  : eventColorMap[latest1?.type] || '#393C56'
              const color2 =
                activeTab.stsType === 'sts'
                  ? eventColorMap.unattributed
                  : eventColorMap[latestNonSts2?.type] ||
                    eventColorMap[latest2?.type] ||
                    '#393C56'
              const pill = (s, idx) => {
                const isActive = activeStsShip === idx
                return (
                  <Box
                    key={s.id}
                    onClick={() => setActiveStsShip(idx)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 4,
                      border: isActive
                        ? '2px solid #0094FF'
                        : '1px solid #393C56',
                      background: isActive
                        ? 'rgba(0, 148, 255, 0.1)'
                        : '#24263C',
                      cursor: 'pointer',
                    }}
                  >
                    <Text
                      style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}
                    >
                      {s.name}
                    </Text>
                    {s.flag && <Text style={{ fontSize: 16 }}>{s.flag}</Text>}
                  </Box>
                )
              }
              return (
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px 0px 20px',
                  }}
                >
                  {pill(s1, 0)}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 2,
                      flexShrink: 0,
                      height: 20,
                    }}
                  >
                    <Box
                      style={{
                        width: 8,
                        height: 20,
                        backgroundColor: color1,
                      }}
                    />
                    <Box
                      style={{
                        width: 8,
                        height: 20,
                        backgroundColor: color2,
                      }}
                    />
                  </Box>
                  {pill(s2, 1)}
                </Box>
              )
            })()}
          <Box
            ref={topSectionRef}
            style={{
              padding: isTopSummaryCollapsed ? '20px 20px 8px 20px' : '20px',
              flexShrink: 0,
              ...(topSectionHeight != null
                ? { height: topSectionHeight, overflowY: 'auto' }
                : {}),
            }}
          >
            <Box
              ref={topSummaryHeaderRef}
              style={{ display: 'flex', marginBottom: '16px' }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Title order={4} style={{ color: 'white' }}>
                    {activeShip.name}
                  </Title>
                  {activeShip.flag && (
                    <Text style={{ fontSize: 18 }}>{activeShip.flag}</Text>
                  )}
                </Box>
                {shouldShowLastKnownLocationButton && (
                  <Tooltip
                    withArrow
                    arrowSize={10}
                    openDelay={150}
                    position="right"
                    offset={10}
                    color="#000"
                    label={
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <KeyValuePair
                          keyName="Last Known Location Event"
                          value={
                            hasPendingNewLastKnownData ? (
                              <Box
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 12 }}>
                                  {eventLabel[hoverLastKnownDetection?.type] ||
                                    hoverLastKnownDetection?.type ||
                                    'Unknown'}
                                </Text>
                                <Text
                                  style={{
                                    color: '#00EB6C',
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  (New)
                                </Text>
                              </Box>
                            ) : (
                              eventLabel[hoverLastKnownDetection?.type] ||
                              hoverLastKnownDetection?.type ||
                              'Unknown'
                            )
                          }
                        />
                        <KeyValuePair
                          keyName="Reported Time"
                          value={hoverLastKnownDetection?.date || 'No info'}
                        />
                      </Box>
                    }
                    styles={{
                      tooltip: {
                        color: '#fff',
                        borderRadius: 8,
                        padding: '10px 12px',
                        maxWidth: 240,
                      },
                    }}
                  >
                    <Box
                      onClick={handleShowLastKnownLocation}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        marginTop: 2,
                      }}
                    >
                      <MarkerPin01
                        style={{
                          width: 14,
                          height: 14,
                          color: '#0094FF',
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        style={{
                          color: '#0094FF',
                          fontSize: 11,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Show last known location
                      </Text>
                      {hasPendingNewLastKnownData && (
                        <Box
                          style={{
                            width: 7,
                            height: 7,
                            marginLeft: 4,
                            borderRadius: 999,
                            background: isNewLastKnownDotFlashOn
                              ? '#00EB6C'
                              : 'rgba(0, 235, 108, 0.28)',
                            boxShadow: isNewLastKnownDotFlashOn
                              ? '0 0 0 2px rgba(0, 235, 108, 0.2)'
                              : 'none',
                            flexShrink: 0,
                            transition: 'all 160ms ease',
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                )}
              </Box>
              <Box style={{ flex: 1 }}></Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginRight: 24,
                }}
              >
                <Tooltip label="Add ship notes" withArrow openDelay={200}>
                  <Box
                    onMouseEnter={() => setHoveredTopAction('note')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'note' ? '#24263C' : 'transparent',
                    }}
                  >
                    <File02 style={{ color: '#fff', width: 20, height: 20 }} />
                  </Box>
                </Tooltip>
                <Tooltip label="Create alert" withArrow openDelay={200}>
                  <Box
                    onMouseEnter={() => setHoveredTopAction('alert')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'alert'
                          ? '#24263C'
                          : 'transparent',
                    }}
                  >
                    <AlertIcon
                      style={{ color: '#fff', width: 20, height: 20 }}
                    />
                  </Box>
                </Tooltip>
                <Tooltip label="Add to favorites" withArrow openDelay={200}>
                  <Box
                    onMouseEnter={() => setHoveredTopAction('favorite')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'favorite'
                          ? '#24263C'
                          : 'transparent',
                    }}
                  >
                    <Star01 style={{ color: '#fff', width: 20, height: 20 }} />
                  </Box>
                </Tooltip>
                <Tooltip label="Expand/collapse" withArrow openDelay={200}>
                  <Box
                    onClick={handleTopSummaryToggle}
                    onMouseEnter={() => setHoveredTopAction('resize')}
                    onMouseLeave={() => setHoveredTopAction(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background:
                        hoveredTopAction === 'resize'
                          ? '#24263C'
                          : 'transparent',
                    }}
                  >
                    <EnlargeVerticalIcon
                      width={26}
                      height={26}
                      style={{
                        color: '#fff',
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>
            </Box>
            {!isTopSummaryCollapsed && (
              <>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'max-content max-content minmax(0, 1fr)',
                    columnGap: '20px',
                    marginBottom: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    onMouseEnter={() => setHoveredCopyField('imo')}
                    onMouseLeave={() => setHoveredCopyField(null)}
                  >
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                      IMO
                    </Text>
                    <Box
                      onClick={() => {
                        if (canCopyImo)
                          handleCopyToClipboard(activeShip.imo, 'imo')
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        cursor: canCopyImo ? 'pointer' : 'default',
                      }}
                    >
                      <Text
                        size="xs"
                        style={{
                          color: 'white',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          minWidth: 0,
                        }}
                        title={activeShip.imo || 'No info'}
                      >
                        {activeShip.imo || 'No info'}
                      </Text>
                      {canCopyImo && (
                        <Tooltip
                          label={copiedField === 'imo' ? 'Copied!' : 'Copy IMO'}
                          withArrow
                          color="#393C56"
                          opened={
                            hoveredCopyField === 'imo' || copiedField === 'imo'
                          }
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color: copiedField === 'imo' ? '#fff' : '#0094ff',
                              cursor:
                                hoveredCopyField === 'imo' ||
                                copiedField === 'imo'
                                  ? 'pointer'
                                  : 'default',
                              flexShrink: 0,
                              transform:
                                copiedField === 'imo'
                                  ? 'scale(1.12)'
                                  : 'scale(1)',
                              transition:
                                'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                              borderRadius: 999,
                              background: 'transparent',
                              opacity:
                                hoveredCopyField === 'imo' ||
                                copiedField === 'imo'
                                  ? 1
                                  : 0,
                              pointerEvents:
                                hoveredCopyField === 'imo' ||
                                copiedField === 'imo'
                                  ? 'auto'
                                  : 'none',
                            }}
                          >
                            <Copy02
                              style={{
                                width: 14,
                                height: 14,
                                color:
                                  copiedField === 'imo' ? '#fff' : '#0094ff',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box
                    onMouseEnter={() => setHoveredCopyField('mmsi')}
                    onMouseLeave={() => setHoveredCopyField(null)}
                  >
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                      MMSI
                    </Text>
                    <Box
                      onClick={() => {
                        if (canCopyMmsi)
                          handleCopyToClipboard(activeShip.mmsi, 'mmsi')
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        cursor: canCopyMmsi ? 'pointer' : 'default',
                      }}
                    >
                      <Text
                        size="xs"
                        style={{
                          color: 'white',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          minWidth: 0,
                        }}
                        title={activeShip.mmsi || 'No info'}
                      >
                        {activeShip.mmsi || 'No info'}
                      </Text>
                      {canCopyMmsi && (
                        <Tooltip
                          label={
                            copiedField === 'mmsi' ? 'Copied!' : 'Copy MMSI'
                          }
                          withArrow
                          color="#393C56"
                          opened={
                            hoveredCopyField === 'mmsi' ||
                            copiedField === 'mmsi'
                          }
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color:
                                copiedField === 'mmsi' ? '#fff' : '#0094ff',
                              cursor:
                                hoveredCopyField === 'mmsi' ||
                                copiedField === 'mmsi'
                                  ? 'pointer'
                                  : 'default',
                              flexShrink: 0,
                              transform:
                                copiedField === 'mmsi'
                                  ? 'scale(1.12)'
                                  : 'scale(1)',
                              transition:
                                'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                              borderRadius: 999,
                              background: 'transparent',
                              opacity:
                                hoveredCopyField === 'mmsi' ||
                                copiedField === 'mmsi'
                                  ? 1
                                  : 0,
                              pointerEvents:
                                hoveredCopyField === 'mmsi' ||
                                copiedField === 'mmsi'
                                  ? 'auto'
                                  : 'none',
                            }}
                          >
                            <Copy02
                              style={{
                                width: 14,
                                height: 14,
                                color:
                                  copiedField === 'mmsi' ? '#fff' : '#0094ff',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box
                    style={{ minWidth: 0, width: '100%' }}
                    onMouseEnter={() => setHoveredCopyField('shipId')}
                    onMouseLeave={() => setHoveredCopyField(null)}
                  >
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                      SynMax Ship ID
                    </Text>
                    <Box
                      onClick={() => {
                        if (canCopyShipId)
                          handleCopyToClipboard(activeShip.shipId, 'shipId')
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 0,
                        width: '100%',
                        cursor: canCopyShipId ? 'pointer' : 'default',
                      }}
                    >
                      <Box
                        title={activeShip.shipId || 'No info'}
                        style={{
                          color: 'white',
                          minWidth: 0,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          fontSize: 11,
                        }}
                      >
                        {activeShip.shipId ? (
                          <>
                            <Box component="span" style={{ flexShrink: 0 }}>
                              ...
                            </Box>
                            <Box
                              component="span"
                              style={{
                                display: 'inline-block',
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'clip',
                                direction: 'rtl',
                                unicodeBidi: 'plaintext',
                                textAlign: 'left',
                              }}
                            >
                              {String(activeShip.shipId).slice(1, -1)}
                            </Box>
                          </>
                        ) : (
                          'No info'
                        )}
                      </Box>
                      {canCopyShipId && (
                        <Tooltip
                          label={
                            copiedField === 'shipId'
                              ? 'Copied!'
                              : 'Copy SynMax Ship Id'
                          }
                          withArrow
                          color="#393C56"
                          opened={
                            hoveredCopyField === 'shipId' ||
                            copiedField === 'shipId'
                          }
                          styles={{
                            tooltip: {
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                            },
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color:
                                copiedField === 'shipId' ? '#fff' : '#0094ff',
                              cursor:
                                hoveredCopyField === 'shipId' ||
                                copiedField === 'shipId'
                                  ? 'pointer'
                                  : 'default',
                              flexShrink: 0,
                              transform:
                                copiedField === 'shipId'
                                  ? 'scale(1.12)'
                                  : 'scale(1)',
                              transition:
                                'transform 140ms ease, color 140ms ease, opacity 140ms ease',
                              borderRadius: 999,
                              background: 'transparent',
                              opacity:
                                hoveredCopyField === 'shipId' ||
                                copiedField === 'shipId'
                                  ? 1
                                  : 0,
                              pointerEvents:
                                hoveredCopyField === 'shipId' ||
                                copiedField === 'shipId'
                                  ? 'auto'
                                  : 'none',
                            }}
                          >
                            <Copy02
                              style={{
                                width: 14,
                                height: 14,
                                color:
                                  copiedField === 'shipId' ? '#fff' : '#0094ff',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>
                {!isUnattributed && (
                  <ShipDetailsPanel
                    selectedEvent={selectedDetection}
                    isLatest={isLatest}
                    eventLabel={eventLabel[selectedDetection?.type] || ''}
                    eventIconOverride={selectedStsIcon}
                    flashEnabled={flashEnabled}
                    onToolsVisibleChange={setDetailToolsVisible}
                  />
                )}
              </>
            )}
          </Box>
          {isUnattributed ? (
            <>
              <Box style={{ flexShrink: 0, padding: '20px 20px 0 20px' }}>
                <ShipDetailsPanel
                  selectedEvent={selectedDetection}
                  isLatest
                  eventLabel={
                    isStsUnattributed
                      ? 'Unattributed'
                      : eventLabel[latestDetection?.type] || ''
                  }
                  flashEnabled={false}
                  unattributed
                  onToolsVisibleChange={setDetailToolsVisible}
                />
              </Box>
              <Box
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px 20px 20px 20px',
                }}
              >
                <EventTimelineCard
                  date={latestDetection?.date}
                  event={
                    isStsUnattributed
                      ? 'Unattributed'
                      : eventLabel[latestDetection?.type] ||
                        latestDetection?.type
                  }
                  icon={<UnattributedIcon style={{ height: 14 }} />}
                  selected
                  onSelect={() => {}}
                  aisInfo={{}}
                  synMaxInfo={
                    activeShip.synMaxInfo ||
                    (isStsUnattributed
                      ? {
                          objectId: 'N/A',
                          imageCapturedTime: latestDetection?.date || 'No info',
                          imageSource: 'Planet Scope',
                          status: 'Preview',
                          latitude: activeShip.aisInfo?.latitude || 'No info',
                          longitude: activeShip.aisInfo?.longitude || 'No info',
                          heading: activeShip.aisInfo?.heading || 'No info',
                          shipLength: activeShip.aisInfo?.length || 'No info',
                          shipWidth: activeShip.aisInfo?.width || 'No info',
                          shipType: activeShip.aisInfo?.shipType || 'No info',
                          shipSubtype: 'Unassigned',
                        }
                      : undefined)
                  }
                />
              </Box>
            </>
          ) : (
            <>
              <Box
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #393C56',
                  flexShrink: 0,
                }}
              >
                {detailTabs.map((tab, i) => (
                  <Box
                    key={tab}
                    onClick={() => updateTabState('activeDetailTab', i)}
                    style={{
                      flex: 1,
                      padding: '12px 10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderBottom:
                        activeDetailTab === i
                          ? '2px solid #fff'
                          : '2px solid transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: activeDetailTab === i ? 700 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab}
                    </Text>
                  </Box>
                ))}
              </Box>
              {ENABLE_TIMELINE_DRAG && (
                <Tooltip
                  label="Drag to resize timeline"
                  position="bottom"
                  withArrow
                  openDelay={0}
                  closeDelay={0}
                  color="#393C56"
                  styles={{
                    tooltip: { color: '#fff', fontSize: 11, fontWeight: 600 },
                  }}
                >
                  <Box
                    onMouseDown={handleTimelineResizeStart}
                    onMouseEnter={() => setIsDragHandleHovered(true)}
                    onMouseLeave={() => setIsDragHandleHovered(false)}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 10,
                      flexShrink: 0,
                      cursor: 'ns-resize',
                      background: 'transparent',
                      position: 'relative',
                    }}
                  >
                    <Box
                      style={{
                        width:
                          isResizingTimeline || isDragHandleHovered ? 54 : 42,
                        height: 3,
                        borderRadius: 999,
                        background:
                          isResizingTimeline || isDragHandleHovered
                            ? '#5C6270'
                            : 'rgba(92, 98, 112, 0.45)',
                        transition: 'all 120ms ease',
                      }}
                    />
                  </Box>
                </Tooltip>
              )}
              <Box
                ref={scrollContainerRef}
                style={{ flex: 1, overflowY: 'auto' }}
              >
                {activeDetailTab === 0 && (
                  <Box
                    style={{
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {timelineItems.map((item) => {
                      if (item.kind === 'context') {
                        const contextEvent = item.event
                        return (
                          <Box key={contextEvent.id}>
                            <EventTimelineCard
                              date={contextEvent.dateLabel}
                              variant={contextEvent.variant}
                              port={contextEvent.port}
                              status={contextEvent.status}
                              duration={contextEvent.duration}
                              newFlag={contextEvent.newFlag}
                              previousFlag={contextEvent.previousFlag}
                            />
                          </Box>
                        )
                      }

                      const det = item.detection
                      const stsLightIcon = renderStsBars(
                        getStsDetectionBarColors(det),
                        {
                          width: 6,
                          height: 14,
                          gap: 2,
                        }
                      )
                      const stsAisIcon = renderStsBars(
                        getStsDetectionBarColors(det),
                        {
                          width: 6,
                          height: 14,
                          gap: 2,
                        }
                      )
                      const iconMap = {
                        ais: <AisIcon style={{ height: 14 }} />,
                        light: <LightShipIcon style={{ height: 14 }} />,
                        dark: <DarkShipIcon style={{ height: 14 }} />,
                        spoofing: <SpoofingIcon style={{ height: 14 }} />,
                        sts: stsLightIcon,
                        'sts-ais': stsAisIcon,
                        unattributed: (
                          <UnattributedIcon style={{ height: 14 }} />
                        ),
                      }
                      const parsedDetDate = new Date(det.date)
                      const detDateKey = `${parsedDetDate.getFullYear()}-${String(parsedDetDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDetDate.getDate()).padStart(2, '0')}`
                      return (
                        <Box
                          key={det.id}
                          ref={(el) => {
                            cardRefs.current[det.id] = el
                          }}
                        >
                          <EventTimelineCard
                            date={det.date}
                            event={eventLabel[det.type] || det.type}
                            icon={iconMap[det.type]}
                            variant={
                              det.type === 'sts' || det.type === 'sts-ais'
                                ? 'sts'
                                : undefined
                            }
                            selected={selectedCard === det.id}
                            isPreviewed={previewCards.includes(det.id)}
                            onTogglePreview={() => {
                              const nextPreviewCards = previewCards.includes(
                                det.id
                              )
                                ? previewCards.filter((id) => id !== det.id)
                                : [...previewCards, det.id]
                              updateTabState('previewCards', nextPreviewCards)
                              // Keep "Show Details" local to the card; do not move map focus.
                              setPreviewDetectionId(null)
                            }}
                            onGoToDate={
                              detDateKey !== mapDate
                                ? () => {
                                    const dateLabel =
                                      parsedDetDate.toLocaleDateString(
                                        'en-US',
                                        {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        }
                                      )
                                    requestGoToDate(
                                      detDateKey,
                                      det.id,
                                      dateLabel
                                    )
                                  }
                                : undefined
                            }
                            onSelect={() => {
                              const isDeselecting = selectedCard === det.id
                              setFlashEnabled(true)
                              setPreviewDetectionId(null)
                              updateTabState('previewCards', [])

                              // On STS tab, selecting a non-STS event navigates to ship tab
                              if (
                                isStsTab &&
                                !isDeselecting &&
                                !det.stsPartner
                              ) {
                                openShipTab(det)
                                setActiveDetectionId(det.id)
                                return
                              }

                              const latestId = activeShipDetections[0]?.id
                              updateTabState(
                                'selectedCard',
                                isDeselecting ? (latestId ?? det.id) : det.id
                              )
                              if (!isDeselecting) {
                                setActiveDetectionId(det.id)
                              } else {
                                setActiveDetectionId(null)
                              }
                            }}
                            onViewStsShips={
                              det.stsPartner
                                ? () =>
                                    openStsTab(
                                      det.shipId,
                                      det.stsPartner,
                                      det.type,
                                      det.id
                                    )
                                : undefined
                            }
                            aisInfo={activeShip.aisInfo}
                            partnerAisInfo={
                              det.stsPartner
                                ? ships[det.stsPartner]?.aisInfo
                                : undefined
                            }
                            shipName={activeShip.name}
                            partnerName={
                              det.stsPartner
                                ? ships[det.stsPartner]?.name
                                : undefined
                            }
                            synMaxInfo={
                              det.type === 'light' ||
                              det.type === 'dark' ||
                              det.type === 'spoofing'
                                ? activeShip.synMaxInfo
                                : undefined
                            }
                            detectionType={det.type}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                )}
                {activeDetailTab === 1 && (
                  <Box style={{ padding: 20 }}>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 2,
                      }}
                    >
                      <Box
                        onClick={() =>
                          setSatSortByTab((prev) => ({
                            ...prev,
                            [activeShipTab]:
                              (prev[activeShipTab] ?? 'desc') === 'desc'
                                ? 'asc'
                                : 'desc',
                          }))
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {satTimelineSortOrder === 'desc'
                            ? 'Sort by: Newest'
                            : 'Sort by: Oldest'}
                        </Text>
                        <ChevronDown
                          style={{
                            width: 16,
                            height: 16,
                            color: '#FFFFFF',
                            transform:
                              satTimelineSortOrder === 'asc'
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            transition: 'transform 140ms ease',
                          }}
                        />
                      </Box>
                    </Box>
                    {satelliteTimelineRows.length === 0 ? (
                      <Text style={{ color: '#898F9D', fontSize: 12 }}>
                        No satellite imagery available.
                      </Text>
                    ) : (
                      <Box
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          marginTop: 8,
                          gap: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {satelliteTimelineRows.map((item) => (
                          <Box
                            key={item.id}
                            onMouseEnter={() =>
                              setHoveredSatelliteCardId(item.id)
                            }
                            onMouseLeave={() => setHoveredSatelliteCardId(null)}
                            style={{
                              minWidth: 0,
                              borderRadius: 6,
                              background:
                                hoveredSatelliteCardId === item.id
                                  ? '#24263C'
                                  : 'transparent',
                              padding: 8,
                              transition: 'background 140ms ease',
                            }}
                          >
                            <Box
                              style={{
                                borderRadius: 6,
                                overflow: 'hidden',
                                background: '#1B1D2E',
                                height: 226,
                              }}
                            >
                              <img
                                src={item.image}
                                alt="Satellite timeline capture"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            </Box>
                            <Box style={{ marginTop: 10 }}>
                              <KeyValuePair
                                keyName="Image Captured Time"
                                value={item.capturedTime}
                              />
                            </Box>
                            <Box
                              style={{
                                marginTop: 8,
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(3, minmax(0, 1fr))',
                                gap: 16,
                              }}
                            >
                              <KeyValuePair
                                keyName="Latitude"
                                value={item.latitude}
                              />
                              <KeyValuePair
                                keyName="Longitude"
                                value={item.longitude}
                              />
                              <KeyValuePair keyName="OID" value={item.oid} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
                {activeDetailTab === 2 && (
                  <Box style={{ padding: 20 }}>
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: '#B8BECE',
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        Ownership
                      </Text>
                      <Box
                        style={{
                          border: '1px solid #3D456B',
                          borderRadius: 4,
                          background: '#24263C',
                          padding: 20,
                          marginBottom: 16,
                        }}
                      >
                        <Box
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: '12px 20px',
                          }}
                        >
                          <KeyValuePair
                            keyName="Commercial Owner"
                            value={ownershipInfo.commercialOwner}
                          />
                          <KeyValuePair
                            keyName="Effective Owner"
                            value={ownershipInfo.effectiveOwner}
                          />
                          <KeyValuePair
                            keyName="Financial Owner"
                            value={ownershipInfo.financialOwner}
                          />
                          <KeyValuePair
                            keyName="Technical Owner"
                            value={ownershipInfo.technicalOwner}
                          />
                          <KeyValuePair
                            keyName="P&I Club"
                            value={ownershipInfo.pniClub}
                          />
                          <KeyValuePair
                            keyName="Member"
                            value={ownershipInfo.member}
                          />
                        </Box>
                      </Box>

                      <Text
                        style={{
                          color: '#B8BECE',
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        Attribution
                      </Text>
                      <Box
                        style={{
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              '1.25fr 1.1fr 1.1fr 1fr 0.95fr',
                            gap: 0,
                            background: '#24263C',
                            borderRadius: 4,
                          }}
                        >
                          {[
                            'Metric',
                            'Prediction',
                            'Reference',
                            'Difference',
                            'Score',
                          ].map((col) => (
                            <Text
                              key={col}
                              style={{
                                color: '#B8BECE',
                                fontSize: 12,
                                fontWeight: 600,
                                padding: '4px 8px',
                              }}
                            >
                              {col}
                            </Text>
                          ))}
                        </Box>
                        {attributionRows.map((row, idx) => (
                          <Box
                            key={`${row.metric}-${idx}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '1.25fr 1.1fr 1.1fr 1fr 0.95fr',
                              gap: 0,
                              borderBottom:
                                idx === attributionRows.length - 1
                                  ? 'none'
                                  : '1px solid #393C56',
                            }}
                          >
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                padding: '8px',
                              }}
                            >
                              {row.metric}
                            </Text>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                padding: '4px 12px',
                              }}
                            >
                              {row.prediction}
                            </Text>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                padding: ' 4px 14px',
                              }}
                            >
                              {row.reference}
                            </Text>
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                padding: '4px 16px',
                              }}
                            >
                              {row.difference}
                            </Text>
                            <Box
                              style={{
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Box
                                style={{
                                  borderRadius: 999,
                                  background: row.scoreBg,
                                  color: row.scoreColor,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '4px 8px',
                                  lineHeight: 1.2,
                                  textAlign: 'center',
                                  minWidth: 70,
                                }}
                              >
                                {row.score}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      )}
      <Modal
        opened={showGoToDateModal && Boolean(pendingGoToDate)}
        onClose={() => {
          if (goToDateSubmitting) return
          closeGoToDateModal()
        }}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        size="550px"
        radius={8}
        transitionProps={{
          transition: 'fade',
          duration: GO_TO_DATE_MODAL_TRANSITION_MS,
          timingFunction: 'ease',
        }}
        overlayProps={{ backgroundOpacity: 0.65, blur: 1 }}
        styles={{
          content: {
            background: '#24263C',
            border: '1px solid #393C56',
            maxWidth: 680,
          },
          body: {
            padding: 28,
          },
        }}
      >
        {pendingGoToDate && (
          <Box style={{ padding: '4px 6px' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Warning
            </Text>
            <Text
              style={{
                color: '#8D93A8',
                fontSize: 14,
                lineHeight: 1.45,
                marginBottom: 20,
                maxWidth: 560,
              }}
            >
              This will update the map and ship positions to{' '}
              <Text span style={{ color: '#fff', fontWeight: 700 }}>
                {pendingGoToDate.dateLabel}.
              </Text>{' '}
              You can return to today&apos;s view using the calendar in the
              header.
            </Text>
            <Box style={{ marginTop: 8, marginBottom: 24 }}>
              <Checkbox
                size="sm"
                checked={dontShowGoToDateAgain}
                disabled={goToDateSubmitting}
                onChange={(e) =>
                  setDontShowGoToDateAgain(e.currentTarget.checked)
                }
                label="Don't show this again"
                styles={{
                  label: { color: '#8D93A8', fontSize: 14 },
                  input: {
                    background: 'transparent',
                    borderColor: '#5C6270',
                    '&[data-checked]': {
                      background: '#0094FF',
                      borderColor: '#0094FF',
                    },
                  },
                }}
              />
            </Box>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <Button
                disabled={goToDateSubmitting}
                onMouseEnter={() => setGoToDateCancelHovered(true)}
                onMouseLeave={() => setGoToDateCancelHovered(false)}
                onClick={() => {
                  if (goToDateSubmitting) return
                  closeGoToDateModal()
                }}
                style={{
                  background: goToDateCancelHovered
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'transparent',
                  border: '1px solid #fff',
                  color: '#fff',
                  fontSize: 14,
                  minWidth: 88,
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={goToDateSubmitting}
                loading={goToDateSubmitting}
                onMouseEnter={() => setGoToDateConfirmHovered(true)}
                onMouseLeave={() => setGoToDateConfirmHovered(false)}
                onClick={() => {
                  if (goToDateSubmitting || !pendingGoToDate) return
                  if (dontShowGoToDateAgain) {
                    setSkipGoToDateWarning(true)
                    try {
                      window.localStorage.setItem(
                        GO_TO_DATE_WARNING_PREF_KEY,
                        'true'
                      )
                    } catch {
                      // Ignore storage issues; behavior still applies this session.
                    }
                  }
                  const nextGoToDate = pendingGoToDate
                  setGoToDateSubmitting(true)
                  goToDateTimerRef.current = window.setTimeout(() => {
                    // Update behind the modal first, then fade modal away,
                    // so the new state appears smoothly without a visible flicker.
                    applyGoToDate(
                      nextGoToDate.dateKey,
                      nextGoToDate.detectionId
                    )
                    closeGoToDateModal()
                    goToDateTimerRef.current = null
                  }, GO_TO_DATE_CONFIRM_DELAY_MS)
                }}
                style={{
                  background: goToDateSubmitting
                    ? '#5C6270'
                    : goToDateConfirmHovered
                      ? '#007DD6'
                      : '#0094FF',
                  color: goToDateSubmitting ? '#D7DAE2' : '#fff',
                  borderColor: goToDateSubmitting
                    ? '#5C6270'
                    : goToDateConfirmHovered
                      ? '#007DD6'
                      : '#0094FF',
                  cursor: goToDateSubmitting ? 'not-allowed' : 'pointer',
                  minWidth: 88,
                }}
              >
                Yes
              </Button>
            </Box>
          </Box>
        )}
      </Modal>
    </Box>
  )
}

export default Myships
