import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ServiceWorkerRegister } from "@/components/sw-register"
import { InstallPrompt } from "@/components/install-prompt"
import { PushSubscribe } from "@/components/push-subscribe"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Konnectik",
  description: "Wi-Fi connectivity that follows you",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-red.png",
    apple: "/logo-red.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Konnectik",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E42320",
  viewportFit: "cover",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          {/* PushSubscribe must live inside <Providers> because it calls useAuth(). */}
          <PushSubscribe />
        </Providers>
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  )
}
