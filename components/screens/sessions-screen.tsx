"use client"

import { useState, useEffect } from "react"
import { Wifi, Clock, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { 
  type UserBundle, 
  type SessionSegment, 
  computeBundleRemainingMinutes,
  formatMinutes,
  formatDate,
  formatRelativeTime
} from "@/lib/mock-data"

interface SessionsScreenProps {
  bundles: UserBundle[]
  segments: SessionSegment[]
  activeSegment: SessionSegment | null
  sessionTimer: number
  onDisconnect: (segmentId: string) => void
  onBuyBundle: () => void
}

export function SessionsScreen({ 
  bundles, 
  segments, 
  activeSegment,
  sessionTimer,
  onDisconnect, 
  onBuyBundle 
}: SessionsScreenProps) {
  const [countdown, setCountdown] = useState<string>("00:00:00")

  // Find the active bundle
  const activeBundle = bundles.find(b => b.status === "active")
  const remainingMinutes = activeBundle 
    ? computeBundleRemainingMinutes(activeBundle, segments) 
    : 0

  // Group segments by bundle
  const getBundleSegments = (bundleId: string) => {
    return segments.filter(s => s.bundle_id === bundleId).sort(
      (a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime()
    )
  }

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSegment || !activeSegment.scheduled_end) return

    const updateCountdown = () => {
      const now = new Date()
      const end = new Date(activeSegment.scheduled_end!)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [activeSegment, sessionTimer])

  if (bundles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wifi className="w-5 h-5" />
            </EmptyMedia>
            <EmptyTitle>No bundles yet</EmptyTitle>
            <EmptyDescription>Purchase a bundle from the map to start connecting to K-Zones.</EmptyDescription>
          </EmptyHeader>
          <Button onClick={onBuyBundle} className="mt-4">Find K-Zones</Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Active Session Card */}
      {activeSegment && activeBundle && (
        <div className="p-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium opacity-90">Connected</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {activeBundle.session_type === "gift" ? "GIFT" : activeBundle.plan_name}
              </Badge>
            </div>

            {/* Countdown */}
            <div className="text-center mb-4">
              <p className="text-4xl font-bold tracking-tight font-mono">{countdown}</p>
              <p className="text-sm opacity-75 mt-1">remaining this session</p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <Progress 
                value={((activeBundle.total_minutes - remainingMinutes) / activeBundle.total_minutes) * 100} 
                className="h-2 bg-white/20"
              />
              <div className="flex justify-between mt-2 text-xs opacity-75">
                <span>{activeBundle.total_minutes - remainingMinutes} min used</span>
                <span>{formatMinutes(remainingMinutes)} left</span>
              </div>
            </div>

            {/* Current AP */}
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-4">
              <MapPin className="w-5 h-5 opacity-75" />
              <div className="flex-1">
                <p className="text-sm font-medium">{activeSegment.ap_name}</p>
                <p className="text-xs opacity-75">{activeSegment.provider_name}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => onDisconnect(activeSegment.id)}
              className="w-full bg-white/20 text-white border-0 hover:bg-white/30"
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Active Bundle (no active session) */}
      {!activeSegment && activeBundle && (
        <div className="p-4">
          <div className="bg-card border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium text-muted-foreground">Ready to connect</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {activeBundle.session_type === "gift" ? "GIFT" : activeBundle.plan_name}
              </Badge>
            </div>

            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-foreground">{formatMinutes(remainingMinutes)}</p>
              <p className="text-sm text-muted-foreground mt-1">remaining on bundle</p>
            </div>

            <Progress 
              value={((activeBundle.total_minutes - remainingMinutes) / activeBundle.total_minutes) * 100} 
              className="h-2 mb-2"
            />

            <p className="text-xs text-muted-foreground text-center mt-3">
              Expires {formatDate(activeBundle.expires_at)}
            </p>
          </div>
        </div>
      )}

      {/* Bundle History */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 mt-2">
          {activeBundle ? "History" : "Past Bundles"}
        </h2>
        
        <div className="flex flex-col gap-3">
          {bundles.map((bundle) => {
            const bundleSegments = getBundleSegments(bundle.id)
            const usedMinutes = bundle.total_minutes - computeBundleRemainingMinutes(bundle, segments)
            
            // Skip active bundle in history (shown above)
            if (bundle.status === "active" && activeBundle?.id === bundle.id) return null
            
            return (
              <div key={bundle.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Bundle header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{bundle.plan_name}</span>
                      {bundle.session_type === "gift" && (
                        <Badge variant="secondary" className="bg-[#22C55E]/10 text-[#22C55E] border-0 text-xs">GIFT</Badge>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "border-0 text-xs",
                        bundle.status === "active" && "bg-[#22C55E]/10 text-[#22C55E]",
                        bundle.status === "exhausted" && "bg-muted text-muted-foreground",
                        bundle.status === "expired" && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {bundle.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.round(usedMinutes)}/{bundle.total_minutes} min
                    </span>
                    <span>{formatRelativeTime(bundle.purchased_at)}</span>
                  </div>
                </div>

                {/* Segments */}
                {bundleSegments.length > 0 && (
                  <div className="divide-y divide-border">
                    {bundleSegments.map((segment) => (
                      <div key={segment.id} className="px-4 py-3 flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          segment.status === "active" ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Wifi className={cn(
                            "w-4 h-4",
                            segment.status === "active" ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{segment.ap_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {segment.provider_name} &middot; {Math.round(segment.time_used_minutes)} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {segment.started_at ? formatRelativeTime(new Date(segment.started_at)) : "—"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Buy more bundles CTA */}
        <div className="mt-4">
          <Button variant="outline" onClick={onBuyBundle} className="w-full">
            Buy a New Bundle
          </Button>
        </div>
      </div>
    </div>
  )
}
