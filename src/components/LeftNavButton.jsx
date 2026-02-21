import React from 'react'
import { Box } from '@mantine/core'
import { NavLink } from 'react-router-dom'

const LeftNavButton = ({ icon, to, onNavClick }) => {
  const handleClick = (e) => {
    e.preventDefault()
    onNavClick(to)
  }

  return (
    <Box component={NavLink} to={to} className="leftnav-btn" onClick={handleClick}>
      {icon}
    </Box>
  )
}

export default LeftNavButton
