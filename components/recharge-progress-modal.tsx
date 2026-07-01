"use client"

import { useEffect, useMemo, useRef } from "react"
import { CheckCircle2, XCircle, Smartphone, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export type RechargeProgressStatus = "initiating" | "awaiting_ussd" | "confirmed" | "failed" | "timeout"

interface RechargeProgressModalProps {
  open: boolean
  status: RechargeProgressStatus
  amountXaf: number
  totalChargedXaf?: number
  method: "mtn" | "orange"
  startedAt: number | null
  onClose: () => void
  onRetry?: () => void
}

const USSD_TIMEOUT_MS = 3 * 60 * 1000 // 3 min — Netwallet typically completes within 2

export function RechargeProgressModal({
  open,
  status,
  amountXaf,
  totalChargedXaf,
  method,
  startedAt,
  onClose,
  onRetry,
}: RechargeProgressModalProps) {
  const tickRef = useRef(0)

  // Force a re-render every second while we are waiting, so the countdown shows.
  useEffect(() => {
    if (!open) return
    if (status !== "awaiting_ussd" && status !== "initiating") return
    const id = setInterval(() => {
      tickRef.current = (tickRef.current + 1) % 100000
    }, 1000)
    return () => clearInterval(id)
  }, [open, status])

  const remainingSec = useMemo(() => {
    if (!startedAt) return null
    const elapsed = Date.now() - startedAt
    const remaining = USSD_TIMEOUT_MS - elapsed
    return Math.max(0, Math.floor(remaining / 1000))
  }, [startedAt, tickRef.current]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const providerName = method === "mtn" ? "MTN MoMo" : "Orange Money"
  const chargeAmount = totalChargedXaf ?? amountXaf

  return (
    <div className="fixed inset-0 z-1200 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {status === "initiating" && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          {status === "awaiting_ussd" && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
          )}
          {status === "confirmed" && (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
          )}
          {status === "failed" && (
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-destructive" />
            </div>
          )}
          {status === "timeout" && (
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-9 h-9 text-amber-600" />
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="text-center mb-5">
          {status === "initiating" && (
            <>
              <h3 className="text-lg font-semibold text-foreground">Initialisation…</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connexion à {providerName} en cours.
              </p>
            </>
          )}
          {status === "awaiting_ussd" && (
            <>
              <h3 className="text-lg font-semibold text-foreground">Validez sur votre téléphone</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Une notification {providerName} a été envoyée. Entrez votre code PIN pour confirmer{" "}
                <span className="font-semibold text-foreground">{chargeAmount.toLocaleString()} XAF</span>.
              </p>
              {remainingSec !== null && (
                <p className="text-xs text-muted-foreground mt-3">
                  Expire dans <span className="font-mono font-semibold">{Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}</span>
                </p>
              )}
            </>
          )}
          {status === "confirmed" && (
            <>
              <h3 className="text-lg font-semibold text-foreground">Paiement confirmé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{amountXaf.toLocaleString()} XAF</span> ont été ajoutés à votre wallet.
              </p>
            </>
          )}
          {status === "failed" && (
            <>
              <h3 className="text-lg font-semibold text-foreground">Paiement échoué</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Le paiement n'a pas pu être validé. Aucun montant n'a été débité.
              </p>
            </>
          )}
          {status === "timeout" && (
            <>
              <h3 className="text-lg font-semibold text-foreground">Délai dépassé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aucune confirmation reçue. Si vous avez validé sur votre téléphone, votre solde sera mis à jour automatiquement dans quelques minutes.
              </p>
            </>
          )}
        </div>

        {/* Progress strip while waiting */}
        {(status === "initiating" || status === "awaiting_ussd") && (
          <div className="h-1 bg-muted rounded-full overflow-hidden mb-5">
            <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {(status === "awaiting_ussd" || status === "initiating") && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              Continuer en arrière-plan
            </Button>
          )}
          {status === "confirmed" && (
            <Button type="button" onClick={onClose} className="flex-1 h-11">
              OK
            </Button>
          )}
          {(status === "failed" || status === "timeout") && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11"
              >
                Fermer
              </Button>
              {onRetry && (
                <Button type="button" onClick={onRetry} className="flex-1 h-11">
                  Réessayer
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
