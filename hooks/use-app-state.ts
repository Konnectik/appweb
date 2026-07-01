"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  useAccessPoints,
  usePlans,
  useUserBundles,
  useSessionSegments,
  useWalletTransactions,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useGiftCredits,
  useReferralEvents,
} from "@/lib/supabase/queries"
import {
  purchaseBundleFn,
  startSegmentFn,
  endSegmentFn,
  initiateRechargeFn,
} from "@/lib/supabase/edge-functions"
import type {
  AccessPoint as DbAP,
  Bundle as DbBundle,
  UserBundle as DbUB,
  SessionSegment as DbSeg,
  WalletTransaction as DbTx,
  AppNotification as DbNotif,
} from "@/lib/supabase/types"
import type {
  AccessPoint as UiAP,
  Plan as UiPlan,
  UserBundle as UiUB,
  SessionSegment as UiSeg,
  WalletTransaction as UiTx,
  AppNotification as UiNotif,
} from "@/lib/mock-data"
import { computeBundleRemainingMinutes, getActiveBundle, getActiveSegment } from "@/lib/mock-data"

export type Screen = "main" | "notifications" | "rewards" | "profile" | "settings" | "help" | "login" | "register" | "bundles" | "usage" | "gifts"
export type TabId = "wallet" | "map" | "sessions"

// --- DB → UI mapping --------------------------------------------------------

function durationToMinutes(d: number, unit: string | null): number {
  const u = (unit || "minutes").toLowerCase()
  if (u.startsWith("min")) return d
  if (u.startsWith("h")) return d * 60
  if (u.startsWith("d")) return d * 60 * 24
  if (u.startsWith("w")) return d * 60 * 24 * 7
  if (u.startsWith("mo")) return d * 60 * 24 * 30
  return d
}

function mapAP(ap: DbAP): UiAP {
  return {
    id: ap.id,
    name: ap.zone_label || "K-Zone",
    location: ap.location || "",
    provider_id: ap.provider_id,
    provider_name: "",
    status: (ap.status as UiAP["status"]) || "online",
    latitude: ap.latitude ?? 0,
    longitude: ap.longitude ?? 0,
    propagation_radius_m: ap.propagation_radius_m ?? 60,
    distance_m: 0,
    rating: ap.avg_rating ? Number(ap.avg_rating) : 0,
  } as UiAP
}

function mapPlan(b: DbBundle): UiPlan {
  return {
    id: b.id,
    name: b.name,
    price_xaf: b.price,
    duration_minutes: durationToMinutes(b.duration, b.duration_unit),
    session_type: (b.session_type as UiPlan["session_type"]) ?? "paid",
    is_active: b.is_active ?? true,
    speed_profile_name: b.speed_profile_name ?? null,
  } as UiPlan
}

function mapUB(ub: DbUB, planNameById: Map<string, string>): UiUB {
  return {
    id: ub.id,
    user_id: ub.user_id,
    plan_id: ub.plan_id ?? "",
    plan_name: (ub.plan_id && planNameById.get(ub.plan_id)) || "",
    session_type: (ub.session_type as UiUB["session_type"]) ?? "paid",
    total_minutes: ub.total_minutes ?? 0,
    status: (ub.status as UiUB["status"]) ?? "active",
    purchased_at: new Date(ub.purchased_at),
    expires_at: ub.expires_at ? new Date(ub.expires_at) : null,
  } as UiUB
}

function mapSeg(s: DbSeg, apById: Map<string, UiAP>): UiSeg {
  const ap = s.ap_id ? apById.get(s.ap_id) : undefined
  return {
    id: s.id,
    bundle_id: s.bundle_id,
    ap_id: s.ap_id,
    ap_name: ap?.name ?? "",
    provider_name: ap?.provider_name ?? "",
    user_id: s.user_id,
    status: (s.status as UiSeg["status"]) ?? "active",
    started_at: s.started_at ? new Date(s.started_at) : null,
    scheduled_end: s.scheduled_end ? new Date(s.scheduled_end) : null,
    ended_at: s.ended_at ? new Date(s.ended_at) : null,
    time_used_minutes: s.time_used_minutes ?? 0,
    time_limit_minutes: 0,
    gross_earned_xaf: 0,
    provider_net_xaf: 0,
  } as UiSeg
}

function mapTx(t: DbTx): UiTx {
  return {
    id: t.id,
    user_id: t.user_id,
    type: t.type as UiTx["type"],
    amount_xaf: Number(t.amount_xaf),
    fee_xaf: t.fee_xaf ? Number(t.fee_xaf) : 0,
    net_xaf: Number(t.net_xaf),
    description: undefined,
    reference: t.reference,
    created_at: new Date(t.created_at),
  } as UiTx
}

function mapNotif(n: DbNotif): UiNotif {
  return {
    id: n.id,
    user_id: n.user_id,
    title: n.title,
    body: n.body,
    category: n.category as UiNotif["category"],
    read_at: n.read_at ? new Date(n.read_at) : null,
    created_at: new Date(n.created_at),
  } as UiNotif
}

// --- Hook -------------------------------------------------------------------

export function useAppState() {
  const auth = useAuth()

  const [authScreen, setAuthScreen] = useState<"login" | "register">("login")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Live data
  const apsQ = useAccessPoints()
  const plansQ = usePlans()
  const ubQ = useUserBundles()
  const segQ = useSessionSegments()
  const txQ = useWalletTransactions()
  const notifQ = useNotifications()
  const giftsQ = useGiftCredits()
  const referralQ = useReferralEvents()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  // Maps for enrichment
  const accessPoints = useMemo(() => (apsQ.data ?? []).map(mapAP), [apsQ.data])
  const apById = useMemo(() => new Map(accessPoints.map((a) => [a.id, a])), [accessPoints])

  const plans = useMemo(() => (plansQ.data ?? []).map(mapPlan), [plansQ.data])
  const planNameById = useMemo(() => new Map(plans.map((p) => [p.id, p.name])), [plans])

  const bundles = useMemo(() => (ubQ.data ?? []).map((b) => mapUB(b, planNameById)), [ubQ.data, planNameById])
  const segments = useMemo(() => (segQ.data ?? []).map((s) => mapSeg(s, apById)), [segQ.data, apById])
  const transactions = useMemo(() => (txQ.data ?? []).map(mapTx), [txQ.data])
  const notifications = useMemo(() => (notifQ.data ?? []).map(mapNotif), [notifQ.data])

  // Navigation / UI
  const [currentScreen, setCurrentScreen] = useState<Screen>("main")
  const [activeTab, setActiveTab] = useState<TabId>("map")
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedAP, setSelectedAP] = useState<UiAP | null>(null)
  const [showRechargeSheet, setShowRechargeSheet] = useState(false)
  const [showBundlePurchaseConfirm, setShowBundlePurchaseConfirm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<UiPlan | null>(null)
  const [sessionTimer, setSessionTimer] = useState(0)

  // --- Recharge progress (live status from initiate-recharge → webhook) ---
  type PendingRecharge = {
    transactionId: string
    amountXaf: number
    totalChargedXaf: number
    phone: string
    method: "mtn" | "orange"
    startedAt: number
    status: "initiating" | "awaiting_ussd" | "confirmed" | "failed" | "timeout"
  }
  const [pendingRecharge, setPendingRecharge] = useState<PendingRecharge | null>(null)

  // Computed
  const activeBundle = getActiveBundle(bundles)
  const activeSegment = getActiveSegment(segments)
  const remainingMinutes = activeBundle ? computeBundleRemainingMinutes(activeBundle, segments) : 0
  const unreadNotifications = notifications.filter((n) => !n.read_at).length

  const referralStats = useMemo(() => {
    const events = referralQ.data ?? []
    const friendsSignedUp = events.filter((e) => e.event_type === "signup").length
    const friendsPurchased = events.filter((e) => e.event_type === "first_purchase").length
    const gifts = giftsQ.data ?? []
    const giftMinutesRemaining = gifts.reduce((sum, g) => sum + (g.minutes_remaining ?? 0), 0)
    const referralMinutesEarned = gifts
      .filter((g) => g.type === "referral")
      .reduce((sum, g) => sum + (g.minutes_total ?? 0), 0)
    return {
      friends_signed_up: friendsSignedUp,
      friends_purchased: friendsPurchased,
      gift_minutes_remaining: giftMinutesRemaining,
      referral_minutes_earned: referralMinutesEarned,
    }
  }, [referralQ.data, giftsQ.data])

  // User shape (mock-compatible, fed by real profile)
  const user = useMemo(() => {
    if (!auth.session) return null
    const p = auth.profile
    return {
      id: auth.user?.id ?? "",
      full_name: p?.full_name ?? auth.user?.user_metadata?.full_name ?? "",
      email: p?.email ?? auth.user?.email ?? "",
      phone: p?.phone ?? auth.user?.user_metadata?.phone ?? "",
      avatar_url: p?.avatar_url ?? null,
      wallet_balance_xaf: p?.wallet_balance_xaf ?? 0,
      referral_code: p?.referral_code ?? "",
      referred_by: p?.referred_by ?? null,
      first_trial_used_at: p?.first_trial_used_at ?? null,
    }
  }, [auth.session, auth.profile, auth.user])

  // Session countdown timer (UI only — segments cache is refreshed via realtime)
  useEffect(() => {
    if (!activeSegment || activeSegment.status !== "active") {
      setSessionTimer(0)
      return
    }
    const tick = () => {
      const now = Date.now()
      const started = activeSegment.started_at ? new Date(activeSegment.started_at).getTime() : now
      setSessionTimer(Math.floor((now - started) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeSegment])

  // -------- Auth actions ---------
  const login = useCallback(async (email: string, password: string) => {
    setAuthBusy(true); setAuthError(null)
    const { error } = await auth.signIn(email, password)
    setAuthBusy(false)
    if (error) setAuthError(error)
    else setCurrentScreen("main")
  }, [auth])

  const loginWithGoogle = useCallback(async () => {
    setAuthBusy(true); setAuthError(null)
    const { error } = await auth.signInWithGoogle()
    setAuthBusy(false)
    if (error) setAuthError(error)
  }, [auth])

  const register = useCallback(async (data: {
    name: string
    email: string
    phone?: string
    password: string
    date_of_birth?: string
    gender?: string
    terms_agreed?: boolean
    referralCode?: string
  }) => {
    setAuthBusy(true); setAuthError(null)
    const { error } = await auth.signUp({
      email: data.email,
      password: data.password,
      full_name: data.name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      terms_agreed: data.terms_agreed,
      referral_code: data.referralCode,
    })
    setAuthBusy(false)
    if (error) setAuthError(error)
    else setCurrentScreen("main")
  }, [auth])

  // Profile completeness — used to route Google sign-ins (and stale users) to
  // the complete-profile screen if required fields are missing.
  const profileComplete = useMemo(() => {
    if (!auth.session) return true // n'a pas d'importance si pas connecté
    const p = auth.profile
    if (!p) return false
    return !!(p.phone && p.date_of_birth && p.terms_agreed_at)
  }, [auth.session, auth.profile])

  const logout = useCallback(async () => {
    await auth.signOut()
    setAuthScreen("login")
  }, [auth])

  // -------- Domain actions (edge functions) ---------

  const failAction = useCallback((title: string, e: unknown) => {
    const msg = (e as Error)?.message || "Unknown error"
    setActionError(msg)
    toast.error(title, { description: msg })
  }, [])

  const rechargeWallet = useCallback(async (amount: number, method: "mtn" | "orange", phoneInput?: string) => {
    if (!user) return
    setActionError(null)
    const scheduleRefreshes = () => {
      for (const delay of [5000, 15000, 30000, 60000]) {
        setTimeout(() => { auth.refreshProfile() }, delay)
      }
    }
    const phone = (phoneInput?.trim() || user.phone || "").trim()
    if (!phone) {
      toast.error("Numéro requis", { description: "Saisissez votre numéro mobile money." })
      return
    }
    const totalChargedXaf = amount + Math.ceil(amount * 0.05)
    setShowRechargeSheet(false)
    setPendingRecharge({
      transactionId: "",
      amountXaf: amount,
      totalChargedXaf,
      phone,
      method,
      startedAt: Date.now(),
      status: "initiating",
    })
    try {
      const res = await initiateRechargeFn(amount, method === "mtn" ? "momo" : "om", phone)
      setPendingRecharge((prev) => prev ? {
        ...prev,
        transactionId: res.transaction_id,
        totalChargedXaf: res.total_charged_xaf ?? totalChargedXaf,
        status: "awaiting_ussd",
      } : null)
      scheduleRefreshes()
    } catch (e) {
      setPendingRecharge((prev) => prev ? { ...prev, status: "failed" } : null)
      failAction("Échec de la recharge", e)
    }
  }, [user, auth, failAction])

  // Watch the transactions cache for the pending recharge's lifecycle.
  useEffect(() => {
    if (!pendingRecharge?.transactionId) return
    if (pendingRecharge.status === "confirmed" || pendingRecharge.status === "failed") return
    const tx = transactions.find((t) => t.id === pendingRecharge.transactionId)
    if (!tx) return
    if (tx.status === "confirmed") {
      setPendingRecharge((prev) => prev ? { ...prev, status: "confirmed" } : null)
      auth.refreshProfile()
      toast.success("Recharge confirmée", {
        description: `${pendingRecharge.amountXaf.toLocaleString()} XAF crédités`,
      })
    } else if (tx.status === "failed") {
      setPendingRecharge((prev) => prev ? { ...prev, status: "failed" } : null)
      toast.error("Recharge échouée", { description: "Aucun montant n'a été débité." })
    }
  }, [transactions, pendingRecharge, auth])

  // Timeout — 3 min after init, if still pending, surface that.
  useEffect(() => {
    if (!pendingRecharge) return
    if (pendingRecharge.status !== "awaiting_ussd" && pendingRecharge.status !== "initiating") return
    const elapsed = Date.now() - pendingRecharge.startedAt
    const remaining = 3 * 60 * 1000 - elapsed
    if (remaining <= 0) {
      setPendingRecharge((prev) => prev ? { ...prev, status: "timeout" } : null)
      return
    }
    const id = setTimeout(() => {
      setPendingRecharge((prev) => {
        if (!prev) return null
        if (prev.status === "awaiting_ussd" || prev.status === "initiating") {
          return { ...prev, status: "timeout" }
        }
        return prev
      })
    }, remaining)
    return () => clearTimeout(id)
  }, [pendingRecharge])

  const closePendingRecharge = useCallback(() => {
    setPendingRecharge(null)
  }, [])

  const retryPendingRecharge = useCallback(() => {
    if (!pendingRecharge) return
    const { amountXaf, method, phone } = pendingRecharge
    setPendingRecharge(null)
    rechargeWallet(amountXaf, method, phone)
  }, [pendingRecharge, rechargeWallet])

  const purchaseInFlightRef = useRef(false)
  const purchaseBundle = useCallback(async (plan: UiPlan, apId: string) => {
    if (!user) return
    if (purchaseInFlightRef.current) return
    purchaseInFlightRef.current = true
    setActionError(null)
    // Best-effort geoloc — the *real* proximity gate is in start-segment.
    // If the user denies geoloc here we still let the purchase go through;
    // start-segment will refuse to consume any minutes far from the AP.
    const getCoords = (): Promise<{ lat: number; lng: number; acc: number } | null> => new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      )
    })
    try {
      const coords = await getCoords()
      const bucket = Math.floor(Date.now() / 10000)
      await purchaseBundleFn(
        plan.id,
        `${user.id}-${plan.id}-${bucket}`,
        coords
          ? { ap_id: apId, user_lat: coords.lat, user_lng: coords.lng, gps_accuracy_m: coords.acc }
          : { ap_id: apId },
      )
      await auth.refreshProfile()
      toast.success("Bundle acheté", { description: plan.name })
      setSelectedAP(null)
      setShowBundlePurchaseConfirm(false)
      setSelectedPlan(null)
    } catch (e) {
      failAction("Échec de l'achat", e)
    } finally {
      purchaseInFlightRef.current = false
    }
  }, [user, auth, failAction])

  const startSession = useCallback(async (bundleId: string, ap: UiAP) => {
    setActionError(null)
    // Ask for live geolocation so the server can enforce proximity. We don't
    // trust the user's stored profile location — only a fresh fix counts.
    const getPosition = (): Promise<GeolocationPosition> => new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("Géolocalisation non disponible sur cet appareil."))
        return
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => reject(new Error(
          err.code === err.PERMISSION_DENIED
            ? "Autorisez la géolocalisation pour démarrer une session sur cette K-Zone."
            : "Impossible d'obtenir votre position. Réessayez près du point d'accès."
        )),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      )
    })
    try {
      const pos = await getPosition()
      await startSegmentFn(bundleId, ap.id, {
        user_lat: pos.coords.latitude,
        user_lng: pos.coords.longitude,
        gps_accuracy_m: pos.coords.accuracy,
      })
      toast.success("Session démarrée", { description: ap.name })
      setSelectedAP(null)
    } catch (e) {
      failAction("Impossible de démarrer la session", e)
    }
  }, [failAction])

  const endSession = useCallback(async (segmentId: string) => {
    setActionError(null)
    try {
      await endSegmentFn(segmentId)
      toast.success("Session terminée")
    } catch (e) {
      failAction("Échec de l'arrêt de session", e)
    }
  }, [failAction])

  const resumeSession = useCallback(async (ap: UiAP) => {
    if (!activeBundle) return
    await startSession(activeBundle.id, ap)
  }, [activeBundle, startSession])

  const markNotificationRead = useCallback((id: string) => {
    markRead.mutate(id)
  }, [markRead])

  const markAllNotificationsRead = useCallback(() => {
    markAllRead.mutate()
  }, [markAllRead])

  const copyReferralCode = useCallback(() => {
    const code = user?.referral_code
    if (!code) {
      toast.error("Code indisponible")
      return
    }
    navigator.clipboard.writeText(code).then(
      () => toast.success("Code copié", { description: code }),
      () => toast.error("Impossible de copier le code"),
    )
  }, [user])

  const shareReferralCode = useCallback(() => {
    const code = user?.referral_code
    if (!code) {
      toast.error("Code indisponible")
      return
    }
    const message = `Rejoins Konnectik avec mon code parrainage ${code} et profite du Wi-Fi partout au Cameroun !`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }, [user])

  return {
    // Auth
    isAuthenticated: !!auth.session,
    authLoading: auth.loading,
    authBusy,
    authError,
    authScreen,
    user,
    actionError,

    // Data (mapped DB rows)
    accessPoints,
    plans,
    bundles,
    segments,
    transactions,
    notifications,
    referralStats,
    profileComplete,
    activeBundle,
    activeSegment,
    remainingMinutes,
    unreadNotifications,

    // Loading flags
    dataLoading: apsQ.isLoading || plansQ.isLoading || ubQ.isLoading || segQ.isLoading || txQ.isLoading || notifQ.isLoading,

    // Nav / UI
    currentScreen,
    activeTab,
    menuOpen,
    selectedAP,
    showRechargeSheet,
    showBundlePurchaseConfirm,
    selectedPlan,
    sessionTimer,

    // Auth actions
    login,
    loginWithGoogle,
    register,
    logout,
    setAuthScreen,

    // Nav actions
    setCurrentScreen,
    setActiveTab,
    setMenuOpen,
    setSelectedAP,
    setShowRechargeSheet,
    setShowBundlePurchaseConfirm,
    setSelectedPlan,

    // Recharge progress
    pendingRecharge,
    closePendingRecharge,
    retryPendingRecharge,

    // Domain actions
    rechargeWallet,
    purchaseBundle,
    startSession,
    endSession,
    resumeSession,
    markNotificationRead,
    markAllNotificationsRead,
    copyReferralCode,
    shareReferralCode,
  }
}
