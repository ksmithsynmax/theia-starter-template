/*
=============================================================================
DIM RING (OPENED STATE) ARCHIVE
=============================================================================
This code was removed from the map because the new timeline flow made "dimming
all markers for an open ship" confusing. 

If the team requests the "dim ring" behavior back (e.g., to show a breadcrumb
of recently clicked ships), you can restore this code.

-----------------------------------------------------------------------------
1. Add this to src/App.css:
-----------------------------------------------------------------------------
.mapboxgl-marker.opened::before {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  opacity: 1;
}

.mapboxgl-marker.opened:hover::before {
  background: rgba(255, 255, 255, 0.25);
}

-----------------------------------------------------------------------------
2. Add this useEffect to src/components/Map.jsx (below the panelFocusId effect):
-----------------------------------------------------------------------------
  // Dim all markers for ships with inactive open tabs.
  // State clears automatically when tabs are closed.
  useEffect(() => {
    if (!map.current) return
    const inactiveShipIds = new Set()
    shipTabs.forEach((tab) => {
      if (!tab || tab.id === activeShipTab || tab.type === 'port') return
      // Only dim ships with their own inactive ship tab.
      // Do not infer dim state from STS partner linkage.
      if (tab.type === 'sts') return
      inactiveShipIds.add(tab.id)
    })

    runtimeDetections.forEach((det) => {
      const marker = markersRef.current[det.id]
      if (!marker) return
      const el = marker.getElement()
      if (
        inactiveShipIds.has(det.shipId) &&
        !el.classList.contains('active') &&
        !el.classList.contains('previewed')
      ) {
        el.classList.add('opened')
      } else {
        el.classList.remove('opened')
      }
    })
  }, [
    shipTabs,
    activeShipTab,
    activeDetectionId,
    previewDetectionId,
    runtimeDetections,
  ])
*/