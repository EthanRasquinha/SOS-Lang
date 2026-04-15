import { useEffect, useState, useMemo } from "react";
import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Line, Pie } from "react-chartjs-2";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Layers, Brain, TrendingUp, Flame } from "lucide-react";
import { Activity, PieChart } from "lucide-react";
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

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
);

/* TYPES */
type FilterOption = "all" | "not-attempted" | "passed" | "failed" | "stale";

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

/* COMPONENT */
export const UserDashboard = () => {
    const navigate = useNavigate();

    /* STATE */
    const [stats, setStats] = useState({
        total_sets: 0,
        total_quizzes: 0,
        avg_score: 0,
    });

    const [activity, setActivity] = useState([
        { date: "", avgScore: 0, count: 0 },
    ]);

    const [recent, setRecent] = useState<
        {
            title: string;
            score: number;
            total: number;
            completed_at: string;
            flashcard_set_id: string;
        }[]
    >([]);

    const [streak, setStreak] = useState(0);
    const [materials, setMaterials] = useState<MaterialCard[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "good" | "mid" | "bad">("all");

    /* NAVIGATION */
    const reviewSet = (setId: string) => {
        navigate(`/studymaterial/${setId}?autostart=true`);
    };

    /* PIE DISTRIBUTION */
    const distribution = useMemo(() => {
        return materials.reduce(
            (acc, item) => {
                acc[item.status]++;
                return acc;
            },
            {
                passed: 0,
                failed: 0,
                stale: 0,
                "not-attempted": 0,
            }
        );
    }, [materials]);
    const filteredRecent = recent.filter((item) => {
        const percent =
            item.total > 0 ? (item.score / item.total) * 100 : 0;

        const matchesSearch = item.title
            ?.toLowerCase()
            .includes(search.toLowerCase());

        let matchesFilter = true;

        if (filter === "good") matchesFilter = percent >= 80;
        else if (filter === "mid") matchesFilter = percent >= 50 && percent < 80;
        else if (filter === "bad") matchesFilter = percent < 50;

        return matchesSearch && matchesFilter;
    });
    const pieData = {
        labels: ["Proficient", "Non-Proficient", "Needs Review", "Unattempted"],
        datasets: [
            {
                data: [
                    distribution.passed,
                    distribution.failed,
                    distribution.stale,
                    distribution["not-attempted"],
                ],
                backgroundColor: ["#22c55e", "#ef4444", "#f59e0b", "#64748b"],
                borderWidth: 1,
            },
        ],
    };

    /* FLASHCARD STATUS CLASSIFIER */
    const getMaterialStatus = (results: QuizResult[] | null) => {
        if (!results || results.length === 0) {
            return {
                cardClass:
                    "border-l-4 border-gray-500 bg-gray-900/40",
                status: "not-attempted",
            };
        }

        const now = Date.now();

        const last = results.reduce((a, b) =>
            new Date(a.completed_at) > new Date(b.completed_at) ? a : b
        );

        const days =
            (now - new Date(last.completed_at).getTime()) /
            (1000 * 60 * 60 * 24);

        if (days > 3) {
            return {
                cardClass:
                    "border-l-4 border-orange-500 bg-orange-900/30",
                status: "stale",
            };
        }

        const avg =
            results.reduce(
                (sum, r) =>
                    sum + (r.total ? (r.score / r.total) * 100 : 0),
                0
            ) / results.length;

        if (avg >= 80) {
            return {
                cardClass:
                    "border-l-4 border-green-500 bg-green-900/30",
                status: "passed",
            };
        }

        return {
            cardClass:
                "border-l-4 border-red-500 bg-red-900/30",
            status: "failed",
        };
    };

    /* FETCH HELPERS */
    const fetchQuizResultsForSet = async (setId: string) => {
        const session = await supabase.auth.getSession();

        const res = await fetch(
            `http://localhost:8000/ai/quiz-results/${setId}`,
            {
                headers: {
                    Authorization: `Bearer ${session.data.session?.access_token}`,
                },
            }
        );

        if (!res.ok) return null;

        const data = await res.json();
        return data.quiz_results || null;
    };

    const fetchStoredMaterials = async () => {
        const session = await supabase.auth.getSession();

        try {
            const res = await fetch(
                "http://localhost:8000/ai/flashcard-sets",
                {
                    headers: {
                        Authorization: `Bearer ${session.data.session?.access_token}`,
                    },
                }
            );

            const data = await res.json();

            const enriched = await Promise.all(
                (data.flashcard_sets || []).map(async (set: any) => {
                    const results = await fetchQuizResultsForSet(set.id);
                    const status = getMaterialStatus(results);

                    return {
                        id: set.id,
                        title: set.title,
                        content: `${set.flashcards?.length || 0} flashcards`,
                        date: new Date(set.created_at).toLocaleDateString(),
                        createdAt: set.created_at,
                        cardClass: status.cardClass,
                        status: status.status,
                    };
                })
            );

            setMaterials(enriched);
        } catch {
            toast.error("Failed to load materials");
        }
    };

    /* MAIN DATA LOAD */
    useEffect(() => {
        const load = async () => {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [statsRes, activityRes, recentRes, streakRes] =
                await Promise.all([
                    fetch("http://localhost:8000/stats", { headers }),
                    fetch("http://localhost:8000/stats/activity", { headers }),
                    fetch("http://localhost:8000/stats/recent", { headers }),
                    fetch("http://localhost:8000/stats/streak", { headers }),
                ]);

            setStats(await statsRes.json());
            setActivity(await activityRes.json());

            const recentData = await recentRes.json();
            setRecent(
                recentData.map((item: any) => ({
                    title: item.flashcard_sets?.title,
                    score: item.score,
                    total: item.total,
                    completed_at: item.completed_at,
                    flashcard_set_id: item.flashcard_sets?.id,
                }))
            );

            const streakData = await streakRes.json();
            setStreak(streakData.streak);
        };

        load();
        fetchStoredMaterials();
    }, []);

    /* LINE CHART */
    const chartData = {
        labels: activity.map((a) => a.date),
        datasets: [
            {
                label: "Daily Attempts",
                data: activity.map((a) => a.count),
                borderColor: "#dc6505",
                backgroundColor: "rgba(220,101,5,0.2)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
            y: { min: 0, ticks: { color: "#94a3b8" } },
        },
    };

    /* UI */
    return (
        <div className="min-h-screen bg-[#07121d] text-white">
            <main className="max-w-6xl mx-auto p-6 space-y-8">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-4">

                        {/* ICON BADGE */}
                        <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <TrendingUp size={20} />
                        </div>

                        {/* TEXT */}
                        <div className="text-left">
                            <h1 className="text-3xl font-semibold font-[Poppins] tracking-tight">
                                Personal Learning Dashboard
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Track your progress and learning insights
                            </p>
                        </div>

                    </div>

                    {/* RIGHT SIDE (optional actions) */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-sm transition">
                            Start Review
                        </button>
                    </div>

                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Study Sets"
                        value={stats.total_sets}
                        icon={<Layers size={20} />}
                    />

                    <StatCard
                        title="Quizzes Completed"
                        value={stats.total_quizzes}
                        icon={<Brain size={20} />}
                    />

                    <StatCard
                        title="Average Performance"
                        value={`${stats.avg_score}%`}
                        icon={<TrendingUp size={20} />}
                    />

                    <StatCard
                        title="Current Streak"
                        value={`${streak} days`}
                        icon={<Flame size={20} />}
                    />
                </div>

                {/* CHARTS */}
                <div className="bg-[#0b1b2b] p-6 rounded-2xl border border-white/10">

                    {/* SECTION HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold font-[Poppins]">
                            Study Analytics
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 h-[400px]">

                        {/* LINE CHART CARD */}
                        <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 h-full">

                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-slate-400">Activity Trend</p>
                                    <h3 className="text-lg font-semibold">Review Frequency</h3>
                                </div>

                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <Activity size={18} />
                                </div>
                            </div>

                            {/* CHART */}
                            <div className="flex-1 min-h-0">
                                <Line
                                    data={chartData}
                                    options={{
                                        ...chartOptions,
                                        maintainAspectRatio: false,
                                    }}
                                />
                            </div>
                        </div>

                        {/* PIE CHART CARD */}
                        <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 h-full">

                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-slate-400">Performance Split</p>
                                    <h3 className="text-lg font-semibold">Mastery Breakdown</h3>
                                </div>

                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                    <PieChart size={18} />
                                </div>
                            </div>

                            {/* CHART */}
                            <div className="flex-1 min-h-0">
                                <Pie
                                    data={pieData}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* RECENT */}
                <div className="bg-[#0b1b2b] p-6 rounded-2xl border border-white/10">

                    {/* HEADER + CONTROLS */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <h2 className="text-2xl font-[Poppins]">Recent Activity</h2>

                        <div className="flex gap-2">

                            {/* SEARCH */}
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sets..."
                                className="px-3 py-2 rounded-lg bg-white/5 border focus:outline-none
    focus:ring-2 focus:ring-orange-500/40 hover:bg-[#132a42] border-white/10 text-sm"
                            />

                            {/* FILTER */}
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="
    px-3 py-2
    rounded-lg
    bg-white/5
    border border-white/10
    text-white
    text-sm
    focus:outline-none
    focus:ring-2
    focus:ring-orange-500/40
    hover:bg-[#132a42]
  "
                            >
                                <option value="all">All</option>
                                <option value="good">≥ 80%</option>
                                <option value="mid">50–79%</option>
                                <option value="bad">&lt; 50%</option>
                            </select>
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="space-y-3">
                        {filteredRecent.map((item, i) => {
                            const percent =
                                item.total > 0
                                    ? (item.score / item.total) * 100
                                    : 0;

                            let color = "text-yellow-400";
                            if (percent >= 80) color = "text-green-400";
                            else if (percent < 50) color = "text-red-400";

                            return (
                                <div
                                    key={i}
                                    className="grid grid-cols-4 items-center bg-white/5 p-4 rounded-lg"
                                >
                                    <span>{item.title}</span>

                                    <span className={color}>
                                        {percent.toFixed(1)}%
                                    </span>

                                    <span className="text-slate-400">
                                        {item.completed_at?.slice(0, 16).replace("T", " ")}
                                    </span>

                                    <button
                                        onClick={() => reviewSet(item.flashcard_set_id)}
                                        className="text-sm px-3 py-2 rounded-full bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                                    >
                                        Review again
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

/* STAT CARD */
function StatCard({ title, value, icon }) {
    return (
        <div className="bg-[#0b1b2b] p-5 rounded-2xl border border-white/10 hover:border-white/20 transition">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm">{title}</p>

                <div className="p-2 rounded-lg bg-white/5 text-orange-400">
                    {icon}
                </div>
            </div>

            {/* VALUE CONTAINER */}
            <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-center">
                <h3 className="text-2xl font-semibold tracking-tight">
                    {value}
                </h3>
            </div>

        </div>
    );
}

export default UserDashboard;