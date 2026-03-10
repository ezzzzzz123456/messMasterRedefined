import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function createMarkerIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:999px;background:${color};opacity:0.22;transform:scale(1.35);"></div>
        <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:${color};border:3px solid rgba(255,255,255,0.98);box-shadow:0 10px 24px rgba(0,0,0,0.38),0 0 0 5px rgba(15,23,42,0.28);color:#fff;font-size:13px;font-weight:800;letter-spacing:0.02em;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export default function NearbyMessesMap({
  center,
  messes,
  centerTitle = 'Your NGO',
  centerLabel = 'N',
  centerColor = '#2563eb',
  listingLabel = 'M',
  listingColor = '#7c3aed',
  emptyMessage = 'Location is unavailable.',
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersLayerRef = useRef(null)

  const resolvedCenter = useMemo(() => {
    if (Number.isFinite(center?.latitude) && Number.isFinite(center?.longitude)) {
      return [center.latitude, center.longitude]
    }

    const firstMess = (messes || []).find(
      (mess) => Number.isFinite(mess.latitude) && Number.isFinite(mess.longitude),
    )
    if (firstMess) return [firstMess.latitude, firstMess.longitude]

    return null
  }, [center, messes])

  useEffect(() => {
    if (!mapContainerRef.current || !resolvedCenter || mapRef.current) return undefined

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(resolvedCenter, 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    markersLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [resolvedCenter])

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !resolvedCenter) return

    const layer = markersLayerRef.current
    layer.clearLayers()

    const bounds = L.latLngBounds([resolvedCenter])

    if (Number.isFinite(center?.latitude) && Number.isFinite(center?.longitude)) {
      L.marker(resolvedCenter, { icon: createMarkerIcon(centerColor, centerLabel) })
        .bindPopup(`<strong>${escapeHtml(centerTitle)}</strong><br/>${escapeHtml(center.location || 'Configured location')}`)
        .addTo(layer)
    }

    for (const mess of messes || []) {
      if (!Number.isFinite(mess.latitude) || !Number.isFinite(mess.longitude)) continue

      const latLng = [mess.latitude, mess.longitude]
      bounds.extend(latLng)

      L.marker(latLng, { icon: createMarkerIcon(listingColor, listingLabel) })
        .bindPopup(`
          <strong>${escapeHtml(mess.name)}</strong><br/>
          ${escapeHtml(mess.location || '')}<br/>
          Distance: ${mess.distanceKm} km<br/>
          Active listings: ${mess.activeListingCount || 0}
        `)
        .addTo(layer)
    }

    if ((messes || []).length) {
      mapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 13 })
    } else {
      mapRef.current.setView(resolvedCenter, 12)
    }
  }, [center?.latitude, center?.location, center?.longitude, centerColor, centerLabel, centerTitle, listingColor, listingLabel, messes, resolvedCenter])

  if (!resolvedCenter) {
    return (
      <div className="h-[360px] rounded-2xl border border-border/40 flex items-center justify-center text-sm text-muted">
        {emptyMessage}
      </div>
    )
  }

  return <div ref={mapContainerRef} className="h-[360px] rounded-2xl overflow-hidden border border-border/40" />
}
