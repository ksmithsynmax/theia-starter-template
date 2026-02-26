import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const aisSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00EB6C" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/></svg>`

const darkShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387H12.75L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387L6.74999 20.9387Z" fill="#FFA500" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="#111326"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="#111326"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="#111326"/></svg>`

const lightShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00A3E3" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="white"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="white"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="white"/></svg>`

const shipMarkers = [
  { svg: aisSvg, lng: 63.0, lat: 18.0 },
  { svg: darkShipSvg, lng: 66.0, lat: 15.0 },
  { svg: lightShipSvg, lng: 60.5, lat: 13.0 },
]

const Map = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [63, 15],
      zoom: 4,
      projection: 'mercator',
    })

    shipMarkers.forEach(({ svg, lng, lat }) => {
      const el = document.createElement('div')
      el.innerHTML = svg
      el.style.cursor = 'pointer'
      new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map.current)
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
