# Konnectik Mobile PWA — Guide pour Claude

## Contexte projet

Konnectik permet d'acheter des bundles Wi-Fi et de se connecter aux K-Zones (points d'accès Mikrotik). Il existe **2 frontends** + un backend Supabase commun :

1. **`/konnectik/`** (ce dossier) — PWA Next.js 16, mobile-first, déployée sur Netlify. C'est la base de la démo.
2. **`../` (dashboard parent)** — Portail admin/provider Vite/React (gestion des APs, providers, bundles, users).
3. **`/konnectik/konnectik-flutter/`** — App mobile native Flutter (référence design, ignorée dans Git).

Backend partagé : projet Supabase `ufdzcxycgprgvigyotnk` avec ~20 tables + 5 edge functions.

---

## Architecture PWA

### Stack

- **Next.js 16** (App Router) + React 19 + Tailwind v4
- **Supabase** : auth (email + Google OAuth), Postgres avec RLS, edge functions, realtime
- **React Query** pour le state serveur
- **Leaflet + OpenStreetMap** pour la carte
- **shadcn/ui** + sonner (toasts)
- **PWA** : `public/manifest.json` + `public/sw.js` (cache shell + tuiles OSM)

### Structure

```
konnectik/
├── app/
│   ├── layout.tsx              # Providers + SW register + viewport
│   ├── page.tsx                # Router principal (currentScreen / activeTab)
│   └── globals.css             # Tailwind + leaflet/dist/leaflet.css
├── components/
│   ├── screens/                # Tous les écrans plein-page
│   ├── map/                    # leaflet-map.tsx (SSR off via map-canvas.tsx)
│   ├── ui/                     # shadcn
│   ├── mobile-shell.tsx        # Wrapper h-dvh + max-w-md mx-auto
│   ├── top-header.tsx          # z-1000 sticky, logo rouge
│   ├── bottom-navigation.tsx   # Wallet / Map / Sessions (z-1000)
│   ├── side-menu.tsx           # Burger menu (z-1200, au-dessus de tout)
│   ├── ap-detail-sheet.tsx     # Legacy bottom sheet — plus utilisé depuis bundles fullscreen
│   ├── purchase-confirm-sheet.tsx
│   ├── recharge-sheet.tsx
│   └── sw-register.tsx
├── contexts/
│   └── auth-context.tsx        # Session + profile + signIn/signUp/Google/signOut + refreshProfile
├── hooks/
│   └── use-app-state.ts        # Glue layer : queries + edge function callers + UI state
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # createBrowserClient (@supabase/ssr)
│   │   ├── types.ts            # Types DB (enums, Profile, AccessPoint, etc.)
│   │   ├── queries.ts          # React Query hooks + realtime channels
│   │   └── edge-functions.ts   # Wrappers typés pour invoke
│   ├── mock-data.ts            # Types UI legacy (utilisés par les screens existants)
│   └── utils.ts
├── public/
│   ├── logo-red.png / logo-white.png
│   ├── momo.png, om.png, nowifi.png, walletempty.png, telecom-tower.svg
│   ├── manifest.json, sw.js
├── netlify.toml                # Build npm + Next plugin + cache headers SW
├── .npmrc                      # legacy-peer-deps=true (React 19 vs react-leaflet)
└── .gitignore                  # konnectik-flutter/, pnpm-lock.yaml, csv
```

### Pattern useAppState

Hook glue qui :
- Appelle les hooks React Query (`useAccessPoints`, `usePlans`, `useUserBundles`, etc.)
- Mappe les types DB → types UI legacy (defined in `lib/mock-data.ts`) pour ne pas casser les screens
- Expose les actions wrappant les edge functions (`purchaseBundle`, `startSession`, etc.)
- Garde l'UI state (currentScreen, activeTab, menuOpen, selectedAP…)
- Expose `profileComplete` calculé depuis le profil chargé

### Pattern navigation

Pas de Next router pour les screens — tout passe par `state.setCurrentScreen(...)` + `state.activeTab`. Le router Next est juste utilisé pour `/` (et future `/auth/callback` si OAuth).

`currentScreen` : `"main" | "notifications" | "rewards" | "profile" | "settings" | "help" | "login" | "register" | "bundles" | "usage" | "gifts"`

`activeTab` : `"wallet" | "map" | "sessions"`

---

## Identité visuelle

- **Primary** `#E42320` (rouge Konnectik) — défini en oklch dans `globals.css`
- **Police** Inter (PWA web) — alors que Flutter utilise Poppins. Acceptable.
- **Logo** : `logo-red.png` partout sauf splash (fond rouge → `logo-white.png`)
- **Mobile-first** : `MobileShell` constrains à `max-w-md` (448px) sur desktop pour preview mobile

---

## Schéma Supabase (en bref)

Tables clés et leur usage côté app :

| Table | Usage |
|---|---|
| `profiles` | Données user (full_name, email, phone, address, gender, date_of_birth, terms_agreed_at, wallet_balance_xaf, referral_code) |
| `access_points` | K-Zones (zone_label, location, lat/lng, propagation_radius_m, status, provider_id) |
| `bundles` | Catalogue (name, duration, duration_unit, price, currency, session_type, is_active) |
| `user_bundles` | Bundles achetés (total_minutes, status, expires_at) |
| `session_segments` | Sessions Wi-Fi (started_at, scheduled_end, ended_at, time_used_minutes, status) |
| `wallet_transactions` | Recharges/débits (type, amount_xaf, fee_xaf, net_xaf, status) |
| `notifications` | Notifs push/in-app (title, body, category, read_at) |
| `gift_credits` | Crédits cadeaux (type: first_time/monthly/referral, minutes_remaining) |
| `device_tokens` | FCM tokens (pas encore branché) |
| `providers` | Provider business info |

### Enums DB confirmés (audit fait via SQL)

- `ap_status` : `online, offline, maintenance` (PAS `out-of-range` — calculé côté client)
- `segment_status` : `active, ended, expired, error`
- `bundle_status` : `active, exhausted, expired`
- `session_type` : `paid, gift`
- `wallet_tx_status` : `pending, confirmed, failed`
- `wallet_tx_type` : `recharge, debit, refund, reward, gift`
- `notification_category` : `system, promo, session, wallet, bundle`
- `app_role` : `admin, owner, user`
- `device_platform` : `ios, android, web`

### RLS

Toutes les tables ont RLS activée. Policies clés :
- `access_points` SELECT : `status = 'online'` (visible par tous les authentifiés)
- `bundles` SELECT : `true` (catalogue public)
- `profiles` SELECT/UPDATE : `id = auth.uid()`
- `user_bundles`, `session_segments`, `wallet_transactions`, `notifications`, `gift_credits` SELECT : `user_id = auth.uid()`
- `device_tokens` ALL : `user_id = auth.uid()`

### Triggers

- `on_auth_user_created` → `handle_new_user()` : crée auto une ligne `profiles` au signup
- `enforce_immutable_profile_fields` → `prevent_immutable_profile_changes()` : bloque modif de certains champs (à vérifier si bloque date_of_birth)
- `update_updated_at` sur plusieurs tables

---

## Edge functions (Supabase)

Tous dans `../supabase/functions/`. Déployées via `npx supabase functions deploy <name> --project-ref ufdzcxycgprgvigyotnk`.

| Fonction | Rôle |
|---|---|
| `purchase-bundle` | Vérifie solde, débite wallet, crée user_bundle, transaction. **Fixée** : utilisait `plan.price_xaf` qui n'existe pas → `plan.price`, calcule total_minutes depuis duration+unit, expiry = 30 jours |
| `start-segment` | Crée segment + appelle Mikrotik relay `hotspot/add-user`. **Fixée** : utilisait status `'failed'` au lieu de `'error'` |
| `end-segment` | Termine segment, alloue provider_earnings_ledger, soft-fail Mikrotik `hotspot/remove-user` |
| `initiate-recharge` | Token Netwallet → POST `/api/v1/global/collection/request-payment`. **Fixée** : net_xaf était le profit Konnectik au lieu du montant user. Normalise phone CM (237XXXXXXXXX) |
| `recharge-webhook` | Reçoit callback Netwallet, vérifie SHA-256 hash, met à jour wallet_transactions + crédite profile. **Fixée** : `PENDING` mappé comme tx intermédiaire (pas `failed`) |
| `provision-router` | Génère config WireGuard pour Mikrotik (utilisée par admin) |

### Secrets Supabase

```
NETWALLET_BASE_URL        # https://netwalletpay.com
NETWALLET_PRIMARY_KEY     # de Netwallet dashboard
NETWALLET_EMAIL           # email du compte Netwallet
NETWALLET_SECONDARY_KEY   # pour signer le Hash
MIKROTIK_RELAY_URL        # URL du VPS relay (pas encore déployé)
MIKROTIK_RELAY_API_KEY    # auth du relay
RESEND_API_KEY            # emails (autre projet)
```

---

## Netwallet (mobile money)

- **Base URL prod** : `https://netwalletpay.com` (pas de sandbox URL publique connue)
- **Auth** : POST `/api/v1/token` form-urlencoded (`primary_key`, `email`, `grant_type=primary_key`) → access_token 900s
- **Collection** : POST `/api/v1/global/collection/request-payment` Bearer + JSON
- **Hash** SHA-256 hex de `COLLECTION_MOBILE_MONEY_{provider}_{orderId}_{secondaryKey}`
- **Providers Cameroun** : `mtn_cm` (MOMO) / `orange_cm` (ORANGE_MONEY)
- **Phone format** : `237XXXXXXXXX` (12 chiffres, pas de +)
- **Webhook** : POST avec `{Status, TransactionId}` (Status: SUCCESS, FAILED, PENDING, CANCELLED, TIMEOUT) + header `X-CallbackToken = SHA256(orderId_secondaryKey)`

### Statut actuel
- ✅ Endpoint et hash conformes à la doc
- ✅ Phone normalisé
- ✅ **Test PowerShell réussi** — statusCode 200, prompt MoMo reçu sur tel.
- ✅ **Bug 4007 "order info invalid" fixé** : Netwallet rejette les OrderID avec tirets. `initiate-recharge` et `purchase-bundle` génèrent maintenant des references alphanumériques uniquement (`RCH{ts}{uuid}` / `BUY{ts}{uuid}` sans tirets).
- ⚠️ Secrets à régénérer côté Netwallet (les valeurs ont été collées en clair dans la session précédente).

---

## Auth flow

### Signup email
1. Form: name, email, phone CM, DOB, password+confirm, referral, terms checkbox, Google btn (pas Apple)
2. `auth.signUp` → trigger crée profile minimal
3. `auth-context` fait un UPDATE complémentaire (phone, DOB, gender, terms_agreed_at)
4. Redirige Map

### Signup Google
1. OAuth Google
2. Trigger crée profile minimal (juste email + full_name de Google)
3. `useAppState.profileComplete` détecte phone/DOB/terms manquants
4. Redirige automatiquement vers `CompleteProfileScreen`
5. User remplit, profile updaté, → Map

### Reset password
- Via Settings → "Envoyer un lien" → `supabase.auth.resetPasswordForEmail`

---

## Map / K-Zone flow

1. **Map screen** : carte Leaflet OSM, géoloc utilisateur, marqueurs pin rouges en forme de tour télécom
2. Clic marker → popup : nom, location, statut, bouton **"Accéder à la K-zone →"** (bloqué si offline)
3. Clic bouton → écran `bundles-screen.tsx` plein écran avec hero rouge + liste cards bundles
4. Clic bundle → `purchase-confirm-sheet` confirmation paiement
5. Succès → segment créé via edge function `start-segment`
6. → `usage-screen` plein écran : countdown circulaire SVG, AP info, barre de progression, bouton Disconnect

Accès rapide à usage screen :
- Banner rouge "Voir live →" en haut de l'onglet Sessions si active segment
- Entrée "Session en cours" rouge en haut du burger menu si active segment

---

## Bottom-nav / overlays z-index

| Élément | z-index |
|---|---|
| Map markers, banners | 500 |
| Bottom nav | 1000 |
| Top header | 1000 |
| Sheets (recharge, purchase, AP detail) | 30 (sont positionnés `inset-x-0 bottom-0` dans `<main>` donc déjà au-dessus du nav par stacking) |
| Side menu backdrop | 1100 |
| Side menu drawer | 1200 |

---

## Mikrotik relay

Architecture conçue mais **pas encore déployée** :

```
Edge Functions ─HTTPS─> Relay VPS ─WireGuard─> Mikrotik routers (NAT)
```

Le relay expose `/hotspot/add-user`, `/hotspot/remove-user`. Variables `MIKROTIK_RELAY_URL` + `MIKROTIK_RELAY_API_KEY` à set quand le VPS sera prêt.

Pour la démo : `start-segment` et `end-segment` essaient le relay, et `end-segment` est soft-fail (n'empêche pas la session de finir). `start-segment` est hard-fail — il faudrait soit déployer le relay, soit ajouter un mock mode quand `MIKROTIK_RELAY_URL` n'est pas défini.

---

## Déploiement

- **Netlify** : connecté au repo `Konnectik/appweb` (le dossier `konnectik/` poussé tout seul, pas le dashboard)
- **Env vars Netlify requises** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
- **Supabase Auth URL** : Site URL = URL Netlify, Redirect URLs = `https://<netlify>.app/**`
- Build via `netlify.toml` : `npm run build` + plugin `@netlify/plugin-nextjs`

---

## Bugs récurrents à connaître

1. **`pnpm-lock.yaml` génère un EarlyDrop sur Netlify** → on a supprimé pnpm-lock.yaml et forcé npm via `.npmrc`
2. **React 19 vs react-leaflet@4** → utilisé `react-leaflet@5` qui supporte React 19 + `legacy-peer-deps=true`
3. **Z-index** : tout overlay critique doit être >= 1000 pour passer au-dessus du bottom-nav et header
4. **Profile incomplete blocking** : `profileComplete` redirige TOUT user sans phone/DOB/terms vers CompleteProfileScreen — utile mais à coder pour ne pas bloquer en boucle si trigger immutable bloque update
5. **Edge function 502** : généralement crash dans le code Deno. Toujours vérifier les logs `[name] FATAL` au lieu de juste les invocations
6. **AnyAP type mismatch** dans `page.tsx` ligne 189 — ignoré via `ignoreBuildErrors: true` dans `next.config.mjs`. Pré-existant, ne bloque pas le build

---

## Commandes utiles

```powershell
# Dev local
cd konnectik
npm install --legacy-peer-deps
npm run dev

# Supabase CLI
npx supabase functions deploy <name> --project-ref ufdzcxycgprgvigyotnk
npx supabase secrets list --project-ref ufdzcxycgprgvigyotnk
npx supabase secrets set KEY=value --project-ref ufdzcxycgprgvigyotnk
npx supabase db query --linked "SELECT ..."

# Git
git add . && git commit -m "..." && git push  # déploie Netlify auto
```

---

## Conventions code

- **`use client`** sur tout composant interactif (App Router Next 16)
- **kebab-case** pour fichiers, **PascalCase** pour composants
- **Pas de mock data dans le code prod** sauf dans `lib/mock-data.ts` qui ne sert qu'aux types UI legacy
- **Tous les paths absolus** via `@/` (configuré dans `tsconfig.json`)
- **Feedback utilisateur** : `toast` de sonner pour mutations, banner inline pour validation
- **Pas d'emoji** dans le code/UI sauf si demandé par le user
- **FR ou EN** : l'UI est mixte (en cours d'unification vers FR)

---

## Ce qui reste à faire (priorisé)

1. 🔴 Débug recharge Netwallet 502 (regarder logs FATAL côté dashboard ou demander à Netwallet)
2. 🔴 Déployer Mikrotik relay VPS ou ajouter mock mode dans `start-segment` pour la démo
3. 🟡 Brancher `device_tokens` + push notifications (FCM ou Web Push)
4. 🟡 Édition complète profil (avatar upload via Supabase Storage)
5. 🟢 Splash transition après auth (actuellement bascule directe)
6. 🟢 i18n complet (Settings stocke déjà la préférence FR/EN en localStorage)
7. 🟢 Page "Help & Support" (currentScreen "help" non implémenté)

---

**Dernière maj** : 2026-05-21 — Session #1 (PWA setup, auth, map, bundles, sessions, wallet, gift, settings, signup Figma).
