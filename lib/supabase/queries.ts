"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { supabase } from "./client"
import { useAuth } from "@/contexts/auth-context"
import type {
  AccessPoint,
  Bundle,
  UserBundle,
  SessionSegment,
  WalletTransaction,
  AppNotification,
  GiftCredit,
} from "./types"

// --- Access points (public; readable by all signed-in users) ------------------

export function useAccessPoints() {
  // Wait for auth — RLS on access_points requires `authenticated`. Without
  // this guard the query fires before sign-in completes, RLS returns [] and
  // the cache holds that empty result until staleTime expires, which is why
  // markers only appeared after a hard refresh.
  const { user } = useAuth()
  return useQuery({
    queryKey: ["access-points", user?.id ?? null],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_points")
        .select("id, provider_id, zone_label, location, latitude, longitude, ssid, propagation_radius_m, status, avg_rating")
        .in("status", ["online", "offline", "maintenance"])
      if (error) throw error
      return (data ?? []) as AccessPoint[]
    },
    staleTime: 60_000,
  })
}

// --- Plans (active bundles, public) -------------------------------------------

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })
      if (error) throw error
      return (data ?? []) as Bundle[]
    },
    staleTime: 5 * 60_000,
  })
}

// --- User bundles (RLS gated) -------------------------------------------------

export function useUserBundles() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["user-bundles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bundles")
        .select("*")
        .eq("user_id", user!.id)
        .order("purchased_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as UserBundle[]
    },
  })
}

// --- Session segments (RLS gated) ---------------------------------------------

export function useSessionSegments() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["session-segments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_segments")
        .select("*")
        .eq("user_id", user!.id)
        .order("started_at", { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as SessionSegment[]
    },
  })

  // Realtime: any change to this user's segments invalidates the cache.
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`segments:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_segments", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["session-segments", user.id] })
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, qc])

  return query
}

// --- Wallet transactions ------------------------------------------------------

export function useWalletTransactions() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["wallet-transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as WalletTransaction[]
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`wallet:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallet_transactions", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["wallet-transactions", user.id] })
          qc.invalidateQueries({ queryKey: ["profile", user.id] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["profile", user.id] })
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, qc])

  return query
}

// --- Notifications ------------------------------------------------------------

export function useNotifications() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as AppNotification[]
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifs:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] })
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, qc])

  return query
}

// --- Gift credits -------------------------------------------------------------

export function useGiftCredits() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["gift-credits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_credits")
        .select("*")
        .eq("user_id", user!.id)
        .order("granted_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as GiftCredit[]
    },
  })

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`gifts:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gift_credits", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["gift-credits", user.id] })
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, qc])

  return query
}

// --- Mutations ----------------------------------------------------------------

export function useMarkNotificationRead() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  })
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user!.id)
        .is("read_at", null)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  })
}
