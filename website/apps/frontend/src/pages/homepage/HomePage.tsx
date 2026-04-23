import React, { useState } from 'react';
import { RegistrationForm } from '@/components/RegistrationForm';
import ucaEmblem from '../../../assets/UCA-emblem.png';
import sosLogo from '../../../assets/sos-logo.png';

// ── Icons ──────────────────────────────────────────────
const IconNote = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCards = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
  </svg>
);
const IconMCQ = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5"/>
  </svg>
);
const IconTrend = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FEATURES = [
  {
    icon: <IconNote />,
    gradient: "from-[#dc6505] to-[#f59e0b]",
    glow: "rgba(220,101,5,0.35)",
    border: "border-[#dc6505]/25",
    bg: "bg-[#dc6505]/8",
    title: "Tagged notes",
    body: "Capture vocabulary, grammar rules, phrases and cultural insights — each note tagged by category for instant filtering.",
  },
  {
    icon: <IconCards />,
    gradient: "from-[#185FA5] to-[#38bdf8]",
    glow: "rgba(24,95,165,0.35)",
    border: "border-[#185FA5]/25",
    bg: "bg-[#185FA5]/8",
    title: "AI flashcard sets",
    body: "Turn any note into a flip-card set automatically. Review front-to-back and let the app track what you know.",
  },
  {
    icon: <IconMCQ />,
    gradient: "from-[#0F6E56] to-[#34d399]",
    glow: "rgba(15,110,86,0.35)",
    border: "border-[#0F6E56]/25",
    bg: "bg-[#0F6E56]/8",
    title: "MCQ quizzes",
    body: "Test real comprehension with AI-generated multiple choice questions drawn directly from your own notes.",
  },
  {
    icon: <IconTrend />,
    gradient: "from-[#534AB7] to-[#a78bfa]",
    glow: "rgba(83,74,183,0.35)",
    border: "border-[#534AB7]/25",
    bg: "bg-[#534AB7]/8",
    title: "Smart review signals",
    body: "Every set is colour-coded — passed, needs review, due, or not started — so you always know what to open next.",
  },
];

const STEPS = [
  { step: "01", color: "text-[#dc6505]", bg: "bg-[#dc6505]/10 border-[#dc6505]/20", title: "Write a note", body: "Tag it as Vocabulary, Grammar, Phrases, and more." },
  { step: "02", color: "text-[#185FA5]", bg: "bg-[#185FA5]/10 border-[#185FA5]/20", title: "Generate a set", body: "AI creates flashcards or MCQ quizzes from your note in one click." },
  { step: "03", color: "text-[#0F6E56]", bg: "bg-[#0F6E56]/10 border-[#0F6E56]/20", title: "Review & track", body: "Each set shows your score history and tells you when to revisit." },
];

const STATUS_PILLS = [
  { label: "Not started", dot: "bg-slate-400",   ring: "ring-slate-400/30",   card: "bg-slate-500/10 border-slate-500/20",   desc: "Haven't attempted yet" },
  { label: "Passed",      dot: "bg-emerald-400", ring: "ring-emerald-400/30", card: "bg-emerald-500/10 border-emerald-500/20", desc: "Avg score ≥ 80%" },
  { label: "Needs review",dot: "bg-red-400",     ring: "ring-red-400/30",     card: "bg-red-500/10 border-red-500/20",         desc: "Avg score < 80%" },
  { label: "Due",         dot: "bg-amber-400",   ring: "ring-amber-400/30",   card: "bg-amber-500/10 border-amber-500/20",     desc: "Not reviewed in 3 days" },
];

// ── Google Translate Tip Banner ─────────────────────────
const TranslateBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div
    className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-sm"
    style={{
      background: "linear-gradient(90deg, rgba(24,95,165,0.18), rgba(83,74,183,0.14))",
      borderBottom: "1px solid rgba(56,189,248,0.15)",
    }}
  >
    {/* Left glow */}
    <div className="pointer-events-none absolute left-0 top-0 h-full w-32 opacity-20"
      style={{ background: "linear-gradient(90deg, rgba(56,189,248,0.4), transparent)" }} />

    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>
        <IconGlobe />
      </div>
      <span className="text-slate-300 text-xs font-medium">
        <span className="text-sky-400 font-semibold">Prefer another language?</span>
        {" "}Use Google Translate to view this site in your language —
      </span>
    </div>

    {/* Steps */}
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
      {[
        "Install the Google Translate extension",
        "Click the extension icon in your browser toolbar",
        "Choose your language",
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

    <a
      href="https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb"
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 whitespace-nowrap"
      style={{
        background: "rgba(56,189,248,0.12)",
        border: "1px solid rgba(56,189,248,0.25)",
        color: "#38bdf8",
      }}
    >
      <IconGlobe />
      Get extension
    </a>

    <button
      onClick={onDismiss}
      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all"
      aria-label="Dismiss"
    >
      <IconX />
    </button>
  </div>
);

export const HomePage = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div
      className="min-h-screen w-full bg-[#06101a] text-white flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'Sora', 'Poppins', sans-serif" }}
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: 0% center } 100% { background-position: 200% center } }
        @keyframes logo-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1) }
          50%       { transform: translate(-50%, -50%) scale(1.04) }
        }
        @keyframes banner-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── TRANSLATE BANNER ── */}
      {!bannerDismissed && (
        <div style={{ animation: "banner-in 0.4s ease both" }}>
          <TranslateBanner onDismiss={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* ══════════════════════
          HERO
      ══════════════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <img
          src={sosLogo}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-6deg)",
            width: "520px", opacity: 0.045,
            animation: "logo-drift 8s ease-in-out infinite",
            filter: "blur(1px)",
          }}
        />
        <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#dc6505]/15 blur-[130px]" />
        <div className="pointer-events-none absolute top-20 left-1/4 w-[300px] h-[300px] rounded-full bg-[#185FA5]/15 blur-[100px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 w-[300px] h-[300px] rounded-full bg-[#534AB7]/15 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center gap-0">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dc6505] shadow-[0_0_6px_rgba(220,101,5,1)]" />
            AI-powered language study
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-[1.1] mb-6">
            SOS-Lang: Study smarter.<br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #dc6505, #f59e0b, #dc6505)",
                backgroundSize: "200% auto",
                animation: "shimmer 3s linear infinite",
              }}
            >
              Remember longer.
            </span>
          </h1>

          <p className="text-base text-slate-400 max-w-xl leading-relaxed mb-10">
            SOS-Lang turns your notes into flashcards and quizzes, then tells you exactly what to review next — so nothing slips through the cracks.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setPopupVisible(true)}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #dc6505, #f59e0b)",
                boxShadow: "0 0 40px rgba(220,101,5,0.4)",
              }}
            >
              Start for free <IconArrow />
            </button>
            <p className="text-xs text-slate-600">No credit card needed</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════
          SPONSOR
      ══════════════════════ */}
      <section className="w-full py-10 px-6 pb-10 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] grid md:grid-cols-[1fr_1.6fr]">
          <div className="bg-white flex flex-col items-center justify-center gap-4 px-10 py-10">
            <p className="text-[20px] font-semibold uppercase tracking-[0.3em] text-slate-700">POWERED BY</p>
            <img src={ucaEmblem} alt="CUNEAC" className="w-full max-w-[200px] object-contain" />
            <p className="text-[18px] font-semibold font-[Poppins] text-slate-700 tracking-wide">CUNEAC</p>
          </div>
          <div
            className="relative flex flex-col justify-center gap-5 px-8 py-10 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d1e35 0%, #0e1a30 100%)" }}
          >
            <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 rounded-full bg-[#185FA5]/20 blur-[70px]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#185FA5]/30 bg-[#185FA5]/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#38bdf8]">
                Academic partner
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed max-w-md">
  <span className="text-white font-semibold">CUNEAC - (Centro Universitario para Europa del Este y Asia Central) </span>
  <br/>  
  An international initiative at the University of Cádiz focused on fostering academic, scientific, and cultural collaboration between Spain, Eastern Europe, and Central Asia through projects, exchanges, and educational programs.
</p>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-md">
                Through events, sponsorships, and applied projects, CUNEAC bridges the gap between classroom knowledge and practical experience — backing student-led tools like SOS-Lang.
              </p>
              <div className="h-px w-16 bg-[#185FA5]/40" />
              <div className="flex items-center gap-6">
                {[{ val: "UCA", label: "University" }, { val: "Cádiz", label: "Spain" }, { val: "2026", label: "Partnership" }].map((s) => (
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

      <main className="flex-1 flex flex-col gap-24 px-6 py-20 max-w-5xl mx-auto w-full">

        {/* FEATURES */}
        <section className="flex flex-col gap-10">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">Features</p>
            <h2 className="text-3xl font-semibold text-white">Everything you need to progress faster</h2>
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

        {/* HOW IT WORKS */}
        <section className="flex flex-col gap-10">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">Workflow</p>
            <h2 className="text-3xl font-semibold text-white">Three steps to mastery</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className={`rounded-2xl border ${s.bg} p-6 flex flex-col gap-3`}>
                <p className={`text-4xl font-bold ${s.color} opacity-60`}>{s.step}</p>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEW SIGNALS */}
        <section className="flex flex-col gap-8">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#dc6505] mb-3">Review signals</p>
            <h2 className="text-3xl font-semibold text-white mb-3">Know exactly what to study next</h2>
            <p className="text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">
              Every set is automatically colour-coded based on your performance and how recently you reviewed it.
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

        {/* CTA */}
        <section
          className="relative rounded-2xl overflow-hidden border border-white/[0.08] px-8 py-16 text-center flex flex-col items-center gap-6"
          style={{ background: "linear-gradient(135deg, #0f1e2e 0%, #0d1a2c 50%, #101428 100%)" }}
        >
          <img src={sosLogo} alt="" aria-hidden="true" className="pointer-events-none select-none absolute"
            style={{ bottom: "-40px", right: "-40px", width: "260px", opacity: 0.04, transform: "rotate(12deg)", filter: "blur(0.5px)" }} />
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-[#dc6505]/15 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 w-[200px] h-[150px] rounded-full bg-[#185FA5]/20 blur-[60px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[200px] h-[150px] rounded-full bg-[#534AB7]/20 blur-[60px]" />
          <div className="relative inline-flex items-center gap-2.5 rounded-full border border-[#dc6505]/30 bg-[#dc6505]/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-[#dc6505]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dc6505]" />
            Start today
          </div>
          <h2 className="relative text-3xl font-semibold text-white">Ready to build better study habits?</h2>
          <p className="relative text-[13px] text-slate-400 max-w-md leading-relaxed">
            Join SOS-Lang and start turning your notes into a system that actually helps you retain your target language.
          </p>
          <button
            onClick={() => setPopupVisible(true)}
            className="relative flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #dc6505, #f59e0b)", boxShadow: "0 0 40px rgba(220,101,5,0.4)" }}
          >
            Get started free <IconArrow />
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07] bg-[#06101a] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={sosLogo} alt="SOS-Lang" className="w-5 h-5 object-contain opacity-70" />
          <span className="text-xs font-semibold text-slate-500">SOS-Lang</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600">Supported by</span>
          <img src={ucaEmblem} alt="CUNEAC" className="h-4 object-contain opacity-40" />
          <span className="text-[11px] font-medium text-slate-500">CUNEAC</span>
        </div>
        <p className="text-xs text-slate-600">Built for fast review and meaningful retention.</p>
      </footer>

      <RegistrationForm
        open={popupVisible}
        onClose={() => setPopupVisible(false)}
        onSuccess={() => console.log("Success")}
      />
    </div>
  );
};

export default HomePage;