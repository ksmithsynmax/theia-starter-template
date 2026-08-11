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
    aisGap: h % 4 === 0,
    routeDeviation: h % 5 === 0,
  }
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
