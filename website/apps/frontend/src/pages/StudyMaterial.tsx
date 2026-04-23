import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import QuizView from "../components/QuizView";
import MCQQuizView from "../components/MCQQuizView";
import sosLogo from '../../assets/sos-logo.png';
import { BookOpen } from "lucide-react";



interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  note_id: string;
  created_at: string;
  flashcards: Flashcard[];
}

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

type FilterOption = "all" | "not-attempted" | "passed" | "failed" | "stale";

interface MaterialCard {
  id: string;
  title: string;
  count: number;
  date: string;
  createdAt: string;
  status: FilterOption;
  type: "flashcard" | "mcq";
  avg: number;
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  completed_at: string;
}

const STATUS_CONFIG = {
  "not-attempted": {
    label: "Not started",
    dot: "bg-slate-500",
    bar: "bg-slate-600",
    text: "text-slate-400",
  },
  "passed": {
    label: "Passed",
    dot: "bg-emerald-400",
    bar: "bg-emerald-500",
    text: "text-emerald-400",
  },
  "failed": {
    label: "Needs review",
    dot: "bg-red-400",
    bar: "bg-red-500",
    text: "text-red-400",
  },
  "stale": {
    label: "Due for review",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
    text: "text-amber-400",
  },
  "all": {
    label: "All",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
    text: "text-amber-400",
  }
};

const getMaterialStatus = (
  results: QuizResult[] | null
): { status: FilterOption; avg: number } => {
  if (!results || results.length === 0) {
    return { status: "not-attempted", avg: 0 };
  }

  const now = Date.now();

  const last = results.reduce((a, b) =>
    new Date(b.completed_at) > new Date(a.completed_at) ? b : a
  );

  const daysSince =
    (now - new Date(last.completed_at).getTime()) / 86400000;

  const avg =
    results.reduce(
      (s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0),
      0
    ) / results.length;

  if (daysSince > 3) return { status: "stale", avg: avg };
  if (avg >= 80) return { status: "passed", avg: avg };
  return { status: "failed", avg: avg };
};

// ── Icons ──────────────────────────────────────────────
const IconCards = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const IconMCQ = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5" />
  </svg>
);
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── Single material row ────────────────────────────────
interface RowProps {
  material: MaterialCard;
  onStart: () => void;
  onDelete: () => void;
  loadingSet: boolean;
  accent: string;
}

const MaterialRow: React.FC<RowProps> = ({ material, onStart, onDelete, loadingSet, accent }) => {
  const statusInfo = STATUS_CONFIG[material.status] ?? STATUS_CONFIG["not-attempted"];
  return (
    // Use flex-wrap so the actions row can drop below on narrow containers
    <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 pl-4 pr-4 py-4 rounded-2xl border border-white/[0.06] bg-[#0d1f35] hover:bg-[#112540] transition-all">
      {/* Status dot — hidden on very small widths to save space */}
      <div className="shrink-0 hidden sm:flex flex-col items-center gap-1.5">
        <span className={`w-2 h-10 rounded-full ${statusInfo.dot}`} />
      </div>

      {/* Title + meta — flex-1 with min-w-0 so it shrinks properly */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-left text-slate-100 break-words">{material.title}</p>
        {/* Meta row wraps naturally */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
          <span className="text-[11px] text-slate-500">
            {material.count} {material.type === "flashcard" ? "cards" : "questions"}
          </span>
          <span className="text-[11px] text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">{material.date}</span>
          <span className="text-[11px] text-slate-600">·</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.text} bg-white/5`}>
            {statusInfo.label}
          </span>
          <span className="text-[11px] font-semibold text-slate-300">
            Avg: {material.avg.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Actions — shrink-0 so buttons never compress, but the row wraps if needed */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <button
          onClick={onStart}
          disabled={loadingSet}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all disabled:opacity-40
            ${accent === "orange"
              ? "bg-[#dc6505] hover:bg-[#b85204] text-white"
              : "bg-[#185FA5] hover:bg-[#0C447C] text-white"
            }`}
        >
          <IconPlay />
          {loadingSet ? "Loading..." : "Start"}
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-white/[0.06] text-slate-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all shrink-0"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
};

// ── Section block ──────────────────────────────────────
interface SectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  children: React.ReactNode;
  count: number;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, icon, accentBg, children, count }) => (
  <div className="flex flex-col gap-4 bg-[#0b1b2b] border border-white/10 rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-1">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg}`}>
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.07] text-slate-400">
            {count}
          </span>
        </div>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

// ── Filter pill ────────────────────────────────────────
interface PillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
const FilterPill: React.FC<PillProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap
      ${active
        ? "bg-[#0d1f35] border-white/20 text-white"
        : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]"
      }`}
  >
    {children}
  </button>
);

// ── Main component ─────────────────────────────────────
export const AIStudyMaterial: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSet | null>(null);
  const [selectedMCQSet, setSelectedMCQSet] = useState<MCQSet | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const fetchQuizResultsForSet = async (setId: string): Promise<QuizResult[] | null> => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/quiz-results/${setId}`, {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.quiz_results || null;
    } catch { return null; }
  };

  const fetchStoredMaterials = async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();
    try {
      const [flashcardRes, mcqRes] = await Promise.all([
        fetch("https://sos-lang.onrender.com/ai/flashcard-sets", {
          headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
        }),
        fetch("https://sos-lang.onrender.com/ai/mcq-sets", {
          headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
        }),
      ]);

      const flashcardData = flashcardRes.ok ? await flashcardRes.json() : { flashcard_sets: [] };
      const mcqData = mcqRes.ok ? await mcqRes.json() : { mcq_sets: [] };

      const flashcardMaterials: MaterialCard[] = await Promise.all(
        (flashcardData.flashcard_sets || []).map(async (set: any) => {
          const results = await fetchQuizResultsForSet(set.id);
          return {
            id: set.id,
            title: set.title,
            count: set.flashcards?.length || 0,
            date: new Date(set.created_at).toLocaleDateString(),
            createdAt: set.created_at,
            status: getMaterialStatus(results).status,
            type: "flashcard" as const,
            avg: getMaterialStatus(results).avg,
          };
        })
      );

      const mcqMaterials: MaterialCard[] = await Promise.all(
        (mcqData.mcq_sets || []).map(async (set: any) => {
          const results = await fetchQuizResultsForSet(set.id);
          return {
            id: set.id,
            title: set.title,
            count: set.mcq_questions?.length || 0,
            date: new Date(set.created_at).toLocaleDateString(),
            createdAt: set.created_at,
            status: getMaterialStatus(results).status,
            type: "mcq" as const,
            avg: getMaterialStatus(results).avg,
          };
        })
      );

      setMaterials([...flashcardMaterials, ...mcqMaterials]);
    } catch {
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string, type: "flashcard" | "mcq") => {
    try {
      const session = await supabase.auth.getSession();
      const endpoint = type === "flashcard"
        ? `https://sos-lang.onrender.com/ai/flashcard-sets/${id}`
        : `https://sos-lang.onrender.com/ai/mcq-sets/${id}`;
      await fetch(endpoint, { method: "DELETE", headers: { Authorization: `Bearer ${session.data.session?.access_token}` } });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const loadFlashcardSet = async (id: string) => {
    setLoadingSet(true);
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch(`https://sos-lang.onrender.com/ai/flashcard-sets/${id}`, {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedFlashcardSet(data.flashcard_set);
    } catch { toast.error("Failed to load flashcard set"); }
    finally { setLoadingSet(false); }
  };

  const loadMCQSet = async (id: string) => {
    setLoadingSet(true);
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch(`https://sos-lang.onrender.com/ai/mcq-sets/${id}`, {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedMCQSet(data.mcq_set);
    } catch { toast.error("Failed to load MCQ set"); }
    finally { setLoadingSet(false); }
  };

  const handleQuizComplete = () => {
    setSelectedFlashcardSet(null);
    setSelectedMCQSet(null);
    fetchStoredMaterials();
  };

  useEffect(() => { fetchStoredMaterials(); }, []);

  if (selectedFlashcardSet) {
    return <QuizView flashcardSet={selectedFlashcardSet} onComplete={handleQuizComplete} onBack={() => setSelectedFlashcardSet(null)} />;
  }
  if (selectedMCQSet) {
    return <MCQQuizView mcqSet={selectedMCQSet} onComplete={handleQuizComplete} onBack={() => setSelectedMCQSet(null)} />;
  }

  const sorted = (items: MaterialCard[]) =>
    [...items].sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const filtered = (items: MaterialCard[]) =>
    filter === "all" ? items : items.filter((m) => m.status === filter);

  const flashcards = sorted(filtered(materials.filter((m) => m.type === "flashcard")));
  const mcqs = sorted(filtered(materials.filter((m) => m.type === "mcq")));

  const totalAll = materials.length;
  const totalDue = materials.filter((m) => m.status === "stale" || m.status === "not-attempted").length;
  const totalPassed = materials.filter((m) => m.status === "passed").length;

  return (
    <div
      className="min-h-screen bg-[#080f1a] text-white flex flex-col"
      style={{ fontFamily: "'Sora', 'Poppins', sans-serif" }}
    >
      {/* ── TOP BAR ── */}
      <header className="relative shrink-0 flex items-center px-6 py-3.5 bg-[#0a1628] border-b border-white/[0.07] overflow-hidden">
        <img
          src={sosLogo}
          alt="SOS-Lang Logo"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-20 opacity-10 pointer-events-none select-none"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <BookOpen size={20} />
          </div>
          <h1 className="text-[24px] font-[Poppins] font-semibold text-white tracking-wide">
            SOS-Lang Study Materials
          </h1>
        </div>
        <button
          onClick={() => setSortOrder((p) => (p === "newest" ? "oldest" : "newest"))}
          className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0f2a44] text-white hover:bg-[#11335a] transition-all whitespace-nowrap"
        >
          {sortOrder === "newest" ? "↓ Newest first" : "↑ Oldest first"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10 max-w-6xl w-full mx-auto">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total sets", value: totalAll, sub: "flashcards + MCQs" },
            { label: "Due for review", value: totalDue, sub: "not started or stale" },
            { label: "Passed", value: totalPassed, sub: "avg score ≥ 80%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-[#0d1f35] border border-white/[0.06] px-5 py-4">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">{stat.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── FILTER PILLS ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "not-attempted", "passed", "failed", "stale"] as FilterOption[]).map((f) => (
            <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All"
                : f === "not-attempted" ? "Not started"
                  : f === "passed" ? "Passed"
                    : f === "failed" ? "Needs review"
                      : "Due for review"}
            </FilterPill>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#dc6505] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Loading your materials...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* FLASHCARDS */}
            <Section
              title="Flashcard Sets"
              subtitle="Flip-card style memorisation"
              icon={<span className="text-[#dc6505]"><IconCards /></span>}
              accent="orange"
              accentBg="bg-[#dc6505]/10"
              count={flashcards.length}
            >
              {flashcards.length === 0 ? (
                <p className="text-slate-500 text-sm">No flashcard sets available.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {flashcards.map((m) => (
                    <MaterialRow
                      key={m.id}
                      material={m}
                      onStart={() => loadFlashcardSet(m.id)}
                      onDelete={() => deleteMaterial(m.id, "flashcard")}
                      loadingSet={loadingSet}
                      accent="orange"
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* MCQ */}
            <Section
              title="MCQ Quizzes"
              subtitle="Multiple choice question sets"
              icon={<span className="text-[#185FA5]"><IconMCQ /></span>}
              accent="blue"
              accentBg="bg-[#185FA5]/10"
              count={mcqs.length}
            >
              {mcqs.length === 0 ? (
                <p className="text-slate-500 text-sm">No MCQ sets available.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {mcqs.map((m) => (
                    <MaterialRow
                      key={m.id}
                      material={m}
                      onStart={() => loadMCQSet(m.id)}
                      onDelete={() => deleteMaterial(m.id, "mcq")}
                      loadingSet={loadingSet}
                      accent="blue"
                    />
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudyMaterial;