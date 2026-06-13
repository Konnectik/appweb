"use client"

import { Fragment, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import type { AccessPoint } from "@/lib/supabase/types"

// --- Icons -----------------------------------------------------------

function buildIcon(color: string, pulse = false) {
  // Pin shape with telecom tower icon centered.
  const html = `
    <div style="position:relative;width:42px;height:52px;">
      ${pulse ? `<div style="position:absolute;left:50%;top:14px;width:32px;height:32px;margin-left:-16px;border-radius:50%;background:${color};opacity:.4;animation:konn-ping 1.4s cubic-bezier(0,0,.2,1) infinite;"></div>` : ""}
      <div style="position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;">
        <svg width="42" height="52" viewBox="0 0 42 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35));">
          <path d="M21 0C9.4 0 0 9.4 0 21c0 15.75 21 31 21 31s21-15.25 21-31C42 9.4 32.6 0 21 0z" fill="${color}"/>
          <circle cx="21" cy="21" r="14" fill="#fff"/>
          <g transform="translate(11 9) scale(0.83)" fill="${color}">
            <path d="M12 4L9 9h6l-3-5zm-1 6v3H8v2h3v8h2v-8h3v-2h-3v-3h-2zm-5.5-.5l-1.4 1.4C2.7 12.5 2 14.2 2 16s.7 3.5 2.1 5.1l1.4-1.4C4.5 18.5 4 17.3 4 16s.5-2.5 1.5-3.5zm13 0L17 11c1 1 1.5 2.2 1.5 3.5S18 17.5 17 18.6l1.5 1.5C19.9 18.5 20.6 16.8 20.6 15s-.7-3.5-2.1-5.5zM3 7L1.6 8.4C-.5 10.5-.5 14 1.6 16l1.4-1.4C1.6 13.2 1.6 10.8 3 9.4L4.4 8 3 7zm18 0l-1.4 1.4c1.4 1.4 1.4 3.8 0 5.2L21 16c2.1-2.1 2.1-5.6 0-7.6L21 7z"/>
          </g>
        </svg>
      </div>
    </div>`
  return L.divIcon({
    html,
    className: "konn-ap-marker",
    iconSize: [42, 52],
    iconAnchor: [21, 52],
    popupAnchor: [0, -48],
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

function FlyToOnChange({ center, trigger }: { center: [number, number] | null; trigger?: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 0.8 })
    // Re-runs when center coords OR trigger increments (recenter button).
  }, [center?.[0], center?.[1], trigger, map])
  return null
}

// --- Main component --------------------------------------------------

interface LeafletMapProps {
  accessPoints: AccessPoint[]
  userLocation: [number, number] | null
  activeAPId?: string | null
  onAPSelect: (ap: AccessPoint) => void
  onAPAccess?: (ap: AccessPoint) => void
  recenterTrigger?: number
}

export default function LeafletMap({
  accessPoints,
  userLocation,
  activeAPId,
  onAPSelect,
  onAPAccess,
  recenterTrigger,
}: LeafletMapProps) {
  // Default center: Yaoundé (Cameroon) — used only as the initial mount value
  // while we wait for the user's geoloc fix, or when geoloc is denied.
  // `MapContainer.center` is read once on mount; FlyToOnChange below handles
  // every subsequent recenter.
  const DEFAULT_CENTER: [number, number] = [3.848, 11.502]
  const center = userLocation ?? DEFAULT_CENTER

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
            <Fragment key={ap.id}>
              {/* Real coverage (geographic) — uses the actual propagation radius */}
              <Circle
                center={pos}
                radius={ap.propagation_radius_m ?? 50}
                pathOptions={{
                  color: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillColor: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: "4 4",
                }}
              />
              {/* Visual halo — ensures the K-Zone is still visible when zoomed out */}
              <Circle
                center={pos}
                radius={Math.max(ap.propagation_radius_m ?? 50, 250)}
                pathOptions={{
                  color: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillColor: isActive ? "#E42320" : ap.status === "online" ? "#22C55E" : "#94A3B8",
                  fillOpacity: 0.06,
                  weight: 1,
                  opacity: 0.5,
                }}
              />
              <Marker
                position={pos}
                icon={icon}
                eventHandlers={{ click: () => onAPSelect(ap) }}
              >
                <Popup>
                  <div style={{ minWidth: 200, padding: "4px 0" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{ap.zone_label}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{ap.location}</div>
                    <div style={{ fontSize: 11, marginTop: 6, color: ap.status === "online" ? "#22C55E" : "#94A3B8", fontWeight: 500 }}>
                      ● {ap.status === "online" ? "En ligne" : ap.status === "maintenance" ? "Maintenance" : "Hors-ligne"}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        onAPAccess?.(ap)
                      }}
                      disabled={ap.status !== "online"}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "8px 12px",
                        background: ap.status === "online" ? "#E42320" : "#94A3B8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: ap.status === "online" ? "pointer" : "not-allowed",
                      }}
                    >
                      Accéder à la K-zone →
                    </button>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          )
        })}

        <FlyToOnChange center={userLocation} trigger={recenterTrigger} />
      </MapContainer>
    </>
  )
}
