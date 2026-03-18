const MS_PER_DAY = 24 * 60 * 60 * 1000

const toTimestamp = (dateStr) => {
  const ts = new Date(dateStr).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

export const pointInPolygon = (lng, lat, polygonCoordinates) => {
  if (!Array.isArray(polygonCoordinates) || polygonCoordinates.length < 3) {
    return false
  }

  let inside = false
  for (
    let i = 0, j = polygonCoordinates.length - 1;
    i < polygonCoordinates.length;
    j = i++
  ) {
    const xi = polygonCoordinates[i][0]
    const yi = polygonCoordinates[i][1]
    const xj = polygonCoordinates[j][0]
    const yj = polygonCoordinates[j][1]

    const intersects =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi || Number.EPSILON) + xi
    if (intersects) inside = !inside
  }
  return inside
}

export const getShipLatestDetectionMap = (detections) => {
  const byShip = new Map()
  detections.forEach((detection) => {
    const current = byShip.get(detection.shipId)
    if (!current || toTimestamp(detection.date) > toTimestamp(current.date)) {
      byShip.set(detection.shipId, detection)
    }
  })
  return byShip
}

const getDateLabel = (dateStr) => {
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return dateStr
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const deriveShipRiskSignals = ({
  ships,
  detections,
  riskWindowDays,
  now = '2026-03-18T12:00:00Z',
}) => {
  const nowTs = toTimestamp(now)
  const windowStartTs = nowTs - riskWindowDays * MS_PER_DAY

  return ships.map((ship) => {
    const shipDetections = detections
      .filter((item) => item.shipId === ship.id)
      .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date))

    const latest = shipDetections[0] || null
    const recentDarkEvent = shipDetections.find(
      (item) => item.type === 'dark' && toTimestamp(item.date) >= windowStartTs
    )
    const lastPortBeforeDark = recentDarkEvent
      ? shipDetections.find(
          (item) =>
            item.type === 'port-call' &&
            toTimestamp(item.date) <= toTimestamp(recentDarkEvent.date)
        )
      : null

    const darkSinceLastPort = Boolean(recentDarkEvent && lastPortBeforeDark)
    const daysSinceDark = recentDarkEvent
      ? Math.max(
          1,
          Math.round((nowTs - toTimestamp(recentDarkEvent.date)) / MS_PER_DAY)
        )
      : null

    const reasonSummary = darkSinceLastPort
      ? `Dark since last port (${daysSinceDark}d ago).`
      : 'No dark-since-port risk in selected window.'

    const evidence = darkSinceLastPort
      ? [
          `Port call: ${lastPortBeforeDark.portName || 'Unknown port'} on ${getDateLabel(lastPortBeforeDark.date)}`,
          `Dark event: ${getDateLabel(recentDarkEvent.date)}`,
          `Risk window: ${riskWindowDays} days`,
        ]
      : [`No qualifying dark event in the last ${riskWindowDays} days.`]

    return {
      shipId: ship.id,
      isFlagged: darkSinceLastPort,
      reasonSummary,
      evidence,
      evidenceWindowDays: riskWindowDays,
      originHint: darkSinceLastPort
        ? 'Frequent precursor region: Strait of Hormuz'
        : null,
      latestDetection: latest,
      recentDarkEvent,
      lastPortBeforeDark,
    }
  })
}

