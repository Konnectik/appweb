# Konnectik Mobile App - Design & Architecture Guidelines

## Design Philosophy: Simplicity as Architecture

This project follows the design principles of Steve Jobs and Jony Ive. Every element must justify its existence. If it doesn't serve the user's immediate goal, it's removed.

**Core Principle**: If a user needs to think about how to use it, we've failed.

### Design Rules (Non-Negotiable)

- **Simplicity is not a style, it is the architecture**
  - Every element must justify its existence
  - The best interface is one the user never notices
  - If an element can be removed without losing meaning, it must be removed
  
- **Consistency is Non-Negotiable**
  - The same component must look and behave identically everywhere it appears
  - If inconsistency is found, flag it immediately—do not invent a third variation
  - Primary Color: `#E42320` (Konnectik Red)
  - Secondary Color: `#FFFFFF` (White)
  - Logo: `public/logo.svg`

## Color System

**EXACTLY 3-5 colors total:**

1. **Primary**: `#E42320` - Konnectik brand red for CTAs, active states, status indicators
2. **White**: `#FFFFFF` - Secondary, backgrounds, text on dark, cards
3. **Gray-900**: `#0F172A` - Dark text, backgrounds
4. **Gray-100**: `#F1F5F9` - Light backgrounds, borders
5. **Status Colors**:
   - Online: `#22C55E` (green) - K-Zone active/available
   - Out-of-Range: `#F97316` (orange) - K-Zone weak signal
   - Offline: `#94A3B8` (gray) - K-Zone unavailable
   - Transaction Success: `#22C55E` (green)
   - Transaction Pending: `#F97316` (orange)

**Never mix opposing temperature gradients** (no pink→green, orange→blue, etc.)

## Typography

**Exactly 2 font families total**

- **Headings**: Geist (600, 700 weights)
- **Body**: Geist (400, 500 weights)
- **Code**: Geist Mono

**Rules:**
- Line-height for body: 1.4-1.6 (use `leading-relaxed` or `leading-6`)
- Never use decorative fonts for body text
- Minimum font size: 14px for readable body text

## Layout: Mobile-First Always

The app is **optimized for mobile (378x752px)** first. All design decisions prioritize the mobile viewport. Desktop responsiveness is secondary.

### Layout Method Priority

1. **Flexbox** (default) - Use for 90% of layouts: `flex items-center justify-between`
2. **CSS Grid** - Only for complex 2D layouts
3. **Never**: Floats, absolute positioning (except overlays/popovers)

**Tailwind Patterns:**
- Prefer spacing scale: `p-4`, `mx-2`, `py-6` (NO arbitrary values like `p-[16px]`)
- Use gap classes: `gap-4`, `gap-x-2`, `gap-y-6`
- Use semantic classes: `items-center`, `justify-between`, `text-center`
- Apply fonts via `font-sans`, `font-serif`, `font-mono` classes
- Wrap titles in `text-balance` or `text-pretty` for optimal line breaks
- Never mix margin/padding with gap classes on the same element

## Architecture

### State Management: `useAppState` Hook

All global state is managed via a single hook in `hooks/use-app-state.ts`. This is the single source of truth for:

- **User State**: `user`, `isAuthenticated`, `authLoading`
- **Map State**: `kzones`, `selectedKZone`, `activeSession`, `userLocation`
- **Session State**: `activeSessions`, `sessionHistory`
- **Wallet State**: `balance`, `transactions`
- **Notifications**: `notifications`, `unreadCount`
- **UI State**: `currentScreen`, `showAPDetail`, `showRechargeSheet`, etc.

**State Mutations:**
- Use camelCase action names: `loginUser()`, `purchaseBundle()`, `resumeSession()`
- All mutations return void and update state directly
- Subscribe to state changes via component re-renders

### Mock Data: `lib/mock-data.ts`

Complete mock dataset for testing all user flows:

**Entities:**
- **Users**: `currentUser` (authenticated user profile)
- **KZones**: `KZONES` array (30+ access points across city)
- **Bundles**: `BUNDLES` array (data + duration combinations)
- **Sessions**: `mockSessions` (active + historical)
- **Transactions**: `mockTransactions` (wallet history)
- **Notifications**: `mockNotifications` (all categories)

**Status Values:**
- `APStatus`: `"online" | "out-of-range" | "offline"`
- `SessionStatus`: `"active" | "paused" | "expired"`
- `TransactionStatus`: `"completed" | "pending" | "failed"`

### Component Organization

```
components/
├── screens/                 # Full-screen views (one per user flow)
│   ├── login-screen.tsx
│   ├── register-screen.tsx
│   ├── map-screen.tsx
│   ├── sessions-screen.tsx
│   ├── wallet-screen.tsx
│   ├── notifications-screen.tsx
│   └── rewards-screen.tsx
├── ui/                      # shadcn/ui components (pre-built)
├── bottom-navigation.tsx   # Tab bar (Map, Sessions, Wallet, Menu)
├── top-header.tsx          # Header with logo, notifications bell
├── side-menu.tsx           # Slide-out drawer menu
├── mobile-shell.tsx        # Layout wrapper (safe areas, viewport)
├── kzone-marker.tsx        # Individual map marker
├── signal-bars.tsx         # Signal strength indicator
├── ap-detail-sheet.tsx     # Bottom sheet: AP info + bundle selection
├── purchase-confirm-sheet.tsx # Confirm bundle purchase + payment
├── recharge-sheet.tsx      # Wallet top-up flow
└── [other interactive components]
```

## User Flows

### 1. **Authentication Flow**
`Login → Register → Verify Phone (mock) → Map`

- Email/password + Google OAuth options
- Referral code input on registration
- Phone verification step (mock approval in 3 seconds)

### 2. **Map & K-Zone Discovery**
`Map View → Tap K-Zone Marker → AP Detail Sheet → Purchase/Resume`

- Map centers on user location (mock: Nairobi coordinates)
- K-Zone markers show signal status (green=online, orange=weak, gray=offline)
- Tap marker opens AP detail sheet
- Active session shows pulsing green animation on marker
- Resumable bundle shows "Resume" badge on marker

### 3. **Bundle Purchase Flow**
`AP Detail Sheet → Select Bundle → Purchase Confirm Sheet → Payment Method → Success → Active Session`

- AP detail sheet lists 3 bundle options (price + duration)
- Purchase confirm sheet shows summary + payment methods
- MTN MoMo / Orange Money selection
- Mock payment success in 2 seconds
- Session becomes active with countdown timer

### 4. **Session Management**
`Sessions Screen → Active Session Card + History → Disconnect/View Details`

- Active session card shows:
  - K-Zone name, provider, signal strength
  - Real-time countdown timer (updates every second)
  - Progress bar (time used vs. total)
  - "Disconnect" button
- History section grouped by bundle (each shows: start time, duration, data used, provider)

### 5. **Wallet Operations**
`Wallet Screen → View Balance + Transactions → Add Funds → Select Provider → Payment → Balance Updated`

- Balance card prominent at top
- Low balance warning if < 100 credits
- Transaction history: date, description (bundle purchase/recharge), amount, status
- "Add Funds" CTA opens recharge sheet
- Amount presets: 500, 1000, 2000, 5000 XAF
- Payment method choice: MTN MoMo or Orange Money
- Mock transaction confirms in 2 seconds

### 6. **Notifications**
`Notifications Icon → Notifications Screen → Filtered by Category`

- Categories: Proximity, Session, Payment, Reward
- Each notification: icon + title + time + unread badge
- Tap to dismiss (mock only)
- Shows empty state when no notifications

### 7. **Rewards**
`Menu → Rewards Screen → View Referral Code + Progress`

- Referral code display (with copy + share buttons)
- Friend count tracker (X out of Y referrals)
- Gift balance card
- Referral history table

## Data Models

### User
```typescript
{
  id: string
  email: string
  phone: string
  name: string
  avatar?: string
  wallet: { balance: number; credits: number }
  referralCode: string
  referralCount: number
  giftBalance: number
  createdAt: Date
}
```

### KZone (Access Point)
```typescript
{
  id: string
  name: string
  provider: "MTN" | "Orange" | "Airtel"
  lat: number
  lng: number
  signalStrength: 1-5
  coverageRadius: number // meters
  status: "online" | "out-of-range" | "offline"
  rating: number // 1-5
  distance?: number // meters from user
}
```

### Bundle
```typescript
{
  id: string
  dataGB: number
  duration: number // hours
  price: number // credits
  description: string
}
```

### Session
```typescript
{
  id: string
  bundleId: string
  kzoneId: string
  startTime: Date
  endTime?: Date
  dataUsed: number // MB
  status: "active" | "paused" | "expired"
  provider: string
  apName: string
}
```

## Component Patterns

### Screen Components
All screen components:
- Accept `onNavigate: (screen: string) => void` for navigation
- Are responsive and mobile-optimized
- Use consistent padding: `px-4 py-4`
- Start with empty states if no data

### Interactive Sheets (Bottom Sheets)
- Use `Drawer` from shadcn/ui (auto-handles mobile)
- Dark overlay on map when open
- Close button (X) or swipe to dismiss
- Smooth animations (`transition-all duration-200`)

### Status Indicators
- **Online K-Zone**: Green (`#22C55E`) with icon
- **Weak Signal**: Orange (`#F97316`) with icon
- **Offline**: Gray (`#94A3B8`) with icon
- **Active Session**: Pulsing green animation on marker

### Buttons
- Primary (Konnectik red): CTA actions (Purchase, Resume, Save)
- Secondary (white): Cancel, skip, alternative actions
- All buttons full-width on mobile, fitted width on desktop

## Testing & Verification

### Mobile-First Testing
- Always test at 378x752px (mobile portrait) first
- Verify all interactive flows work on mobile
- Then check 768px (tablet) and 1024px (desktop)
- A change that doesn't work on mobile is not complete

### Mock Data Flows
All user stories are testable with mock data:
1. Login with `user@konnectik.com` / `password`
2. See map with 30 K-Zones
3. Tap any K-Zone to purchase bundle
4. Session becomes active immediately
5. Wallet shows transaction
6. Notifications appear
7. Rewards referral code displays

## Integration Points (Future)

When connecting to real backend:

1. **Authentication**: Replace mock login with real API
2. **Map Data**: Fetch live K-Zone locations + status from backend
3. **Payments**: Integrate MTN MoMo / Orange Money APIs
4. **Real-time Sessions**: Subscribe to active session updates via WebSocket
5. **Notifications**: Push notifications from backend
6. **User Profile**: Fetch from authenticated user endpoint

## Code Conventions

- **File naming**: kebab-case for files, camelCase for exports
- **Component naming**: PascalCase for components, camelCase for hooks
- **Props interfaces**: `ComponentNameProps` naming pattern
- **State updates**: Use immutable patterns, never mutate state directly
- **Imports**: Group by external, internal, relative
- **Unused imports**: Remove immediately when code is deleted

## Common Mistakes to Avoid

1. ❌ Using 6+ colors - Keep to 3-5 max
2. ❌ Mixing layout methods (floats + flexbox) - Use flexbox for 90%
3. ❌ Breaking mobile layout for desktop feature - Mobile first always
4. ❌ Inventing UI variations - Use exact same component everywhere
5. ❌ Hidden complexity - Every interaction must be obvious
6. ❌ Arbitrary Tailwind values - Use spacing scale (4, 6, 8, 12, 16, 20, etc.)
7. ❌ Forgetting state sync - All screens reference same `useAppState`
8. ❌ Inconsistent error states - Use same pattern everywhere

---

**Last Updated**: May 20, 2026
**Maintained By**: UI/UX Architecture (v0)
**Design Philosophy**: Simplicity. Inevitability. Quiet confidence.
