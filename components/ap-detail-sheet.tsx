"use client"

import { X, Star, MapPin, Wifi, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignalBars } from "@/components/signal-bars"
import { cn } from "@/lib/utils"
import { type AccessPoint, type Plan, formatMinutes, formatCurrency } from "@/lib/mock-data"

interface APDetailSheetProps {
  ap: AccessPoint | null
  plans: Plan[]
  onClose: () => void
  onBuyBundle: (plan: Plan) => void
  onResume: () => void
  onAddFunds: () => void
  walletBalance: number
  hasResumableBundle?: boolean
  resumableMinutes?: number
  isEligibleForTrial?: boolean
  isConnected?: boolean
}

export function APDetailSheet({ 
  ap, 
  plans,
  onClose, 
  onBuyBundle, 
  onResume,
  onAddFunds,
  walletBalance,
  hasResumableBundle,
  resumableMinutes,
  isEligibleForTrial = false,
  isConnected = false
}: APDetailSheetProps) {
  if (!ap) return null

  const formatDistance = (meters?: number) => {
    if (!meters) return "—"
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`
    }
    return `${meters}m`
  }

  const getSignalStrength = (rssi?: number): number => {
    if (!rssi) return 0
    if (rssi >= -50) return 5
    if (rssi >= -60) return 4
    if (rssi >= -70) return 3
    if (rssi >= -80) return 2
    return 1
  }

  const isOnline = ap.status === "online"
  const isInRange = ap.distance_m ? ap.distance_m <= ap.propagation_radius_m : true
  const canConnect = isOnline && isInRange

  // Filter to only show active paid plans (exclude trials if not eligible)
  const availablePlans = plans.filter(p => {
    if (!p.is_active) return false
    if (p.session_type === "gift" && !isEligibleForTrial) return false
    return true
  })

  return (
    <div className="absolute inset-x-0 bottom-0 bg-card rounded-t-3xl shadow-2xl z-30 max-h-[75vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-muted" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between px-5 pb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-foreground">{ap.name}</h2>
            <span className={cn(
              "w-2 h-2 rounded-full",
              isOnline && isInRange && "bg-[#22C55E]",
              isOnline && !isInRange && "bg-[#F59E0B]",
              !isOnline && "bg-muted-foreground"
            )} />
          </div>
          <p className="text-sm text-muted-foreground">{ap.provider_name} &middot; {ap.zone_label}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 px-5 pb-5 border-b border-border">
        <div className="flex items-center gap-2">
          <SignalBars strength={getSignalStrength(ap.rssi_dbm)} />
          <span className="text-sm text-muted-foreground">Signal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formatDistance(ap.distance_m)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
          <span className="text-sm text-foreground font-medium">{ap.avg_rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Connection status */}
      {isConnected && (
        <div className="px-5 py-4 bg-[#22C55E]/10 border-b border-[#22C55E]/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-sm font-medium text-[#22C55E]">Connected to this K-Zone</span>
          </div>
        </div>
      )}

      {/* Resume CTA */}
      {!isConnected && hasResumableBundle && resumableMinutes && resumableMinutes > 0 && canConnect && (
        <div className="px-5 py-4 border-b border-border">
          <Button 
            onClick={onResume}
            className="w-full h-14 text-base font-semibold gap-3"
          >
            <Play className="w-5 h-5" />
            Resume &mdash; {formatMinutes(resumableMinutes)} remaining
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Continue your existing bundle at this K-Zone
          </p>
        </div>
      )}

      {/* Out of range warning */}
      {!canConnect && isOnline && (
        <div className="px-5 py-4 bg-[#F59E0B]/10 border-b border-[#F59E0B]/20">
          <p className="text-sm text-[#F59E0B] text-center">
            Move closer to connect ({formatDistance(ap.distance_m)} away, {ap.propagation_radius_m}m range)
          </p>
        </div>
      )}

      {/* Offline warning */}
      {!isOnline && (
        <div className="px-5 py-4 bg-muted border-b border-border">
          <p className="text-sm text-muted-foreground text-center">
            This K-Zone is currently offline
          </p>
        </div>
      )}

      {/* Bundles list */}
      {!isConnected && (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Buy a Bundle</h3>
            <span className="text-sm text-muted-foreground">
              Balance: <span className="text-foreground font-medium">{formatCurrency(walletBalance)}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {availablePlans.map((plan) => {
              const isAffordable = plan.price_xaf <= walletBalance
              const isFree = plan.price_xaf === 0
              const isDisabled = !canConnect || (!isFree && !isAffordable)

              return (
                <button
                  key={plan.id}
                  onClick={() => !isDisabled && onBuyBundle(plan)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    isDisabled 
                      ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed" 
                      : "border-border hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base font-medium text-foreground">{plan.name}</span>
                    <span className="text-sm text-muted-foreground">{formatMinutes(plan.duration_minutes)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {isFree ? (
                      <span className="text-base font-semibold text-[#22C55E]">FREE</span>
                    ) : (
                      <span className="text-base font-semibold text-foreground">{formatCurrency(plan.price_xaf)}</span>
                    )}
                    {!isFree && !isAffordable && (
                      <span className="text-xs text-destructive">Insufficient funds</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Wallet CTA if balance is low */}
      {!isConnected && walletBalance < 150 && (
        <div className="px-5 pb-5 pt-2 border-t border-border">
          <Button variant="outline" className="w-full h-12" onClick={onAddFunds}>
            Add Funds to Wallet
          </Button>
        </div>
      )}
    </div>
  )
}
