"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Wifi, Power, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatMinutes, type SessionSegment } from "@/lib/mock-data"

interface UsageScreenProps {
  activeSegment: SessionSegment | null
  remainingMinutes: number
  sessionTimer: number // seconds elapsed
  onBack: () => void
  onDisconnect: (segmentId: string) => void
}

function formatHms(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

export function UsageScreen({
  activeSegment,
  remainingMinutes,
  sessionTimer,
  onBack,
  onDisconnect,
}: UsageScreenProps) {
  const [disconnecting, setDisconnecting] = useState(false)

  // remaining seconds — derived from scheduled_end if available, else from minutes
  const [remainingSec, setRemainingSec] = useState(remainingMinutes * 60)

  useEffect(() => {
    if (!activeSegment) return
    const tick = () => {
      const end = activeSegment.scheduled_end ? new Date(activeSegment.scheduled_end).getTime() : 0
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setRemainingSec(left)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeSegment])

  if (!activeSegment) {
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
          <h1 className="ml-2 text-lg font-semibold">Session active</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <img src="/nowifi.png" alt="" className="w-24 h-24 object-contain mb-4 opacity-80" />
          <p className="text-sm text-muted-foreground">Aucune session active.</p>
        </div>
      </div>
    )
  }

  // Progress: timeUsed / totalDuration (using sessionTimer seconds elapsed)
  const totalSec = (activeSegment.scheduled_end
    ? (new Date(activeSegment.scheduled_end).getTime() - new Date(activeSegment.started_at!).getTime()) / 1000
    : sessionTimer + remainingSec) || 1
  const usedSec = Math.max(0, totalSec - remainingSec)
  const progress = Math.min(100, Math.max(0, (usedSec / totalSec) * 100))

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await Promise.resolve(onDisconnect(activeSegment.id))
    setDisconnecting(false)
    onBack()
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
        <h1 className="ml-2 text-lg font-semibold">Session active</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col">
        {/* Big circular countdown */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border, 0 0% 90%))" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#E42320"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${(2 * Math.PI * 44) * (progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 flex items-center justify-center mb-2">
              <Wifi className="w-6 h-6 text-[#22C55E]" />
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Temps restant</p>
            <p className="text-3xl font-bold text-foreground tabular-nums mt-1">{formatHms(remainingSec)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatMinutes(Math.floor(usedSec / 60))} utilisé{usedSec >= 120 ? "es" : ""}
            </p>
          </div>
        </div>

        {/* AP info card */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Connecté à</p>
              <p className="text-base font-semibold text-foreground truncate">{activeSegment.ap_name || "K-Zone"}</p>
              {activeSegment.provider_name && (
                <p className="text-xs text-muted-foreground truncate">{activeSegment.provider_name}</p>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#22C55E] shrink-0 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{formatMinutes(Math.floor(usedSec / 60))} utilisé</span>
            <span>{formatMinutes(Math.floor(remainingSec / 60))} restantes</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full bg-primary transition-all duration-1000",
                progress > 90 && "bg-destructive"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Disconnect button */}
        <div className="mt-auto pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full h-12 text-base font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {disconnecting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Déconnexion…</>
            ) : (
              <><Power className="w-5 h-5 mr-2" /> Déconnecter</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Votre temps non utilisé sera conservé sur ce bundle.
          </p>
        </div>
      </div>
    </div>
  )
}
