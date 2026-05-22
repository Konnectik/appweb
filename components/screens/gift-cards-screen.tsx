"use client"

import { useState } from "react"
import { ArrowLeft, Gift, Sparkles, Calendar, Users, Ticket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/contexts/auth-context"
import { useGiftCredits } from "@/lib/supabase/queries"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface GiftCardsScreenProps {
  onBack: () => void
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

const TYPE_LABEL: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
  first_time: { label: "Bonus de bienvenue", icon: Sparkles, color: "#E42320" },
  monthly: { label: "Cadeau mensuel", icon: Calendar, color: "#22C55E" },
  referral: { label: "Parrainage", icon: Users, color: "#F59E0B" },
}

export function GiftCardsScreen({ onBack }: GiftCardsScreenProps) {
  const { user } = useAuth()
  const { data: gifts, isLoading } = useGiftCredits()
  const [code, setCode] = useState("")
  const [redeeming, setRedeeming] = useState(false)

  const activeGifts = (gifts ?? []).filter((g) => g.minutes_remaining > 0)
  const totalRemaining = activeGifts.reduce((sum, g) => sum + g.minutes_remaining, 0)

  const handleRedeem = async () => {
    if (!code.trim()) return
    setRedeeming(true)
    // Mock — to wire to a future "redeem-gift-code" edge function
    await new Promise((r) => setTimeout(r, 600))
    setRedeeming(false)
    toast.info("Code de cadeau", {
      description: "Le rachat de code sera disponible bientôt.",
    })
    setCode("")
  }

  return (
    <div className="h-dvh bg-background flex flex-col pt-[env(safe-area-inset-top)]">
      <header className="flex items-center h-14 px-2 shrink-0 border-b border-border bg-card">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="ml-2 text-lg font-semibold">Cartes cadeaux</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Hero — total remaining */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">Crédits cadeau disponibles</p>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            {isLoading ? "—" : formatMinutes(totalRemaining)}
          </p>
          <p className="text-xs opacity-80 mt-1">
            {activeGifts.length} crédit{activeGifts.length > 1 ? "s" : ""} actif{activeGifts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Redeem code */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
            Utiliser un code
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Field>
              <FieldLabel htmlFor="gift-code">Code cadeau</FieldLabel>
              <Input
                id="gift-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="KONN-XXXX-XXXX"
                className="h-11 font-mono tracking-wider"
                maxLength={20}
              />
            </Field>
            <Button onClick={handleRedeem} disabled={!code.trim() || redeeming} className="w-full h-11">
              {redeeming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validation…</> : <><Ticket className="w-4 h-4 mr-2" /> Activer</>}
            </Button>
          </div>
        </section>

        {/* Gift credits list */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
            Mes crédits
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeGifts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">Aucun crédit cadeau actif.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Invitez des amis ou attendez votre cadeau mensuel.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeGifts.map((g) => {
                const meta = TYPE_LABEL[g.type] || TYPE_LABEL.monthly
                const Icon = meta.icon
                const expired = g.expires_at ? new Date(g.expires_at) < new Date() : false
                const usagePct = g.minutes_total > 0 ? (1 - g.minutes_remaining / g.minutes_total) * 100 : 0

                return (
                  <div key={g.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                          <span className="text-sm font-bold text-foreground tabular-nums">
                            {formatMinutes(g.minutes_remaining)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          sur {formatMinutes(g.minutes_total)} offerts
                        </p>
                        <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
                          <div
                            className={cn("h-full transition-all", expired ? "bg-destructive" : "bg-primary")}
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                        {g.expires_at && (
                          <p className={cn("text-[10px] mt-1.5", expired ? "text-destructive" : "text-muted-foreground")}>
                            {expired ? "Expiré" : "Expire"} le{" "}
                            {new Date(g.expires_at).toLocaleDateString("fr-FR", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Les crédits cadeau servent à connecter votre Wi-Fi gratuitement.
        </p>
      </div>
    </div>
  )
}
