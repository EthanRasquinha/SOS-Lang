import { useEffect, useState, useMemo } from "react";
import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Line, Pie } from "react-chartjs-2";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Layers, Brain, TrendingUp, Flame, Activity, PieChart } from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend, ArcElement);

import sosLogo from "../../assets/sos-logo.png";

/* ── TIPOS ── */
type FilterOption = "all" | "not-attempted" | "passed" | "failed" | "stale";
type DistributionKeys = Exclude<FilterOption, "all">;

interface MaterialCard {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  cardClass: string;
  status: FilterOption;
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  completed_at: string;
}

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
};

/* ── TARJETA DE ESTADÍSTICA ── */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, accent = "#dc6505" }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
    style={{
      background: "linear-gradient(145deg, #0d1f35, #0a1828)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}
  >
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none opacity-10"
      style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)`, transform: "translate(30%, -30%)" }} />

    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18`, color: accent }}>
        {icon}
      </div>
    </div>

    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

/* ── COMPONENTE PRINCIPAL ── */
export const UserDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total_sets: 0, total_quizzes: 0, avg_score: 0 });
  const [activity, setActivity] = useState([{ date: "", avgScore: 0, count: 0 }]);
  const [recent, setRecent] = useState<{ title: string; score: number; total: number; completed_at: string; flashcard_set_id: string }[]>([]);
  const [streak, setStreak] = useState(0);
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "good" | "mid" | "bad">("all");
  const [mcqCount, setMcqCount] = useState(0);

  const reviewSet = (setId: string) => navigate(`/studymaterial/${setId}?autostart=true`);

  const distribution = useMemo(() =>
    materials.reduce<Record<DistributionKeys, number>>(
      (acc, item) => { if (item.status !== "all") acc[item.status]++; return acc; },
      { passed: 0, failed: 0, stale: 0, "not-attempted": 0 }
    ), [materials]);

  const filteredRecent = recent.filter((item) => {
    const percent = item.total > 0 ? (item.score / item.total) * 100 : 0;
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    let matchesFilter = true;
    if (filter === "good") matchesFilter = percent >= 80;
    else if (filter === "mid") matchesFilter = percent >= 50 && percent < 80;
    else if (filter === "bad") matchesFilter = percent < 50;
    return matchesSearch && matchesFilter;
  });

  const getMaterialStatus = (results: QuizResult[] | null) => {
    if (!results || results.length === 0) return { cardClass: "border-gray-500 bg-gray-900/40", status: "not-attempted" as FilterOption };
    const now = Date.now();
    const last = results.reduce((a, b) => new Date(a.completed_at) > new Date(b.completed_at) ? a : b);
    const days = (now - new Date(last.completed_at).getTime()) / 86400000;
    if (days > 3) return { cardClass: "border-amber-500 bg-amber-900/20", status: "stale" as FilterOption };
    const avg = results.reduce((s, r) => s + (r.total ? (r.score / r.total) * 100 : 0), 0) / results.length;
    if (avg >= 80) return { cardClass: "border-emerald-500 bg-emerald-900/20", status: "passed" as FilterOption };
    return { cardClass: "border-red-500 bg-red-900/20", status: "failed" as FilterOption };
  };

  const fetchResultsForSet = async (setId: string) => {
    const session = await supabase.auth.getSession();
    const res = await fetch(`https://sos-lang.onrender.com/ai/quiz-results/${setId}`, {
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.quiz_results || null;
  };

  const fetchStoredMaterials = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      const [flashRes, mcqRes] = await Promise.all([
        fetch("https://sos-lang.onrender.com/ai/flashcard-sets", { headers }),
        fetch("https://sos-lang.onrender.com/ai/mcq-sets", { headers }),
      ]);

      const flashData = flashRes.ok ? await flashRes.json() : { flashcard_sets: [] };
      const mcqData = mcqRes.ok ? await mcqRes.json() : { mcq_sets: [] };
      const mcqSets = mcqData.mcq_sets || [];

      setMcqCount(mcqSets.length);

      const [flashEnriched, mcqEnriched] = await Promise.all([
        Promise.all((flashData.flashcard_sets || []).map(async (set: any) => {
          const results = await fetchResultsForSet(set.id);
          const status = getMaterialStatus(results);
          return { id: set.id, title: set.title, content: `${set.flashcards?.length || 0} tarjetas`, date: new Date(set.created_at).toLocaleDateString(), createdAt: set.created_at, ...status };
        })),
        Promise.all(mcqSets.map(async (set: any) => {
          const results = await fetchResultsForSet(set.id);
          const status = getMaterialStatus(results);
          return { id: set.id, title: set.title, content: `${set.questions?.length || 0} preguntas`, date: new Date(set.created_at).toLocaleDateString(), createdAt: set.created_at, ...status };
        })),
      ]);

      setMaterials([...flashEnriched, ...mcqEnriched]);
    } catch { toast.error("Error al cargar los materiales."); }
  };

  useEffect(() => {
    const load = async () => {
      const session = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session.data.session?.access_token}` };
      const [statsRes, activityRes, recentRes, streakRes] = await Promise.all([
        fetch("https://sos-lang.onrender.com/stats", { headers }),
        fetch("https://sos-lang.onrender.com/stats/activity", { headers }),
        fetch("https://sos-lang.onrender.com/stats/recent", { headers }),
        fetch("https://sos-lang.onrender.com/stats/streak", { headers }),
      ]);
      setStats(await statsRes.json());
      setActivity(await activityRes.json());
      const recentData = await recentRes.json();
      setRecent(recentData.map((item: any) => ({
        title: item.flashcard_sets?.title,
        score: item.score,
        total: item.total,
        completed_at: item.completed_at,
        flashcard_set_id: item.flashcard_sets?.id,
      })));
      setStreak((await streakRes.json()).streak);
    };
    load();
    fetchStoredMaterials();
  }, []);

  /* ── CONFIGURACIÓN DE GRÁFICOS ── */
  const chartData = {
    labels: activity.map((a) => a.date),
    datasets: [{
      label: "Intentos diarios",
      data: activity.map((a) => a.count),
      borderColor: "#dc6505",
      backgroundColor: "rgba(220,101,5,0.12)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#dc6505",
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#64748b", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
      y: { min: 0, ticks: { color: "#64748b", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
    },
  };

  const pieData = {
    labels: ["Dominado", "No dominado", "Pendiente de revisión", "Sin intentar"],
    datasets: [{
      data: [distribution.passed, distribution.failed, distribution.stale, distribution["not-attempted"]],
      backgroundColor: ["#22c55e", "#ef4444", "#f59e0b", "#475569"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const totalSets = stats.total_sets + mcqCount;

  /* ── RENDER ── */
  return (
    <>
      <style>{DASH_STYLES}</style>
      <div className="min-h-screen text-white" style={{ background: "#07121d", fontFamily: "'Sora', 'Poppins', sans-serif" }}>

        {/* ENCABEZADO */}
        <header className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.06] overflow-hidden"
          style={{ background: "linear-gradient(90deg, #0a1628, #0d1f35)" }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(220,101,5,0.4), transparent)" }} />
          <img src={sosLogo} className="absolute right-4 top-1/2 -translate-y-1/2 h-20 opacity-[0.06] pointer-events-none select-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,101,5,0.12)", color: "#dc6505" }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Panel de aprendizaje</h1>
              <p className="text-xs text-slate-500">Sigue tu progreso e información</p>
            </div>
          </div>

          <button className="relative z-10 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #dc6505, #b85204)", boxShadow: "0 0 16px rgba(220,101,5,0.25)" }}>
            Iniciar repaso
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 space-y-7">

          {/* TARJETAS DE ESTADÍSTICAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total de conjuntos" value={totalSets} icon={<Layers size={18} />} />
            <StatCard title="Exámenes completados" value={stats.total_quizzes} icon={<Brain size={18} />} accent="#818cf8" />
            <StatCard title="Rendimiento medio" value={`${stats.avg_score}%`} icon={<TrendingUp size={18} />} accent="#22c55e" />
            <StatCard title="Racha actual" value={`${streak}d`} icon={<Flame size={18} />} accent="#f59e0b" />
          </div>

          {/* GRÁFICOS */}
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#0b1b2b" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white tracking-tight">Analíticas de estudio</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>

              {/* Gráfico de líneas */}
              <div className="flex flex-col p-6 gap-4" style={{ background: "#0b1b2b" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Tendencia de actividad</p>
                    <h3 className="text-sm font-bold text-white mt-0.5">Frecuencia de repaso</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,101,5,0.1)", color: "#dc6505" }}>
                    <Activity size={16} />
                  </div>
                </div>
                <div style={{ height: "220px" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Gráfico circular */}
              <div className="flex flex-col p-6 gap-4" style={{ background: "#0b1b2b" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Distribución del rendimiento</p>
                    <h3 className="text-sm font-bold text-white mt-0.5">Desglose de dominio</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,101,5,0.1)", color: "#dc6505" }}>
                    <PieChart size={16} />
                  </div>
                </div>
                <div style={{ height: "220px" }}>
                  <Pie data={pieData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#64748b", font: { size: 11 }, padding: 12, boxWidth: 10 } } } }} />
                </div>
              </div>

            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#0b1b2b" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white tracking-tight">Actividad reciente</h2>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conjuntos..."
                  className="dash-input"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="dash-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="all">Todas las puntuaciones</option>
                  <option value="good">≥ 80 %</option>
                  <option value="mid">50–79 %</option>
                  <option value="bad">&lt; 50 %</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {filteredRecent.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-10">No se encontraron resultados.</p>
              ) : filteredRecent.map((item, i) => {
                const percent = item.total > 0 ? (item.score / item.total) * 100 : 0;
                const color = percent >= 80 ? "#22c55e" : percent >= 50 ? "#f59e0b" : "#ef4444";
                const bgColor = percent >= 80 ? "rgba(34,197,94,0.08)" : percent >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";

                return (
                  <div key={i} className="flex flex-wrap items-center gap-3 px-6 py-3.5 transition-colors hover:bg-white/[0.02]">
                    <span className="flex-1 min-w-0 text-sm font-medium text-slate-200 truncate">{item.title || "Sin título"}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color, background: bgColor }}>
                      {percent.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 shrink-0 hidden sm:block">
                      {item.completed_at?.slice(0, 16).replace("T", " ")}
                    </span>
                    <button
                      onClick={() => reviewSet(item.flashcard_set_id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-all hover:scale-105"
                      style={{ background: "rgba(220,101,5,0.12)", color: "#dc6505", border: "1px solid rgba(220,101,5,0.2)" }}
                    >
                      Repasar →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

const DASH_STYLES = `
  .dash-input {
    padding: 0.4rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: white;
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-width: 0;
  }
  .dash-input::placeholder { color: rgba(100,116,139,0.6); }
  .dash-input:focus {
    border-color: rgba(220,101,5,0.4);
    box-shadow: 0 0 0 3px rgba(220,101,5,0.1);
  }
  .dash-input option { background: #0d1f35; color: white; }
`;

export default UserDashboard;