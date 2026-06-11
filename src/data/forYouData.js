// "For You" curated feed.
//
// These items represent what the system would surface for a given user based on
// IMPLICIT signals (what they bookmark, the ports/vessels they view, their org
// and region) — not a manually-built list. For the prototype this is a static
// seed, but each item carries a `reason` so the feed can stay transparent about
// why something was surfaced.
//
// Every item has a representative `lng`/`lat` so it can be rendered on the map,
// plus a `color` used by the marker styles.

export const FOR_YOU_KIND_LABELS = {
  ship: 'Vessel',
  port: 'Port',
  shape: 'Area',
}

export const forYouItems = [
  {
    id: 'fy-ship-wisdom-star',
    kind: 'ship',
    shipId: 'wisdom-star',
    name: 'Wisdom Star',
    subtitle: 'Tanker',
    detectionType: 'dark',
    reason: 'Went dark near a port you follow',
    priority: 1,
    color: '#FFA500',
    lng: 61.4,
    lat: 20.9,
  },
  {
    id: 'fy-ship-meridian-star',
    kind: 'ship',
    shipId: 'meridian-star',
    name: 'Meridian Star',
    subtitle: 'Tanker',
    detectionType: 'spoofing',
    reason: 'Repeated AIS spoofing this week',
    priority: 2,
    color: '#FF6D99',
    lng: 56.2,
    lat: 15.3,
  },
  {
    id: 'fy-ship-celestine',
    kind: 'ship',
    shipId: 'celestine',
    name: 'Celestine',
    subtitle: 'Tanker',
    detectionType: 'dark',
    reason: 'STS transfer with a flagged vessel',
    priority: 3,
    color: '#FFA500',
    lng: 63.7,
    lat: 9.7,
  },
  {
    id: 'fy-port-dubai',
    kind: 'port',
    portId: 'port-dubai',
    name: 'Dubai',
    subtitle: 'Port of interest',
    flag: '\u{1F1E6}\u{1F1EA}',
    reason: 'Elevated activity at a port you follow',
    priority: 4,
    color: '#0094FF',
    lng: 55.2708,
    lat: 25.2648,
  },
  {
    id: 'fy-port-muscat',
    kind: 'port',
    portId: 'port-muscat',
    name: 'Muscat',
    subtitle: 'Port of interest',
    flag: '\u{1F1F4}\u{1F1F2}',
    reason: 'New vessels of interest arriving',
    priority: 5,
    color: '#0094FF',
    lng: 58.5659,
    lat: 23.628,
  },
  {
    id: 'fy-shape-hormuz',
    kind: 'shape',
    name: 'Strait of Hormuz watch',
    subtitle: 'Saved area',
    reason: 'Anomalies detected inside your saved area',
    priority: 6,
    color: '#00A3E3',
    lng: 56.5,
    lat: 26.6,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [55.9, 26.1],
          [57.1, 26.1],
          [57.1, 27.0],
          [55.9, 27.0],
          [55.9, 26.1],
        ],
      ],
    },
  },
]
