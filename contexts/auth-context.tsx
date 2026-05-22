"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: {
    email: string
    password: string
    full_name: string
    phone?: string
    date_of_birth?: string // YYYY-MM-DD
    gender?: string
    terms_agreed?: boolean
    referral_code?: string
  }) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
    setProfile(data as Profile | null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  // Realtime subscription on the current user's profile row so the wallet
  // balance (and any other profile fields) stay in sync after server-side
  // updates (recharge webhook, admin tweaks, etc.). Without this the UI shows
  // a stale balance and users get confused about which recharge credited.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new) setProfile(payload.new as Profile)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(
    async (data: {
      email: string
      password: string
      full_name: string
      phone?: string
      date_of_birth?: string
      gender?: string
      terms_agreed?: boolean
      referral_code?: string
    }) => {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone ?? null,
            referral_code: data.referral_code ?? null,
          },
        },
      })
      if (error) return { error: error.message }

      // Update profile with the extra fields the trigger didn't capture.
      // (Trigger handle_new_user reads only basic fields from auth.users user_metadata.)
      const userId = signUpData.user?.id
      if (userId) {
        const updates: Record<string, string | null> = {}
        if (data.phone) updates.phone = data.phone
        if (data.date_of_birth) updates.date_of_birth = data.date_of_birth
        if (data.gender) updates.gender = data.gender
        if (data.terms_agreed) updates.terms_agreed_at = new Date().toISOString()

        if (Object.keys(updates).length > 0) {
          // RLS allows the user to update their own profile.
          await supabase.from("profiles").update(updates).eq("id", userId)
        }
      }
      return { error: null }
    },
    []
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [session, loadProfile])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
