"use client"

import { useState } from "react"
import { ArrowLeft, Lock, Globe, Bell, Loader2, LogOut, ChevronRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SettingsScreenProps {
  onBack: () => void
  onLogout: () => void
}

const LANG_KEY = "konnectik.lang"
const NOTIFS_KEY = "konnectik.notifs"

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const { user } = useAuth()

  // Section: password
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPwd, setSavingPwd] = useState(false)

  // Section: language (stored locally — UI hint only; i18n n'est pas branché)
  const [lang, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "fr"
    return window.localStorage.getItem(LANG_KEY) || "fr"
  })

  // Section: notifications (préférences stockées localement pour la démo)
  const [notifs, setNotifs] = useState(() => {
    if (typeof window === "undefined") return { session: true, payment: true, promo: false }
    try {
      return JSON.parse(window.localStorage.getItem(NOTIFS_KEY) || "") as { session: boolean; payment: boolean; promo: boolean }
    } catch {
      return { session: true, payment: true, promo: false }
    }
  })

  const setLangPersist = (next: string) => {
    setLang(next)
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, next)
    toast.success(next === "fr" ? "Langue: Français" : "Language: English")
  }

  const setNotifsPersist = (next: typeof notifs) => {
    setNotifs(next)
    if (typeof window !== "undefined") window.localStorage.setItem(NOTIFS_KEY, JSON.stringify(next))
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPwd(false)
    if (error) {
      toast.error("Échec", { description: error.message })
      return
    }
    toast.success("Mot de passe modifié")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordOpen(false)
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
    })
    if (error) {
      toast.error("Échec", { description: error.message })
      return
    }
    toast.success("Email de réinitialisation envoyé", {
      description: user.email,
    })
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
        <h1 className="ml-2 text-lg font-semibold">Paramètres</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Account */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">Compte</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground truncate">{user?.email ?? "—"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-foreground">Changer le mot de passe</span>
              <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", passwordOpen && "rotate-90")} />
            </button>
            {passwordOpen && (
              <form onSubmit={handlePasswordSave} className="px-4 py-3 space-y-3 bg-muted/30">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="new_password">Nouveau mot de passe</FieldLabel>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Au moins 6 caractères"
                      className="h-11"
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm_password">Confirmer</FieldLabel>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe"
                      className="h-11"
                      autoComplete="new-password"
                    />
                  </Field>
                </FieldGroup>
                <div className="flex gap-2">
                  <Button type="submit" disabled={savingPwd} className="flex-1 h-11">
                    {savingPwd ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…</> : "Enregistrer"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handlePasswordReset} className="h-11">
                    Envoyer un lien
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tu peux aussi recevoir un email pour réinitialiser ton mot de passe.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Language */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">Langue</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { code: "fr", label: "Français" },
              { code: "en", label: "English" },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLangPersist(l.code)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-foreground">{l.label}</span>
                {lang === l.code && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            La préférence est enregistrée. La traduction complète sera ajoutée plus tard.
          </p>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">Notifications</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { key: "session" as const, label: "Sessions Wi-Fi", desc: "Démarrage, fin, expiration bientôt" },
              { key: "payment" as const, label: "Paiements", desc: "Recharges, achats, échecs" },
              { key: "promo" as const, label: "Promotions & cadeaux", desc: "Bons plans et crédits offerts" },
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-3 px-4 py-3">
                <Bell className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifs[item.key]}
                  onCheckedChange={(v) => setNotifsPersist({ ...notifs, [item.key]: v })}
                />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Logout */}
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          className="w-full h-12 text-base font-medium text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>

        <p className="text-center text-xs text-muted-foreground pb-6">Konnectik · v1.0</p>
      </div>
    </div>
  )
}
