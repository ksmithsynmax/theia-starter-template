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
} from '@untitledui/icons'

import TheiaLogo from '../assets/TheiaLogo.svg'
import { useShipContext } from '../context/ShipContext'

const TopNav = () => {
  const { mapDate, setMapDate } = useShipContext()
  const [calendarOpen, setCalendarOpen] = useState(false)
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
            <Text variant="body1" c="#fff" style={{ margin: '0 8px' }}>
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
    </div>
  )
}

export default TopNav
