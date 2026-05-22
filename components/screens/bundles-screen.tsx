"use client"

import { ArrowLeft, MapPin, Wifi, Star, Wallet as WalletIcon, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency, formatMinutes, type AccessPoint, type Plan } from "@/lib/mock-data"

interface BundlesScreenProps {
  ap: AccessPoint
  plans: Plan[]
  walletBalance: number
  hasResumableBundle?: boolean
  resumableMinutes?: number
  isEligibleForTrial?: boolean
  isConnected?: boolean
  onBack: () => void
  onBuyBundle: (plan: Plan) => void
  onResume: () => void
  onAddFunds: () => void
}

export function BundlesScreen({
  ap,
  plans,
  walletBalance,
  hasResumableBundle,
  resumableMinutes,
  isEligibleForTrial = false,
  isConnected = false,
  onBack,
  onBuyBundle,
  onResume,
  onAddFunds,
}: BundlesScreenProps) {
  const isOnline = ap.status === "online"
  const availablePlans = plans.filter((p) => {
    if (!p.is_active) return false
    if (p.session_type === "gift" && !isEligibleForTrial) return false
    return true
  })
  const rating = (ap.rating ?? ap.avg_rating ?? 0) as number

  return (
    <div className="h-dvh bg-background flex flex-col pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <header className="flex items-center h-14 px-2 shrink-0 border-b border-border bg-card relative z-1000">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="ml-2 text-lg font-semibold flex-1 truncate">{ap.name}</h1>
      </header>

      {/* Hero card */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-1">K-Zone</p>
              <h2 className="text-xl font-bold truncate">{ap.name}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm opacity-90">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{ap.location || "—"}</span>
              </div>
            </div>
            <div
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold shrink-0",
                isOnline ? "bg-white text-primary" : "bg-white/20 text-white"
              )}
            >
              {isOnline ? "● En ligne" : ap.status === "maintenance" ? "Maintenance" : "Hors-ligne"}
            </div>
          </div>
          <div className="flex items-center gap-5 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">{ap.propagation_radius_m ?? 50}m</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <WalletIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{formatCurrency(walletBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected banner */}
      {isConnected && (
        <div className="mx-5 mt-3 p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-sm font-medium text-[#22C55E]">Vous êtes connecté à cette K-Zone</span>
        </div>
      )}

      {/* Resume CTA */}
      {!isConnected && hasResumableBundle && resumableMinutes && resumableMinutes > 0 && isOnline && (
        <div className="px-5 pt-3">
          <Button onClick={onResume} className="w-full h-14 text-base font-semibold gap-3">
            <Play className="w-5 h-5" />
            Reprendre — {formatMinutes(resumableMinutes)} restantes
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Continuez votre bundle actif sur cette K-Zone
          </p>
        </div>
      )}

      {/* Offline warning */}
      {!isOnline && (
        <div className="mx-5 mt-3 p-4 rounded-xl bg-muted border border-border text-center">
          <p className="text-sm text-muted-foreground">
            {ap.status === "maintenance"
              ? "Cette K-Zone est en maintenance."
              : "Cette K-Zone est hors-ligne pour le moment."}
          </p>
        </div>
      )}

      {/* Bundles list */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Bundles disponibles</h3>
          <span className="text-xs text-muted-foreground">{availablePlans.length} offre{availablePlans.length > 1 ? "s" : ""}</span>
        </div>

        {availablePlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Aucun bundle disponible pour cette K-Zone.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {availablePlans.map((plan) => {
              const isFree = plan.price_xaf === 0
              const isAffordable = plan.price_xaf <= walletBalance
              const isDisabled = !isOnline || (!isFree && !isAffordable)

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => !isDisabled && onBuyBundle(plan)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    isDisabled
                      ? "border-muted bg-muted/40 opacity-60 cursor-not-allowed"
                      : "border-border bg-card hover:border-primary hover:shadow-md active:scale-[0.98]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{plan.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatMinutes(plan.duration_minutes)}
                      {plan.speed_profile_name ? ` · ${plan.speed_profile_name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    {isFree ? (
                      <span className="text-lg font-bold text-[#22C55E]">FREE</span>
                    ) : (
                      <span className="text-lg font-bold text-foreground">{formatCurrency(plan.price_xaf)}</span>
                    )}
                    {!isFree && !isAffordable && (
                      <span className="text-[10px] text-destructive font-medium uppercase">Solde insuffisant</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Add funds CTA when insufficient balance */}
        {availablePlans.length > 0 && availablePlans.every((p) => p.price_xaf > walletBalance) && (
          <Button
            type="button"
            variant="outline"
            onClick={onAddFunds}
            className="w-full h-12 mt-4 gap-2"
          >
            <Plus className="w-4 h-4" />
            Recharger mon wallet
          </Button>
        )}
      </div>
    </div>
  )
}
