import React from 'react'
import { Box } from '@mantine/core'

const LeftNavButton = ({ icon }) => {
  return (
    <Box component="button" type="button" className="leftnav-btn">
      {icon}
    </Box>
  )
}

export default LeftNavButton
