import React from 'react'
import { Box } from '@mantine/core'
import {
  Anchor,
  List,
  VideoRecorder,
  BezierCurve03,
  Signal01,
} from '@untitledui/icons'
import ShipIcon from '../custom-icons/ShipIcon'
import SatelliteIcon from '../custom-icons/SatelliteIcon'
import OsintIcon from '../custom-icons/OsintIcon'
import AlertIcon from '../custom-icons/AlertIcon'
import SimilarSearchIcon from '../custom-icons/SimilarSearchIcon'
import LeftNavButton from './LeftNavButton'

const leftNavItems = [
  // { icon: <Signal01 color="white" size={20} />, to: '/events' },
    { icon: <ShipIcon />, to: '/myships' },
    { icon: <List color="white" size={20} />, to: '/events' },


  { icon: <Anchor color="white" size={20} />, to: '/ports' },
  { icon: <SatelliteIcon />, to: '/tip-cue' },
  { icon: <VideoRecorder color="white" size={20} />, to: '/webcams' },
  // { icon: <BezierCurve03 color="white" size={20} />, to: '/polygons' },
  { icon: <OsintIcon />, to: '/osint' },
  { icon: <AlertIcon />, to: '/alerts' },
  { icon: <SimilarSearchIcon />, to: '/similarsearch' },
]

const LeftNav = ({ onNavClick }) => {
  return (
    <Box
      style={{
        backgroundColor: '#24263C',
        width: '50px',
        minWidth: '50px',
        minHeight: '100%',
        position: 'relative',
        pointerEvents: 'auto',
      }}
    >
      {leftNavItems.map((item, index) => (
        <LeftNavButton key={index} icon={item.icon} to={item.to} onNavClick={onNavClick} />
      ))}
    </Box>
  )
}

export default LeftNav
