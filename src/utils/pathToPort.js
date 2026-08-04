// Path to Port routing helpers (prototype).
//
// This is a mock prediction: we treat the route from a vessel's current
// position to the destination port as a great-circle straight line, derive the
// distance with the haversine formula, and compute ETA as "now + distance /
// speed". No land avoidance or real routing is performed.

const EARTH_RADIUS_NM = 3440.065 // nautical miles

const toRadians = (deg) => (deg * Math.PI) / 180

const toPoint = (value) => {
  if (!value) return null
  const lng = Number(value.lng ?? value.longitude ?? value[0])
  const lat = Number(value.lat ?? value.latitude ?? value[1])
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  return { lng, lat }
}

// Great-circle distance between two {lng,lat} points, in nautical miles.
export const haversineNm = (from, to) => {
  const a = toPoint(from)
  const b = toPoint(to)
  if (!a || !b) return null
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return EARTH_RADIUS_NM * c
}

// Interpolated great-circle path (array of [lng,lat]) so the drawn route curves
// slightly instead of being a single flat segment. Falls back to a 2-point line.
export const greatCirclePath = (from, to, steps = 48) => {
  const a = toPoint(from)
  const b = toPoint(to)
  if (!a || !b) return []
  const lat1 = toRadians(a.lat)
  const lng1 = toRadians(a.lng)
  const lat2 = toRadians(b.lat)
  const lng2 = toRadians(b.lng)
  const dLat = lat2 - lat1
  const dLng = lng2 - lng1
  const angular =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
      )
    )
  if (!Number.isFinite(angular) || angular === 0) {
    return [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ]
  }
  const points = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const A = Math.sin((1 - f) * angular) / Math.sin(angular)
    const B = Math.sin(f * angular) / Math.sin(angular)
    const x =
      A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2)
    const y =
      A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y))
    const lng = Math.atan2(y, x)
    points.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI])
  }
  return points
}

// Initial great-circle bearing (degrees, 0-360) from one point to another.
export const initialBearing = (from, to) => {
  const a = toPoint(from)
  const b = toPoint(to)
  if (!a || !b) return null
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const dLng = toRadians(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

// Deterministic pseudo-speed (knots) for a vessel, seeded by a stable string
// (e.g. MMSI) so the "all arrivals" illustration shows varied but stable speeds.
export const syntheticSpeedKn = (seed, min = 10, max = 16) => {
  const str = String(seed || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  const span = Math.max(0, max - min)
  return Math.round((min + (hash % (span * 10 + 1)) / 10) * 10) / 10
}

// ETA for a given distance (nm) at a given speed (knots), from `fromDate`.
export const computeEta = (distanceNm, speedKn, fromDate = new Date()) => {
  if (
    !Number.isFinite(distanceNm) ||
    !Number.isFinite(speedKn) ||
    speedKn <= 0
  ) {
    return { hours: null, etaDate: null }
  }
  const hours = distanceNm / speedKn
  const etaDate = new Date(fromDate.getTime() + hours * 3600 * 1000)
  return { hours, etaDate }
}

// "2d 4h" / "6h 30m" / "45m"
export const formatDuration = (hours) => {
  if (!Number.isFinite(hours) || hours < 0) return '—'
  const totalMinutes = Math.round(hours * 60)
  const days = Math.floor(totalMinutes / (24 * 60))
  const remAfterDays = totalMinutes - days * 24 * 60
  const hrs = Math.floor(remAfterDays / 60)
  const mins = remAfterDays - hrs * 60
  if (days > 0) return `${days}d ${hrs}h`
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

// "Aug 6, 2026 14:20 UTC"
export const formatEta = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—'
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
  return `${datePart} ${timePart} UTC`
}

// "1,240 nm"
export const formatDistanceNm = (distanceNm) => {
  if (!Number.isFinite(distanceNm)) return '—'
  return `${Math.round(distanceNm).toLocaleString('en-US')} nm`
}

// Preset speeds (knots) offered by the speed control across all versions.
export const PATH_TO_PORT_SPEEDS = [8, 12, 16, 20]
export const DEFAULT_PATH_TO_PORT_SPEED = 12
