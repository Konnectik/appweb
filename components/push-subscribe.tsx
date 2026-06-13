"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(normalized)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

/**
 * Silently subscribes the user to Web Push once the session is active.
 *
 * - No prompt UI here: notification permission is requested on first use
 *   (mounting). On iOS Safari this only works inside a PWA installed to home
 *   screen — the InstallPrompt component handles that flow.
 * - Stores the subscription in `device_tokens` (existing table) so the
 *   future `send-push` edge function can target it.
 * - Skips entirely if VAPID key isn't configured.
 */
export function PushSubscribe() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !VAPID_PUBLIC_KEY) return
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return

    let cancelled = false

    ;(async () => {
      try {
        if (Notification.permission === "denied") return
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission()
          if (perm !== "granted") return
        }
        const reg = await navigator.serviceWorker.ready
        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
        }
        if (cancelled) return
        const platform = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios"
          : /Android/i.test(navigator.userAgent) ? "android"
          : "web"

        await supabase.from("device_tokens").upsert({
          user_id: user.id,
          platform,
          token: JSON.stringify(sub),
        }, { onConflict: "user_id,token" })
      } catch (err) {
        console.warn("[push] subscribe failed", err)
      }
    })()

    return () => { cancelled = true }
  }, [user])

  return null
}
