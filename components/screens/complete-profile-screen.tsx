"use client"

import { useState } from "react"
import { Loader2, Phone, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface CompleteProfileScreenProps {
  onDone: () => void
}

function normalizeCmPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00237")) return digits.slice(2)
  if (digits.startsWith("237") && digits.length === 12) return digits
  if (digits.length === 9 && digits.startsWith("6")) return `237${digits}`
  return null
}

const GENDERS = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
]

export function CompleteProfileScreen({ onDone }: CompleteProfileScreenProps) {
  const { user, profile, refreshProfile } = useAuth()

  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [dob, setDob] = useState(profile?.date_of_birth ?? "")
  const [gender, setGender] = useState(profile?.gender ?? "")
  const [terms, setTerms] = useState(!!profile?.terms_agreed_at)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)

    if (!phone.trim()) return setErr("Numéro de téléphone requis.")
    const normalizedPhone = normalizeCmPhone(phone)
    if (!normalizedPhone) return setErr("Format invalide. Ex: 6XXXXXXXX.")
    if (!dob) return setErr("Date de naissance requise.")
    if (!gender) return setErr("Veuillez préciser votre genre.")
    if (!terms) return setErr("Vous devez accepter les conditions.")

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: normalizedPhone,
        date_of_birth: dob,
        gender,
        terms_agreed_at: new Date().toISOString(),
      })
      .eq("id", user.id)
    setSaving(false)

    if (error) {
      toast.error("Échec", { description: error.message })
      return
    }
    await refreshProfile()
    toast.success("Profil complété")
    onDone()
  }

  return (
    <div className="min-h-screen h-dvh bg-background flex flex-col">
      <header className="flex items-center h-14 px-5 safe-area-inset-top border-b border-border">
        <h1 className="text-lg font-semibold">Compléter votre profil</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-sm text-muted-foreground mb-6">
          Bienvenue {profile?.full_name || user.email} ! Quelques informations supplémentaires sont
          requises avant de continuer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="phone">Téléphone <span className="text-destructive">*</span></FieldLabel>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6XX XX XX XX"
                  className="h-12 pr-10"
                  autoComplete="tel"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Requis pour les recharges mobile money</p>
            </Field>

            <Field>
              <FieldLabel htmlFor="dob">Date de naissance <span className="text-destructive">*</span></FieldLabel>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-12 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">Genre <span className="text-destructive">*</span></FieldLabel>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={`flex-1 h-12 rounded-md border-2 text-sm font-medium transition-colors ${
                      gender === g.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>
          </FieldGroup>

          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-2">
            <Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} className="mt-0.5" />
            <span>
              J'accepte les <a className="text-primary font-medium" href="#">Termes</a> et{" "}
              <a className="text-primary font-medium" href="#">Conditions</a> d'utilisation de Konnectik.
            </span>
          </label>

          {err && (
            <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {err}
            </p>
          )}

          <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold mt-3">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…</> : "Continuer"}
          </Button>
        </form>
      </div>
    </div>
  )
}
