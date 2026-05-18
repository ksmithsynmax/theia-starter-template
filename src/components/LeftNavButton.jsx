import React from 'react'
import { Box, Tooltip } from '@mantine/core'
import { NavLink } from 'react-router-dom'

const LeftNavButton = ({ icon, to, onNavClick, label }) => {
  const handleClick = (e) => {
    e.preventDefault()
    onNavClick(to)
  }

  return (
    <Tooltip
      label={label}
      position="right"
      withArrow
      arrowSize={6}
      offset={8}
      transitionProps={{ duration: 120 }}
      styles={{
        tooltip: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          border: '1px solid #000000',
          fontSize: 11,
          fontWeight: 500,
          padding: '6px 8px',
        },
        arrow: {
          backgroundColor: '#000000',
          border: '1px solid #000000',
        },
      }}
    >
      <Box
        component={NavLink}
        to={to}
        className="leftnav-btn"
        onClick={handleClick}
        aria-label={label}
        title={label}
      >
        {icon}
      </Box>
    </Tooltip>
  )
}

export default LeftNavButton
