"use client"

import type { ReactNode } from "react"

interface MobileShellProps {
  children: ReactNode
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    // h-dvh = dynamic viewport height (handles mobile browser chrome correctly).
    // h-screen fallback for older browsers.
    <div className="h-dvh bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {children}
    </div>
  )
}
