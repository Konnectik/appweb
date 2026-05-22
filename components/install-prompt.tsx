"use client"

import { useEffect, useState } from "react"
import { Download, X, Share, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "konnectik:install-prompt-dismissed-at"
const DISMISS_DAYS = 7

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  if ((window.navigator as unknown as { standalone?: boolean }).standalone) return true
  return false
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
}

function isAndroid(): boolean {
  if (typeof window === "undefined") return false
  return /Android/i.test(window.navigator.userAgent)
}

function wasRecentlyDismissed(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY)
    if (!v) return false
    const at = parseInt(v, 10)
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    if (isIOS()) {
      const t = setTimeout(() => setShow(true), 2500)
      return () => {
        clearTimeout(t)
        window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      }
    }

    if (isAndroid()) {
      const t = setTimeout(() => {
        if (!deferred) setShow(true)
      }, 8000)
      return () => {
        clearTimeout(t)
        window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [deferred])

  const dismiss = () => {
    setShow(false)
    setShowIosHint(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
  }

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
      setShow(false)
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
      return
    }
    if (isIOS()) {
      setShowIosHint(true)
      return
    }
  }

  if (!show) return null

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[1300] px-3 pb-[max(env(safe-area-inset-bottom),12px)]"
        role="dialog"
        aria-label="Installer l'application Konnectik"
      >
        <div className="mx-auto max-w-md rounded-2xl bg-card border border-border shadow-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">Installer Konnectik</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {isIOS()
                ? "Ajoutez l'app à votre écran d'accueil pour un accès rapide."
                : "Accédez plus rapidement à vos K-Zones depuis votre écran d'accueil."}
            </p>
          </div>
          <Button size="sm" onClick={handleInstall} className="shrink-0 h-9 px-3">
            Installer
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Plus tard"
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showIosHint && (
        <div
          className="fixed inset-0 z-[1400] bg-black/60 flex items-end sm:items-center justify-center p-4"
          onClick={dismiss}
        >
          <div
            className="bg-card rounded-2xl max-w-sm w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Installer sur iPhone</h3>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span className="flex-1">
                  Appuyez sur l'icône <Share className="w-4 h-4 inline align-text-bottom" /> Partager en bas de Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="flex-1">
                  Choisissez <strong>Sur l'écran d'accueil</strong> <Plus className="w-4 h-4 inline align-text-bottom" />.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span className="flex-1">Confirmez avec <strong>Ajouter</strong>.</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
