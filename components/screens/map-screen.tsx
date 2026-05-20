"use client"

import { useEffect, useState } from "react"
import { MapCanvas } from "@/components/map/map-canvas"
import { Locate } from "lucide-react"
import type { AccessPoint as RealAccessPoint } from "@/lib/supabase/types"
import type { AccessPoint as MockAccessPoint } from "@/lib/mock-data"

// Bridge: accept the legacy mock shape AND the real Supabase shape.
type AnyAP = MockAccessPoint | RealAccessPoint

function toRealAP(ap: AnyAP): RealAccessPoint {
  // If it already looks like the Supabase shape (has zone_label), keep it.
  if ("zone_label" in ap) return ap as RealAccessPoint
  const m = ap as MockAccessPoint
  return {
    id: m.id,
    provider_id: (m as any).provider_id ?? "",
    zone_label: (m as any).name ?? "K-Zone",
    location: (m as any).location ?? "",
    latitude: (m as any).latitude ?? null,
    longitude: (m as any).longitude ?? null,
    ssid: null,
    propagation_radius_m: (m as any).propagation_radius_m ?? 60,
    status: ((m as any).status ?? "online") as RealAccessPoint["status"],
    avg_rating: (m as any).rating ?? null,
  }
}

interface MapScreenProps {
  accessPoints: AnyAP[]
  onAPSelect: (ap: AnyAP) => void
  hasResumableBundle?: boolean
  resumableBundleMinutes?: number
  activeAPId?: string | null
}

export function MapScreen({
  accessPoints,
  onAPSelect,
  hasResumableBundle,
  resumableBundleMinutes,
  activeAPId,
}: MapScreenProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [recenterTick, setRecenterTick] = useState(0)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Request geolocation once on mount. On HTTPS the browser will prompt.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation not supported by this browser")
      return
    }
    if (!window.isSecureContext) {
      setGeoError("Geolocation requires HTTPS")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setGeoError(null)
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Permission de localisation refusée"
            : err.code === err.POSITION_UNAVAILABLE
            ? "Position indisponible"
            : err.code === err.TIMEOUT
            ? "Délai de localisation dépassé"
            : err.message
        setGeoError(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  // Map raw items to the shape Leaflet expects, keep an index for original lookup
  const realAPs = accessPoints.map(toRealAP)
  const lookup = new Map(accessPoints.map((ap) => [ap.id, ap]))

  const handleSelect = (real: RealAccessPoint) => {
    const original = lookup.get(real.id)
    if (original) onAPSelect(original)
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <MapCanvas
        accessPoints={realAPs}
        userLocation={userLocation}
        activeAPId={activeAPId}
        onAPSelect={handleSelect}
        recenterTrigger={recenterTick}
      />

      {/* Resumable bundle banner */}
      {hasResumableBundle && resumableBundleMinutes && resumableBundleMinutes > 0 && !activeAPId && (
        <div className="absolute top-4 left-4 right-4 bg-primary text-primary-foreground rounded-xl p-4 shadow-lg z-500 pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Bundle Active</p>
              <p className="text-xs opacity-90">
                {Math.floor(resumableBundleMinutes / 60)}h {resumableBundleMinutes % 60}m remaining
              </p>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium">Tap a K-Zone</span>
          </div>
        </div>
      )}

      {/* Connected banner */}
      {activeAPId && (
        <div className="absolute top-4 left-4 right-4 bg-[#22C55E] text-white rounded-xl p-4 shadow-lg z-500 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <p className="text-sm font-semibold">Connected</p>
          </div>
        </div>
      )}

      {/* Geo error toast (non-blocking) */}
      {geoError && !userLocation && (
        <div className="absolute top-20 left-4 right-4 bg-card border border-border rounded-lg p-3 shadow-md z-500 text-xs text-muted-foreground">
          Location unavailable — showing default city view.
        </div>
      )}

      {/* Recenter button */}
      <button
        type="button"
        onClick={() => setRecenterTick((t) => t + 1)}
        disabled={!userLocation}
        className="absolute bottom-4 right-4 w-12 h-12 bg-card rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 z-500"
        aria-label="Recenter map"
      >
        <Locate className="w-5 h-5 text-foreground" />
      </button>
    </div>
  )
}
