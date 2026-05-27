import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text, Radio, Button, Checkbox, Select, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { Calendar, Edit02, CheckCircle, ChevronDown } from '@untitledui/icons'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'
import { useShipContext } from '../context/ShipContext'

const ALERTS_SECONDARY_NAV_DEFAULT_WIDTH = 386
const IMPORT_SHIP_OPTIONS = [
  { id: 'invictus', name: 'INVICTUS', flag: '🇺🇸', imo: '9381653', mmsi: '338070829' },
  { id: 'ocean-moon', name: 'OCEAN MOON', flag: '🇲🇭', imo: '9381653', mmsi: '338070829' },
  { id: 'ubc-stockholm', name: 'UBC STOCKHOLM', flag: '🇨🇾', imo: '9381653', mmsi: '338070829' },
  { id: 'virgen-de-coromoto', name: 'VIRGEN DE COROMOTO', flag: '🇨🇴', imo: '9381653', mmsi: '338070829' },
  { id: 'kerkyra', name: 'KERKYRA', flag: '🇵🇦', imo: '9381653', mmsi: '338070829' },
]
const IMPORT_SHAPE_OPTIONS = [
  {
    id: 'shape-1',
    name: 'Shape 1',
    previewArea: 'Red Sea',
    length: '372.57km',
    area: '80km²',
    glyph: 'poly',
  },
]

function AlertsSecondaryNav({ isOpen, onOpen, onClose }) {
  const { setAlertPreviewAreas } = useShipContext()
  const shipUploadInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('New Alert')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [shipSelection, setShipSelection] = useState('any')
  const [areaSelection, setAreaSelection] = useState('global')
  const [selectedTriggers, setSelectedTriggers] = useState([])
  const [sequentialLogic, setSequentialLogic] = useState('no')
  
  // Step 4 state
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [doesNotExpire, setDoesNotExpire] = useState(false)
  const [notificationFrequency, setNotificationFrequency] = useState('Daily Report')
  const [receiveViaEmail, setReceiveViaEmail] = useState(true)
  const [receiveViaApp, setReceiveViaApp] = useState(false)
  const [emailForNotifications, setEmailForNotifications] = useState('')
  const [alertName, setAlertName] = useState('')
  const [hasNewAlert, setHasNewAlert] = useState(false)
  const [specificShipDraft, setSpecificShipDraft] = useState('')
  const [selectedSpecificShips, setSelectedSpecificShips] = useState([])
  const [importDropdownOpen, setImportDropdownOpen] = useState(false)
  const [selectedImportShipIds, setSelectedImportShipIds] = useState([])
  const [uploadedShipFileName, setUploadedShipFileName] = useState('')
  const [specificAreaSearch, setSpecificAreaSearch] = useState('')
  const [specificAreaDraft, setSpecificAreaDraft] = useState('')
  const [selectedSpecificAreas, setSelectedSpecificAreas] = useState([])
  const [importShapesDropdownOpen, setImportShapesDropdownOpen] = useState(false)
  const [selectedImportShapeIds, setSelectedImportShapeIds] = useState([])
  const [drawnAreaCount, setDrawnAreaCount] = useState(0)
  const [uploadedAreaFileName, setUploadedAreaFileName] = useState('')

  const isNewAlert = activeTab === 'New Alert'

  const normalizePreviewAreaLabel = (value) =>
    String(value || '')
      .replace(/\s+AOI$/i, '')
      .trim()
  const arePreviewAreasEqual = (left, right) => {
    if (!Array.isArray(left) || !Array.isArray(right)) return false
    if (left.length !== right.length) return false
    return left.every((item, index) => {
      const other = right[index]
      return (
        item?.id === other?.id &&
        item?.label === other?.label &&
        item?.area === other?.area
      )
    })
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 5) {
      setCurrentStep(6)
      setHasNewAlert(true)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setShipSelection('any')
    setAreaSelection('global')
    setSelectedTriggers([])
    setSequentialLogic('no')
    setStartDate(null)
    setEndDate(null)
    setDoesNotExpire(false)
    setNotificationFrequency('Daily Report')
    setReceiveViaEmail(true)
    setReceiveViaApp(false)
    setEmailForNotifications('')
    setAlertName('')
    setSpecificShipDraft('')
    setSelectedSpecificShips([])
    setImportDropdownOpen(false)
    setSelectedImportShipIds([])
    setUploadedShipFileName('')
    setSpecificAreaSearch('')
    setSpecificAreaDraft('')
    setSelectedSpecificAreas([])
    setImportShapesDropdownOpen(false)
    setSelectedImportShapeIds([])
    setDrawnAreaCount(0)
    setUploadedAreaFileName('')
    setAlertPreviewAreas([])
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isNextDisabled = () => {
    if (currentStep === 1) {
      if (shipSelection === 'any') return false
      const hasSpecificShipInput =
        selectedSpecificShips.length > 0 ||
        selectedImportShipIds.length > 0 ||
        Boolean(uploadedShipFileName)
      return !hasSpecificShipInput
    }
    if (currentStep === 2) {
      if (areaSelection === 'global') return false
      const hasSpecificAreaInput =
        selectedSpecificAreas.length > 0 ||
        specificAreaSearch.trim().length > 0 ||
        selectedImportShapeIds.length > 0 ||
        drawnAreaCount > 0 ||
        Boolean(uploadedAreaFileName)
      return !hasSpecificAreaInput
    }
    if (currentStep === 3 && selectedTriggers.length > 1 && sequentialLogic === 'yes') return true
    if (currentStep === 4) {
      if (!startDate) return true
      if (!doesNotExpire && !endDate) return true
      if (receiveViaEmail && !emailForNotifications.trim()) return true
      if (!receiveViaEmail && !receiveViaApp) return true
    }
    if (currentStep === 5 && !alertName.trim()) return true
    return false
  }

  const toggleTrigger = (trigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    )
  }

  const triggerOptions = [
    { id: 'optical', label: 'Optical detection' },
    { id: 'spoofing', label: 'Spoofing event' },
    { id: 'ais_on', label: 'AIS on' },
    { id: 'ais_off', label: 'AIS off' },
    { id: 'sts_ais', label: 'STS (AIS)' },
    { id: 'sts_optical', label: 'STS (optical)' },
    { id: 'flag_change', label: 'Flag change' },
    { id: 'ownership_change', label: 'Ownership change' },
    { id: 'gps_manipulation', label: 'GPS manipulation' },
  ]
  const shapeRouteTriggerOptions = [
    { id: 'enters_selected_area', label: 'Enters selected area' },
    { id: 'leaves_selected_area', label: 'Leaves selected area' },
  ]
  const isShapeRouteFlow =
    areaSelection === 'specific' && selectedImportShapeIds.length > 0

  const triggerLabels = selectedTriggers.map(id => triggerOptions.find(t => t.id === id)?.label).join(', ')
  const triggersValue = selectedTriggers.length > 0
    ? `${selectedTriggers.length > 1 ? (sequentialLogic === 'yes' ? 'Sequential: ' : 'Non-sequential: ') : ''}${triggerLabels}`
    : 'None'

  const receiveViaText = [receiveViaEmail ? 'Email' : null, receiveViaApp ? 'In-App Notification' : null].filter(Boolean).join(', ')
  const uploadedFileDisplay = uploadedShipFileName || 'None'
  const selectedImportShips = useMemo(
    () =>
      IMPORT_SHIP_OPTIONS.filter((ship) => selectedImportShipIds.includes(ship.id)),
    [selectedImportShipIds]
  )
  const selectedImportShapes = useMemo(
    () =>
      IMPORT_SHAPE_OPTIONS.filter((shape) =>
        selectedImportShapeIds.includes(shape.id)
      ),
    [selectedImportShapeIds]
  )
  const importFromMyShipsSummary = selectedImportShips.length
    ? selectedImportShips.map((ship) => `${ship.name} ${ship.flag}`).join(', ')
    : 'None'
  const importFromMyShapesSummary = selectedImportShapes.length
    ? selectedImportShapes.map((shape) => shape.name).join(', ')
    : 'None'

  const addSpecificShip = (shipLabel) => {
    const cleaned = shipLabel.trim()
    if (!cleaned) return
    setSelectedSpecificShips((prev) => {
      if (prev.some((ship) => ship.toLowerCase() === cleaned.toLowerCase())) {
        return prev
      }
      return [...prev, cleaned]
    })
    setSpecificShipDraft('')
  }

  const removeSpecificShip = (shipLabel) => {
    setSelectedSpecificShips((prev) => prev.filter((ship) => ship !== shipLabel))
  }

  const addSpecificArea = (areaLabel) => {
    const cleaned = areaLabel.trim()
    if (!cleaned) return
    setSelectedSpecificAreas((prev) => {
      if (prev.some((area) => area.toLowerCase() === cleaned.toLowerCase())) {
        return prev
      }
      return [...prev, cleaned]
    })
    setSpecificAreaDraft('')
    setSpecificAreaSearch('')
  }

  const removeSpecificArea = (areaLabel) => {
    setSelectedSpecificAreas((prev) => prev.filter((area) => area !== areaLabel))
  }

  const toggleImportShape = (shapeId) => {
    setSelectedImportShapeIds((prev) =>
      prev.includes(shapeId)
        ? prev.filter((id) => id !== shapeId)
        : [...prev, shapeId]
    )
  }

  const renderShapeGlyph = (glyph) => {
    const baseStyle = {
      width: 14,
      height: 14,
      border: '1px solid #00B8FF',
      background: 'rgba(0, 184, 255, 0.15)',
      display: 'inline-block',
    }
    if (glyph === 'line') {
      return <span style={{ ...baseStyle, height: 4, marginTop: 5 }} />
    }
    if (glyph === 'circle') {
      return <span style={{ ...baseStyle, borderRadius: '50%' }} />
    }
    if (glyph === 'rect') {
      return <span style={{ ...baseStyle, transform: 'skew(12deg)' }} />
    }
    if (glyph === 'poly-alt') {
      return (
        <span
          style={{
            ...baseStyle,
            clipPath: 'polygon(10% 0%, 75% 0%, 100% 40%, 70% 100%, 0% 100%, 25% 45%)',
          }}
        />
      )
    }
    return (
      <span
        style={{
          ...baseStyle,
          clipPath: 'polygon(0% 20%, 35% 0%, 100% 0%, 75% 45%, 100% 100%, 25% 100%)',
        }}
      />
    )
  }

  useEffect(() => {
    if (!isNewAlert || currentStep !== 2 || areaSelection !== 'specific') {
      setAlertPreviewAreas((prev) => (prev.length === 0 ? prev : []))
      return
    }
    const selectedArea = selectedSpecificAreas[0]
    const selectedShapeArea = selectedImportShapes[0]?.previewArea
    const areaCandidate =
      selectedArea ||
      selectedShapeArea ||
      specificAreaDraft ||
      specificAreaSearch

    const previewCandidates = []
    if (areaCandidate) {
      previewCandidates.push({
        id: `search-${normalizePreviewAreaLabel(areaCandidate).toLowerCase()}`,
        label: normalizePreviewAreaLabel(areaCandidate),
        area: normalizePreviewAreaLabel(areaCandidate),
      })
    }
    selectedImportShapes.forEach((shape) => {
      const normalized = normalizePreviewAreaLabel(shape.previewArea)
      if (!normalized) return
      previewCandidates.push({
        id: `shape-${shape.id}`,
        label: shape.name,
        area: normalized,
      })
    })

    const dedupedPreviewAreas = previewCandidates.filter(
      (candidate, index, arr) =>
        arr.findIndex((item) => item.id === candidate.id) === index
    )
    setAlertPreviewAreas((prev) =>
      arePreviewAreasEqual(prev, dedupedPreviewAreas)
        ? prev
        : dedupedPreviewAreas
    )
  }, [
    isNewAlert,
    currentStep,
    areaSelection,
    selectedSpecificAreas,
    selectedImportShapes,
    specificAreaDraft,
    specificAreaSearch,
    setAlertPreviewAreas,
  ])

  useEffect(() => {
    if (isShapeRouteFlow) return
    setSelectedTriggers((prev) =>
      prev.filter(
        (triggerId) =>
          !shapeRouteTriggerOptions.some((option) => option.id === triggerId)
      )
    )
  }, [isShapeRouteFlow])

  const toggleImportShip = (ship) => {
    setSelectedImportShipIds((prev) => {
      const isSelected = prev.includes(ship.id)
      if (isSelected) {
        return prev.filter((id) => id !== ship.id)
      }
      return [...prev, ship.id]
    })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const renderSummaryRow = (label, value, stepToEdit) => (
    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>{label}</Text>
        <Text style={{ color: '#fff', fontSize: '14px', lineHeight: 1.4 }}>{value}</Text>
      </Box>
      <Edit02
        size={16}
        color="#888F9E"
        style={{ cursor: 'pointer', marginTop: '4px' }}
        onClick={() => setCurrentStep(stepToEdit)}
      />
    </Box>
  )

  return (
    <Box
      style={{
        width: isOpen ? ALERTS_SECONDARY_NAV_DEFAULT_WIDTH : 32,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #393c56',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ExpandButton
            backgroundColor={expandHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      {isOpen && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton
            backgroundColor={collapseHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      <Box
        style={{
          width: ALERTS_SECONDARY_NAV_DEFAULT_WIDTH,
          minWidth: ALERTS_SECONDARY_NAV_DEFAULT_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box
          style={{
            display: 'flex',
            borderBottom: '1px solid #393C56',
            height: 50,
          }}
        >
          <Box
            onClick={() => setActiveTab('New Alert')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: isNewAlert ? '2px solid #fff' : 'none',
              color: isNewAlert ? '#fff' : '#888F9E',
              fontWeight: isNewAlert ? 600 : 400,
              fontSize: 14,
            }}
          >
            New Alert
          </Box>
          <Box
            onClick={() => setActiveTab('My Alerts')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: !isNewAlert ? '2px solid #fff' : 'none',
              color: !isNewAlert ? '#fff' : '#888F9E',
              fontWeight: !isNewAlert ? 600 : 400,
              fontSize: 14,
              gap: '6px',
            }}
          >
            {hasNewAlert && (
              <Box
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#F75349',
                }}
              />
            )}
            My Alerts
          </Box>
        </Box>

        <Box
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isNewAlert ? (
            <>
              {/* Progress Bar */}
              {currentStep < 6 && (
                <Box
                  style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
                >
                  {[1, 2, 3, 4, 5].map((step) => (
                    <Box
                      key={step}
                      style={{
                        height: '8px',
                        flex: 1,
                        backgroundColor: currentStep >= step ? '#0094FF' : '#24263C',
                        borderRadius: '4px',
                      }}
                    />
                  ))}
                </Box>
              )}

              {currentStep === 1 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select ship(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the ship(s) you'd like to be alerted with. If you don't
                    have a specific ship in mind, select "Any ship" and you'll be
                    notified when any ship triggers the alert.
                  </Text>

                  <Radio.Group value={shipSelection} onChange={setShipSelection}>
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '8px',
                      }}
                    >
                      <Radio
                        value="any"
                        label="Any ship"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                      <Radio
                        value="specific"
                        label="Specific ship(s)"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                    </Box>
                  </Radio.Group>
                  {shipSelection === 'specific' && (
                    <>
                      <Box
                        style={{
                          height: '1px',
                          backgroundColor: '#393C56',
                          margin: '22px 0 18px',
                        }}
                      />
                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginBottom: '14px',
                          lineHeight: 1.4,
                        }}
                      >
                        Add ship(s) using any of below methods:
                      </Text>

                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <Text style={{ color: '#E0E0E0', fontSize: '14px' }}>
                          Search For Ship(s)
                        </Text>
                        <Text style={{ color: '#E0E0E0', fontSize: '14px' }}>
                          {selectedSpecificShips.length} Ship
                          {selectedSpecificShips.length === 1 ? '' : 's'}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          minHeight: 40,
                          border: '1px solid #393C56',
                          borderRadius: 4,
                          background: 'transparent',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        {selectedSpecificShips.map((ship) => (
                          <Box
                            key={ship}
                            style={{
                              height: 22,
                              borderRadius: 4,
                              background: '#3A3F58',
                              padding: '0 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Text style={{ color: '#fff', fontSize: 12 }}>{ship}</Text>
                            <Text
                              onClick={() => removeSpecificShip(ship)}
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                cursor: 'pointer',
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </Text>
                          </Box>
                        ))}
                        <input
                          value={specificShipDraft}
                          onChange={(event) => setSpecificShipDraft(event.currentTarget.value)}
                          onBlur={() => addSpecificShip(specificShipDraft)}
                          onKeyDown={(event) => {
                            if (
                              event.key === 'Enter' ||
                              event.key === ',' ||
                              event.key === 'Tab'
                            ) {
                              event.preventDefault()
                              addSpecificShip(specificShipDraft)
                            }
                          }}
                          placeholder={
                            selectedSpecificShips.length === 0
                              ? 'Search by name, SynMax ship ID, IMO, or MMSI'
                              : ''
                          }
                          style={{
                            flex: 1,
                            minWidth: 120,
                            height: 28,
                            background: 'transparent',
                            color: '#fff',
                            border: 'none',
                            outline: 'none',
                            fontSize: 13,
                          }}
                        />
                      </Box>

                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '14px',
                          marginBottom: '8px',
                        }}
                      >
                        <Text style={{ color: '#E0E0E0', fontSize: '14px' }}>
                          Import From My Ships
                        </Text>
                        <Text style={{ color: '#E0E0E0', fontSize: '12px' }}>
                          {selectedImportShipIds.length} Ship
                          {selectedImportShipIds.length === 1 ? '' : 's'}
                        </Text>
                      </Box>
                      <Box style={{ position: 'relative' }}>
                        <Box
                          onClick={() => setImportDropdownOpen((prev) => !prev)}
                          style={{
                            height: 40,
                            border: '1px solid #393C56',
                            borderRadius: 4,
                            padding: '0 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            gap: 8,
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              minWidth: 0,
                              flex: 1,
                              overflowX: 'auto',
                            }}
                          >
                            {selectedImportShips.length === 0 ? (
                              <Text style={{ color: '#A4ABBE', fontSize: 14 }}>
                                Select
                              </Text>
                            ) : (
                              selectedImportShips.map((ship) => (
                                <Box
                                  key={ship.id}
                                  style={{
                                    height: 20,
                                    borderRadius: 4,
                                    background: '#2F3852',
                                    border: '1px solid #3B4A6E',
                                    padding: '0 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Text style={{ color: '#fff', fontSize: 11 }}>
                                    {ship.name} {ship.flag}
                                  </Text>
                                  <Text
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      toggleImportShip(ship)
                                    }}
                                    style={{
                                      color: '#fff',
                                      fontSize: 11,
                                      cursor: 'pointer',
                                      lineHeight: 1,
                                    }}
                                  >
                                    ×
                                  </Text>
                                </Box>
                              ))
                            )}
                          </Box>
                          <ChevronDown
                            size={16}
                            color="#FFFFFF"
                            style={{
                              transform: importDropdownOpen
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 120ms ease',
                            }}
                          />
                        </Box>

                        {importDropdownOpen && (
                          <Box
                            style={{
                              position: 'absolute',
                              top: 44,
                              left: 0,
                              right: 0,
                              border: '1px solid #393C56',
                              borderRadius: 4,
                              background: '#111326',
                              zIndex: 20,
                              overflow: 'hidden',
                            }}
                          >
                            {IMPORT_SHIP_OPTIONS.map((ship, index) => (
                              <Box
                                key={ship.id}
                                style={{
                                  padding: '10px 12px',
                                  borderBottom:
                                    index < IMPORT_SHIP_OPTIONS.length - 1
                                      ? '1px solid #2D314A'
                                      : 'none',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr auto auto',
                                  gap: 12,
                                  alignItems: 'center',
                                }}
                              >
                                <Box
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 0,
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedImportShipIds.includes(ship.id)}
                                    onChange={() => toggleImportShip(ship)}
                                    size="sm"
                                    className="ship-filter-checkbox"
                                  />
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 13,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 145,
                                    }}
                                  >
                                    {ship.name} {ship.flag}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text
                                    style={{ color: '#8C93A5', fontSize: 10, marginBottom: 2 }}
                                  >
                                    IMO
                                  </Text>
                                  <Text style={{ color: '#E0E0E0', fontSize: 12 }}>
                                    {ship.imo}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text
                                    style={{ color: '#8C93A5', fontSize: 10, marginBottom: 2 }}
                                  >
                                    MMSI
                                  </Text>
                                  <Text style={{ color: '#E0E0E0', fontSize: 12 }}>
                                    {ship.mmsi}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginTop: '14px', marginBottom: '8px' }}>
                        Upload File
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#8C93A5',
                            fontSize: '12px',
                            lineHeight: 1.35,
                            maxWidth: '200px',
                          }}
                        >
                          Accepted file types: .csv, .xls, .xlsx
                        </Text>
                        <Button
                          variant="outline"
                          onClick={() => shipUploadInputRef.current?.click()}
                          style={{
                            minWidth: '120px',
                            borderColor: '#5B6175',
                            color: '#E0E0E0',
                            backgroundColor: 'transparent',
                          }}
                        >
                          Upload
                        </Button>
                      </Box>
                      <input
                        ref={shipUploadInputRef}
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={(event) =>
                          setUploadedShipFileName(
                            event.target.files?.[0]?.name || ''
                          )
                        }
                        style={{ display: 'none' }}
                      />
                      {!!uploadedShipFileName && (
                        <Text
                          style={{
                            color: '#A4ABBE',
                            fontSize: '12px',
                            marginTop: '8px',
                          }}
                        >
                          Uploaded: {uploadedShipFileName}
                        </Text>
                      )}
                    </>
                  )}
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select area(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the area(s) you'd like to be alerted with. If you
                    don't have a specific area in mind, select "Global" and
                    you'll be notified when the alert is triggered anywhere in
                    the world.
                  </Text>

                  <Radio.Group
                    value={areaSelection}
                    onChange={setAreaSelection}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '8px',
                      }}
                    >
                      <Radio
                        value="global"
                        label="Global"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                      <Radio
                        value="specific"
                        label="Specific area(s)"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                    </Box>
                  </Radio.Group>
                  {areaSelection === 'specific' && (
                    <>
                      <Box
                        style={{
                          height: '1px',
                          backgroundColor: '#393C56',
                          margin: '22px 0 18px',
                        }}
                      />
                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginBottom: '14px',
                          lineHeight: 1.4,
                        }}
                      >
                        Add area(s) using any of below methods:
                      </Text>

                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#E0E0E0',
                            fontSize: '14px',
                          }}
                        >
                          Search For Area(s)
                        </Text>
                        <Text style={{ color: '#E0E0E0', fontSize: '12px' }}>
                          {selectedSpecificAreas.length} Area
                          {selectedSpecificAreas.length === 1 ? '' : 's'}
                        </Text>
                      </Box>
                      <Box
                        style={{
                          minHeight: 40,
                          border: '1px solid #393C56',
                          borderRadius: 4,
                          background: 'transparent',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        {selectedSpecificAreas.map((area) => (
                          <Box
                            key={area}
                            style={{
                              height: 22,
                              borderRadius: 4,
                              background: '#3A3F58',
                              padding: '0 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Text style={{ color: '#fff', fontSize: 12 }}>{area}</Text>
                            <Text
                              onClick={() => removeSpecificArea(area)}
                              style={{
                                color: '#fff',
                                fontSize: 12,
                                cursor: 'pointer',
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </Text>
                          </Box>
                        ))}
                        <input
                          value={specificAreaDraft}
                          onChange={(event) => {
                            setSpecificAreaDraft(event.currentTarget.value)
                            setSpecificAreaSearch(event.currentTarget.value)
                          }}
                          onBlur={() => addSpecificArea(specificAreaDraft)}
                          onKeyDown={(event) => {
                            if (
                              event.key === 'Enter' ||
                              event.key === ',' ||
                              event.key === 'Tab'
                            ) {
                              event.preventDefault()
                              addSpecificArea(specificAreaDraft)
                            }
                          }}
                          placeholder={
                            selectedSpecificAreas.length === 0
                              ? 'Search ports, oceans, countries'
                              : ''
                          }
                          style={{
                            flex: 1,
                            minWidth: 120,
                            height: 28,
                            background: 'transparent',
                            color: '#fff',
                            border: 'none',
                            outline: 'none',
                            fontSize: 13,
                          }}
                        />
                      </Box>

                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '14px',
                          marginBottom: '8px',
                        }}
                      >
                        <Text style={{ color: '#E0E0E0', fontSize: '14px' }}>
                          Import From My Shapes
                        </Text>
                        <Text style={{ color: '#E0E0E0', fontSize: '12px' }}>
                          {selectedImportShapeIds.length} Shape
                          {selectedImportShapeIds.length === 1 ? '' : 's'}
                        </Text>
                      </Box>
                      <Box style={{ position: 'relative' }}>
                        <Box
                          onClick={() => setImportShapesDropdownOpen((prev) => !prev)}
                          style={{
                            height: 40,
                            border: '1px solid #393C56',
                            borderRadius: 4,
                            padding: '0 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            gap: 8,
                          }}
                        >
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              minWidth: 0,
                              flex: 1,
                              overflowX: 'auto',
                            }}
                          >
                            {selectedImportShapes.length === 0 ? (
                              <Text style={{ color: '#A4ABBE', fontSize: 14 }}>
                                Select shape
                              </Text>
                            ) : (
                              selectedImportShapes.map((shape) => (
                                <Box
                                  key={shape.id}
                                  style={{
                                    height: 20,
                                    borderRadius: 4,
                                    background: '#2F3852',
                                    border: '1px solid #3B4A6E',
                                    padding: '0 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Text style={{ color: '#fff', fontSize: 11 }}>
                                    {shape.name}
                                  </Text>
                                  <Text
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      toggleImportShape(shape.id)
                                    }}
                                    style={{
                                      color: '#fff',
                                      fontSize: 11,
                                      cursor: 'pointer',
                                      lineHeight: 1,
                                    }}
                                  >
                                    ×
                                  </Text>
                                </Box>
                              ))
                            )}
                          </Box>
                          <ChevronDown
                            size={16}
                            color="#FFFFFF"
                            style={{
                              transform: importShapesDropdownOpen
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 120ms ease',
                            }}
                          />
                        </Box>
                        {importShapesDropdownOpen && (
                          <Box
                            style={{
                              position: 'absolute',
                              top: 44,
                              left: 0,
                              right: 0,
                              border: '1px solid #393C56',
                              borderRadius: 4,
                              background: '#111326',
                              zIndex: 20,
                              overflow: 'hidden',
                            }}
                          >
                            {IMPORT_SHAPE_OPTIONS.map((shape, index) => (
                              <Box
                                key={shape.id}
                                style={{
                                  padding: '10px 12px',
                                  borderBottom:
                                    index < IMPORT_SHAPE_OPTIONS.length - 1
                                      ? '1px solid #2D314A'
                                      : 'none',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr auto auto',
                                  gap: 10,
                                  alignItems: 'center',
                                }}
                              >
                                <Box
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 0,
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedImportShapeIds.includes(shape.id)}
                                    onChange={() => toggleImportShape(shape.id)}
                                    size="sm"
                                    className="ship-filter-checkbox"
                                  />
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 95,
                                    }}
                                  >
                                    {shape.name}
                                  </Text>
                                  <Box
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 16,
                                      height: 16,
                                    }}
                                  >
                                    {renderShapeGlyph(shape.glyph)}
                                  </Box>
                                </Box>
                                <Box>
                                  <Text
                                    style={{ color: '#8C93A5', fontSize: 10, marginBottom: 2 }}
                                  >
                                    Length
                                  </Text>
                                  <Text style={{ color: '#E0E0E0', fontSize: 12 }}>
                                    {shape.length}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text
                                    style={{ color: '#8C93A5', fontSize: 10, marginBottom: 2 }}
                                  >
                                    Area
                                  </Text>
                                  <Text style={{ color: '#E0E0E0', fontSize: 12 }}>
                                    {shape.area}
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>

                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginTop: '14px',
                          marginBottom: '8px',
                        }}
                      >
                        Draw Polygon
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#8C93A5',
                            fontSize: '12px',
                            lineHeight: 1.35,
                            maxWidth: '200px',
                          }}
                        >
                          Draw polygon on map and use as area
                        </Text>
                        <Button
                          variant="outline"
                          onClick={() => setDrawnAreaCount((prev) => prev + 1)}
                          style={{
                            minWidth: '120px',
                            borderColor: '#5B6175',
                            color: '#E0E0E0',
                            backgroundColor: 'transparent',
                          }}
                        >
                          Draw
                        </Button>
                      </Box>
                      {drawnAreaCount > 0 && (
                        <Text
                          style={{
                            color: '#A4ABBE',
                            fontSize: '12px',
                            marginTop: '8px',
                          }}
                        >
                          {drawnAreaCount} drawn area
                          {drawnAreaCount === 1 ? '' : 's'}
                        </Text>
                      )}

                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginTop: '14px',
                          marginBottom: '8px',
                        }}
                      >
                        Upload File
                      </Text>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <Text
                          style={{
                            color: '#8C93A5',
                            fontSize: '12px',
                            lineHeight: 1.35,
                            maxWidth: '200px',
                          }}
                        >
                          Accepted file types: .json, .geojson
                        </Text>
                        <Button
                          variant="outline"
                          disabled
                          style={{
                            minWidth: '120px',
                            borderColor: '#5B6175',
                            color: '#A4ABBE',
                            backgroundColor: 'transparent',
                            opacity: 0.9,
                          }}
                        >
                          Upload
                        </Button>
                      </Box>
                    </>
                  )}
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select trigger(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the trigger(s) you'd like to be alerted with. If
                    multiple triggers are selected, you can apply sequential
                    logic and be alerted only when the triggers happen in the
                    desired order.
                  </Text>

                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginTop: '8px',
                    }}
                  >
                    {isShapeRouteFlow &&
                      shapeRouteTriggerOptions.map((option) => (
                        <Checkbox
                          key={option.id}
                          label={option.label}
                          checked={selectedTriggers.includes(option.id)}
                          onChange={() => toggleTrigger(option.id)}
                          size="sm"
                          className="ship-filter-checkbox"
                          styles={{
                            label: {
                              color: '#fff',
                              fontSize: '14px',
                              cursor: 'pointer',
                              paddingLeft: '12px',
                              lineHeight: '1.2',
                            },
                          }}
                        />
                      ))}
                    {triggerOptions.map((option) => (
                      <Checkbox
                        key={option.id}
                        label={option.label}
                        checked={selectedTriggers.includes(option.id)}
                        onChange={() => toggleTrigger(option.id)}
                        size="sm"
                        className="ship-filter-checkbox"
                        styles={{
                          label: {
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                            lineHeight: '1.2',
                          },
                        }}
                      />
                    ))}
                  </Box>

                  {selectedTriggers.length > 1 && (
                    <>
                      <Box
                        style={{
                          height: '1px',
                          backgroundColor: '#393C56',
                          margin: '24px 0',
                        }}
                      />
                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginBottom: '16px',
                        }}
                      >
                        Multiple triggers selected. Apply sequential logic?
                      </Text>
                      <Radio.Group
                        value={sequentialLogic}
                        onChange={setSequentialLogic}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            gap: '24px',
                          }}
                        >
                          <Radio
                            value="no"
                            label="No"
                            size="md"
                            styles={{
                              radio: {
                                backgroundColor: 'transparent',
                                borderColor: '#fff',
                                borderWidth: 2,
                                cursor: 'pointer',
                              },
                              icon: {
                                color: '#0094FF',
                              },
                              label: {
                                color: '#fff',
                                fontSize: '16px',
                                cursor: 'pointer',
                                paddingLeft: '12px',
                              },
                            }}
                          />
                          <Radio
                            value="yes"
                            label="Yes"
                            size="md"
                            styles={{
                              radio: {
                                backgroundColor: 'transparent',
                                borderColor: '#fff',
                                borderWidth: 2,
                                cursor: 'pointer',
                              },
                              icon: {
                                color: '#0094FF',
                              },
                              label: {
                                color: '#fff',
                                fontSize: '16px',
                                cursor: 'pointer',
                                paddingLeft: '12px',
                              },
                            }}
                          />
                        </Box>
                      </Radio.Group>
                    </>
                  )}
                </>
              )}

              {currentStep === 4 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Configure settings:
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the start and end dates and choose how often you'd
                    like to receive this alert.
                  </Text>

                  <Box style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        Start Date
                      </Text>
                      <DateInput
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="MM/DD/YYYY"
                        valueFormat="MM/DD/YYYY"
                        rightSection={<Calendar size={20} color="#888F9E" />}
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        End Date
                      </Text>
                      <DateInput
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="MM/DD/YYYY"
                        valueFormat="MM/DD/YYYY"
                        disabled={doesNotExpire}
                        rightSection={<Calendar size={20} color="#888F9E" />}
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                            opacity: doesNotExpire ? 0.5 : 1,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <Checkbox
                      label="Does not expire"
                      checked={doesNotExpire}
                      onChange={(e) => {
                        setDoesNotExpire(e.currentTarget.checked)
                        if (e.currentTarget.checked) setEndDate(null)
                      }}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                  </Box>

                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                    Notification Frequency
                  </Text>
                  <Select
                    value={notificationFrequency}
                    onChange={setNotificationFrequency}
                    data={['Daily Report', 'Immediate', 'Weekly Report']}
                    styles={{
                      input: {
                        backgroundColor: 'transparent',
                        borderColor: '#393C56',
                        color: '#fff',
                        height: '40px',
                      },
                      dropdown: {
                        backgroundColor: '#181926',
                        borderColor: '#393C56',
                      },
                      item: {
                        color: '#fff',
                      },
                    }}
                  />

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginTop: '16px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Receives a single summary at the end of each day listing all
                    ships that triggered alerts during that day. No report is
                    sent if no alerts occur.
                  </Text>

                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '12px' }}>
                    Receive Via
                  </Text>
                  <Box style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <Checkbox
                      label="Email"
                      checked={receiveViaEmail}
                      onChange={(e) => setReceiveViaEmail(e.currentTarget.checked)}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                    <Checkbox
                      label="In-App Notification"
                      checked={receiveViaApp}
                      onChange={(e) => setReceiveViaApp(e.currentTarget.checked)}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                  </Box>

                  {receiveViaEmail && (
                    <>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        Email for Notifications
                      </Text>
                      <TextInput
                        value={emailForNotifications}
                        onChange={(e) => setEmailForNotifications(e.currentTarget.value)}
                        placeholder="Enter email"
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </>
                  )}
                </>
              )}

              {currentStep === 5 && (
                <>
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                    Confirm alert details:
                  </Text>
                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                    Review and confirm the selected ship, area, and alert triggers, along with any other related details.
                  </Text>

                  <Box style={{ backgroundColor: '#24263C', borderRadius: '4px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Box>
                      <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '8px' }}>Alert Name</Text>
                      <TextInput
                        value={alertName}
                        onChange={(e) => setAlertName(e.currentTarget.value)}
                        placeholder="Enter name"
                        styles={{
                          input: {
                            backgroundColor: '#181926',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </Box>

                    {renderSummaryRow(
                      `Ship(s)`,
                      shipSelection === 'any'
                        ? 'Any ship'
                        : `Specific ship(s) • Search: ${
                            selectedSpecificShips.length
                              ? selectedSpecificShips.join(', ')
                              : 'None'
                          } • Import: ${importFromMyShipsSummary} • File: ${uploadedFileDisplay}`,
                      1
                    )}
                    {renderSummaryRow(
                      `Area(s)`,
                      areaSelection === 'global'
                        ? 'Global'
                        : `Specific area(s) • Search: ${
                            selectedSpecificAreas.length
                              ? selectedSpecificAreas.join(', ')
                              : 'None'
                          } • Shape: ${importFromMyShapesSummary} • Drawn: ${drawnAreaCount} • File: ${
                            uploadedAreaFileName || 'None'
                          }`,
                      2
                    )}
                    {renderSummaryRow(`Trigger(s) - ${selectedTriggers.length} trigger${selectedTriggers.length === 1 ? '' : 's'}`, triggersValue, 3)}

                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box style={{ display: 'flex', gap: '48px' }}>
                        <Box>
                          <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>Start Date</Text>
                          <Text style={{ color: '#fff', fontSize: '14px' }}>{formatDate(startDate)}</Text>
                        </Box>
                        <Box>
                          <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>End Date</Text>
                          <Text style={{ color: '#fff', fontSize: '14px' }}>{doesNotExpire ? 'Does not expire' : formatDate(endDate)}</Text>
                        </Box>
                      </Box>
                      <Edit02 size={16} color="#888F9E" style={{ cursor: 'pointer', marginTop: '4px' }} onClick={() => setCurrentStep(4)} />
                    </Box>

                    {renderSummaryRow('Notification Frequency', notificationFrequency, 4)}
                    {renderSummaryRow('Receive Via', receiveViaText, 4)}
                    {receiveViaEmail && renderSummaryRow('Email for Notification', emailForNotifications || 'None provided', 4)}
                  </Box>
                </>
              )}
              {currentStep === 6 && (
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
                  <CheckCircle size={48} color="#00EB6C" style={{ marginBottom: '24px' }} />
                  <Text style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                    Alert created successfully.
                  </Text>
                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
                    Please check 'My Alerts' tab for the latest status.
                  </Text>
                  <Box style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('My Alerts')}
                      style={{
                        flex: 1,
                        borderColor: '#393C56',
                        color: '#fff',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Go To My Alerts
                    </Button>
                    <Button
                      onClick={handleReset}
                      style={{
                        flex: 1,
                        backgroundColor: '#0094FF',
                        color: '#fff',
                      }}
                    >
                      Create New Alert
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Text style={{ color: '#888F9E', fontSize: '14px' }}>
                No alerts yet.
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer Buttons */}
        {isNewAlert && currentStep < 6 && (
          <Box
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #393C56',
              display: 'flex',
              gap: '12px',
              backgroundColor: '#181926',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                // Handle actual cancel logic here
              }}
              style={{
                flex: currentStep === 1 ? 1 : 0,
                width: currentStep === 1 ? 'auto' : '100px',
                minWidth: currentStep === 1 ? 'auto' : '100px',
                borderColor: '#393C56',
                color: '#fff',
                backgroundColor: 'transparent',
                padding: 0,
              }}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                style={{
                  flex: 0,
                  width: '100px',
                  minWidth: '100px',
                  borderColor: '#393C56',
                  color: '#fff',
                  backgroundColor: 'transparent',
                  padding: 0,
                }}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isNextDisabled()}
              style={{
                flex: 1,
                backgroundColor: isNextDisabled() ? '#393C56' : '#0094FF',
                color: isNextDisabled() ? '#888F9E' : '#fff',
                cursor: isNextDisabled() ? 'not-allowed' : 'pointer',
              }}
            >
              {currentStep === 5 ? 'Confirm & Create' : 'Next'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AlertsSecondaryNav
