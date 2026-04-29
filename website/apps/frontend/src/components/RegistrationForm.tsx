import * as React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import sosLogo from '../../assets/sos-logo.png'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"

const formSchema = z.object({
  email: z.string().email("Por favor escribe una correo electronico valido."),
  password: z.string().min(6, "Su contraseña debe tener al menos 6 caracteres."),
  language: z.string().min(2, "Por favor selecciona un idioma."),
})

type RegistrationFormProps = {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

// --- Email verification success modal ---
function VerifyEmailModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", animation: "fade-in 0.2s ease both" }}
    >
      <div
        className="relative max-w-sm w-full rounded-3xl p-8 text-center flex flex-col items-center gap-5 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0d1f35 0%, #0a1628 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(56,189,248,0.08), 0 30px 80px rgba(0,0,0,0.5)",
          animation: "slide-up 0.4s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }} />

        {/* Animated envelope icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl relative"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
            border: "1px solid rgba(249,115,22,0.25)",
            animation: "envelope-float 3s ease-in-out infinite",
          }}
        >
          ✉️
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center text-[9px] font-bold text-emerald-900">✓</div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Chequear su bandeja de entrada</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Nosotros enviamos un correo de verificación a
          </p>
          <p className="text-sky-400 font-semibold text-sm mt-1 break-all">{email}</p>
        </div>

        <div className="w-full bg-[#1a0f07] border border-orange-500/30 rounded-2xl p-4 text-orange-100 text-xs leading-relaxed text-left">
  <span className="text-orange-400 font-semibold">Tengas en cuenta:</span>{" "}
  Debe verificar tu correo electrónico antes de poder iniciar sesión. Revise tu carpeta de spam si no lo ve.
</div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            boxShadow: "0 0 24px rgba(249,115,22,0.35)",
          }}
        >
          Got it →
        </button>
      </div>
    </div>
  )
}

// --- LANGuage flags ---
const LANGUAGES = [
  { value: "russian",  label: "Russian",  flag: "🇷🇺" },
  { value: "spanish",  label: "Spanish",  flag: "🇪🇸" },
  { value: "english",  label: "English",  flag: "🇬🇧" },
]

const GLOBAL_STYLES = `
  @keyframes fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes envelope-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .reg-input {
    width: 100%;
    padding: 0 1rem;
    height: 3rem;
    border-radius: 0.875rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    color: white;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .reg-input::placeholder { color: rgba(148,163,184,0.5); }
  .reg-input:focus {
    border-color: rgba(14,165,233,0.6);
    box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
  }
  .reg-input[aria-invalid="true"] {
    border-color: rgba(248,113,113,0.5);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
  }
  .field-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(148,163,184,0.8);
    margin-bottom: 0.4rem;
  }
`

export const RegistrationForm = ({ onSuccess, open, onClose, children }: RegistrationFormProps) => {
  const [loading, setLoading] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", language: "" },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    const languageMap: Record<string, number> = { english: 0, spanish: 1, russian: 2 }
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { language: languageMap[data.language] } },
    })
    setLoading(false)

    if (error) {
      toast("Registro fallido", { description: error.message, position: "bottom-right" })
      return
    }

    setVerifyEmail(data.email)
  }

  const handleVerifyClose = () => {
    setVerifyEmail(null)
    onSuccess()
  }

  if (!open) return null

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* Email verification overlay */}
      {verifyEmail && <VerifyEmailModal email={verifyEmail} onClose={handleVerifyClose} />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Card */}
        <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(160deg, #0e1f35 0%, #090f1e 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            animation: "modal-in 0.4s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)" }} />

          {/* Ambient glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-10"
            style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/8 text-sm z-10"
          >
            ✕
          </button>

          <div className="px-8 pt-8 pb-7 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "white",
                  border: "1px solid rgba(249,115,22,0.3)",
                  boxShadow: "0 0 30px rgba(249,115,22,0.15)",
                }}
              >
                <img src={sosLogo} className="w-8 h-9 object-contain" alt="SOS-LANG" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Crea una cuenta</h2>
                <p className="text-slate-500 text-sm mt-1">Unete a SOS-LANG y comienza a aprender hoy</p>
              </div>
            </div>

            {children}

            {/* Form */}
            <form id="reg-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="field-label" htmlFor="reg-email">Correo electronico</label>
                    <input
                      {...field}
                      id="reg-email"
                      type="email"
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className="reg-input"
                    />
                    {fieldState.error && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="field-label" htmlFor="reg-password">Contraseña</label>
                    <input
                      {...field}
                      id="reg-password"
                      type="password"
                      placeholder="Mín. 6 caracteres"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className="reg-input"
                    />
                    {fieldState.error && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              {/* LANGuage */}
              <Controller
                name="language"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <label className="field-label">Idioma que estás aprendiendo</label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger
                        className="w-full h-12 rounded-[0.875rem] text-sm font-medium"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: fieldState.invalid ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(255,255,255,0.09)",
                          color: field.value ? "white" : "rgba(148,163,184,0.5)",
                        }}
                      >
                        <SelectValue placeholder="Elige un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </form>

            {/* Submit */}
            <button
              type="submit"
              form="reg-form"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
boxShadow: "0 0 24px rgba(249,115,22,0.35)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creando cuenta…
                </span>
              ) : (
                "Crear Cuenta →"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}