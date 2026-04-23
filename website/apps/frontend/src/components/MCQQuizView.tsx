import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface MCQQuestion {
  id: string;
  created_at: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface MCQSet {
  id: string;
  title: string;
  note_id: string;
  created_at: string;
  questions: MCQQuestion[];
}

interface MCQQuizViewProps {
  mcqSet: MCQSet;
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

// --- Sound synthesis using Web Audio API ---
function useQuizSounds() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new AudioContext();
    return ctx.current;
  };

  const playCorrect = () => {
    const ac = getCtx();
    const times = [0, 0.12, 0.24];
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord arp
    times.forEach((t, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = freqs[i];
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ac.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.18, ac.currentTime + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.35);
      osc.start(ac.currentTime + t);
      osc.stop(ac.currentTime + t + 0.4);
    });
  };

  const playWrong = () => {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ac.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ac.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.45);
  };

  return { playCorrect, playWrong };
}

// --- Particle burst for correct answers ---
function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl z-10">
      {particles.map((i) => {
        const angle = (i / 18) * 360;
        const radius = 60 + Math.random() * 60;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const colors = ["#4ade80", "#86efac", "#a3e635", "#34d399", "#fde68a", "#fbbf24"];
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 6;
        return (
          <div
            key={i}
            className="absolute rounded-full top-1/2 left-1/2"
            style={{
              width: size,
              height: size,
              background: color,
              transform: `translate(-50%, -50%)`,
              animation: `particle-burst 0.7s ease-out forwards`,
              animationDelay: `${Math.random() * 0.1}s`,
              "--tx": `${x}px`,
              "--ty": `${y}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// --- Shake animation for wrong answers ---
function useShake() {
  const [shaking, setShaking] = useState(false);
  const trigger = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };
  return { shaking, trigger };
}

const LETTER_LABELS = ["A", "B", "C", "D", "E", "F"];

const MCQQuizView: React.FC<MCQQuizViewProps> = ({ mcqSet, onComplete, onBack }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const [correctBurst, setCorrectBurst] = useState(false);
  const { shaking, trigger: triggerShake } = useShake();
  const { playCorrect, playWrong } = useQuizSounds();

  const questions = mcqSet.questions;
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const progress = ((index + (selected ? 1 : 0)) / questions.length) * 100;

  const submitMCQResults = async (finalScore: number) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("https://sos-lang.onrender.com/ai/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          mcq_set_id: mcqSet.id,
          score: finalScore,
          total: questions.length,
        }),
      });
      if (response.ok) toast.success("Results saved!");
    } catch (error) {
      console.error("Error saving MCQ results:", error);
    }
  };

  const normalizeOptions = (options: unknown): string[] => {
    if (Array.isArray(options)) return options;
    if (typeof options === "string") {
      try { return JSON.parse(options); } catch { return []; }
    }
    return [];
  };

  const normalizedOptions = normalizeOptions(q.options);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowExplanation(true);

    if (option === q.correct_answer) {
      playCorrect();
      setScore((prev) => prev + 1);
      setCorrectBurst(true);
      setTimeout(() => setCorrectBurst(false), 800);
    } else {
      playWrong();
      triggerShake();
    }
  };

  const handleNext = () => {
    setCardVisible(false);
    setTimeout(() => {
      if (isLast) {
        setFinished(true);
      } else {
        setIndex((prev) => prev + 1);
        setSelected(null);
        setShowExplanation(false);
        setCardVisible(true);
      }
    }, 320);
  };

  const getOptionStyle = (opt: string) => {
    const base = "relative w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 font-medium text-sm flex items-center gap-4 group";
    if (!selected) return `${base} bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 cursor-pointer hover:scale-[1.01] active:scale-[0.99]`;
    if (opt === q.correct_answer) return `${base} bg-emerald-500/20 border border-emerald-400/60 cursor-default scale-[1.01]`;
    if (opt === selected && opt !== q.correct_answer) return `${base} bg-red-500/20 border border-red-400/60 cursor-default`;
    return `${base} bg-white/3 border border-white/5 cursor-default opacity-40`;
  };

  const getLetterStyle = (opt: string) => {
    const base = "w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200";
    if (!selected) return `${base} bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white`;
    if (opt === q.correct_answer) return `${base} bg-emerald-400 text-emerald-950`;
    if (opt === selected && opt !== q.correct_answer) return `${base} bg-red-400 text-red-950`;
    return `${base} bg-white/10 text-white/30`;
  };

  const getResultIcon = (opt: string) => {
    if (!selected) return null;
    if (opt === q.correct_answer) return <span className="ml-auto text-emerald-400 text-lg leading-none">✓</span>;
    if (opt === selected) return <span className="ml-auto text-red-400 text-lg leading-none">✗</span>;
    return null;
  };

  // ---- Finished screen ----
  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    const tier = percent >= 80 ? { label: "Excellent!", color: "#4ade80", emoji: "🏆" }
      : percent >= 50 ? { label: "Good job!", color: "#fbbf24", emoji: "🎯" }
      : { label: "Keep going!", color: "#f87171", emoji: "📚" };

    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <div className="min-h-screen bg-[var(--page-bg)] text-white flex flex-col items-center justify-center p-6">
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
            style={{ animation: "slide-up 0.5s cubic-bezier(.22,1,.36,1) both" }}
          >
            <div className="text-5xl mb-4">{tier.emoji}</div>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">{mcqSet.title}</h2>
            <p className="text-slate-400 text-sm mb-8">Quiz Complete</p>

            {/* Circular progress */}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={tier.color} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - percent / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)", filter: `drop-shadow(0 0 8px ${tier.color}88)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: tier.color }}>{percent}%</span>
                <span className="text-xs text-slate-400 mt-0.5">{tier.label}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-8">
              <span className="text-white font-semibold text-lg">{score}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-white font-semibold text-lg">{questions.length}</span>
              <span className="text-slate-400 ml-2">correct answers</span>
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 text-white font-semibold transition-all text-sm hover:scale-105 active:scale-95"
              >
                ← Back
              </button>
              <button
                onClick={() => { onComplete(score, questions.length); submitMCQResults(score); }}
                className="px-6 py-2.5 rounded-full bg-[var(--accent)] hover:opacity-90 text-white font-semibold transition-all text-sm hover:scale-105 active:scale-95 shadow-lg"
                style={{ boxShadow: "0 0 20px rgba(var(--accent-rgb), 0.35)" }}
              >
                Done ✓
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- Quiz screen ----
  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="min-h-screen bg-[var(--page-bg)] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 hover:-translate-x-0.5 transition-transform"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/8 border border-white/10 text-slate-300">
                {index + 1} <span className="text-slate-600">/</span> {questions.length}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                {score} ✓
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/6 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--accent), #818cf8)",
                boxShadow: "0 0 10px rgba(var(--accent-rgb), 0.5)",
              }}
            />
          </div>

          {/* Question card */}
          <div
            className={`relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col gap-6 overflow-hidden ${shaking ? "quiz-shake" : ""}`}
            style={{
              animation: cardVisible ? "slide-up 0.35s cubic-bezier(.22,1,.36,1) both" : "slide-out 0.3s ease-in both",
              transition: "border-color 0.3s",
              borderColor: selected
                ? selected === q.correct_answer
                  ? "rgba(74, 222, 128, 0.25)"
                  : "rgba(248, 113, 113, 0.25)"
                : undefined,
            }}
          >
            {/* Particle burst on correct */}
            <ParticleBurst active={correctBurst} />

            {/* Subtle ambient glow on answer */}
            {selected && (
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-10 transition-all duration-500"
                style={{
                  background: selected === q.correct_answer
                    ? "radial-gradient(ellipse at 50% 0%, #4ade80, transparent 70%)"
                    : "radial-gradient(ellipse at 50% 0%, #f87171, transparent 70%)",
                }}
              />
            )}

            {/* Question number badge */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">
                Q{index + 1}
              </span>
              <h2 className="text-lg font-semibold leading-relaxed text-white/95">{q.question}</h2>
            </div>

            {/* Options */}
            <div className="grid gap-2.5">
              {normalizedOptions.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={getOptionStyle(opt)}
                  style={
                    selected && opt === q.correct_answer
                      ? { animation: "correct-pulse 0.5s ease-out" }
                      : selected && opt === selected && opt !== q.correct_answer
                      ? { animation: "wrong-flash 0.4s ease-out" }
                      : { animationDelay: `${i * 0.06}s`, animation: cardVisible ? "option-in 0.4s cubic-bezier(.22,1,.36,1) both" : undefined }
                  }
                >
                  <span className={getLetterStyle(opt)}>{LETTER_LABELS[i]}</span>
                  <span className="flex-1 text-white/85">{opt}</span>
                  {getResultIcon(opt)}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && q.explanation && (
              <div
                className="bg-white/4 rounded-2xl p-4 border border-white/8 text-slate-300 text-sm leading-relaxed"
                style={{ animation: "slide-up 0.35s cubic-bezier(.22,1,.36,1) both" }}
              >
                <span
                  className="font-semibold mr-1.5"
                  style={{ color: selected === q.correct_answer ? "#4ade80" : "#fb923c" }}
                >
                  {selected === q.correct_answer ? "✓ Correct!" : "✗ Incorrect —"}
                </span>
                {q.explanation}
              </div>
            )}

            {/* Next button */}
            {selected && (
              <div
                className="flex justify-end"
                style={{ animation: "slide-up 0.3s cubic-bezier(.22,1,.36,1) both" }}
              >
                <button
                  onClick={handleNext}
                  className="bg-[var(--accent)] hover:opacity-90 text-white font-semibold px-7 py-2.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-lg"
                  style={{ boxShadow: "0 0 20px rgba(var(--accent-rgb), 0.35)" }}
                >
                  {isLast ? "Finish Quiz 🏁" : "Next →"}
                </button>
              </div>
            )}
          </div>

          {/* Footer score */}
          <p className="text-center text-slate-600 text-xs tracking-wide">
            {selected
              ? `Score: ${score} / ${index + 1}`
              : `${questions.length - index - 1} question${questions.length - index - 1 !== 1 ? "s" : ""} remaining`}
          </p>
        </div>
      </div>
    </>
  );
};

const GLOBAL_STYLES = `
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes slide-out {
    from { opacity: 1; transform: translateY(0)    scale(1);    }
    to   { opacity: 0; transform: translateY(-18px) scale(0.98); }
  }
  @keyframes option-in {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes correct-pulse {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.025); }
    100% { transform: scale(1.01); }
  }
  @keyframes wrong-flash {
    0%   { transform: translateX(0); }
    20%  { transform: translateX(-6px); }
    40%  { transform: translateX(5px); }
    60%  { transform: translateX(-4px); }
    80%  { transform: translateX(3px); }
    100% { transform: translateX(0); }
  }
  @keyframes particle-burst {
    0%   { transform: translate(-50%, -50%) translate(0px, 0px) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }
  .quiz-shake {
    animation: quiz-card-shake 0.55s cubic-bezier(.36,.07,.19,.97) both !important;
  }
  @keyframes quiz-card-shake {
    0%, 100% { transform: translateX(0); }
    15%  { transform: translateX(-7px) rotate(-0.5deg); }
    30%  { transform: translateX(6px)  rotate(0.5deg); }
    45%  { transform: translateX(-5px) rotate(-0.3deg); }
    60%  { transform: translateX(4px); }
    75%  { transform: translateX(-3px); }
  }
`;

export default MCQQuizView;