// Which vessels are "expected" at each prototype port. Keyed by port id and
// resolved by name as a fallback (port tabs sometimes carry only a name). Every
// referenced ship exists in mockData.js and has detections with numeric
// lng/lat, so the route line and ETA math have real coordinates to work with.

import { resolvePortCoords } from './portCoords'
import { haversineNm, computeEta } from '../utils/pathToPort'
import {
  getRotterdamArrivalBaseRows,
  isRotterdamPort,
} from './mockRotterdamArrivals'

export const EXPECTED_ARRIVALS = {
  'port-mumbai': [
    'invictus',
    'tiffani',
    'celestine',
    'wisdom-star',
    'meridian-star',
  ],
  'port-dubai': [
    'sea-falcon',
    'orion-dawn',
    'nordic-crown',
    'azure-horizon',
    'invictus',
  ],
  'port-muscat': ['tiffani', 'celestine', 'meridian-star', 'wisdom-star'],
  'port-bar-harbor': ['invictus', 'sea-falcon', 'orion-dawn'],
}

const normalizePortToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Resolve a port tab (or {id,name}) to its list of expected arrival ship ids.
export const getExpectedArrivalShipIds = (tab) => {
  if (!tab) return []
  const rawId = String(tab.id || '').trim()
  if (EXPECTED_ARRIVALS[rawId]) return EXPECTED_ARRIVALS[rawId]
  const nameToken = normalizePortToken(tab.name)
  if (!nameToken) return []
  const match = Object.keys(EXPECTED_ARRIVALS).find(
    (key) => normalizePortToken(key.replace(/^port-/, '')) === nameToken
  )
  return match ? EXPECTED_ARRIVALS[match] : []
}

// Latest detection (by array order / id) that has usable coordinates.
const latestCoordinateDetection = (detections, shipId) => {
  const forShip = detections
    .filter(
      (d) =>
        d.shipId === shipId &&
        Number.isFinite(d.lng) &&
        Number.isFinite(d.lat)
    )
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  return forShip[0] || null
}

// Build fully-derived Expected Arrivals rows for a port at the given speed.
// Each row carries display fields plus the raw position + distance so callers
// can draw the route without re-deriving anything.
export const buildExpectedArrivals = ({
  portTab,
  ships,
  detections,
  speed,
  scale,
}) => {
  const port = resolvePortCoords(portTab)
  // Rotterdam is a synthetic large-scale scenario: hundreds of inbound vessels
  // generated with plausible positions/types/flags. `scale` caps how many rows
  // we return (v8 = 300 for the "what if 300 ships" demo; other versions get a
  // small handful). These rows are already fully derived, so we just attach ETA.
  if (port && isRotterdamPort(portTab)) {
    const base = getRotterdamArrivalBaseRows(scale ?? 300)
    const rows = base
      .map((row) => {
        const { hours, etaDate } = computeEta(row.distanceNm, speed)
        return { ...row, etaHours: hours, etaDate }
      })
      .sort((a, b) => (a.distanceNm ?? Infinity) - (b.distanceNm ?? Infinity))
    return { port, rows }
  }
  const shipIds = getExpectedArrivalShipIds(portTab)
  const rows = shipIds
    .map((shipId) => {
      const ship = ships[shipId]
      if (!ship) return null
      const detection = latestCoordinateDetection(detections, shipId)
      const position = detection
        ? { lng: detection.lng, lat: detection.lat }
        : null
      const distanceNm =
        port && position ? haversineNm(position, port) : null
      const { hours, etaDate } = computeEta(distanceNm, speed)
      return {
        id: `arrival-${shipId}`,
        shipId,
        detectionId: detection?.id ?? null,
        name: ship.name || 'No info',
        flag: ship.flag || '-',
        type: ship.shipType || ship.aisInfo?.shipType || 'No info',
        imo: ship.imo || 'No info',
        mmsi: ship.mmsi || 'No info',
        position,
        distanceNm,
        etaHours: hours,
        etaDate,
      }
    })
    .filter(Boolean)
  // Soonest arrivals first (nulls last).
  rows.sort((a, b) => {
    if (a.distanceNm == null) return 1
    if (b.distanceNm == null) return -1
    return a.distanceNm - b.distanceNm
  })
  return { port, rows }
}
