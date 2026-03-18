import React from 'react'

const SpoofingInfo = ({ style }) => {
  return (
    <svg
      width="23"
      height="23"
      style={style}
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="11.0607"
        y="1.06065"
        width="14.1421"
        height="14.1421"
        transform="rotate(45 11.0607 1.06065)"
        fill="#FF6D99"
        stroke="#111326"
        stroke-width="1.5"
      />
      <path
        d="M11.0607 11.8937V7.1716"
        stroke="#111326"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="11.0607" cy="14.9492" r="1.11108" fill="#111326" />
    </svg>
  )
}

export default SpoofingInfo
