import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const Map = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'mercator',
    })

    const observer = new ResizeObserver(() => {
      map.current?.resize()
    })
    observer.observe(mapContainer.current)

    return () => {
      observer.disconnect()
      map.current.remove()
      map.current = null
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        outline: 'none',
      }}
    />
  )
}

export default Map
