"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface RechargeSheetProps {
  onClose: () => void
  onRecharge: (amount: number, provider: "mtn" | "orange") => void
  userPhone?: string
}

const quickAmounts = [500, 1000, 2000, 5000]

export function RechargeSheet({ onClose, onRecharge, userPhone }: RechargeSheetProps) {
  const [amount, setAmount] = useState<number>(1000)
  const [provider, setProvider] = useState<"mtn" | "orange">("mtn")
  const [phone, setPhone] = useState(userPhone || "")

  const fee = Math.ceil(amount * 0.05)
  const totalToCharge = amount + fee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRecharge(amount, provider)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sheet */}
      <div className="mt-auto bg-card rounded-t-2xl relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[85dvh] overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)]">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Add Funds</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 pb-4">
          <FieldGroup>
            {/* Amount */}
            <Field>
              <FieldLabel>Amount (XAF)</FieldLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(200, Math.min(50000, Number(e.target.value))))}
                className="h-14 text-2xl font-semibold text-center"
                min={200}
                max={50000}
              />
              <p className="text-xs text-muted-foreground mt-1">Min: 200 XAF &middot; Max: 50,000 XAF</p>
            </Field>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                    amount === amt 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Provider */}
            <Field className="mt-4">
              <FieldLabel>Payment Method</FieldLabel>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("mtn")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    provider === "mtn" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <img src="/momo.png" alt="MTN MoMo" className="w-10 h-10 object-contain" />
                  <span className="text-sm font-medium text-foreground">MTN MoMo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("orange")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    provider === "orange" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <img src="/om.png" alt="Orange Money" className="w-10 h-10 object-contain" />
                  <span className="text-sm font-medium text-foreground">Orange Money</span>
                </button>
              </div>
            </Field>

            {/* Phone */}
            <Field className="mt-4">
              <FieldLabel>Phone Number</FieldLabel>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={provider === "mtn" ? "6XX XXX XXX" : "6XX XXX XXX"}
                className="h-12"
              />
            </Field>
          </FieldGroup>

          {/* Fee breakdown */}
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Montant crédité au wallet</span>
              <span className="text-foreground">{amount.toLocaleString()} XAF</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Frais de service (5%)</span>
              <span className="text-foreground">+{fee.toLocaleString()} XAF</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span className="text-foreground">Vous payez</span>
              <span className="text-primary">{totalToCharge.toLocaleString()} XAF</span>
            </div>
          </div>

          </div>

          <div className="px-5 pt-3 pb-4 border-t border-border bg-card">
            <Button type="submit" className="w-full h-12" disabled={!phone || amount < 200}>
              Payer {totalToCharge.toLocaleString()} XAF
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
