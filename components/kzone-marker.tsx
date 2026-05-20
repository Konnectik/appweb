"use client"

import { cn } from "@/lib/utils"

export type APStatus = "online" | "offline" | "out-of-range"

interface KZoneMarkerProps {
  status: APStatus
  hasResumableBundle?: boolean
  selected?: boolean
  isActive?: boolean
  onClick?: () => void
}

export function KZoneMarker({ status, hasResumableBundle, selected, isActive, onClick }: KZoneMarkerProps) {
  const statusColors = {
    online: "bg-[#22C55E]",
    "out-of-range": "bg-[#F59E0B]",
    offline: "bg-muted-foreground",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center transition-transform",
        selected && "scale-125"
      )}
    >
      {/* Pin */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
        statusColors[status]
      )}>
        <svg 
          className="w-4 h-4 text-white" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M8.111 16.404a5.5 5.5 0 0 1 7.778 0M12 20h.01M3.294 10.404a12 12 0 0 1 17.412 0M6.797 13.404a8 8 0 0 1 10.406 0" />
        </svg>
      </div>

      {/* Active connection indicator */}
      {isActive && (
        <div className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-50" />
      )}

      {/* Resume badge */}
      {hasResumableBundle && status === "online" && !isActive && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </span>
      )}

      {/* Pin tail */}
      <div className={cn(
        "absolute -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent",
        status === "online" && "border-t-[#22C55E]",
        status === "out-of-range" && "border-t-[#F59E0B]",
        status === "offline" && "border-t-muted-foreground"
      )} />
    </button>
  )
}
