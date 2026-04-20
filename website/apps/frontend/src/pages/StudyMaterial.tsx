import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import QuizView from "../components/QuizView";
import MCQQuizView from "../components/MCQQuizView";

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

// ✅ Added `type` field to distinguish flashcard sets from MCQ sets
interface MaterialCard {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  cardClass: string;
  status: FilterOption;
  type: "flashcard" | "mcq";
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  completed_at: string;
}

export const AIStudyMaterial: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<FlashcardSet | null>(null);
  const [selectedMCQSet, setSelectedMCQSet] = useState<MCQSet | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const getMaterialStatus = (
    results: QuizResult[] | null
  ): { cardClass: string; status: FilterOption } => {
    if (!results || results.length === 0) {
      return {
        cardClass:
          "border-l-4 border-gray-500 bg-gray-900/40 hover:bg-gray-800/50 shadow-gray-500/10 hover:shadow-gray-500/20",
        status: "not-attempted",
      };
    }



    const now = Date.now();
    const lastAttempt = results.reduce((latest, current) =>
      new Date(current.completed_at).getTime() > new Date(latest.completed_at).getTime()
        ? current
        : latest,
      results[0]
    );

    const daysSinceReview =
      (now - new Date(lastAttempt.completed_at).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceReview > 3) {
      return {
        cardClass:
          "border-l-4 border-orange-500 bg-orange-900/30 hover:bg-orange-800/40 shadow-orange-500/10 hover:shadow-orange-500/20",
        status: "stale",
      };
    }

    const averagePercent =
      results.reduce(
        (sum, result) =>
          sum + (result.total > 0 ? (result.score / result.total) * 100 : 0),
        0
      ) / results.length;

    if (averagePercent >= 80) {
      return {
        cardClass:
          "border-l-4 border-green-500 bg-green-900/30 hover:bg-green-800/40 shadow-green-500/10 hover:shadow-green-500/20",
        status: "passed",
      };
    }

    return {
      cardClass:
        "border-l-4 border-red-500 bg-red-900/30 hover:bg-red-800/40 shadow-red-500/10 hover:shadow-red-500/20",
      status: "failed",
    };
  };



  const fetchQuizResultsForSet = async (setId: string): Promise<QuizResult[] | null> => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/quiz-results/${setId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.quiz_results || null;
    } catch {
      return null;
    }
  };

  const fetchStoredMaterials = async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();

    try {
      // ✅ Fetch both flashcard sets and MCQ sets in parallel
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

      // Enrich flashcard sets
      const flashcardMaterials: MaterialCard[] = await Promise.all(
        (flashcardData.flashcard_sets || []).map(async (set: any) => {
          const results = await fetchQuizResultsForSet(set.id);
          const statusData = getMaterialStatus(results);
          return {
            id: set.id,
            title: set.title,
            content: `${set.flashcards?.length || 0} flashcards`,
            date: new Date(set.created_at).toLocaleDateString(),
            createdAt: set.created_at,
            cardClass: statusData.cardClass,
            status: statusData.status,
            type: "flashcard" as const,
          };
        })
      );

      // Enrich MCQ sets
      const mcqMaterials: MaterialCard[] = await Promise.all(
        (mcqData.mcq_sets || []).map(async (set: any) => {


          const results = await fetchQuizResultsForSet(set.id);
          const statusData = getMaterialStatus(results);

          return {
            id: set.id,
            title: set.title,
            content: `${set.mcq_questions?.length || 0} MCQ questions`, // ✅ FIXED HERE
            date: new Date(set.created_at).toLocaleDateString(),
            createdAt: set.created_at,
            cardClass: statusData.cardClass,
            status: statusData.status,
            type: "mcq" as const,
          };
        })
      );

      setMaterials([...flashcardMaterials, ...mcqMaterials]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string, type: "flashcard" | "mcq") => {
    try {
      const session = await supabase.auth.getSession();
      const endpoint =
        type === "flashcard"
          ? `https://sos-lang.onrender.com/ai/flashcard-sets/${id}`
          : `https://sos-lang.onrender.com/ai/mcq-sets/${id}`;

      await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      setMaterials(materials.filter((m) => m.id !== id));
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete material");
    }
  };

  // ✅ Load flashcard set for quiz
  const loadFlashcardSet = async (id: string) => {
    setLoadingSet(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/flashcard-sets/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSelectedFlashcardSet(data.flashcard_set);
    } catch {
      toast.error("Failed to load flashcard set");
    } finally {
      setLoadingSet(false);
    }
  };

  // ✅ Load MCQ set for quiz
  const loadMCQSet = async (id: string) => {
    setLoadingSet(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/mcq-sets/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      console.log("Loaded MCQ Set:", data);
      setSelectedMCQSet(data.mcq_set);
    } catch {
      toast.error("Failed to load MCQ set");
    } finally {
      setLoadingSet(false);
    }
  };

  const handleStartQuiz = (material: MaterialCard) => {
    if (material.type === "flashcard") {
      loadFlashcardSet(material.id);
    } else {
      loadMCQSet(material.id);
    }
  };

  const handleQuizComplete = () => {
    setSelectedFlashcardSet(null);
    setSelectedMCQSet(null);
    fetchStoredMaterials();
  };

  useEffect(() => {
    fetchStoredMaterials();
  }, []);

  const filteredMaterials = materials
    .filter((material) => filter === "all" || material.status === filter)
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  // ✅ Fixed: clean conditional rendering, no syntax error
  if (selectedFlashcardSet) {
    return (
      <QuizView
        flashcardSet={selectedFlashcardSet}
        onComplete={handleQuizComplete}
        onBack={() => setSelectedFlashcardSet(null)}
      />
    );
  }

  if (selectedMCQSet) {
    return (
      <MCQQuizView
        mcqSet={selectedMCQSet}
        onComplete={handleQuizComplete}
        onBack={() => setSelectedMCQSet(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-white p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Study Material Storage</h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="rounded-2xl border border-[#1f3248] bg-[#122437] px-4 py-2 text-sm text-white"
          >
            <option value="all">All Materials</option>
            <option value="not-attempted">Not Attempted</option>
            <option value="passed">Average ≥ 80%</option>
            <option value="failed">Average &lt; 80%</option>
            <option value="stale">Not Reviewed in 3 Days</option>
          </select>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-soft)]"
          >
            Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-slate-400 text-center mt-8">Loading study materials...</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => (
          <Card
            key={material.id}
            className={`rounded-3xl transition-all duration-300 shadow-2xl ${material.cardClass}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{material.title}</CardTitle>
                {/* ✅ Badge showing type */}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${material.type === "mcq"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                  : "bg-orange-600/30 text-orange-300 border border-orange-500/30"
                  }`}>
                  {material.type === "mcq" ? "MCQ" : "Flashcards"}
                </span>
              </div>
              <p className="text-sm text-slate-400">{material.date}</p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <p className="text-slate-300 text-sm">{material.content}</p>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleStartQuiz(material)}
                  disabled={loadingSet}
                  className="flex-1 rounded-full bg-[var(--accent)]"
                >
                  {loadingSet ? "Loading..." : "Start Quiz"}
                </Button>

                <Button
                  onClick={() => deleteMaterial(material.id, material.type)}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && filteredMaterials.length === 0 && (
          <p className="text-slate-500 col-span-full text-center mt-8">
            No study materials found. Generate some from your notes!
          </p>
        )}
      </div>
    </div>
  );
};

export default AIStudyMaterial;
