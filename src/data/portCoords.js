// Shared port-center coordinates for the prototype. Consumed by both the map
// (marker placement, route destination) and the Path to Port routing math in
// the Ports panel, so the two stay in sync from a single source of truth.

export const PROTOTYPE_PORTS = [
  { id: 'port-dubai', name: 'Dubai', lng: 55.2708, lat: 25.2648 },
  { id: 'port-muscat', name: 'Muscat', lng: 58.5659, lat: 23.628 },
  { id: 'port-mumbai', name: 'Mumbai', lng: 72.8277, lat: 18.936 },
  { id: 'port-bar-harbor', name: 'Bar Harbor', lng: 103.78, lat: 1.25, flag: '🇺🇸' },
]

const normalizePortToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

// Resolve a port tab (or {id,name}) to its center coordinates.
export const resolvePortCoords = (tab) => {
  if (!tab) return null
  const rawId = String(tab.id || '').trim()
  const byId = PROTOTYPE_PORTS.find((port) => port.id === rawId)
  if (byId) return byId
  const nameToken = normalizePortToken(tab.name)
  if (!nameToken) return null
  return (
    PROTOTYPE_PORTS.find(
      (port) => normalizePortToken(port.name) === nameToken
    ) || null
  )
}
