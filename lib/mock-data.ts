// Konnectik Mock Data Store
// Complete test data for all user story flows

export type APStatus = "online" | "offline" | "maintenance"
export type BundleStatus = "active" | "exhausted" | "expired"
export type SegmentStatus = "pending" | "active" | "completed" | "terminated" | "failed"
export type TransactionType = "recharge" | "debit" | "refund" | "gift"
export type NotificationCategory = "proximity" | "session" | "payment" | "reward" | "system"
export type SessionType = "paid" | "gift"

// Access Points (K-Zones) - Multi-zone pilot across Douala
export interface AccessPoint {
  id: string
  name: string
  zone_label: string
  provider_id: string
  provider_name: string
  lat: number
  lng: number
  ssid: string
  bssid: string
  propagation_radius_m: number
  status: APStatus
  avg_rating: number
  distance_m?: number
  rssi_dbm?: number
}

export const mockAccessPoints: AccessPoint[] = [
  {
    id: "ap-001",
    name: "Konnectik Akwa Palace",
    zone_label: "Akwa",
    provider_id: "prov-001",
    provider_name: "TechWave Cameroon",
    lat: 4.0511,
    lng: 9.7679,
    ssid: "KONNECTIK-AKWA-01",
    bssid: "AA:BB:CC:DD:EE:01",
    propagation_radius_m: 150,
    status: "online",
    avg_rating: 4.7,
    distance_m: 45,
    rssi_dbm: -42,
  },
  {
    id: "ap-002",
    name: "Konnectik Bonanjo Hub",
    zone_label: "Bonanjo",
    provider_id: "prov-002",
    provider_name: "CamNet Solutions",
    lat: 4.0435,
    lng: 9.6945,
    ssid: "KONNECTIK-BONANJO-01",
    bssid: "AA:BB:CC:DD:EE:02",
    propagation_radius_m: 200,
    status: "online",
    avg_rating: 4.5,
    distance_m: 320,
    rssi_dbm: -68,
  },
  {
    id: "ap-003",
    name: "Konnectik Bonapriso Cafe",
    zone_label: "Bonapriso",
    provider_id: "prov-001",
    provider_name: "TechWave Cameroon",
    lat: 4.0283,
    lng: 9.6912,
    ssid: "KONNECTIK-BONAPRISO-01",
    bssid: "AA:BB:CC:DD:EE:03",
    propagation_radius_m: 100,
    status: "online",
    avg_rating: 4.8,
    distance_m: 890,
    rssi_dbm: -85,
  },
  {
    id: "ap-004",
    name: "Konnectik Deido Market",
    zone_label: "Deido",
    provider_id: "prov-003",
    provider_name: "Urban Connect",
    lat: 4.0612,
    lng: 9.7234,
    ssid: "KONNECTIK-DEIDO-01",
    bssid: "AA:BB:CC:DD:EE:04",
    propagation_radius_m: 120,
    status: "offline",
    avg_rating: 4.2,
    distance_m: 1450,
  },
  {
    id: "ap-005",
    name: "Konnectik Makepe Junction",
    zone_label: "Makepe",
    provider_id: "prov-002",
    provider_name: "CamNet Solutions",
    lat: 4.0789,
    lng: 9.7456,
    ssid: "KONNECTIK-MAKEPE-01",
    bssid: "AA:BB:CC:DD:EE:05",
    propagation_radius_m: 180,
    status: "online",
    avg_rating: 4.4,
    distance_m: 2100,
  },
]

// Bundle Plans
export interface Plan {
  id: string
  name: string
  price_xaf: number
  duration_minutes: number
  speed_profile: string
  session_type: SessionType
  is_active: boolean
}

export const mockPlans: Plan[] = [
  {
    id: "plan-2hr",
    name: "2 Hours",
    price_xaf: 150,
    duration_minutes: 120,
    speed_profile: "konnectik-standard",
    session_type: "paid",
    is_active: true,
  },
  {
    id: "plan-5hr",
    name: "5 Hours",
    price_xaf: 300,
    duration_minutes: 300,
    speed_profile: "konnectik-standard",
    session_type: "paid",
    is_active: true,
  },
  {
    id: "plan-24hr",
    name: "24 Hours",
    price_xaf: 1000,
    duration_minutes: 1440,
    speed_profile: "konnectik-premium",
    session_type: "paid",
    is_active: true,
  },
  {
    id: "plan-trial",
    name: "Free Trial",
    price_xaf: 0,
    duration_minutes: 30,
    speed_profile: "konnectik-trial",
    session_type: "gift",
    is_active: true,
  },
]

// User Bundles
export interface UserBundle {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  session_type: SessionType
  total_minutes: number
  status: BundleStatus
  purchased_at: Date
  expires_at: Date
}

export const mockUserBundles: UserBundle[] = [
  {
    id: "bundle-001",
    user_id: "user-001",
    plan_id: "plan-5hr",
    plan_name: "5 Hours",
    session_type: "paid",
    total_minutes: 300,
    status: "active",
    purchased_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  {
    id: "bundle-002",
    user_id: "user-001",
    plan_id: "plan-2hr",
    plan_name: "2 Hours",
    session_type: "paid",
    total_minutes: 120,
    status: "exhausted",
    purchased_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
]

// Session Segments
export interface SessionSegment {
  id: string
  bundle_id: string
  ap_id: string
  ap_name: string
  provider_name: string
  user_id: string
  status: SegmentStatus
  started_at: Date | null
  scheduled_end: Date | null
  ended_at: Date | null
  time_used_minutes: number
  time_limit_minutes: number
  gross_earned_xaf: number
  provider_net_xaf: number
}

export const mockSessionSegments: SessionSegment[] = [
  // Active segment on current bundle
  {
    id: "seg-001",
    bundle_id: "bundle-001",
    ap_id: "ap-001",
    ap_name: "Konnectik Akwa Palace",
    provider_name: "TechWave Cameroon",
    user_id: "user-001",
    status: "active",
    started_at: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    scheduled_end: new Date(Date.now() + 75 * 60 * 1000), // 75 mins from now (120 total remaining when started)
    ended_at: null,
    time_used_minutes: 45,
    time_limit_minutes: 120,
    gross_earned_xaf: 0,
    provider_net_xaf: 0,
  },
  // Previous completed segment
  {
    id: "seg-002",
    bundle_id: "bundle-001",
    ap_id: "ap-002",
    ap_name: "Konnectik Bonanjo Hub",
    provider_name: "CamNet Solutions",
    user_id: "user-001",
    status: "completed",
    started_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
    scheduled_end: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ended_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    time_used_minutes: 90,
    time_limit_minutes: 300,
    gross_earned_xaf: 90,
    provider_net_xaf: 81,
  },
  // Old bundle segments
  {
    id: "seg-003",
    bundle_id: "bundle-002",
    ap_id: "ap-003",
    ap_name: "Konnectik Bonapriso Cafe",
    provider_name: "TechWave Cameroon",
    user_id: "user-001",
    status: "completed",
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    scheduled_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    ended_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    time_used_minutes: 120,
    time_limit_minutes: 120,
    gross_earned_xaf: 150,
    provider_net_xaf: 135,
  },
]

// Wallet Transactions
export interface WalletTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount_xaf: number
  fee_xaf: number
  net_xaf: number
  description: string
  payment_method?: string
  reference?: string
  created_at: Date
}

export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: "tx-001",
    user_id: "user-001",
    type: "recharge",
    amount_xaf: 1000,
    fee_xaf: 50,
    net_xaf: 950,
    description: "Wallet top-up",
    payment_method: "MTN MoMo",
    reference: "MAN-2024-001234",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "tx-002",
    user_id: "user-001",
    type: "debit",
    amount_xaf: 300,
    fee_xaf: 0,
    net_xaf: 300,
    description: "5 Hour Bundle Purchase",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "tx-003",
    user_id: "user-001",
    type: "recharge",
    amount_xaf: 500,
    fee_xaf: 25,
    net_xaf: 475,
    description: "Wallet top-up",
    payment_method: "Orange Money",
    reference: "MAN-2024-001198",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "tx-004",
    user_id: "user-001",
    type: "debit",
    amount_xaf: 150,
    fee_xaf: 0,
    net_xaf: 150,
    description: "2 Hour Bundle Purchase",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "tx-005",
    user_id: "user-001",
    type: "gift",
    amount_xaf: 0,
    fee_xaf: 0,
    net_xaf: 0,
    description: "First-time 30min gift credited",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
]

// Notifications
export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  category: NotificationCategory
  read_at: Date | null
  created_at: Date
  data?: Record<string, unknown>
}

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-001",
    user_id: "user-001",
    title: "K-Zone Nearby",
    body: "You have 75 min remaining. Konnectik Bonanjo Hub is 320m away.",
    category: "proximity",
    read_at: null,
    created_at: new Date(Date.now() - 5 * 60 * 1000),
    data: { ap_id: "ap-002" },
  },
  {
    id: "notif-002",
    user_id: "user-001",
    title: "Session Started",
    body: "Connected to Konnectik Akwa Palace. 120 min available.",
    category: "session",
    read_at: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "notif-003",
    user_id: "user-001",
    title: "Wallet Recharged",
    body: "950 XAF credited to your wallet. New balance: 950 XAF",
    category: "payment",
    read_at: new Date(Date.now() - 30 * 60 * 1000),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "notif-004",
    user_id: "user-001",
    title: "Bundle Purchased",
    body: "5 Hour bundle activated. Valid for 7 days.",
    category: "payment",
    read_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "notif-005",
    user_id: "user-001",
    title: "Referral Milestone!",
    body: "5 friends signed up with your code. 5 more for a free 30min!",
    category: "reward",
    read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "notif-006",
    user_id: "user-001",
    title: "15 Minutes Remaining",
    body: "Your session at Konnectik Bonapriso Cafe ends in 15 minutes.",
    category: "session",
    read_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
]

// User Profile
export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string | null
  wallet_balance_xaf: number
  referral_code: string
  referred_by: string | null
  first_trial_used_at: Date | null
  last_monthly_gift_at: Date | null
  created_at: Date
}

export const mockUserProfile: UserProfile = {
  id: "user-001",
  full_name: "Karol Konarski",
  email: "karol@konnectik.app",
  phone: "677123456",
  avatar_url: null,
  wallet_balance_xaf: 650,
  referral_code: "KK8X2M4P",
  referred_by: null,
  first_trial_used_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  last_monthly_gift_at: null,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
}

// Referral Stats
export interface ReferralStats {
  friends_signed_up: number
  friends_purchased: number
  gift_minutes_earned: number
  gift_minutes_remaining: number
  progress_to_next_reward: number
}

export const mockReferralStats: ReferralStats = {
  friends_signed_up: 12,
  friends_purchased: 7,
  gift_minutes_earned: 30,
  gift_minutes_remaining: 15,
  progress_to_next_reward: 7, // 7/10 toward next reward
}

// Gift Credits
export interface GiftCredit {
  id: string
  user_id: string
  type: "first_time" | "monthly" | "referral"
  minutes_total: number
  minutes_remaining: number
  granted_at: Date
  expires_at: Date
}

export const mockGiftCredits: GiftCredit[] = [
  {
    id: "gift-001",
    user_id: "user-001",
    type: "first_time",
    minutes_total: 30,
    minutes_remaining: 0,
    granted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    expires_at: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
  },
  {
    id: "gift-002",
    user_id: "user-001",
    type: "referral",
    minutes_total: 30,
    minutes_remaining: 15,
    granted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expires_at: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
  },
]

// Helper functions to compute derived values
export function computeBundleRemainingMinutes(bundle: UserBundle, segments: SessionSegment[]): number {
  const completedMinutes = segments
    .filter(s => s.bundle_id === bundle.id && (s.status === "completed" || s.status === "terminated"))
    .reduce((sum, s) => sum + s.time_used_minutes, 0)
  
  const activeSegment = segments.find(s => s.bundle_id === bundle.id && s.status === "active")
  const activeMinutes = activeSegment?.time_used_minutes ?? 0
  
  return Math.max(0, bundle.total_minutes - completedMinutes - activeMinutes)
}

export function getActiveSegment(segments: SessionSegment[]): SessionSegment | null {
  return segments.find(s => s.status === "active") ?? null
}

export function getActiveBundle(bundles: UserBundle[]): UserBundle | null {
  return bundles.find(b => b.status === "active") ?? null
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} XAF`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}
