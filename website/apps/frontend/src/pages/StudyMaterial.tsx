import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import QuizView from "../components/QuizView";

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

export const AIStudyMaterial: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const getMaterialStatus = (
    results: QuizResult[] | null
  ): { cardClass: string; status: FilterOption } => {
    // ⚪ NEVER REVIEWED
    if (!results || results.length === 0) {
      return {
        cardClass:
          "border-l-4 border-gray-500 bg-gray-900/40 hover:bg-gray-800/50 shadow-gray-500/10 hover:shadow-gray-500/20",
        status: "not-attempted",
      };
    }

    const now = Date.now();

    const lastAttempt = results.reduce((latest, current) => {
      return new Date(current.completed_at).getTime() >
        new Date(latest.completed_at).getTime()
        ? current
        : latest;
    }, results[0]);

    const daysSinceReview =
      (now - new Date(lastAttempt.completed_at).getTime()) /
      (1000 * 60 * 60 * 24);

    // 🟠 STALE
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

    // 🟢 PASSED
    if (averagePercent >= 80) {
      return {
        cardClass:
          "border-l-4 border-green-500 bg-green-900/30 hover:bg-green-800/40 shadow-green-500/10 hover:shadow-green-500/20",
        status: "passed",
      };
    }

    // 🔴 FAILED
    return {
      cardClass:
        "border-l-4 border-red-500 bg-red-900/30 hover:bg-red-800/40 shadow-red-500/10 hover:shadow-red-500/20",
      status: "failed",
    };
  };

  const fetchQuizResultsForSet = async (
    setId: string
  ): Promise<QuizResult[] | null> => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(
        `http://localhost:8000/ai/quiz-results/${setId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.quiz_results || null;
    } catch (error) {
      console.error("Failed to fetch quiz results:", error);
      return null;
    }
  };

  const fetchStoredMaterials = async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();

    try {
      const response = await fetch(
        "http://localhost:8000/ai/flashcard-sets",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      const enrichedMaterials = await Promise.all(
        (data.flashcard_sets || []).map(async (set: any) => {
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
          };
        })
      );

      setMaterials(enrichedMaterials);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const session = await supabase.auth.getSession();

      await fetch(`http://localhost:8000/ai/flashcard-sets/${id}`, {
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

  const loadFlashcardSet = async (id: string) => {
    setLoadingSet(true);

    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `http://localhost:8000/ai/flashcard-sets/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setSelectedSet(data.flashcard_set);
    } catch {
      toast.error("Failed to load flashcard set");
    } finally {
      setLoadingSet(false);
    }
  };

  const handleQuizComplete = () => {
    setSelectedSet(null);
    fetchStoredMaterials();
  };

  useEffect(() => {
    fetchStoredMaterials();
  }, []);

  const filteredMaterials = materials
    .filter((material) => filter === "all" || material.status === filter)
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
    );

  return selectedSet ? (
    <QuizView
      flashcardSet={selectedSet}
      onComplete={handleQuizComplete}
      onBack={() => setSelectedSet(null)}
    />
  ) : (
    <div className="min-h-screen bg-[var(--page-bg)] text-white p-8 flex flex-col gap-6">
      <div className="flex justify-between">
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
      onClick={() =>
        setSortOrder((prev) =>
          prev === "newest" ? "oldest" : "newest"
        )
      }
      className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-soft)]"
    >
      Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
    </button>
  </div>
  </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => (
          <Card
            key={material.id}
            className={`rounded-3xl transition-all duration-300 shadow-2xl ${material.cardClass}`}
          >
            <CardHeader>
              <CardTitle>{material.title}</CardTitle>
              <p className="text-sm text-slate-400">{material.date}</p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <p>{material.content}</p>

              <div className="flex gap-2">
                <Button
                  onClick={() => loadFlashcardSet(material.id)}
                  disabled={loadingSet}
                  className="flex-1 rounded-full bg-[var(--accent)]"
                >
                  Start Quiz
                </Button>

                <Button
                  onClick={() => deleteMaterial(material.id)}
                  className="flex-1 rounded-full bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIStudyMaterial;