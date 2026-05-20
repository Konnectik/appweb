"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

interface RegisterScreenProps {
  onRegister: (data: { name: string; email: string; password: string; referralCode?: string }) => void
  onGoogleRegister: () => void
  onLogin: () => void
  onBack: () => void
  prefillReferralCode?: string
  busy?: boolean
  error?: string | null
}

export function RegisterScreen({
  onRegister,
  onGoogleRegister,
  onLogin,
  onBack,
  prefillReferralCode,
  busy,
  error,
}: RegisterScreenProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState(prefillReferralCode || "")
  const [showPassword, setShowPassword] = useState(false)
  const [pwdMismatch, setPwdMismatch] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setPwdMismatch(true)
      return
    }
    if (password.length < 6) {
      setPwdMismatch(false)
      return
    }
    setPwdMismatch(false)
    onRegister({ name, email, password, referralCode: referralCode || undefined })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center h-14 px-4 safe-area-inset-top">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Logo Section */}
      <div className="flex flex-col items-center px-8 pt-4 pb-8">
        <Image
          src="/logo-red.png"
          alt="Konnectik"
          width={64}
          height={64}
          className="w-16 h-16 mb-3 object-contain"
          priority
        />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Create Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Join the Konnectik network</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoComplete="name"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                autoComplete="email"
              />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirmer le mot de passe</FieldLabel>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Retapez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (pwdMismatch) setPwdMismatch(false)
                }}
                className="h-12"
                autoComplete="new-password"
              />
              {pwdMismatch && (
                <p className="text-xs text-destructive mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="referral">Referral Code (optional)</FieldLabel>
              <Input
                id="referral"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="h-12 uppercase"
                maxLength={8}
              />
            </Field>
          </FieldGroup>

          {error && (
            <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy} className="w-full h-12 text-base font-semibold">
            {busy ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onGoogleRegister}
          disabled={busy}
          className="w-full h-12 text-base font-medium"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
