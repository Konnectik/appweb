"use client"

import { X, Wifi, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Plan, type AccessPoint, formatMinutes, formatCurrency } from "@/lib/mock-data"

interface PurchaseConfirmSheetProps {
  plan: Plan
  ap: AccessPoint
  walletBalance: number
  onClose: () => void
  onConfirm: () => void
}

export function PurchaseConfirmSheet({ 
  plan, 
  ap, 
  walletBalance,
  onClose, 
  onConfirm 
}: PurchaseConfirmSheetProps) {
  const newBalance = walletBalance - plan.price_xaf
  const isFree = plan.price_xaf === 0

  return (
    <div className="fixed inset-0 z-1100 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative bg-card rounded-t-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Confirm Purchase</h2>
            <p className="text-sm text-muted-foreground">Review your bundle details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Bundle details */}
        <div className="px-5 pb-5">
          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{plan.name}</p>
                <p className="text-sm text-muted-foreground">{formatMinutes(plan.duration_minutes)} of connectivity</p>
              </div>
              <div className="text-right">
                {isFree ? (
                  <p className="text-lg font-bold text-[#22C55E]">FREE</p>
                ) : (
                  <p className="text-lg font-bold text-foreground">{formatCurrency(plan.price_xaf)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{ap.name}</span>
              <span className="text-muted-foreground/50">&middot;</span>
              <span>{ap.provider_name}</span>
            </div>
          </div>

          {/* Balance breakdown */}
          {!isFree && (
            <div className="border border-border rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current balance</span>
                <span className="text-sm text-foreground">{formatCurrency(walletBalance)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Bundle price</span>
                <span className="text-sm text-foreground">- {formatCurrency(plan.price_xaf)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">New balance</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(newBalance)}</span>
              </div>
            </div>
          )}

          {/* Info text */}
          <div className="flex items-start gap-2 mb-5">
            <Wifi className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your bundle will be activated immediately and you&apos;ll be connected to {ap.name}. 
              You can disconnect and resume at any K-Zone within 7 days.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-12"
            >
              {isFree ? "Activate Free Trial" : `Pay ${formatCurrency(plan.price_xaf)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
