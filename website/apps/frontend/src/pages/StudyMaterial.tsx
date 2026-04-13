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
  borderClass: string;
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

  const getMaterialStatus = (results: QuizResult[] | null): { borderClass: string; status: FilterOption } => {
    if (!results || results.length === 0) {
      return { borderClass: "border-l-4 border-black bg-gray-50", status: "not-attempted" };
    }

    const now = Date.now();
    const lastAttempt = results.reduce((latest, current) => {
      return new Date(current.completed_at).getTime() > new Date(latest.completed_at).getTime() ? current : latest;
    }, results[0]);

    const daysSinceReview = (now - new Date(lastAttempt.completed_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 3) {
      return { borderClass: "border-l-4 border-orange-500 bg-orange-50", status: "stale" };
    }

    const averagePercent =
      results.reduce((sum, result) => sum + (result.total > 0 ? (result.score / result.total) * 100 : 0), 0) /
      results.length;

    if (averagePercent >= 80) {
      return { borderClass: "border-l-4 border-green-500 bg-green-50", status: "passed" };
    }

    return { borderClass: "border-l-4 border-red-500 bg-red-50", status: "failed" };
  };

  const fetchQuizResultsForSet = async (setId: string): Promise<QuizResult[] | null> => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/ai/quiz-results/${setId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

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
            borderClass: statusData.borderClass,
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
      setMaterials(materials.filter(m => m.id !== id));
      toast.success("Material deleted");
    } catch (error) {
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
      if (!response.ok) throw new Error("Failed to fetch flashcard set");
      
      const data = await response.json();
      setSelectedSet(data.flashcard_set);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load flashcard set");
    } finally {
      setLoadingSet(false);
    }
  };

  const handleStartQuiz = (setId: string) => {
    loadFlashcardSet(setId);
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
    .sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <>
      {selectedSet ? (
        <QuizView
          flashcardSet={selectedSet}
          onComplete={handleQuizComplete}
          onBack={() => setSelectedSet(null)}
        />
      ) : (
        <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-[var(--text-primary)] p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold font-['Poppins'] text-[#004d73]">Study Material Storage</h1>
              <p className="text-sm text-[#7c7f86] mt-1">
                Filter by quiz status or sort by latest material.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterOption)}
                className="rounded-2xl border border-[#7c7f86] bg-[#ebe9e8] px-4 py-2 text-sm text-[#004d73]"
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

          {materials.length === 0 && !loading ? (
            <Card className="surface-card rounded-3xl p-8 text-center">
              <p className="text-[#004d73] text-lg">No flashcard sets yet.</p>
              <p className="text-[#7c7f86] text-sm mt-2">Create a note and convert it to flashcards to get started!</p>
            </Card>
          ) : filteredMaterials.length === 0 && !loading ? (
            <Card className="surface-card rounded-3xl p-8 text-center">
              <p className="text-[#004d73] text-lg">No materials match this filter.</p>
              <p className="text-[#7c7f86] text-sm mt-2">Try another filter or refresh your materials.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className={`rounded-3xl shadow-2xl transition-shadow border-0 ${material.borderClass}`}>
                  <CardHeader>
                    <CardTitle className="text-[#004d73] text-lg font-['Poppins']">{material.title}</CardTitle>
                    <p className="text-sm text-[#7c7f86]">{material.date}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col space-y-4">
                    <p className="text-[#004d73]">{material.content}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleStartQuiz(material.id)}
                        disabled={loadingSet}
                        className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white px-4 py-2"
                      >
                        {loadingSet ? "Loading..." : "Start Quiz"}
                      </Button>
                      <Button
                        onClick={() => deleteMaterial(material.id)}
                        className="flex-1 rounded-full bg-[#dc6505] hover:bg-[#efb486] text-white px-4 py-2"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIStudyMaterial;
