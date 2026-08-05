import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, TextInput } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import {
  Plus,
  Grid01,
  Bell02,
  User03,
  Edit01,
  SearchMd,
  Calendar,
  BarChart01,
  ChevronDown,
  Save01,
  Sliders02,
} from '@untitledui/icons'

import TheiaLogo from '../assets/TheiaLogo.svg'
import { useShipContext } from '../context/ShipContext'

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateFromKey = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

const normalizePickerDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'string') {
    const fromKey = parseDateFromKey(value)
    if (fromKey) return fromKey

    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return null
}

const parseTypedDate = (rawValue) => {
  const trimmed = rawValue.trim()
  const match = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (!match) return { value: null, error: 'Use format YYYY/MM/DD' }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsedDate = new Date(year, month - 1, day)
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return { value: null, error: 'Enter a valid date' }
  }

  const now = new Date()
  now.setHours(23, 59, 59, 999)
  if (parsedDate > now) {
    return { value: null, error: 'Date cannot be in the future' }
  }

  return { value: parsedDate, error: null }
}

const TopNav = ({
  markerMode = 'pin',
  onMarkerModeChange,
  favoritesVersion = 'v1',
  onFavoritesVersionChange,
  forYouVersion = 'v1',
  onForYouVersionChange,
  stsVersion = 'v1',
  onStsVersionChange,
  pathToPortVersion = 'v1',
  onPathToPortVersionChange,
}) => {
  const { mapDate, setMapDate } = useShipContext()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isEditingCalendarDate, setIsEditingCalendarDate] = useState(false)
  const [typedDate, setTypedDate] = useState('')
  const [typedDateError, setTypedDateError] = useState(null)
  const [prototypesOpen, setPrototypesOpen] = useState(false)
  const calendarRef = useRef(null)
  const prototypesRef = useRef(null)
  const selectedDate = parseDateFromKey(mapDate) || new Date()
  const selectedDateKey = formatDateKey(selectedDate)
  const selectedDateToolbarLabel = selectedDateKey.replace(/-/g, '/')
  const selectedDateHeaderLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  useEffect(() => {
    if (!calendarOpen) return
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [calendarOpen])

  useEffect(() => {
    if (!prototypesOpen) return
    const handleClickOutside = (e) => {
      if (prototypesRef.current && !prototypesRef.current.contains(e.target)) {
        setPrototypesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [prototypesOpen])

  useEffect(() => {
    setTypedDate(selectedDateKey.replace(/-/g, '/'))
    setTypedDateError(null)
  }, [selectedDateKey])

  useEffect(() => {
    if (!calendarOpen) {
      setIsEditingCalendarDate(false)
      setTypedDateError(null)
    }
  }, [calendarOpen])

  const applyTypedDate = (closeOnSuccess = false) => {
    const { value, error } = parseTypedDate(typedDate)
    if (error || !value) {
      setTypedDateError(error)
      return
    }

    const nextDateKey = formatDateKey(value)
    setMapDate(nextDateKey)
    setTypedDate(nextDateKey.replace(/-/g, '/'))
    setTypedDateError(null)
    if (closeOnSuccess) {
      setCalendarOpen(false)
      setIsEditingCalendarDate(false)
    }
  }

  return (
    <div>
      <Box
        style={{
          backgroundColor: '#181926',
          display: 'flex',
        }}
      >
        <Box
          style={{
            padding: '16px 24px',
            borderRight: '1px solid #393C56',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={TheiaLogo} alt="Theia Logo" />
        </Box>
        <Box
          component="button"
          type="button"
          className="topnav-icon-btn"
          style={{ borderRight: '1px solid #393C56' }}
        >
          <Grid01 color="white" size={20} />
        </Box>
        <Box component="button" type="button" className="topnav-station">
          <Text variant="body1" c="#fff">
            Untitled Station
          </Text>
        </Box>
        <Box component="button" type="button" className="topnav-icon-btn">
          <Plus color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        <Box
          ref={prototypesRef}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setPrototypesOpen((prev) => !prev)}
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: prototypesOpen ? '#2E3150' : '#24263C',
              border: '1px solid #393C56',
              color: '#FFFFFF',
              borderRadius: 4,
              padding: '0 12px',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <Sliders02 style={{ color: '#fff', width: 16, height: 16 }} />
            <Text style={{ color: '#fff', fontSize: 12 }}>Prototypes</Text>
            <ChevronDown color="#A7AEC2" size={16} />
          </Box>
          {prototypesOpen && (
            <Box
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 320,
                background: '#24263C',
                border: '1px solid #393C56',
                borderRadius: 8,
                zIndex: 1000,
              }}
            >
              <Box
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #393C56',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                  Prototypes
                </Text>
                <Text style={{ color: '#A7AEC2', fontSize: 11, marginTop: 2 }}>
                  Switch experimental variants
                </Text>
              </Box>
              <Box
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {[
                  {
                    label: 'Marker style',
                    value: markerMode,
                    onChange: onMarkerModeChange,
                    options: [
                      ['pulse', 'Pulsing rings'],
                      ['pulse-icon', 'Pulsing icons'],
                      ['pulse-button', 'Pulsing button'],
                      ['pulse-button-double', 'Pulsing button (double)'],
                      ['ring', 'Custom ring'],
                    ],
                  },
                  {
                    label: 'For You',
                    value: forYouVersion,
                    onChange: onForYouVersionChange,
                    options: [
                      ['v2', 'Maritime Briefing'],
                      ['v1', 'For You'],
                    ],
                  },
                  {
                    label: 'Ship-to-Ship',
                    value: stsVersion,
                    onChange: onStsVersionChange,
                    options: [
                      ['v1', 'Ship-to-Ship v1'],
                      ['v2', 'Ship-to-Ship v2'],
                      ['v4', 'Ship-to-Ship v4'],
                      ['v7', 'Ship-to-Ship v7'],
                      ['v8', 'Ship-to-Ship v8'],
                      ['v9', 'Ship-to-Ship v9'],
                      ['v10', 'Ship-to-Ship v10'],
                      ['v11', 'Ship-to-Ship v11'],
                      ['v12', 'Ship-to-Ship v12'],
                      ['v13', 'Ship-to-Ship v13'],
                      ['v16', 'Ship-to-Ship v16'],
                      ['v17', 'Ship-to-Ship v17'],
                      ['v18', 'Ship-to-Ship v18 — Cap at 5'],
                      ['v19', 'Ship-to-Ship v19 — Scale to N'],
                    ],
                  },
                  {
                    label: 'Path to Port',
                    value: pathToPortVersion,
                    onChange: onPathToPortVersionChange,
                    options: [
                      ['v1', 'Path to Port v1 — Map panel'],
                      ['v2', 'Path to Port v2 — Vessel panel'],
                      ['v3', 'Path to Port v3 — Inline row'],
                      ['v4', 'Path to Port v4 — All arrivals'],
                      ['v5', 'Path to Port v5 — Arrivals board'],
                    ],
                  },
                ].map((group) => (
                  <Box key={group.label}>
                    <Text
                      style={{
                        color: '#A7AEC2',
                        fontSize: 11,
                        marginBottom: 6,
                      }}
                    >
                      {group.label}
                    </Text>
                    <Box
                      component="select"
                      value={group.value}
                      onChange={(event) =>
                        group.onChange?.(event.currentTarget.value)
                      }
                      style={{
                        height: 32,
                        width: '100%',
                        backgroundColor: '#181926',
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A7AEC2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        border: '1px solid #393C56',
                        color: '#FFFFFF',
                        borderRadius: 4,
                        padding: '0 34px 0 10px',
                        fontSize: 12,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {group.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
        <Box component="button" type="button" className="topnav-icon-btn">
          <Bell02 color="white" size={20} />
        </Box>
        <Box component="button" type="button" className="topnav-icon-btn">
          <User03 color="white" size={20} />
        </Box>
      </Box>
      <Box
        style={{
          backgroundColor: '#24263C',
          display: 'flex',
          alignItems: 'center',
          height: '50px',
          borderBottom: '1px solid #393C56',
        }}
      >
        <Box
          component="button"
          type="button"
          className="topnav-toolbar-btn topnav-toolbar-btn--no-hover"
          style={{ marginRight: '16px' }}
        >
          <Text variant="body1" c="#fff" style={{ marginRight: '8px' }}>
            Untitled Stations
          </Text>
          <Edit01 color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <SearchMd color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ marginLeft: '8px' }}>
            Search
          </Text>
        </Box>
        <Box style={{ position: 'relative' }} ref={calendarRef}>
          <Box
            component="button"
            type="button"
            className="topnav-toolbar-btn"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <Calendar color="white" size={20} />
            <Text variant="body1" c="#fff" style={{ margin: '0 8px' }}>
              {selectedDateToolbarLabel}
            </Text>
          </Box>
          {calendarOpen && (
            <Box
              className="datepicker-dark"
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                background: '#24263C',
                border: '1px solid #393C56',
                borderRadius: 8,
                padding: 16,
                zIndex: 1000,
              }}
            >
              <Box
                style={{
                  margin: '-16px -16px 0 -16px',
                  padding: '14px 16px 10px 16px',
                  borderBottom: '1px solid #393C56',
                }}
              >
                <Box style={{ marginBottom: 0 }}>
                  <Text
                    style={{ color: '#A7AEC2', fontSize: 10, marginBottom: 4 }}
                  >
                    Select date
                  </Text>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}
                    >
                      {selectedDateHeaderLabel}
                    </Text>
                    <Box
                      component="button"
                      type="button"
                      className="topnav-toolbar-btn--no-hover calendar-edit-icon-btn"
                      onClick={() => {
                        setIsEditingCalendarDate((prev) => !prev)
                        setTypedDateError(null)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit01 style={{ color: '#fff', width: 16, height: 16 }} />
                    </Box>
                  </Box>
                </Box>
                {isEditingCalendarDate && (
                  <Box style={{ marginTop: 8 }}>
                    <TextInput
                      value={typedDate}
                      onChange={(event) => {
                        setTypedDate(event.currentTarget.value)
                        if (typedDateError) setTypedDateError(null)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          applyTypedDate(true)
                        }
                      }}
                      placeholder="YYYY/MM/DD"
                      size="xs"
                      error={typedDateError}
                      styles={{
                        input: {
                          background: '#181926',
                          borderColor: '#393C56',
                          color: '#fff',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
              <Box style={{ paddingTop: 10 }}>
              <DatePicker
                value={selectedDate}
                maxDate={new Date()}
                onChange={(date) => {
                  const nextDate = normalizePickerDate(date)
                  if (!nextDate) return
                  const nextDateKey = formatDateKey(nextDate)
                  setMapDate(nextDateKey)
                  setTypedDate(nextDateKey.replace(/-/g, '/'))
                  setTypedDateError(null)
                  setCalendarOpen(false)
                  setIsEditingCalendarDate(false)
                }}
                styles={{
                  day: { color: '#fff', borderRadius: '50%' },
                  weekday: { color: '#fff' },
                  calendarHeaderLevel: { color: '#fff' },
                  calendarHeaderControl: { color: '#fff' },
                  calendarHeaderControlIcon: { color: '#fff' },
                  monthsListControl: { color: '#fff' },
                  yearsListControl: { color: '#fff' },
                }}
              />
              </Box>
            </Box>
          )}
        </Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <BarChart01 color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ margin: '0 8px' }}>
            Ships in view: 2541
          </Text>
          <ChevronDown color="white" size={20} />
        </Box>
        <Box style={{ flex: 1 }}></Box>
        <Box component="button" type="button" className="topnav-toolbar-btn">
          <Save01 color="white" size={20} />
          <Text variant="body1" c="#fff" style={{ marginLeft: '8px' }}>
            Saved
          </Text>
        </Box>
      </Box>
    </div>
  )
}

export default TopNav
