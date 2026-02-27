import React from 'react'

const STSAisIcon = ({ style }) => {
  return (
    <svg
      width="21"
      height="21"
      style={style}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.75" y="0.75" width="9.5" height="19" fill="#00EB6C" />
      <rect x="10.25" y="0.75" width="9.5" height="19" fill="#00A3E3" />
      <rect
        x="0.75"
        y="0.75"
        width="19"
        height="19"
        stroke="#111326"
        strokeWidth="1.5"
        strokeMiterlimit="10"
      />
      <path
        d="M10.25 0.75L10.25 19.75"
        stroke="#111326"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default STSAisIcon
