"use client"

import { Wallet, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabId = "map" | "sessions" | "wallet"

interface BottomNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  walletBalance?: number
}

export function BottomNavigation({ activeTab, onTabChange, walletBalance = 0 }: BottomNavigationProps) {
  const tabs = [
    { id: "wallet" as const, label: "Wallet", icon: Wallet, badge: walletBalance > 0 ? `${walletBalance.toLocaleString()}` : undefined },
    { id: "map" as const, label: "Map", icon: MapPin },
    { id: "sessions" as const, label: "Sessions", icon: Clock },
  ]

  return (
    <nav className="bg-card border-t border-border safe-area-inset-bottom shrink-0 z-1000 relative">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isMap = tab.id === "map"
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isMap ? (
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center -mt-6 shadow-lg transition-all",
                  isActive ? "bg-primary" : "bg-muted"
                )}>
                  <Icon className={cn("w-6 h-6", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {tab.badge && (
                      <span className="absolute -top-2 -right-3 text-[10px] font-medium text-primary">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
