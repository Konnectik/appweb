"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import type { AccessPoint } from "@/lib/supabase/types"

// --- Icons -----------------------------------------------------------

function buildIcon(color: string, pulse = false) {
  const html = `
    <div style="position:relative;width:28px;height:28px;">
      ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.35;animation:konn-ping 1.4s cubic-bezier(0,0,.2,1) infinite;"></div>` : ""}
      <div style="position:absolute;inset:4px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);"></div>
    </div>`
  return L.divIcon({
    html,
    className: "konn-ap-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const ICON_ONLINE = () => buildIcon("#22C55E")
const ICON_OFFLINE = () => buildIcon("#94A3B8")
const ICON_OUT_OF_RANGE = () => buildIcon("#F97316")
const ICON_ACTIVE = () => buildIcon("#E42320", true)

function userLocationIcon() {
  const html = `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:#E42320;opacity:.35;animation:konn-ping 1.6s cubic-bezier(0,0,.2,1) infinite;"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:#E42320;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>
    </div>`
  return L.divIcon({
    html,
    className: "konn-user-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// --- Recenter button hook -------------------------------------------

function FlyToOnChange({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 0.8 })
  }, [center, map])
  return null
}

// --- Main component --------------------------------------------------

interface LeafletMapProps {
  accessPoints: AccessPoint[]
  userLocation: [number, number] | null
  activeAPId?: string | null
  onAPSelect: (ap: AccessPoint) => void
  recenterTrigger?: number
}

export default function LeafletMap({
  accessPoints,
  userLocation,
  activeAPId,
  onAPSelect,
  recenterTrigger,
}: LeafletMapProps) {
  // Default center: Yaoundé (Cameroon) — adjust as needed.
  const DEFAULT_CENTER: [number, number] = [3.848, 11.502]
  const center = userLocation ?? DEFAULT_CENTER
  const flyTarget = useMemo(() => (recenterTrigger ? userLocation : null), [recenterTrigger, userLocation])

  const validAPs = accessPoints.filter(
    (ap) => typeof ap.latitude === "number" && typeof ap.longitude === "number"
  )

  return (
    <>
      <style>{`@keyframes konn-ping{75%,100%{transform:scale(2.2);opacity:0}}`}</style>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%", minHeight: 400 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon()} />
        )}

        {validAPs.map((ap) => {
          const isActive = ap.id === activeAPId
          const icon =
            isActive
              ? ICON_ACTIVE()
              : ap.status === "offline" || ap.status === "maintenance"
              ? ICON_OFFLINE()
              : ICON_ONLINE()
          const pos: [number, number] = [ap.latitude as number, ap.longitude as number]
          return (
            <div key={ap.id}>
              <Circle
                center={pos}
                radius={ap.propagation_radius_m ?? 50}
                pathOptions={{
                  color: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillColor: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
              <Marker
                position={pos}
                icon={icon}
                eventHandlers={{ click: () => onAPSelect(ap) }}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{ap.zone_label}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{ap.location}</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>Status: {ap.status}</div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}

        <FlyToOnChange center={flyTarget} />
      </MapContainer>
    </>
  )
}
