import React from 'react'

const STSDefaultIcon = ({ style }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2.5" y="2.5" width="7" height="5" fill="#00A3E3" />
      <rect x="2.5" y="7.5" width="7" height="5" fill="#FFA500" />
      <rect x="2.5" y="12.5" width="7" height="5" fill="#F75349" />
      <rect
        x="17.5"
        y="17.5"
        width="7"
        height="5"
        transform="rotate(-180 17.5 17.5)"
        fill="#00A3E3"
      />
      <rect
        x="17.5"
        y="12.5"
        width="7"
        height="5"
        transform="rotate(-180 17.5 12.5)"
        fill="#FFA500"
      />
      <rect
        x="17.5"
        y="7.5"
        width="7"
        height="5"
        transform="rotate(-180 17.5 7.5)"
        fill="#F75349"
      />
      <rect
        x="2.25"
        y="2.25"
        width="15.5"
        height="15.5"
        stroke="#111326"
        stroke-width="1.5"
        stroke-miterlimit="10"
      />
      <path
        d="M10 2.5625V17.4375"
        stroke="#111326"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  )
}

export default STSDefaultIcon
