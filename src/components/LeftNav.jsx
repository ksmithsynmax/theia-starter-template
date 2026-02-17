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
  { icon: <Signal01 color="white" size={20} /> },
  { icon: <Anchor color="white" size={20} /> },
  { icon: <List color="white" size={20} /> },
  { icon: <ShipIcon /> },
  { icon: <SatelliteIcon /> },
  { icon: <VideoRecorder color="white" size={20} /> },
  { icon: <BezierCurve03 color="white" size={20} /> },
  { icon: <OsintIcon /> },
  { icon: <AlertIcon /> },
  { icon: <SimilarSearchIcon /> },
]

const LeftNav = () => {
  return (
    <Box
      style={{
        backgroundColor: '#181926',
        width: '50px',
        minHeight: '100vh',
      }}
    >
      {leftNavItems.map((item, index) => (
        <LeftNavButton key={index} icon={item.icon} />
      ))}
    </Box>
  )
}

export default LeftNav
