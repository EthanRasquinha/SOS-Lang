import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PieChart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ucaEmblem from '../../../assets/UCA-emblem.png';
import sosLogo from '../../../assets/sos-logo.png';

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Icons ──────────────────────────────────────────────
const IconNote = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCards = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
  </svg>
);
const IconMCQ = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5"/>
  </svg>
);
const IconTrend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Types ──────────────────────────────────────────────
type DistributionKeys = "passed" | "failed" | "stale" | "not-attempted";

interface QuizResult {
  score: number;
  total: number;
  completed_at: string;
}

// ── Data ───────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconNote />,
    gradient: "from-[#dc6505] to-[#f59e0b]",
    glow: "rgba(220,101,5,0.35)",
    border: "border-[#dc6505]/25",
    bg: "bg-[#dc6505]/8",
    title: "Apuntes etiquetadas",
    body: "Captura vocabulario, reglas gramaticales, frases e información cultural — cada nota etiquetada por categoría para filtrado instantáneo.",
  },
  {
    icon: <IconCards />,
    gradient: "from-[#185FA5] to-[#38bdf8]",
    glow: "rgba(24,95,165,0.35)",
    border: "border-[#185FA5]/25",
    bg: "bg-[#185FA5]/8",
    title: "Tarjetas con IA",
    body: "Convierte cualquier nota en un juego de tarjetas automáticamente. Repasa de cara a cara y deja que la app registre lo que ya sabes.",
  },
  {
    icon: <IconMCQ />,
    gradient: "from-[#0F6E56] to-[#34d399]",
    glow: "rgba(15,110,86,0.35)",
    border: "border-[#0F6E56]/25",
    bg: "bg-[#0F6E56]/8",
    title: "Exámenes de opción múltiple",
    body: "Pon a prueba tu comprensión real con preguntas de opción múltiple generadas por IA a partir de tus propias notas.",
  },
  {
    icon: <IconTrend />,
    gradient: "from-[#534AB7] to-[#a78bfa]",
    glow: "rgba(83,74,183,0.35)",
    border: "border-[#534AB7]/25",
    bg: "bg-[#534AB7]/8",
    title: "Señales de revisión inteligente",
    body: "Cada conjunto está codificado por colores — aprobado, necesita repaso, pendiente o sin comenzar — para que siempre sepas qué abrir a continuación.",
  },
];

const HOW_TO_USE = [
  {
    step: "01",
    color: "text-[#dc6505]",
    bg: "bg-[#dc6505]/10 border-[#dc6505]/20",
    title: "Escribe una nota",
    body: "Ve a la sección de Apuntes y crea tu primera nota. Etiquétala con una categoría — Vocabulario, Gramática, Frases o Información Cultural — para que puedas filtrarla y encontrarla al instante más adelante.",
  },
  {
    step: "02",
    color: "text-[#185FA5]",
    bg: "bg-[#185FA5]/10 border-[#185FA5]/20",
    title: "Genera un conjunto de estudio",
    body: "Con un solo clic, la IA transforma cualquier nota en un juego de tarjetas o un examen de opción múltiple. Sin esfuerzo adicional — solo abre una nota y pulsa Generar.",
  },
  {
    step: "03",
    color: "text-[#0F6E56]",
    bg: "bg-[#0F6E56]/10 border-[#0F6E56]/20",
    title: "Repasa y haz seguimiento de tu progreso",
    body: "Cada conjunto está codificado por colores para mostrarte de un vistazo qué has aprobado, qué necesita más trabajo y qué está pendiente de repaso. SOS-LANG lleva el registro — tú solo estudia.",
  },
];

const STATUS_PILLS = [
  { label: "Sin comenzar",   dot: "bg-slate-400",   ring: "ring-slate-400/30",   card: "bg-slate-500/10 border-slate-500/20",   desc: "Todavía no lo has intentado" },
  { label: "Aprobado",       dot: "bg-emerald-400", ring: "ring-emerald-400/30", card: "bg-emerald-500/10 border-emerald-500/20", desc: "Puntuación media ≥ 80 %" },
  { label: "Necesita repaso",dot: "bg-red-400",     ring: "ring-red-400/30",     card: "bg-red-500/10 border-red-500/20",         desc: "Puntuación media < 80 %" },
  { label: "Pendiente",      dot: "bg-amber-400",   ring: "ring-amber-400/30",   card: "bg-amber-500/10 border-amber-500/20",     desc: "Sin repasar en 3 días" },
];

// ── Helpers ────────────────────────────────────────────
const getMaterialStatus = (results: QuizResult[] | null): DistributionKeys => {
  if (!results || results.length === 0) return "not-attempted";
  const now = Date.now();
  const last = results.reduce((a, b) =>
    new Date(a.completed_at) > new Date(b.completed_at) ? a : b
  );
  const days = (now - new Date(last.completed_at).getTime()) / 86_400_000;
  if (days > 3) return "stale";
  const avg =
    results.reduce((s, r) => s + (r.total ? (r.score / r.total) * 100 : 0), 0) /
    results.length;
  return avg >= 80 ? "passed" : "failed";
};

const fetchResultsForSet = async (
  setId: string,
  token: string
): Promise<QuizResult[] | null> => {
  const res = await fetch(
    `https://sos-lang.onrender.com/ai/quiz-results/${setId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.quiz_results || null;
};

// ── Widget de progreso ─────────────────────────────────
const MasterySnapshot: React.FC = () => {
  const [distribution, setDistribution] = useState<Record<DistributionKeys, number>>({
    passed: 0, failed: 0, stale: 0, "not-attempted": 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [flashRes, mcqRes] = await Promise.all([
          fetch("https://sos-lang.onrender.com/ai/flashcard-sets", { headers }),
          fetch("https://sos-lang.onrender.com/ai/mcq-sets", { headers }),
        ]);

        const flashData = flashRes.ok ? await flashRes.json() : { flashcard_sets: [] };
        const mcqData = mcqRes.ok ? await mcqRes.json() : { mcq_sets: [] };
        const allSets = [
          ...(flashData.flashcard_sets || []),
          ...(mcqData.mcq_sets || []),
        ];

        if (allSets.length === 0) { setLoading(false); return; }

        const statuses = await Promise.all(
          allSets.map((set: any) =>
            fetchResultsForSet(set.id, token).then(getMaterialStatus)
          )
        );

        const dist: Record<DistributionKeys, number> = {
          passed: 0, failed: 0, stale: 0, "not-attempted": 0,
        };
        statuses.forEach((s) => dist[s]++);
        setDistribution(dist);
        setHasData(true);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = {
    labels: ["Dominado", "Necesita repaso", "Pendiente de revisión", "Sin comenzar"],
    datasets: [{
      data: [
        distribution.passed,
        distribution.failed,
        distribution.stale,
        distribution["not-attempted"],
      ],
      backgroundColor: ["#22c55e", "#ef4444", "#f59e0b", "#475569"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  const LEGEND = [
    { label: "Dominado",              key: "passed"        as DistributionKeys, color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
    { label: "Necesita repaso",       key: "failed"        as DistributionKeys, color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    { label: "Pendiente de revisión", key: "stale"         as DistributionKeys, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Sin comenzar",          key: "not-attempted" as DistributionKeys, color: "#475569", bg: "rgba(71,85,105,0.15)" },
  ];
  

  

  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0d1f35, #0a1828)" }}
    >
        
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
            Distribución del rendimiento
          </p>
          <h3 className="text-sm font-bold text-white mt-0.5">Tu progreso actual</h3>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(220,101,5,0.1)", color: "#dc6505" }}
        >
          <PieChart size={16} />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div
              className="w-6 h-6 rounded-full border-2"
              style={{
                borderColor: "rgba(220,101,5,0.3)",
                borderTopColor: "#dc6505",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(220,101,5,0.1)", color: "#dc6505" }}
            >
              <PieChart size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Aún no tienes conjuntos de estudio</p>
              <p className="text-[12px] text-slate-500 mt-1">
                Escribe tu primera nota y genera un conjunto para ver tu progreso aquí.
              </p>
            </div>
            <Link
              to="/notes"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 text-white"
              style={{
                background: "linear-gradient(135deg, #dc6505, #f59e0b)",
                boxShadow: "0 0 20px rgba(220,101,5,0.3)",
              }}
            >
              Ir a mis apuntes <IconArrow />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0" style={{ width: 180, height: 180 }}>
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) =>
                          ` ${ctx.label}: ${ctx.raw} conjunto${Number(ctx.raw) !== 1 ? "s" : ""}`,
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              {LEGEND.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
                  />
                  <span className="text-[13px] text-slate-400 flex-1">{item.label}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: item.color, background: item.bg }}
                  >
                    {distribution[item.key]}
                  </span>
                  {total > 0 && (
                    <span className="text-[11px] text-slate-600 w-8 text-right">
                      {Math.round((distribution[item.key] / total) * 100)}%
                    </span>
                  )}
                </div>
              ))}

              <div className="mt-1 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Total de conjuntos registrados</span>
                <span className="text-sm font-bold text-white">{total}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ───────────────────────────────
export const RegisteredHomePage = () => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
    const TranslateBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div
    className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm"
    style={{
      background: "linear-gradient(90deg, rgba(24,95,165,0.18), rgba(83,74,183,0.14))",
      borderBottom: "1px solid rgba(56,189,248,0.15)",
    }}
  >
    <div
      className="pointer-events-none absolute left-0 top-0 h-full w-32 opacity-20"
      style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.4), transparent)" }}
    />

    <div className="flex items-center gap-2 shrink-0">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}
      >
        <IconGlobe />
      </div>
      <span className="text-slate-300 text-xs font-medium">
        <span className="text-sky-400 font-semibold">¿Prefieres otro idioma?</span>
        {" "}Puedes traducir esta página desde tu navegador —
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      {[
        "Haz clic en los tres puntos en la esquina superior derecha",
        "Selecciona “Traducir” o “Traducir esta página”",
        "Elige tu idioma",
      ].map((step, i) => (
        <React.Fragment key={i}>
          <span className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}
            >
              {i + 1}
            </span>
            {step}
          </span>
          {i < 2 && <span className="text-slate-600 hidden sm:inline">→</span>}
        </React.Fragment>
      ))}
    </div>

    <button
      onClick={onDismiss}
      className="shrink-0 ml-auto w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all"
      aria-label="Cerrar"
    >
      <IconX />
    </button>
  </div>
);
  return (
    <div className="min-h-screen w-full bg-[#06101a] text-white flex flex-col overflow-x-hidden font-[Poppins]">
      <style>{`
        @keyframes shimmer  { 0%   { background-position: 0%   center } 100% { background-position: 200% center } }
        @keyframes logo-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1)    }
          50%      { transform: translate(-50%, -50%) scale(1.04) }
        }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin     { to   { transform: rotate(360deg); } }
      `}</style>

      {!bannerDismissed && (
        <div style={{ animation: "banner-in 0.4s ease both" }}>
          <TranslateBanner onDismiss={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* HERO */}
      <section className="relative font-[Poppins] flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <img
          src={sosLogo} alt="" aria-hidden="true"
          className="pointer-events-none select-none absolute"
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-6deg)", width: "520px", opacity: 0.045, animation: "logo-drift 8s ease-in-out infinite", filter: "blur(1px)" }}
        />
        <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#dc6505]/15 blur-[130px]" />
        <div className="pointer-events-none absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-[#185FA5]/15 blur-[100px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-[#534AB7]/15 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center gap-0" style={{ animation: "fade-up 0.5s ease both" }}>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,1)]" />
            Bienvenido de vuelta
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-[Poppins] text-white max-w-3xl leading-[1.1] mb-6">
            Bienvenido a{" "}
            <span
              className="bg-clip-text font-[Poppins] text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#dc6505,#f59e0b,#dc6505)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite" }}
            >
              SOS-LANG
            </span>
          </h1>

          <p className="text-base font-[Poppins] text-slate-400 max-w-xl leading-relaxed mb-10" style={{ animation: "fade-up 0.6s ease 0.2s both" }}>
            Ahora podrás estudiar de manera más inteligente, divertida y efectiva, podrás recordar durante más tiempo lo aprendido y repasar con más facilidad lo que vayas olvidando
          </p>

          <Link
            to="/notes"
            className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#dc6505,#f59e0b)", boxShadow: "0 0 40px rgba(220,101,5,0.4)", animation: "fade-up 0.6s ease 0.35s both" }}
          >
            Ir a mis Apuntes <IconArrow />
          </Link>
        </div>
      </section>

      <main className="flex-1 flex flex-col gap-24 px-6 py-20 max-w-5xl mx-auto w-full">

        {/* PROGRESO + ACCESO RÁPIDO A NOTAS */}
        <section className="grid gap-6 md:grid-cols-[1fr_300px]">

          <MasterySnapshot />

          <div
            className="relative rounded-2xl border border-[#dc6505]/20 overflow-hidden flex flex-col justify-between gap-6 p-6"
            style={{ background: "linear-gradient(145deg,#0f1e2e,#0a1626)" }}
          >
            <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-[#dc6505]/10 blur-[60px]" />
            <div className="relative flex flex-col gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(220,101,5,0.12)", color: "#dc6505" }}
              >
                <IconNote />
              </div>
              <h3 className="text-base font-bold text-white">Tus Apuntes</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Todo tu vocabulario, reglas gramaticales y frases están aquí. Crea una nueva nota y genera un conjunto de estudio en segundos.
              </p>
            </div>
            <Link
              to="/notes"
              className="relative flex items-center justify-between gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#dc6505,#f59e0b)", boxShadow: "0 0 24px rgba(220,101,5,0.3)" }}
            >
              Abrir Apuntes <IconArrow />
            </Link>
          </div>
        </section>

        {/* CÓMO USAR */}
        <section className="flex flex-col gap-10">
          <div className="text-center font-[Poppins]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">Primeros pasos</p>
            <h2 className="text-3xl font-semibold font-[Poppins] text-white">Cómo usar SOS-LANG</h2>
          </div>
          <div className="flex flex-col gap-4">
            {HOW_TO_USE.map((s) => (
              <div key={s.step} className={`rounded-2xl border ${s.bg} p-6 flex gap-5 items-start hover:scale-[1.01] transition-all duration-200`}>
                <p className={`text-4xl font-bold ${s.color} opacity-55 min-w-[52px]`}>{s.step}</p>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARACTERÍSTICAS */}
        <section className="flex flex-col gap-10">
          <div className="text-center font-[Poppins]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">Qué puedes hacer con SOS-LANG</p>
            <h2 className="text-3xl font-semibold font-[Poppins] text-white">Todo lo que necesitas para progresar más rápido</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className={`group relative rounded-2xl border ${f.border} ${f.bg} hover:scale-[1.02] transition-all duration-200 p-6 flex flex-col gap-4 overflow-hidden`}>
                <div className="pointer-events-none absolute top-0 left-0 w-32 h-32 rounded-full blur-[60px] opacity-40" style={{ background: f.glow }} />
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${f.gradient}`} style={{ boxShadow: `0 0 20px ${f.glow}` }}>
                  {f.icon}
                </div>
                <div className="relative">
                  <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEÑALES DE REVISIÓN */}
        <section className="flex flex-col gap-8">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">
              SOS-LANG te dice qué sabes y qué necesitas repasar
            </p>
            <h2 className="text-3xl font-semibold text-white mb-3 font-[Poppins]">Sabe exactamente qué estudiar a continuación</h2>
            <p className="text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">
              Cada conjunto se codifica automáticamente por colores según tu rendimiento y cuándo lo repasaste por última vez.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_PILLS.map((s) => (
              <div key={s.label} className={`rounded-xl border ${s.card} px-4 py-5 flex flex-col gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ${s.ring}`}>
                  <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{s.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* DESARROLLADO POR */}
      <section className="w-full py-10 px-6 pb-10 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] grid md:grid-cols-[1fr_1.6fr]">
          <div className="bg-white flex flex-col items-center justify-center gap-4 px-10 py-10">
            <p className="text-[20px] font-semibold uppercase tracking-[0.3em] text-slate-700">DESARROLLADO POR</p>
            <img src={ucaEmblem} alt="CUNEAC" className="w-full max-w-[200px] object-contain" />
            <p className="text-[18px] font-semibold font-[Poppins] text-slate-700 tracking-wide">CUNEAC</p>
          </div>
          <div
            className="relative flex flex-col justify-center gap-5 px-8 py-10 overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0d1e35 0%,#0e1a30 100%)" }}
          >
            <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 rounded-full bg-[#185FA5]/20 blur-[70px]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#185FA5]/30 bg-[#185FA5]/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#38bdf8]">
                Coordinación Académica
              </div>
              <p className="text-[13px] font-[Poppins] text-slate-300 leading-relaxed max-w-md">
                <span className="text-white font-semibold">CUNEAC — Centro Universitario para Europa del Este y Asia Central</span>
                <br />
                Una iniciativa internacional de la Universidad de Cádiz centrada en fomentar la colaboración académica, científica y cultural entre España, Europa del Este y Asia Central a través de proyectos, intercambios y programas educativos.
              </p>
              <p className="text-[13px] font-[Poppins] text-slate-500 leading-relaxed max-w-md">
                A través de eventos, patrocinios y proyectos aplicados, CUNEAC tiende puentes entre el conocimiento en el aula y la experiencia práctica — respaldando herramientas creadas por estudiantes como SOS-LANG.
              </p>
              <div className="h-px w-16 bg-[#185FA5]/40" />
              <div className="flex items-center gap-6">
                {[{ val: "UCA", label: "Universidad" }, { val: "Cádiz", label: "España" }, { val: "2026", label: "Colaboración" }].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white">{s.val}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="border-t border-white/[0.07] bg-[#06101a] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={sosLogo} alt="SOS-LANG" className="w-5 h-5 object-contain opacity-70" />
          <span className="text-xs font-semibold text-slate-500">SOS-LANG</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600">Respaldado por</span>
          <img src={ucaEmblem} alt="CUNEAC" className="h-4 object-contain opacity-40" />
          <span className="text-[11px] font-medium text-slate-500">CUNEAC</span>
        </div>
        <p className="text-xs text-slate-600">Diseñado para un repaso rápido y una retención significativa.</p>
      </footer>
    </div>
  );
};

export default RegisteredHomePage;