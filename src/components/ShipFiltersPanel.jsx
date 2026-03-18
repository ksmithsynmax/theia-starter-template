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
  { id: 'ais', label: 'AIS', icon: <AisIcon style={{ width: 14, height: 22 }} /> },
  { id: 'light', label: 'Light', icon: <LightShipIcon style={{ width: 14, height: 22 }} /> },
  { id: 'dark', label: 'Dark', icon: <DarkShipIcon style={{ width: 14, height: 22 }} /> },
  {
    id: 'unattributed',
    label: 'Unattributed',
    icon: <UnattributedIcon style={{ width: 14, height: 22 }} />,
  },
]

const analyticsRows = [
  { id: 'spoofing', label: 'Spoofing', icon: <SpoofingIcon style={{ width: 18, height: 18 }} /> },
  { id: 'sts', label: 'Ship-To-Ship', icon: <STSIcon style={{ width: 18, height: 18 }} /> },
  {
    id: 'sts-ais',
    label: 'AIS Ship-To-Ship',
    icon: <STSAisIcon style={{ width: 18, height: 18 }} />,
  },
  { id: 'similar-ships', label: 'Similar Ships', icon: <SimilarSearchIcon /> },
]

const ShipFiltersPanel = ({ onClose }) => {
  const [dataTypesOpen, setDataTypesOpen] = useState(true)
  const [analyticsOpen, setAnalyticsOpen] = useState(true)
  const [showLegendOnMap, setShowLegendOnMap] = useState(false)
  const [checked, setChecked] = useState({
    ais: true,
    light: true,
    dark: true,
    unattributed: true,
    spoofing: true,
    sts: true,
    'sts-ais': true,
    'similar-ships': true,
  })

  const dataTypesAllSelected = useMemo(
    () => dataTypeRows.every((row) => checked[row.id]),
    [checked]
  )
  const analyticsAllSelected = useMemo(
    () => analyticsRows.every((row) => checked[row.id]),
    [checked]
  )

  const resetFilters = () => {
    setChecked({
      ais: true,
      light: true,
      dark: true,
      unattributed: true,
      spoofing: true,
      sts: true,
      'sts-ais': true,
      'similar-ships': true,
    })
    setShowLegendOnMap(false)
    setDataTypesOpen(true)
    setAnalyticsOpen(true)
  }

  const toggleSectionRows = (rows, value) => {
    setChecked((prev) => {
      const next = { ...prev }
      rows.forEach((row) => {
        next[row.id] = value
      })
      return next
    })
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
              checked={checked[row.id]}
              onChange={(event) => {
                const isChecked = event.currentTarget.checked
                setChecked((prev) => ({ ...prev, [row.id]: isChecked }))
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

