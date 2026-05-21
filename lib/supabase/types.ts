// Minimal Database type — covers the tables the user app reads/writes.
// Expand later by running `supabase gen types typescript` against the project.

// Aligned with actual Postgres enums (verified 2026-05-20).
export type APStatus = "online" | "offline" | "maintenance"
export type SegmentStatus = "active" | "ended" | "expired" | "error"
export type BundleStatus = "active" | "exhausted" | "expired"
export type SessionType = "paid" | "gift"
export type NotificationCategory = "system" | "promo" | "session" | "wallet" | "bundle"
export type WalletTxType = "recharge" | "debit" | "refund" | "reward" | "gift"
export type WalletTxStatus = "pending" | "confirmed" | "failed"

// UI-only derived status — computed client-side from distance vs propagation_radius_m.
export type APUiStatus = APStatus | "out-of-range"

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  company: string | null
  avatar_url: string | null
  gender: string | null
  date_of_birth: string | null // YYYY-MM-DD
  terms_agreed_at: string | null
  wallet_balance_xaf: number
  referral_code: string | null
  referred_by: string | null
  first_trial_used_at: string | null
  last_monthly_gift_at: string | null
  created_at: string
  updated_at: string
}

export interface AccessPoint {
  id: string
  provider_id: string
  zone_label: string
  location: string
  latitude: number | null
  longitude: number | null
  ssid: string | null
  propagation_radius_m: number | null
  status: APStatus
  avg_rating: number | null
}

export interface Bundle {
  id: string
  name: string
  duration: number
  duration_unit: string
  price: number
  currency: string
  is_active: boolean | null
  session_type: SessionType | null
  speed_profile_name: string | null
}

export interface UserBundle {
  id: string
  user_id: string
  plan_id: string | null
  session_type: SessionType
  total_minutes: number
  status: BundleStatus
  purchased_at: string
  expires_at: string | null
}

export interface SessionSegment {
  id: string
  bundle_id: string
  ap_id: string | null
  user_id: string
  status: SegmentStatus
  started_at: string
  scheduled_end: string | null
  ended_at: string | null
  time_used_minutes: number | null
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: WalletTxType
  amount_xaf: number
  fee_xaf: number | null
  net_xaf: number
  reference: string
  status: WalletTxStatus
  created_at: string
}

export type GiftCreditType = "first_time" | "monthly" | "referral"

export interface GiftCredit {
  id: string
  user_id: string
  type: GiftCreditType
  minutes_total: number
  minutes_remaining: number
  granted_at: string
  expires_at: string | null
  exhausted_at: string | null
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  category: NotificationCategory
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

// Loose Database type — strict enough for queries, lax enough to evolve.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      access_points: { Row: AccessPoint; Insert: Partial<AccessPoint>; Update: Partial<AccessPoint> }
      bundles: { Row: Bundle; Insert: Partial<Bundle>; Update: Partial<Bundle> }
      user_bundles: { Row: UserBundle; Insert: Partial<UserBundle>; Update: Partial<UserBundle> }
      session_segments: { Row: SessionSegment; Insert: Partial<SessionSegment>; Update: Partial<SessionSegment> }
      wallet_transactions: { Row: WalletTransaction; Insert: Partial<WalletTransaction>; Update: Partial<WalletTransaction> }
      notifications: { Row: AppNotification; Insert: Partial<AppNotification>; Update: Partial<AppNotification> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
