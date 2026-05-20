"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import type LeafletMap from "./leaflet-map"

const DynamicMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted">
      <div className="text-sm text-muted-foreground">Loading map…</div>
    </div>
  ),
})

export function MapCanvas(props: ComponentProps<typeof LeafletMap>) {
  return <DynamicMap {...props} />
}
