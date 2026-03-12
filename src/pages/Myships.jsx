import React, { useState, useEffect, useRef, useCallback } from 'react'
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

const detailTabs = [
  'Event Timeline',
  'Sat. Imagery Timeline',
  'Ship Information',
]
const GO_TO_DATE_WARNING_PREF_KEY = 'myships.skipGoToDateWarning'
const GO_TO_DATE_CONFIRM_DELAY_MS = 1400
const GO_TO_DATE_MODAL_TRANSITION_MS = 220
const TIMELINE_MIN_HEIGHT = 260
const getDetectionDateKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

// Keep drag-resize code for possible future re-enable.
const ENABLE_TIMELINE_DRAG = true

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
  const [isTopSummaryCollapsed, setIsTopSummaryCollapsed] = useState(false)
  const [hoveredTopAction, setHoveredTopAction] = useState(null)
  const [detailToolsVisible, setDetailToolsVisible] = useState(true)
  const [showGoToDateModal, setShowGoToDateModal] = useState(false)
  const [dontShowGoToDateAgain, setDontShowGoToDateAgain] = useState(false)
  const [skipGoToDateWarning, setSkipGoToDateWarning] = useState(false)
  const [pendingGoToDate, setPendingGoToDate] = useState(null)
  const [goToDateSubmitting, setGoToDateSubmitting] = useState(false)
  const loadedTabsRef = useRef(new Set())
  const cardRefs = useRef({})
  const scrollContainerRef = useRef(null)
  const tabScrollRef = useRef(null)
  const prevMapDateRef = useRef(mapDate)
  const panelContainerRef = useRef(null)
  const topSectionRef = useRef(null)
  const topSummaryHeaderRef = useRef(null)
  const lastExpandedTopHeightRef = useRef(null)
  const goToDateTimerRef = useRef(null)
  const goToDateCloseTimerRef = useRef(null)

  const updateOverflow = useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setOverflowLeft(el.scrollLeft > 0)
    setOverflowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const getMinTopHeight = useCallback(() => {
    const FALLBACK_MIN = 96
    if (!topSummaryHeaderRef.current || !topSectionRef.current) return FALLBACK_MIN

    const headerRect = topSummaryHeaderRef.current.getBoundingClientRect()
    const topSectionStyles = window.getComputedStyle(topSectionRef.current)
    const headerStyles = window.getComputedStyle(topSummaryHeaderRef.current)

    const paddingTop = parseFloat(topSectionStyles.paddingTop) || 0
    const paddingBottom = parseFloat(topSectionStyles.paddingBottom) || 0
    const marginBottom = parseFloat(headerStyles.marginBottom) || 0

    return Math.ceil(headerRect.height + paddingTop + paddingBottom + marginBottom)
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
      const sourceDetection = detections.find((d) => d.id === detectionId)
      const sourceShipId = sourceDetection?.shipId
      const sourceType = sourceDetection?.type
      const shipDetectionsForDate = sourceShipId
        ? detections
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
            previewCard: null,
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
    [activeShipTab, setMapDate, setActiveDetectionId, setPreviewDetectionId]
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
      if (goToDateTimerRef.current) {
        window.clearTimeout(goToDateTimerRef.current)
      }
      if (goToDateCloseTimerRef.current) {
        window.clearTimeout(goToDateCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (mapDate === prevMapDateRef.current) return
    prevMapDateRef.current = mapDate
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (mapDate === todayStr && activeShipTab) {
      const tab = shipTabs.find((t) => t.id === activeShipTab)
      const shipId = tab?.type === 'sts' ? tab.shipIds[0] : activeShipTab
      const latest = detections
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
          previewCard: null,
        },
      }))
    }
  }, [mapDate, activeShipTab, setActiveDetectionId, setPreviewDetectionId])

  const currentTabState = tabState[activeShipTab] || {
    selectedCard: null,
    previewCard: null,
    activeDetailTab: 0,
  }
  const selectedCard = currentTabState.selectedCard
  const previewCard = currentTabState.previewCard
  const activeDetailTab = currentTabState.activeDetailTab

  const updateTabState = (key, value) => {
    setTabState((prev) => ({
      ...prev,
      [activeShipTab]: {
        ...prev[activeShipTab],
        selectedCard: prev[activeShipTab]?.selectedCard ?? null,
        previewCard: prev[activeShipTab]?.previewCard ?? null,
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
      const shipDetections = detections
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
        updateTabState('previewCard', null)
        setActiveDetectionId(targetId)
        setPreviewDetectionId(null)
        if (selectedDetectionId) setSelectedDetectionId(null)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [activeShipTab])

  useEffect(() => {
    if (selectedDetectionId != null) {
      const activeTabForSelection = shipTabs.find((t) => t.id === activeShipTab)
      const isCurrentTabSts = activeTabForSelection?.type === 'sts'
      if (isCurrentTabSts) {
        setSelectedDetectionId(null)
        return
      }
      updateTabState('selectedCard', selectedDetectionId)
      updateTabState('previewCard', null)
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
          if (Math.abs(candidate - topSectionHeight) < Math.abs(closest - topSectionHeight)) {
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
    ? detections
        .filter((d) => d.shipId === activeShipId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []
  const timelineDetections = activeShipDetections.filter(
    (d) => d.type !== 'ais'
  )

  const latestDetection = activeShipDetections[0] || null
  const latestAisDetection =
    activeShipDetections.find((d) => d.type === 'ais') || null
  const latestNonStsDetection = activeShipDetections.find(
    (d) => d.type !== 'sts' && d.type !== 'sts-ais'
  )

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
    sts: 'STS',
    'sts-ais': 'STS',
    unattributed: 'Unattributed',
  }

  const handleSwitchToAis = () => {
    const targetDetection = latestAisDetection || latestDetection
    if (!targetDetection) return

    setFlashEnabled(true)
    setActiveDetectionId(targetDetection.id)
    setPreviewDetectionId(null)

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
            previewCard: null,
            activeDetailTab: prev[currentShipId]?.activeDetailTab ?? 0,
          },
        }))
        setActiveShipTab(currentShipId)
      } else if (targetDetection) {
        openShipTab(targetDetection)
      } else {
        updateTabState('selectedCard', targetDetection.id)
        updateTabState('previewCard', null)
        setActiveShipTab(activeShipTab)
      }
    } else {
      updateTabState('selectedCard', targetDetection.id)
      updateTabState('previewCard', null)
      setActiveShipTab(activeShipTab)
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

  const getLatestNonStsByShip = useCallback((shipId) => {
    return detections
      .filter(
        (d) => d.shipId === shipId && d.type !== 'sts' && d.type !== 'sts-ais'
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }, [])

  const getStsTabBarColors = useCallback(
    (tab) => {
      if (!tab || tab.type !== 'sts') return null
      const [ship1Id, ship2Id] = tab.shipIds
      const latestNonSts1 = getLatestNonStsByShip(ship1Id)
      const latestNonSts2 = getLatestNonStsByShip(ship2Id)
      const color1 =
        eventColorMap[latestNonSts1?.type] || eventColorMap.light || '#393C56'
      const color2 =
        tab.stsType === 'sts'
          ? eventColorMap.unattributed
          : eventColorMap[latestNonSts2?.type] || eventColorMap.ais || '#393C56'
      return [color1, color2]
    },
    [getLatestNonStsByShip]
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
      const leftType = getLatestNonStsByShip(det.shipId)?.type || 'light'
      const rightType =
        det.type === 'sts'
          ? 'unattributed'
          : getLatestNonStsByShip(det.stsPartner)?.type || 'ais'
      return [
        eventColorMap[leftType] || eventColorMap.light,
        eventColorMap[rightType] || eventColorMap.unattributed,
      ]
    },
    [getLatestNonStsByShip]
  )

  const renderStsTabIcon = useCallback(
    (tab, size = { width: 8, height: 20, gap: 2 }) => {
      const colors = getStsTabBarColors(tab)
      return renderStsBars(colors, size)
    },
    [getStsTabBarColors, renderStsBars]
  )
  const selectedStsIcon =
    isStsTab &&
    (selectedDetection?.type === 'sts' || selectedDetection?.type === 'sts-ais')
      ? (() => {
          const colors = getStsDetectionBarColors(selectedDetection)
          return renderStsBars(colors, { width: 6, height: 14, gap: 2 })
        })()
      : undefined

  const eventIconMap = {
    ais: <AisIcon style={{ height: 12 }} />,
    light: <LightShipIcon style={{ height: 12 }} />,
    dark: <DarkShipIcon style={{ height: 12 }} />,
    spoofing: <SpoofingIcon style={{ height: 12 }} />,
    sts: <STSIcon style={{ height: 12 }} />,
    'sts-ais': <STSAisIcon style={{ height: 12 }} />,
    unattributed: <UnattributedIcon style={{ height: 12 }} />,
  }

  const stsHeaderType = isStsTab
    ? activeStsShip === 0
      ? latestNonStsDetection?.type
      : activeTab.stsType === 'sts-ais'
        ? latestNonStsDetection?.type || 'ais'
        : null
    : null
  const headerType = isStsUnattributed
    ? 'unattributed'
    : selectedDetection?.type === 'ais'
      ? 'ais'
      : stsHeaderType || latestDetection?.type

  const derivedLatestEvent = headerType ? (
    <Box
      style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff' }}
    >
      {eventIconMap[headerType]}
      <Text size="xs" style={{ color: '#fff' }}>
        {eventLabel[headerType] || headerType}
      </Text>
    </Box>
  ) : null
  const isLatest =
    !selectedCard || selectedDetection?.id === latestDetection?.id
  const isAisSelected =
    latestAisDetection != null &&
    selectedDetection?.id === latestAisDetection.id

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
              const latest1 = detections
                .filter((d) => d.shipId === sid1)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latest2 = detections
                .filter((d) => d.shipId === sid2)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latestNonSts1 = detections
                .filter(
                  (d) =>
                    d.shipId === sid1 &&
                    d.type !== 'sts' &&
                    d.type !== 'sts-ais'
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
              const latestNonSts2 = detections
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
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <Title order={4} style={{ color: 'white' }}>
                  {activeShip.name}
                </Title>
                {activeShip.flag && (
                  <Text style={{ fontSize: 18 }}>{activeShip.flag}</Text>
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
                    display: 'flex',
                    marginBottom: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        color: '#888F9E',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Event
                    </Text>
                    <Box
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      {derivedLatestEvent}
                      {latestAisDetection && !isAisSelected && (
                        <Text
                          onClick={handleSwitchToAis}
                          style={{
                            color: '#0094FF',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Switch to Latest AIS
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'max-content max-content minmax(0, 1fr)',
                    columnGap: '32px',
                    marginBottom: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>IMO</Text>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
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
                          label="Copy IMO"
                          withArrow
                          color="#393C56"
                          styles={{
                            tooltip: { color: '#fff', fontSize: 12, fontWeight: 600 },
                          }}
                        >
                          <Box
                            onClick={() =>
                              navigator.clipboard.writeText(String(activeShip.imo))
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color: '#0094ff',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Copy02
                              style={{ width: 14, height: 14, color: '#0094ff' }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>MMSI</Text>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
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
                          label="Copy MMSI"
                          withArrow
                          color="#393C56"
                          styles={{
                            tooltip: { color: '#fff', fontSize: 12, fontWeight: 600 },
                          }}
                        >
                          <Box
                            onClick={() =>
                              navigator.clipboard.writeText(String(activeShip.mmsi))
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color: '#0094ff',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Copy02
                              style={{ width: 14, height: 14, color: '#0094ff' }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box style={{ minWidth: 0, width: '100%' }}>
                    <Text style={{ color: '#888F9E', fontSize: '10px' }}>
                      SynMax Ship ID
                    </Text>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 0,
                        width: '100%',
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
                          fontSize: 12,
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
                              {String(activeShip.shipId).slice(1)}
                            </Box>
                          </>
                        ) : (
                          'No info'
                        )}
                      </Box>
                      {canCopyShipId && (
                        <Tooltip
                          label="Copy SynMax Ship Id"
                          withArrow
                          color="#393C56"
                          styles={{
                            tooltip: { color: '#fff', fontSize: 12, fontWeight: 600 },
                          }}
                        >
                          <Box
                            onClick={() =>
                              navigator.clipboard.writeText(activeShip.shipId)
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              color: '#0094ff',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Copy02
                              style={{ width: 14, height: 14, color: '#0094ff' }}
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
                        width: isResizingTimeline || isDragHandleHovered ? 54 : 42,
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
                    {timelineDetections.map((det) => {
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
                            isPreviewed={previewCard === det.id}
                            onTogglePreview={() => {
                              const nextPreviewId =
                                previewCard === det.id ? null : det.id
                              updateTabState('previewCard', nextPreviewId)
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
                              updateTabState('previewCard', null)

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
                    <Title order={4} style={{ color: '#fff' }}>
                      Sat. Imagery Timeline
                    </Title>
                  </Box>
                )}
                {activeDetailTab === 2 && (
                  <Box style={{ padding: 20 }}>
                    <Title order={4} style={{ color: '#fff' }}>
                      Ship Information
                    </Title>
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
        size="md"
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
            padding: 18,
          },
        }}
      >
        {pendingGoToDate && (
          <Box>
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Warning
            </Text>
            <Text
              style={{
                color: '#8D93A8',
                fontSize: 14,
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              This will update the map and ship positions to{' '}
              <Text span style={{ color: '#fff', fontWeight: 700 }}>
                {pendingGoToDate.dateLabel}.
              </Text>{' '}
              You can return to today&apos;s view using the calendar in the
              header.
            </Text>
            <Box style={{ marginTop: 12, marginBottom: 16 }}>
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
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Button
                variant="subtle"
                disabled={goToDateSubmitting}
                onClick={() => {
                  if (goToDateSubmitting) return
                  closeGoToDateModal()
                }}
                style={{
                  color: '#fff',
                  paddingLeft: 0,
                  paddingRight: 0,
                  fontSize: 14,
                }}
                styles={{
                  root: {
                    background: 'transparent',
                    color: '#fff',
                    '&:hover': {
                      background: 'transparent',
                      color: '#BFC4CE',
                    },
                  },
                  inner: { justifyContent: 'flex-start' },
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={goToDateSubmitting}
                loading={goToDateSubmitting}
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
                    closeGoToDateModal(() => {
                      applyGoToDate(
                        nextGoToDate.dateKey,
                        nextGoToDate.detectionId
                      )
                    })
                    goToDateTimerRef.current = null
                  }, GO_TO_DATE_CONFIRM_DELAY_MS)
                }}
                style={{
                  background: goToDateSubmitting ? '#5C6270' : '#0094FF',
                  color: goToDateSubmitting ? '#D7DAE2' : '#fff',
                  borderColor: goToDateSubmitting ? '#5C6270' : '#0094FF',
                  cursor: goToDateSubmitting ? 'not-allowed' : 'pointer',
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
