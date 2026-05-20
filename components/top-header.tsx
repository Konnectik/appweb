"use client"

import { Menu, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TopHeaderProps {
  onMenuClick: () => void
  onNotificationsClick: () => void
  unreadCount?: number
  transparent?: boolean
}

export function TopHeader({ 
  onMenuClick, 
  onNotificationsClick, 
  unreadCount = 0,
  transparent = false 
}: TopHeaderProps) {
  return (
    <header className={cn(
      "flex items-center justify-between px-4 h-14 safe-area-inset-top z-1000 shrink-0",
      transparent
        ? "bg-card/85 backdrop-blur-md border-b border-border/60 relative"
        : "bg-card border-b border-border relative"
    )}>
      <button
        type="button"
        onClick={onMenuClick}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          transparent ? "bg-card/90 backdrop-blur-sm shadow-sm" : "hover:bg-muted"
        )}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex items-center gap-2">
        <Image
          src="/logo-red.png"
          alt="Konnectik"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
          priority
        />
        <span className="font-semibold text-lg text-foreground tracking-tight">Konnectik</span>
      </div>

      <button
        type="button"
        onClick={onNotificationsClick}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors relative",
          transparent ? "bg-card/90 backdrop-blur-sm shadow-sm" : "hover:bg-muted"
        )}
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}
