import React from 'react'
import { Box } from '@mantine/core'
import {
  Signal01,
  VideoRecorder,
  Clock,
} from '@untitledui/icons'
import SatelliteIcon from '../custom-icons/SatelliteIcon'
import OsintIcon from '../custom-icons/OsintIcon'
import AlertIcon from '../custom-icons/AlertIcon'
import SimilarSearchIcon from '../custom-icons/SimilarSearchIcon'
import LeftNavButton from './LeftNavButton'

const timelineNavItem = { icon: <Clock color="white" size={20} />, to: '/timeline', label: 'Timeline' }

const LeftNav = ({ onNavClick, watchlistVersion = 'grouped' }) => {
  const isVersion2 = watchlistVersion === 'version2'
  const primaryNavItems = [
    { icon: <Signal01 color="white" size={20} />, to: '/watchlist', label: 'Watchlist' },
    { icon: <SatelliteIcon />, to: '/tip-cue', label: 'Tip & Cue' },
    { icon: <VideoRecorder color="white" size={20} />, to: '/webcams', label: 'Webcams' },
    { icon: <OsintIcon />, to: '/osint', label: 'OSINT' },
    ...(!isVersion2 ? [{ icon: <AlertIcon />, to: '/alerts', label: 'Alerts' }] : []),
    { icon: <SimilarSearchIcon />, to: '/similarsearch', label: 'Similar Search' },
  ]

  return (
    <Box
      style={{
        backgroundColor: '#24263C',
        width: '50px',
        minWidth: '50px',
        minHeight: '100%',
        position: 'relative',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Box>
        {primaryNavItems.map((item, index) => (
          <LeftNavButton
            key={index}
            icon={item.icon}
            to={item.to}
            label={item.label}
            onNavClick={onNavClick}
          />
        ))}
      </Box>
      <Box style={{ marginTop: 'auto' }}>
        <LeftNavButton
          icon={timelineNavItem.icon}
          to={timelineNavItem.to}
          label={timelineNavItem.label}
          onNavClick={onNavClick}
        />
      </Box>
    </Box>
  )
}

export default LeftNav
