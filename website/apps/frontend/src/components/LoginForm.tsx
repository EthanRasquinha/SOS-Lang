import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Mail, Lock, ArrowRight, X } from "lucide-react"
import sosLogo from "../../assets/sos-logo.png"
import { supabase } from "@/lib/supabaseClient"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type LoginFormProps = {
  onSuccess: () => void;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
};

export const LoginForm = ({ onSuccess, open, onClose, children }: LoginFormProps) => {
  if (!open) return null;

  const [loading, setLoading] = React.useState(false);
  const [focused, setFocused] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast("Login failed", { description: error.message, position: "bottom-right" });
      setLoading(false);
      return;
    }

    toast("Login successful!", { description: "¡Bienvenidos!", position: "bottom-right" });
    setLoading(false);
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(4, 9, 20, 0.85)",
        backdropFilter: "blur(12px)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Glow orbs behind card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,101,5,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1f35 0%, #080f1a 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(220,101,5,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #dc6505, transparent)" }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <X size={14} />
        </button>

        {children}

        <div className="px-8 pt-9 pb-8">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "white",
                border: "1px solid rgba(220,101,5,0.25)",
                boxShadow: "0 8px 24px rgba(220,101,5,0.15)",
              }}
            >
              <img src={sosLogo} className="w-9 h-10" alt="SOS-Lang" />
            </div>
            <h1 className="text-white font-semibold text-2xl tracking-wide">SOS-LANG</h1>
            <p className="text-slate-500 text-xs mt-1 tracking-widest uppercase font-medium">¡Bienvenidos!</p>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Form */}
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Email field */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Correo electrónico
                  </label>
                  <div
                    className="relative flex items-center rounded-xl transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        fieldState.invalid
                          ? "rgba(239,68,68,0.5)"
                          : focused === "email"
                          ? "rgba(220,101,5,0.5)"
                          : "rgba(255,255,255,0.07)"
                      }`,
                      boxShadow: focused === "email" ? "0 0 0 3px rgba(220,101,5,0.08)" : "none",
                    }}
                  >
                    <Mail size={14} className="absolute left-3.5 text-slate-600" />
                    <input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      disabled={loading}
                      onFocus={() => setFocused("email")}
                      onBlur={() => { setFocused(null); field.onBlur(); }}
                      className="w-full h-11 pl-9 pr-4 bg-transparent text-white text-sm placeholder:text-slate-700 outline-none rounded-xl"
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-red-400 mt-0.5">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {/* Password field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Contraseña
                  </label>
                  <div
                    className="relative flex items-center rounded-xl transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        fieldState.invalid
                          ? "rgba(239,68,68,0.5)"
                          : focused === "password"
                          ? "rgba(220,101,5,0.5)"
                          : "rgba(255,255,255,0.07)"
                      }`,
                      boxShadow: focused === "password" ? "0 0 0 3px rgba(220,101,5,0.08)" : "none",
                    }}
                  >
                    <Lock size={14} className="absolute left-3.5 text-slate-600" />
                    <input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      onFocus={() => setFocused("password")}
                      onBlur={() => { setFocused(null); field.onBlur(); }}
                      className="w-full h-11 pl-9 pr-4 bg-transparent text-white text-sm placeholder:text-slate-700 outline-none rounded-xl"
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-red-400 mt-0.5">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(220,101,5,0.5)"
                  : "linear-gradient(135deg, #dc6505 0%, #b85204 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(220,101,5,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(220,101,5,0.45)";
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(220,101,5,0.3)";
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Iniciar sesión...
                </>
              ) : (
                <>
                  Siguente
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}