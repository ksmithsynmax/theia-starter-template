import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text, TextInput } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { Calendar, Edit01 } from '@untitledui/icons'

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const normalizeDate = (value, fallbackDate = new Date()) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
  }
  return new Date(
    fallbackDate.getFullYear(),
    fallbackDate.getMonth(),
    fallbackDate.getDate()
  )
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

const formatToolbarDate = (date) =>
  `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')}`

const formatPanelDate = (date) =>
  `${DAY_LABELS[date.getDay()]}, ${MONTH_LABELS[date.getMonth()].slice(0, 3)} ${date.getDate()}`

const TopNavCalendar = () => {
  const maxDate = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])
  const [selectedDate, setSelectedDate] = useState(maxDate)
  const [opened, setOpened] = useState(false)
  const [isEditingCalendarDate, setIsEditingCalendarDate] = useState(false)
  const [typedDate, setTypedDate] = useState(formatToolbarDate(maxDate))
  const [typedDateError, setTypedDateError] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target)) {
        setOpened(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])
  useEffect(() => {
    setTypedDate(formatToolbarDate(selectedDate))
    setTypedDateError(null)
  }, [selectedDate])
  useEffect(() => {
    if (!opened) {
      setIsEditingCalendarDate(false)
      setTypedDateError(null)
    }
  }, [opened])

  const applyTypedDate = (closeOnSuccess = false) => {
    const { value, error } = parseTypedDate(typedDate)
    if (error || !value) {
      setTypedDateError(error)
      return
    }

    const normalized = normalizeDate(value, maxDate)
    setSelectedDate(normalized)
    setTypedDate(formatToolbarDate(normalized))
    setTypedDateError(null)
    if (closeOnSuccess) {
      setOpened(false)
      setIsEditingCalendarDate(false)
    }
  }

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
      <Box
        component="button"
        type="button"
        className="topnav-toolbar-btn"
        onClick={() => setOpened((v) => !v)}
      >
        <Calendar color="white" size={20} />
        <Text variant="body1" c="#fff" style={{ marginLeft: '10px' }}>
          {formatToolbarDate(selectedDate)}
        </Text>
      </Box>

      {opened && (
        <Box
          className="datepicker-dark"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            borderRadius: 8,
            border: '1px solid #393C56',
            background: '#24263C',
            boxShadow: '0 18px 30px rgba(0, 0, 0, 0.35)',
            zIndex: 10,
            overflow: 'hidden',
            padding: 16,
          }}
        >
          <Box
            style={{
              margin: '-16px -16px 0 -16px',
              padding: '14px 16px 10px 16px',
              borderBottom: '1px solid #393C56',
            }}
          >
            <Text style={{ color: '#A9B0C2', fontSize: 13, marginBottom: 8 }}>
              Select date
            </Text>
            <Box
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {formatPanelDate(selectedDate)}
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
              maxDate={maxDate}
              allowLevelChange={false}
              firstDayOfWeek={1}
              onChange={(value) => {
                const nextDate = normalizeDate(value, selectedDate)
                if (!nextDate) return
                setSelectedDate(nextDate)
                setTypedDate(formatToolbarDate(nextDate))
                setTypedDateError(null)
                setOpened(false)
                setIsEditingCalendarDate(false)
              }}
              styles={{
                day: {
                  color: '#fff',
                  borderRadius: '50%',
                  '&[data-outside]': {
                    color: '#fff',
                  },
                  '&[data-disabled]': {
                    color: '#313754',
                  },
                  '&:hover': {
                    background: '#0094FF',
                    color: '#fff',
                  },
                  '&[data-disabled]:hover': {
                    background: 'transparent',
                    color: '#313754',
                  },
                },
                weekday: {
                  color: '#fff',
                },
                calendarHeaderControl: {
                  color: '#fff',
                  background: 'transparent',
                  borderRadius: 8,
                  '&:hover': {
                    background: '#0094FF',
                  },
                  '&:active': {
                    background: '#0094FF',
                  },
                },
                calendarHeaderControlIcon: {
                  color: '#fff',
                },
                calendarHeaderLevel: {
                  color: '#fff',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  borderRadius: 8,
                  padding: '0 22px',
                  height: 40,
                  '&:hover': {
                    background: '#0094FF',
                  },
                  '&:active': {
                    background: '#0094FF',
                  },
                  '&:focus': {
                    outline: 'none',
                    background: '#0094FF',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                    background: '#0094FF',
                  },
                },
                monthsListControl: {
                  color: '#fff',
                },
                yearsListControl: {
                  color: '#fff',
                },
                daySelected: {
                  background: '#0094FF',
                  color: '#fff',
                  '&:hover': {
                    background: '#0094FF',
                    color: '#fff',
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TopNavCalendar

