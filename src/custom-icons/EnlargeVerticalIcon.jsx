import React from 'react'

const EnlargeVerticalIcon = ({ width = 24, height = 24, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.207 15.1358L16.1033 18.0321M16.1033 18.0321L19.0004 15.1358M16.1033 18.0321L16.1038 5.96533"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7934 8.86199L7.89714 5.96484M7.89714 5.96484L5 8.86199M7.89714 5.96484L7.89675 18.032"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default EnlargeVerticalIcon
