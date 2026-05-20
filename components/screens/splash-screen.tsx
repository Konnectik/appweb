"use client"

import Image from "next/image"

export function SplashScreen() {
  return (
    <div className="min-h-screen h-dvh bg-primary flex flex-col items-center justify-center px-8">
      <Image
        src="/logo-white.png"
        alt="Konnectik"
        width={120}
        height={120}
        className="w-28 h-28 object-contain mb-6"
        priority
      />
      <h1 className="text-3xl font-extrabold italic text-white tracking-tight">Konnectik</h1>
      <p className="text-white/80 text-sm mt-2">Wi-Fi that follows you</p>
      <div className="mt-10 w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
    </div>
  )
}
