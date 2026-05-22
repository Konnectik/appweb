"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, ArrowLeft, User, Mail, Phone, Calendar, Gift } from "lucide-react"

interface RegisterScreenProps {
  onRegister: (data: {
    name: string
    email: string
    password: string
    phone?: string
    date_of_birth?: string
    terms_agreed?: boolean
    referralCode?: string
  }) => void
  onGoogleRegister: () => void
  onLogin: () => void
  onBack: () => void
  prefillReferralCode?: string
  busy?: boolean
  error?: string | null
}

function normalizeCmPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00237")) return digits.slice(2)
  if (digits.startsWith("237") && digits.length === 12) return digits
  if (digits.length === 9 && digits.startsWith("6")) return `237${digits}`
  return null
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
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [referralCode, setReferralCode] = useState(prefillReferralCode || "")
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!termsAgreed) {
      setLocalError("Vous devez accepter les conditions d'utilisation.")
      return
    }
    if (password !== confirmPwd) {
      setLocalError("Les mots de passe ne correspondent pas.")
      return
    }
    if (password.length < 6) {
      setLocalError("Le mot de passe doit faire au moins 6 caractères.")
      return
    }
    const normalizedPhone = phone ? normalizeCmPhone(phone) : null
    if (phone && !normalizedPhone) {
      setLocalError("Numéro invalide. Format: 6XXXXXXXX ou +237 6XXXXXXXX.")
      return
    }

    onRegister({
      name,
      email,
      password,
      phone: normalizedPhone || undefined,
      date_of_birth: dob || undefined,
      terms_agreed: termsAgreed,
      referralCode: referralCode || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col pt-[env(safe-area-inset-top)]">
      {/* Top bar */}
      <header className="flex items-center h-14 px-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <span className="ml-1 text-sm text-muted-foreground">Signup</span>
      </header>

      {/* White card with content */}
      <div className="flex-1 mx-4 mb-4 bg-card rounded-2xl shadow-sm px-5 py-6 overflow-y-auto">
        {/* Logo block */}
        <div className="flex flex-col items-center mb-5">
          <div className="border-2 border-blue-500 rounded-xl p-3 mb-4">
            <Image
              src="/logo-red.png"
              alt="Konnectik"
              width={56}
              height={56}
              className="w-14 h-14 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold italic text-foreground tracking-tight">Get Started</h1>
          <p className="text-xs text-muted-foreground mt-1">by creating a free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="full_name" className="sr-only">Nom complet</FieldLabel>
              <div className="relative">
                <Input
                  id="full_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="h-12 bg-muted/60 border-0 pr-10"
                  autoComplete="name"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="email" className="sr-only">Email</FieldLabel>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Valid Email"
                  required
                  className="h-12 bg-muted/60 border-0 pr-10"
                  autoComplete="email"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="phone" className="sr-only">Téléphone</FieldLabel>
              <div className="relative flex items-center gap-2 h-12 bg-muted/60 rounded-md px-2">
                <span className="text-base shrink-0">🇨🇲</span>
                <span className="text-xs text-muted-foreground shrink-0">+237</span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="flex-1 h-9 bg-transparent border-0 pr-8 focus-visible:ring-0"
                  autoComplete="tel"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="dob" className="sr-only">Date de naissance</FieldLabel>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="Date of Birth"
                  className="h-12 bg-muted/60 border-0 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="sr-only">Mot de passe</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="h-12 bg-muted/60 border-0 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm" className="sr-only">Confirmer</FieldLabel>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm Password"
                required
                className="h-12 bg-muted/60 border-0"
                autoComplete="new-password"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="referral" className="sr-only">Code de parrainage</FieldLabel>
              <div className="relative">
                <Input
                  id="referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Referral Code (Optional)"
                  maxLength={8}
                  className="h-12 bg-muted/60 border-0 pr-10 uppercase"
                />
                <Gift className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </Field>
          </FieldGroup>

          {/* Terms */}
          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
            <Checkbox
              checked={termsAgreed}
              onCheckedChange={(v) => setTermsAgreed(v === true)}
              className="mt-0.5"
            />
            <span>
              By checking the box you agree to our{" "}
              <a href="#" className="text-primary font-medium">Terms</a> and{" "}
              <a href="#" className="text-primary font-medium">Conditions</a>
            </span>
          </label>

          {(localError || error) && (
            <p role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {localError || error}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2 pb-1">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">Or Register With</span>
            <Separator className="flex-1" />
          </div>

          {/* Google only — no Apple */}
          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={onGoogleRegister}
              disabled={busy}
              className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              aria-label="Continue with Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>

          <Button type="submit" disabled={busy} className="w-full h-12 text-base font-semibold mt-2">
            {busy ? "Création…" : "Next"}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already a member?{" "}
            <button type="button" onClick={onLogin} className="text-primary font-semibold">
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
