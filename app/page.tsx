"use client"

import { MobileShell } from "@/components/mobile-shell"
import { BottomNavigation } from "@/components/bottom-navigation"
import { TopHeader } from "@/components/top-header"
import { SideMenu } from "@/components/side-menu"
import { MapScreen } from "@/components/screens/map-screen"
import { SessionsScreen } from "@/components/screens/sessions-screen"
import { WalletScreen } from "@/components/screens/wallet-screen"
import { NotificationsScreen } from "@/components/screens/notifications-screen"
import { RewardsScreen } from "@/components/screens/rewards-screen"
import { LoginScreen } from "@/components/screens/login-screen"
import { RegisterScreen } from "@/components/screens/register-screen"
import { ProfileSettingsScreen } from "@/components/screens/profile-settings-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import { SplashScreen } from "@/components/screens/splash-screen"
import { BundlesScreen } from "@/components/screens/bundles-screen"
import { APDetailSheet } from "@/components/ap-detail-sheet"
import { RechargeSheet } from "@/components/recharge-sheet"
import { PurchaseConfirmSheet } from "@/components/purchase-confirm-sheet"
import { useAppState } from "@/hooks/use-app-state"

export default function KonnectikApp() {
  const state = useAppState()

  // Auth loading splash
  if (state.authLoading) {
    return <SplashScreen />
  }

  // Auth screens
  if (!state.isAuthenticated) {
    if (state.authScreen === "login") {
      return (
        <MobileShell>
          <LoginScreen
            onLogin={(email, password) => state.login(email, password)}
            onGoogleLogin={() => state.loginWithGoogle()}
            onRegister={() => state.setAuthScreen("register")}
            onForgotPassword={() => {}}
            busy={state.authBusy}
            error={state.authError}
          />
        </MobileShell>
      )
    }
    return (
      <MobileShell>
        <RegisterScreen
          onRegister={(data) => state.register(data)}
          onGoogleRegister={() => state.loginWithGoogle()}
          onLogin={() => state.setAuthScreen("login")}
          onBack={() => state.setAuthScreen("login")}
          busy={state.authBusy}
          error={state.authError}
        />
      </MobileShell>
    )
  }

  // Notifications screen
  if (state.currentScreen === "notifications") {
    return (
      <MobileShell>
        <NotificationsScreen
          notifications={state.notifications}
          onBack={() => state.setCurrentScreen("main")}
          onNotificationClick={(n) => {
            state.markNotificationRead(n.id)
          }}
          onMarkAllRead={() => state.markAllNotificationsRead()}
        />
      </MobileShell>
    )
  }

  // Profile settings
  if (state.currentScreen === "profile") {
    return (
      <MobileShell>
        <ProfileSettingsScreen onBack={() => state.setCurrentScreen("main")} />
      </MobileShell>
    )
  }

  // Bundles screen (full screen — opened from map "Accéder à la K-zone")
  if (state.currentScreen === "bundles" && state.selectedAP) {
    return (
      <MobileShell>
        <BundlesScreen
          ap={state.selectedAP}
          plans={state.plans.filter((p) => p.is_active)}
          walletBalance={state.user?.wallet_balance_xaf || 0}
          hasResumableBundle={!!state.activeBundle && state.remainingMinutes > 0 && !state.activeSegment}
          resumableMinutes={state.remainingMinutes}
          isEligibleForTrial={!state.user?.first_trial_used_at}
          isConnected={state.activeSegment?.ap_id === state.selectedAP.id}
          onBack={() => {
            state.setSelectedAP(null)
            state.setCurrentScreen("main")
          }}
          onBuyBundle={(plan) => {
            state.setSelectedPlan(plan)
            state.setShowBundlePurchaseConfirm(true)
          }}
          onResume={() => {
            if (state.selectedAP) state.resumeSession(state.selectedAP)
          }}
          onAddFunds={() => state.setShowRechargeSheet(true)}
        />
        {/* Purchase Confirm Sheet — needs to be available from here too */}
        {state.showBundlePurchaseConfirm && state.selectedPlan && state.selectedAP && (
          <PurchaseConfirmSheet
            plan={state.selectedPlan}
            ap={state.selectedAP}
            walletBalance={state.user?.wallet_balance_xaf || 0}
            onClose={() => {
              state.setShowBundlePurchaseConfirm(false)
              state.setSelectedPlan(null)
            }}
            onConfirm={() => {
              if (state.selectedPlan && state.selectedAP) {
                state.purchaseBundle(state.selectedPlan, state.selectedAP.id)
              }
            }}
          />
        )}
        {state.showRechargeSheet && (
          <RechargeSheet
            onClose={() => state.setShowRechargeSheet(false)}
            onRecharge={(amount, method) => state.rechargeWallet(amount, method)}
            userPhone={state.user?.phone || ""}
          />
        )}
      </MobileShell>
    )
  }

  // App settings
  if (state.currentScreen === "settings") {
    return (
      <MobileShell>
        <SettingsScreen
          onBack={() => state.setCurrentScreen("main")}
          onLogout={() => {
            state.logout()
            state.setCurrentScreen("main")
          }}
        />
      </MobileShell>
    )
  }

  // Rewards screen
  if (state.currentScreen === "rewards") {
    return (
      <MobileShell>
        <RewardsScreen
          onBack={() => state.setCurrentScreen("main")}
          referralCode={state.user?.referral_code || ""}
          friendsSignedUp={state.referralStats.friends_signed_up}
          friendsPurchased={state.referralStats.friends_purchased}
          giftMinutes={state.referralStats.gift_minutes_remaining}
          onShare={() => {}}
          onCopyCode={() => {}}
        />
      </MobileShell>
    )
  }

  // Main app
  return (
    <MobileShell>
      {/* Header */}
      <TopHeader
        onMenuClick={() => state.setMenuOpen(true)}
        onNotificationsClick={() => state.setCurrentScreen("notifications")}
        unreadCount={state.unreadNotifications}
        transparent={state.activeTab === "map"}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {state.activeTab === "map" && (
          <MapScreen
            accessPoints={state.accessPoints}
            onAPSelect={state.setSelectedAP}
            onAPAccess={(ap) => {
              state.setSelectedAP(ap)
              state.setCurrentScreen("bundles")
            }}
            hasResumableBundle={!!state.activeBundle && state.remainingMinutes > 0 && !state.activeSegment}
            resumableBundleMinutes={state.remainingMinutes}
            activeAPId={state.activeSegment?.ap_id}
          />
        )}

        {state.activeTab === "sessions" && (
          <SessionsScreen
            bundles={state.bundles}
            segments={state.segments}
            activeSegment={state.activeSegment}
            sessionTimer={state.sessionTimer}
            onDisconnect={(segmentId) => state.endSession(segmentId)}
            onBuyBundle={() => state.setActiveTab("map")}
          />
        )}

        {state.activeTab === "wallet" && (
          <WalletScreen
            balance={state.user?.wallet_balance_xaf || 0}
            transactions={state.transactions}
            onAddFunds={() => state.setShowRechargeSheet(true)}
            onTransactionClick={() => {}}
          />
        )}

        {/* AP Detail Bottom Sheet */}
        {state.selectedAP && state.activeTab === "map" && (
          <APDetailSheet
            ap={state.selectedAP}
            plans={state.plans.filter(p => p.is_active)}
            onClose={() => state.setSelectedAP(null)}
            onBuyBundle={(plan) => {
              state.setSelectedPlan(plan)
              state.setShowBundlePurchaseConfirm(true)
            }}
            onResume={() => {
              if (state.selectedAP) {
                state.resumeSession(state.selectedAP)
              }
            }}
            onAddFunds={() => {
              state.setSelectedAP(null)
              state.setShowRechargeSheet(true)
            }}
            walletBalance={state.user?.wallet_balance_xaf || 0}
            hasResumableBundle={!!state.activeBundle && state.remainingMinutes > 0 && !state.activeSegment}
            resumableMinutes={state.remainingMinutes}
            isEligibleForTrial={!state.user?.first_trial_used_at}
            isConnected={state.activeSegment?.ap_id === state.selectedAP.id}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={state.activeTab}
        onTabChange={(tab) => {
          state.setActiveTab(tab)
          state.setSelectedAP(null)
        }}
        walletBalance={state.user?.wallet_balance_xaf || 0}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={state.menuOpen}
        onClose={() => state.setMenuOpen(false)}
        user={state.user ? {
          name: state.user.full_name,
          email: state.user.email,
          phone: state.user.phone,
          referralCode: state.user.referral_code,
        } : null}
        onNavigate={(screen) => {
          if (screen === "rewards" || screen === "profile" || screen === "settings" || screen === "help") {
            state.setCurrentScreen(screen)
          }
          state.setMenuOpen(false)
        }}
        onLogout={() => {
          state.logout()
          state.setMenuOpen(false)
        }}
      />

      {/* Recharge Sheet */}
      {state.showRechargeSheet && (
        <RechargeSheet
          onClose={() => state.setShowRechargeSheet(false)}
          onRecharge={(amount, method) => state.rechargeWallet(amount, method)}
          userPhone={state.user?.phone || ""}
        />
      )}

      {/* Purchase Confirm Sheet */}
      {state.showBundlePurchaseConfirm && state.selectedPlan && state.selectedAP && (
        <PurchaseConfirmSheet
          plan={state.selectedPlan}
          ap={state.selectedAP}
          walletBalance={state.user?.wallet_balance_xaf || 0}
          onClose={() => {
            state.setShowBundlePurchaseConfirm(false)
            state.setSelectedPlan(null)
          }}
          onConfirm={() => {
            if (state.selectedPlan && state.selectedAP) {
              state.purchaseBundle(state.selectedPlan, state.selectedAP.id)
              // Auto-start session after purchase
              setTimeout(() => {
                if (state.selectedAP) {
                  const newBundle = state.bundles[0]
                  if (newBundle) {
                    state.startSession(newBundle.id, state.selectedAP)
                  }
                }
              }, 100)
            }
          }}
        />
      )}
    </MobileShell>
  )
}
