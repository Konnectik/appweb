"use client"

import { cn } from "@/lib/utils"

interface SignalBarsProps {
  strength: number // 0-5
  className?: string
}

export function SignalBars({ strength, className }: SignalBarsProps) {
  return (
    <div className={cn("flex items-end gap-0.5 h-4", className)}>
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-1 rounded-full transition-colors",
            bar <= strength ? "bg-[#22C55E]" : "bg-muted"
          )}
          style={{ height: `${(bar / 5) * 100}%` }}
        />
      ))}
    </div>
  )
}
