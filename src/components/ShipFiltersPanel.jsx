import { useMemo, useState } from 'react'
import { Box, Text, Checkbox } from '@mantine/core'
import { ChevronDown, RefreshCcw01, Sliders04, XClose } from '@untitledui/icons'
import AisIcon from '../custom-icons/AisIcon'
import LightShipIcon from '../custom-icons/LightShipIcon'
import DarkShipIcon from '../custom-icons/DarkShipIcon'
import UnattributedIcon from '../custom-icons/UnattributedIcon'
import SpoofingIcon from '../custom-icons/SpoofingIcon'
import STSIcon from '../custom-icons/STSIcon'
import STSAisIcon from '../custom-icons/STSAisIcon'
import SimilarSearchIcon from '../custom-icons/SimilarSearchIcon'
import { useShipContext } from '../context/ShipContext'
import { SHIP_FILTER_IDS } from '../constants/shipFilters'

const HelpDot = () => (
  <Box
    style={{
      width: 18,
      height: 18,
      borderRadius: 999,
      border: '1.5px solid #8E94A7',
      color: '#8E94A7',
      fontSize: 12,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
    }}
  >
    ?
  </Box>
)

const RowAdjustIcon = () => <Sliders04 size={16} color="#A4ABBE" />

const dataTypeRows = [
  { id: SHIP_FILTER_IDS.AIS, label: 'AIS', icon: <AisIcon style={{ width: 14, height: 22 }} /> },
  { id: SHIP_FILTER_IDS.LIGHT, label: 'Light', icon: <LightShipIcon style={{ width: 14, height: 22 }} /> },
  { id: SHIP_FILTER_IDS.DARK, label: 'Dark', icon: <DarkShipIcon style={{ width: 14, height: 22 }} /> },
  {
    id: SHIP_FILTER_IDS.UNATTRIBUTED,
    label: 'Unattributed',
    icon: <UnattributedIcon style={{ width: 14, height: 22 }} />,
  },
]

const analyticsRows = [
  { id: SHIP_FILTER_IDS.SPOOFING, label: 'Spoofing', icon: <SpoofingIcon style={{ width: 18, height: 18 }} /> },
  { id: SHIP_FILTER_IDS.STS, label: 'Ship-To-Ship', icon: <STSIcon style={{ width: 18, height: 18 }} /> },
  {
    id: SHIP_FILTER_IDS.STS_AIS,
    label: 'AIS Ship-To-Ship',
    icon: <STSAisIcon style={{ width: 18, height: 18 }} />,
  },
  { id: SHIP_FILTER_IDS.SIMILAR_SHIPS, label: 'Similar Ships', icon: <SimilarSearchIcon /> },
]

const ShipFiltersPanel = ({ onClose }) => {
  const {
    shipFilters,
    setShipFilterChecked,
    setShipFiltersBulk,
    resetShipFilters,
    showLegendOnMap,
    setShowLegendOnMap,
  } = useShipContext()
  const [dataTypesOpen, setDataTypesOpen] = useState(true)
  const [analyticsOpen, setAnalyticsOpen] = useState(true)

  const dataTypesAllSelected = useMemo(
    () => dataTypeRows.every((row) => shipFilters[row.id]),
    [shipFilters]
  )
  const analyticsAllSelected = useMemo(
    () => analyticsRows.every((row) => shipFilters[row.id]),
    [shipFilters]
  )

  const resetFilters = () => {
    resetShipFilters()
    setDataTypesOpen(true)
    setAnalyticsOpen(true)
  }

  const toggleSectionRows = (rows, value) => {
    const updates = {}
    rows.forEach((row) => {
      updates[row.id] = value
    })
    setShipFiltersBulk(updates)
  }

  const renderRows = (rows) => (
    <Box style={{ padding: '14px 16px 12px', background: '#1F2134' }}>
      {rows.map((row) => (
        <Box
          key={row.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 42,
            gap: 10,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Checkbox
              checked={shipFilters[row.id]}
              onChange={(event) => {
                const isChecked = event.currentTarget.checked
                setShipFilterChecked(row.id, isChecked)
              }}
              size="sm"
              className="ship-filter-checkbox"
            />
            <Box style={{ display: 'flex', alignItems: 'center', width: 22, justifyContent: 'center' }}>
              {row.icon}
            </Box>
            <Text style={{ color: '#E8EBF2', fontSize: 14, lineHeight: 1.1 }}>
              {row.label}
            </Text>
            <HelpDot />
          </Box>
          <RowAdjustIcon />
        </Box>
      ))}
    </Box>
  )

  return (
    <Box
      style={{
        position: 'absolute',
        right: 90,
        bottom: 24,
        width: 318,
        maxHeight: 'calc(100vh - 130px)',
        overflowY: 'auto',
        borderRadius: 4,
        border: '1px solid #393C56',
        background: '#181926',
        zIndex: 3,
        boxShadow: '0 16px 32px rgba(0,0,0,0.35)',
        pointerEvents: 'auto',
      }}
    >
      <Box
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2D314A',
          padding: '0 14px',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Ship Filters</Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Box
            onClick={resetFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <RefreshCcw01 color="white" size={16} />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>RESET</Text>
          </Box>
          <XClose onClick={onClose} color="white" size={18} style={{ cursor: 'pointer' }} />
        </Box>
      </Box>

      <Box style={{ borderBottom: '1px solid #2D314A' }}>
        <Box
          style={{
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            background: '#181926',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Checkbox
              checked={dataTypesAllSelected}
              onChange={(event) =>
                toggleSectionRows(dataTypeRows, event.currentTarget.checked)
              }
              size="sm"
              className="ship-filter-checkbox"
            />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Data Types</Text>
          </Box>
          <ChevronDown
            onClick={() => setDataTypesOpen((v) => !v)}
            color="white"
            size={18}
            style={{
              cursor: 'pointer',
              transform: dataTypesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
            }}
          />
        </Box>
        {dataTypesOpen && renderRows(dataTypeRows)}
      </Box>

      <Box style={{ borderBottom: '1px solid #2D314A' }}>
        <Box
          style={{
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            background: '#181926',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Checkbox
              checked={analyticsAllSelected}
              onChange={(event) =>
                toggleSectionRows(analyticsRows, event.currentTarget.checked)
              }
              size="sm"
              className="ship-filter-checkbox"
            />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Analytics</Text>
          </Box>
          <ChevronDown
            onClick={() => setAnalyticsOpen((v) => !v)}
            color="white"
            size={18}
            style={{
              cursor: 'pointer',
              transform: analyticsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
            }}
          />
        </Box>
        {analyticsOpen && renderRows(analyticsRows)}
      </Box>

      <Box style={{ padding: '14px 16px 16px', background: '#1F2134' }}>
        <Checkbox
          checked={showLegendOnMap}
          onChange={(event) => setShowLegendOnMap(event.currentTarget.checked)}
          label="Show legend on map"
          size="sm"
          className="ship-filter-checkbox"
          styles={{ label: { color: '#fff', fontSize: 13 } }}
        />
      </Box>
    </Box>
  )
}

export default ShipFiltersPanel

