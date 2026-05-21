"use client"

import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProfileSettingsScreenProps {
  onBack: () => void
}

// Normalize phone to 237XXXXXXXXX (12 digits) — same rule as the edge function.
function normalizeCmPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00237")) return digits.slice(2)
  if (digits.startsWith("237") && digits.length === 12) return digits
  if (digits.length === 9 && digits.startsWith("6")) return `237${digits}`
  return null
}

export function ProfileSettingsScreen({ onBack }: ProfileSettingsScreenProps) {
  const { user, profile, refreshProfile } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [address, setAddress] = useState(profile?.address ?? "")
  const [dob, setDob] = useState(profile?.date_of_birth ?? "")
  const [gender, setGender] = useState(profile?.gender ?? "")
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const updates: Record<string, string | null> = {
      full_name: fullName.trim() || profile?.full_name || "",
      address: address.trim() || null,
      date_of_birth: dob || null,
      gender: gender || null,
    }

    if (phone.trim()) {
      const normalized = normalizeCmPhone(phone)
      if (!normalized) {
        toast.error("Numéro invalide", {
          description: "Format attendu : 6XXXXXXXX ou +237 6XXXXXXXX",
        })
        setSaving(false)
        return
      }
      updates.phone = normalized
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)
    setSaving(false)

    if (error) {
      toast.error("Échec de l'enregistrement", { description: error.message })
      return
    }

    toast.success("Profil mis à jour")
    await refreshProfile()
    onBack()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center h-14 px-2 safe-area-inset-top border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="ml-2 text-lg font-semibold">Mon profil</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={user.email ?? ""} disabled className="h-12 opacity-70" />
          </Field>

          <Field>
            <FieldLabel htmlFor="full_name">Nom complet</FieldLabel>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
              className="h-12"
              autoComplete="name"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">
              Téléphone <span className="text-destructive">*</span>
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                Requis pour les recharges mobile money
              </span>
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="6XX XX XX XX"
              className="h-12"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dob">Date de naissance</FieldLabel>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="h-12"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="gender">Genre</FieldLabel>
            <div className="flex gap-2">
              {[
                { value: "male", label: "Homme" },
                { value: "female", label: "Femme" },
                { value: "other", label: "Autre" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`flex-1 h-11 rounded-md border-2 text-sm font-medium transition-colors ${
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

          <Field>
            <FieldLabel htmlFor="address">Adresse</FieldLabel>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ville, quartier"
              className="h-12"
              autoComplete="street-address"
            />
          </Field>

          {profile?.referral_code && (
            <Field>
              <FieldLabel htmlFor="referral">Code de parrainage</FieldLabel>
              <Input id="referral" value={profile.referral_code} disabled className="h-12 opacity-70 font-mono" />
            </Field>
          )}
        </FieldGroup>

        <Button type="submit" disabled={saving} className="w-full h-12 text-base font-semibold">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </form>
    </div>
  )
}
