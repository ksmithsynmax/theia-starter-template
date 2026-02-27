import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { detections } from '../data/mockData'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// AIS - green ship
const aisSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00EB6C" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/></svg>`

// Dark - orange ship with radar
const darkShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387H12.75L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387L6.74999 20.9387Z" fill="#FFA500" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="#111326"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="#111326"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="#111326"/></svg>`

// Light - blue ship with radar
const lightShipSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#00A3E3" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M8.80502 15.6375L8.50201 15.3363L8.86659 14.9515C9.30584 14.4803 9.50283 14.0896 9.59584 13.5072C9.72054 12.6752 9.43626 11.8463 8.82215 11.2359L8.50298 10.9186L8.81329 10.6245L9.12359 10.3304L9.41852 10.6236C10.0892 11.2902 10.4583 12.2034 10.4425 13.1598C10.4267 14.1162 10.1359 14.8233 9.46858 15.5499L9.10804 15.9387L8.80502 15.6375Z" fill="white"/><path d="M4.69717 15.6375L5.00018 15.3363L4.63561 14.9515C4.19636 14.4803 3.99937 14.0896 3.90636 13.5072C3.78166 12.6752 4.06594 11.8463 4.68004 11.2359L4.99922 10.9186L4.68891 10.6245L4.3786 10.3304L4.08367 10.6236C3.41301 11.2902 3.04388 12.2034 3.05969 13.1598C3.0755 14.1162 3.36633 14.8233 4.03362 15.5499L4.39416 15.9387L4.69717 15.6375Z" fill="white"/><ellipse cx="6.74958" cy="13.1887" rx="2.06057" ry="2" fill="white"/></svg>`

// Spoofing - pink diamond with exclamation
const spoofingSvg = `<svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11.0607" y="1.06065" width="14.1421" height="14.1421" transform="rotate(45 11.0607 1.06065)" fill="#FF6D99" stroke="#111326" stroke-width="1.5"/><path d="M11.0607 11.8937V7.1716" stroke="#111326" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.0607" cy="14.9492" r="1.11108" fill="#111326"/></svg>`

// Unattributed - red ship with magnifying glass
const unattributedSvg = `<svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.74999 20.9387L12.75 20.9387L12.75 16.18C12.75 5.45464 6.74998 0.93869 6.74998 0.93869C6.74998 0.93869 0.749988 5.45464 0.749994 16.18L0.749997 20.9387H6.74999Z" fill="#F75349" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><ellipse cx="6.72543" cy="12.4387" rx="2.57571" ry="2.5" stroke="#111326" stroke-width="1.5"/><path d="M9.15069 17.4049C9.38254 17.7481 9.85378 17.8461 10.2032 17.6237C10.5527 17.4014 10.648 16.9428 10.4162 16.5996L9.78344 17.0022L9.15069 17.4049ZM8.08876 14.4934L7.45601 14.896L9.15069 17.4049L9.78344 17.0022L10.4162 16.5996L8.72151 14.0907L8.08876 14.4934Z" fill="#111326"/></svg>`

// Ship-to-Ship - blue/red split rectangle
const stsSvg = `<svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.75" y="0.75" width="9.5" height="19" fill="#00A3E3"/><rect x="10.25" y="0.75" width="9.5" height="19" fill="#F75349"/><rect x="0.75" y="0.75" width="19" height="19" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M10.25 0.75L10.25 19.75" stroke="#111326" stroke-width="1.5" stroke-linecap="round"/></svg>`

// Ship-to-Ship AIS - green/blue split rectangle
const stsAisSvg = `<svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.75" y="0.75" width="9.5" height="19" fill="#00EB6C"/><rect x="10.25" y="0.75" width="9.5" height="19" fill="#00A3E3"/><rect x="0.75" y="0.75" width="19" height="19" stroke="#111326" stroke-width="1.5" stroke-miterlimit="10"/><path d="M10.25 0.75L10.25 19.75" stroke="#111326" stroke-width="1.5" stroke-linecap="round"/></svg>`

const svgByType = {
  ais: aisSvg,
  dark: darkShipSvg,
  light: lightShipSvg,
  spoofing: spoofingSvg,
  unattributed: unattributedSvg,
  sts: stsSvg,
  'sts-ais': stsAisSvg,
}

const Map = ({ onDetectionClick, selectedDetectionId }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})
  const onDetectionClickRef = useRef(onDetectionClick)
  onDetectionClickRef.current = onDetectionClick

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [63, 15],
      zoom: 4,
      projection: 'mercator',
      attributionControl: false,
      logoPosition: 'bottom-right',
    })

    detections.forEach((detection) => {
      const svg = svgByType[detection.type]
      if (!svg) return
      const el = document.createElement('div')
      el.innerHTML = svg
      el.className = 'map-marker'
      el.style.cursor = 'pointer'
      el.dataset.detectionId = detection.id
      el.dataset.shipId = detection.shipId
      el.dataset.detectionType = detection.type
      el.addEventListener('click', () => {
        // Clear active from all markers
        Object.values(markersRef.current).forEach((m) => {
          m.getElement().classList.remove('active')
        })
        // Set active on clicked marker
        el.classList.add('active')
        onDetectionClickRef.current?.(detection)
      })
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([detection.lng, detection.lat])
        .addTo(map.current)
      markersRef.current[detection.id] = marker
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
