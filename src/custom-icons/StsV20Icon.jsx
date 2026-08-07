import React from 'react'

// v20 / v17 Ship-to-Ship icon: two colored columns with a transfer-arrows
// glyph. Green for AIS STS, purple for every other STS event. Matches the
// map marker built by buildStsV20Svg in Map.jsx.
const StsV20Icon = ({ type, style, size = 16 }) => {
  const color = type === 'sts-ais' ? '#00EB6C' : '#A78BFA'
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.75"
        y="0.75"
        width="16.5"
        height="16.5"
        fill={color}
        stroke="#111326"
        strokeWidth="1.5"
      />
      <path
        d="M6.24519 6.63459L11.5379 6.63459L10.3218 5.41853C10.2261 5.32278 10.2261 5.16757 10.3218 5.07181C10.4176 4.97606 10.5728 4.97606 10.6685 5.07181L12.3031 6.70642L12.32 6.72494C12.3986 6.82124 12.3929 6.96336 12.3031 7.05314L10.6685 8.68774C10.5728 8.78349 10.4176 8.78349 10.3218 8.68774C10.2261 8.59199 10.2261 8.43678 10.3218 8.34103L11.5379 7.12497L6.24519 7.12497C6.10978 7.12497 6 7.01519 6 6.87978C6 6.74436 6.10978 6.63459 6.24519 6.63459Z"
        fill="black"
        stroke="black"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.1298 11.3752L6.83714 11.3752L8.05319 12.5912C8.14895 12.687 8.14895 12.8422 8.05319 12.938C7.95744 13.0337 7.80223 13.0337 7.70648 12.938L6.07187 11.3033L6.05495 11.2848C5.97639 11.1885 5.9821 11.0464 6.07187 10.9566L7.70648 9.32202C7.80223 9.22627 7.95744 9.22627 8.05319 9.32202C8.14895 9.41778 8.14895 9.57299 8.05319 9.66874L6.83714 10.8848L12.1298 10.8848C12.2652 10.8848 12.375 10.9946 12.375 11.13C12.375 11.2654 12.2652 11.3752 12.1298 11.3752Z"
        fill="black"
        stroke="black"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default StsV20Icon
