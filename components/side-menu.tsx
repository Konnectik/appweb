"use client"

import { X, User, Gift, Settings, HelpCircle, LogOut } from "lucide-react"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    email: string
    avatarUrl?: string
  }
  onNavigate: (screen: "profile" | "rewards" | "settings" | "help") => void
  onLogout: () => void
}

export function SideMenu({ isOpen, onClose, user, onNavigate, onLogout }: SideMenuProps) {
  const menuItems = [
    { id: "profile" as const, label: "My Profile", icon: User },
    { id: "rewards" as const, label: "Rewards & Gifts", icon: Gift },
    { id: "settings" as const, label: "Settings", icon: Settings },
    { id: "help" as const, label: "Help & Support", icon: HelpCircle },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-card z-50 flex flex-col transition-transform duration-300 safe-area-inset-top shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors -mr-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <Separator />

        {/* Logout */}
        <div className="p-2 safe-area-inset-bottom">
          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-destructive/10 transition-colors text-left rounded-lg"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Log Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 safe-area-inset-bottom">
          <div className="flex items-center gap-2 opacity-50">
            <Image
              src="/logo.svg"
              alt="Konnectik"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="text-xs text-muted-foreground">Konnectik v1.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}
