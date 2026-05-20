"use client"

import { ArrowLeft, Wifi, Wallet, Gift, MapPin, Bell, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { type AppNotification, type NotificationCategory, formatRelativeTime } from "@/lib/mock-data"

interface NotificationsScreenProps {
  notifications: AppNotification[]
  onBack: () => void
  onNotificationClick: (notification: AppNotification) => void
  onMarkAllRead: () => void
}

export function NotificationsScreen({ 
  notifications, 
  onBack, 
  onNotificationClick,
  onMarkAllRead 
}: NotificationsScreenProps) {
  const unreadCount = notifications.filter(n => !n.read_at).length

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "proximity":
        return MapPin
      case "session":
        return Wifi
      case "payment":
        return Wallet
      case "reward":
        return Gift
      case "system":
        return Bell
    }
  }

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case "proximity":
        return "bg-[#F59E0B]/10 text-[#F59E0B]"
      case "session":
        return "bg-[#22C55E]/10 text-[#22C55E]"
      case "payment":
        return "bg-primary/10 text-primary"
      case "reward":
        return "bg-[#8B5CF6]/10 text-[#8B5CF6]"
      case "system":
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 h-14 px-4 border-b border-border safe-area-inset-top">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllRead}
            className="text-primary gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </header>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-8 py-16">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell className="w-5 h-5" />
                </EmptyMedia>
                <EmptyTitle>No notifications</EmptyTitle>
                <EmptyDescription>{"You're all caught up!"}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = getCategoryIcon(notification.category)
              const isUnread = !notification.read_at
              
              return (
                <button
                  key={notification.id}
                  onClick={() => onNotificationClick(notification)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors active:bg-muted",
                    isUnread && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    getCategoryColor(notification.category)
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm text-foreground",
                        isUnread && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
