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
} from '@untitledui/icons'

import TheiaLogo from '../assets/TheiaLogo.svg'
import { useShipContext } from '../context/ShipContext'

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDateFromKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }

  return date
}

const parseTypedDate = (rawValue) => {
  const trimmed = rawValue.trim()
  const match = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (!match) {
    return { value: null, error: 'Use format YYYY/MM/DD' }
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsedDate = new Date(year, month - 1, day)

  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month - 1
    || parsedDate.getDate() !== day
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

const TopNav = () => {
  const { mapDate, setMapDate } = useShipContext()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [typedDate, setTypedDate] = useState(mapDate.replace(/-/g, '/'))
  const [typedDateError, setTypedDateError] = useState(null)
  const calendarRef = useRef(null)

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
    setTypedDate(mapDate.replace(/-/g, '/'))
    setTypedDateError(null)
  }, [mapDate])

  const applyTypedDate = (closeOnSuccess = false) => {
    const { value, error } = parseTypedDate(typedDate)
    if (error || !value) {
      setTypedDateError(error)
      return
    }

    const nextDate = formatDateKey(value)
    setMapDate(nextDate)
    setTypedDate(nextDate.replace(/-/g, '/'))
    setTypedDateError(null)
    if (closeOnSuccess) {
      setCalendarOpen(false)
    }
  }

  const selectedDate = toDateFromKey(mapDate)

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
            <Text
              variant="body1"
              c="#fff"
              style={{ margin: '0 8px' }}
            >
              {mapDate.replace(/-/g, '/')}
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
              <Box style={{ marginBottom: 12 }}>
                <Text style={{ color: '#a7aec2', fontSize: 11, marginBottom: 6 }}>
                  Type a date as YYYY/MM/DD
                </Text>
                <Box style={{ width: '100%' }}>
                <TextInput
                  value={typedDate}
                  onChange={(event) => {
                    setTypedDate(event.currentTarget.value)
                    if (typedDateError) setTypedDateError(null)
                  }}
                  onBlur={() => {
                    if (typedDate.trim().length > 0) {
                      applyTypedDate(false)
                    }
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
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      background: '#181926',
                      borderColor: '#393C56',
                      color: '#fff',
                    },
                  }}
                />
                </Box>
              </Box>
              <DatePicker
                key={mapDate}
                value={selectedDate}
                defaultDate={selectedDate || new Date()}
                maxDate={new Date()}
                onChange={(date) => {
                  if (!date) return
                  const nextDate = formatDateKey(date)
                  setMapDate(nextDate)
                  setTypedDate(nextDate.replace(/-/g, '/'))
                  setTypedDateError(null)
                  setCalendarOpen(false)
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
