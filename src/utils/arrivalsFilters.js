// Path to Port v7 "Advanced filters" — shared between the Map overlay (which
// applies the filters) and the Myships side panel (which renders the filter
// modal). Real data drives type/ETA/distance/flag/speed; the values below are
// prototype-only facets we don't have real data for yet, derived from a stable
// hash of the vessel id so a given ship always shows the same values.

export const DEFAULT_ARRIVALS_FILTERS = {
  shipTypes: [],
  etaWithinHours: null,
  maxDistanceNm: null,
  flags: [],
  statuses: [],
  terminals: [],
  speedBand: null,
  dataFlags: [],
}

export const ARRIVAL_STATUS_OPTIONS = ['On time', 'Delayed', 'Uncertain']

export const ARRIVAL_TERMINAL_OPTIONS = [
  'Container Terminal',
  'Bulk Terminal',
  'Oil Jetty',
  'Anchorage',
]

export const ARRIVAL_SPEED_BANDS = [
  { value: 'anchored', label: 'Anchored' },
  { value: 'slow', label: 'Slow (1–8 kn)' },
  { value: 'cruising', label: 'Cruising (8+ kn)' },
]

export const ARRIVAL_ETA_OPTIONS = [
  { value: 24, label: 'Within 24 hours' },
  { value: 48, label: 'Within 48 hours' },
  { value: 168, label: 'Within 7 days' },
]

export const ARRIVAL_DISTANCE_OPTIONS = [
  { value: 250, label: '≤ 250 nm' },
  { value: 500, label: '≤ 500 nm' },
  { value: 1000, label: '≤ 1000 nm' },
]

export const ARRIVAL_DATA_FLAG_OPTIONS = [
  { value: 'ais-gap', label: 'AIS gap' },
  { value: 'route-deviation', label: 'Route deviation' },
]

const hashArrivalId = (value) => {
  const str = String(value ?? '')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

export const syntheticArrivalAttrs = (row) => {
  const h = hashArrivalId(row.shipId || row.mmsi || row.name)
  return {
    status: ARRIVAL_STATUS_OPTIONS[h % ARRIVAL_STATUS_OPTIONS.length],
    terminal:
      ARRIVAL_TERMINAL_OPTIONS[(h >> 2) % ARRIVAL_TERMINAL_OPTIONS.length],
    // Anomalies are intentionally rare so v9's "salient" set stays small (the
    // handful worth investigating out of hundreds of routine arrivals).
    aisGap: h % 17 === 0,
    routeDeviation: h % 19 === 3,
    // v9 (military "salience-first") synthetic signals:
    loitering: h % 23 === 1,
    // Vessel of interest / watchlist hit — the rarest, highest-priority flag.
    watchlist: h % 29 === 2,
  }
}

// v9 salience model. A vessel is "salient" (worth drawing/surfacing) when it's on
// the watchlist OR exhibits an anomaly (dark/AIS gap, route deviation, loitering).
// Everything else is background traffic the analyst can ignore. Returns a stable,
// analysis-friendly descriptor per row.
export const ARRIVAL_ANOMALY_LABELS = {
  aisGap: 'AIS gap',
  routeDeviation: 'Route deviation',
  loitering: 'Loitering',
}

export const getArrivalSalience = (row) => {
  const attrs = syntheticArrivalAttrs(row)
  const anomalies = []
  if (attrs.aisGap) anomalies.push('aisGap')
  if (attrs.routeDeviation) anomalies.push('routeDeviation')
  if (attrs.loitering) anomalies.push('loitering')
  const watchlist = attrs.watchlist
  return {
    watchlist,
    anomalies,
    isAnomalous: anomalies.length > 0,
    isSalient: watchlist || anomalies.length > 0,
  }
}

// Apply the advanced facets to a list of arrival rows. Mirrors the Map overlay's
// inline filtering so the side panel can show an accurate "how many match" count
// without re-running the map pipeline. Expects rows with type/flag/etaDate/
// distanceNm/speed (from buildExpectedArrivals).
export const filterArrivalRows = (rows, filters) => {
  if (!filters || !Array.isArray(rows)) return rows || []
  const {
    shipTypes = [],
    etaWithinHours,
    maxDistanceNm,
    flags = [],
    statuses = [],
    terminals = [],
    speedBand,
    dataFlags = [],
  } = filters
  let out = rows
  if (shipTypes.length) out = out.filter((r) => shipTypes.includes(r.type))
  if (flags.length) out = out.filter((r) => flags.includes(r.flag))
  if (etaWithinHours) {
    const cutoff = Date.now() + etaWithinHours * 3600000
    out = out.filter((r) => r.etaDate && r.etaDate.getTime() <= cutoff)
  }
  if (maxDistanceNm) {
    out = out.filter(
      (r) => Number.isFinite(r.distanceNm) && r.distanceNm <= maxDistanceNm
    )
  }
  if (speedBand) {
    out = out.filter((r) => {
      const s = Number(r.speed) || 0
      if (speedBand === 'anchored') return s < 1
      if (speedBand === 'slow') return s >= 1 && s <= 8
      if (speedBand === 'cruising') return s > 8
      return true
    })
  }
  if (statuses.length || terminals.length || dataFlags.length) {
    out = out.filter((r) => {
      const attrs = syntheticArrivalAttrs(r)
      if (statuses.length && !statuses.includes(attrs.status)) return false
      if (terminals.length && !terminals.includes(attrs.terminal)) return false
      if (dataFlags.includes('ais-gap') && !attrs.aisGap) return false
      if (dataFlags.includes('route-deviation') && !attrs.routeDeviation) {
        return false
      }
      return true
    })
  }
  return out
}

// True when any facet is active — used to show a filter count / "clear" affordance.
export const countActiveArrivalsFilters = (filters) => {
  if (!filters) return 0
  let count = 0
  count += filters.shipTypes?.length || 0
  count += filters.flags?.length || 0
  count += filters.statuses?.length || 0
  count += filters.terminals?.length || 0
  count += filters.dataFlags?.length || 0
  if (filters.etaWithinHours != null) count += 1
  if (filters.maxDistanceNm != null) count += 1
  if (filters.speedBand != null) count += 1
  return count
}
