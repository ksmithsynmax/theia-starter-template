import React, { useState, useRef, useEffect } from 'react'
import { Box, Text } from '@mantine/core'
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
  XClose,
} from '@untitledui/icons'

import TheiaLogo from '../assets/TheiaLogo.svg'
import { useShipContext } from '../context/ShipContext'

const LEFT_NAV_WIDTH = 50
const DETAIL_PANEL_WIDTH = 500

const TopNav = ({ panelOpen = false }) => {
  const { mapDate, setMapDate } = useShipContext()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [previousMapDate, setPreviousMapDate] = useState(null)
  const [showHistoricalToast, setShowHistoricalToast] = useState(true)
  const calendarRef = useRef(null)
  const lastMapDateRef = useRef(mapDate)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isHistoricalDate = mapDate !== todayStr
  const toastLeftInset = LEFT_NAV_WIDTH + (panelOpen ? DETAIL_PANEL_WIDTH : 0)

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
    if (lastMapDateRef.current !== mapDate) {
      setPreviousMapDate(lastMapDateRef.current)
      lastMapDateRef.current = mapDate
    }
  }, [mapDate])

  useEffect(() => {
    if (isHistoricalDate) setShowHistoricalToast(true)
  }, [isHistoricalDate, mapDate])

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
              <DatePicker
                value={mapDate}
                maxDate={new Date()}
                onChange={(date) => {
                  setMapDate(date)
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
      {isHistoricalDate && showHistoricalToast && (
        <Box
          style={{
            position: 'fixed',
            top: 122,
            left: `calc(${toastLeftInset}px + (100vw - ${toastLeftInset}px) / 2)`,
            transform: 'translateX(-50%)',
            transition: 'left 0.3s ease',
            zIndex: 1200,
            background: '#090B14',
            border: '1px solid #393C56',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            width: 'min(560px, calc(100vw - 80px))',
            padding: '14px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              Viewing historical date
            </Text>
            <Text style={{ color: '#BFC4CE', fontSize: 14 }}>
              {mapDate.replace(/-/g, '/')}
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {previousMapDate && (
              <Box
                onClick={() => setMapDate(previousMapDate)}
                style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid #fff',
                  borderRadius: 4,
                  padding: '8px 10px',
                  whiteSpace: 'nowrap',
                }}
              >
                Back to previous date
              </Box>
            )}
            <Box
              onClick={() => setMapDate(todayStr)}
              style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #fff',
                borderRadius: 4,
                padding: '8px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              Go to today
            </Box>
            <Box
              onClick={() => setShowHistoricalToast(false)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <XClose style={{ color: '#fff', width: 18, height: 18 }} />
            </Box>
          </Box>
        </Box>
      )}
    </div>
  )
}

export default TopNav
