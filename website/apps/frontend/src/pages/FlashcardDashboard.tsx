import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import QuizView from "../components/QuizView";

interface FlashcardSet {
  id: string;
  title: string;
  note_id: string;
  created_at: string;
  flashcards: Flashcard[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface QuizResult {
  score: number;
  total: number;
  completed_at: string;
}

type FilterOption = "all" | "not-attempted" | "passed" | "failed" | "stale";

export const FlashcardDashboard: React.FC = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult[]>>({});
  const [filter, setFilter] = useState<FilterOption>("all");

  const getSetStatus = (results: QuizResult[] | null) => {
    if (!results || results.length === 0) {
      return {
        status: "not-attempted" as FilterOption,
        label: "Not reviewed yet",
        borderClass: "!border-2 !border-black",
        badgeClass: "bg-white/10 text-white",
        cardClass: "bg-[#07121d]",
      };
    }

    const lastAttempt = results.reduce((latest, current) => {
      return new Date(current.completed_at).getTime() > new Date(latest.completed_at).getTime() ? current : latest;
    }, results[0]);

    const daysSinceReview = (Date.now() - new Date(lastAttempt.completed_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReview > 3) {
      return {
        status: "stale" as FilterOption,
        label: "Review due",
        borderClass: "!border-2 !border-[#dc6505]",
        badgeClass: "bg-[#dc6505]/15 text-[#dc6505]",
        cardClass: "bg-[#0e1b28]",
      };
    }

    const averagePercent =
      results.reduce((sum, result) => sum + (result.total > 0 ? (result.score / result.total) * 100 : 0), 0) /
      results.length;

    if (averagePercent >= 80) {
      return {
        status: "passed" as FilterOption,
        label: "Mastered",
        borderClass: "!border-2 !border-[#36718f]",
        badgeClass: "bg-[#36718f]/15 text-[#36718f]",
        cardClass: "bg-[#0d232f]",
      };
    }

    return {
      status: "failed" as FilterOption,
      label: "Needs practice",
      borderClass: "!border-2 !border-[#dc2626]",
      badgeClass: "bg-[#dc2626]/15 text-[#dc2626]",
      cardClass: "bg-[#2c1315]",
    };
  };

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("No active session found. Please log in again.");
      }

      const response = await fetch("http://localhost:8000/ai/flashcard-sets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch flashcard sets: ${response.status} ${response.statusText} ${errorText}`);
      }

      const data = await response.json();
      const sets = data.flashcard_sets || [];
      setFlashcardSets(sets);
      await Promise.all(sets.map((set: FlashcardSet) => fetchQuizResults(set.id)));
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to load flashcard sets");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async (setId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/ai/quiz-results/${setId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizResults(prev => ({
          ...prev,
          [setId]: data.quiz_results || []
        }));
      }
    } catch (error) {
      console.error("Failed to fetch quiz results:", error);
    }
  };

  const loadFlashcardSet = async (set: FlashcardSet) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/ai/flashcard-sets/${set.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSet(data.flashcard_set);
        await fetchQuizResults(set.id);
      } else {
        toast.error("Failed to load flashcard set");
      }
    } catch (error) {
      console.error("Failed to load flashcard set:", error);
      toast.error("Failed to load flashcard set");
    }
  };

  const deleteFlashcardSet = async (setId: string) => {
    if (!window.confirm("Are you sure you want to delete this flashcard set?")) {
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/ai/flashcard-sets/${setId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (response.ok) {
        setFlashcardSets(prev => prev.filter(s => s.id !== setId));
        toast.success("Flashcard set deleted");
      } else {
        toast.error("Failed to delete flashcard set");
      }
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
      toast.error("Failed to delete flashcard set");
    }
  };

  const handleQuizComplete = () => {
    if (selectedSet) {
      fetchQuizResults(selectedSet.id);
    }
    setSelectedSet(null);
  };

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  if (selectedSet) {
    return (
      <QuizView 
        flashcardSet={selectedSet} 
        onComplete={handleQuizComplete}
        onBack={() => setSelectedSet(null)}
      />
    );
  }

  return (
    <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-white p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flashcard Sets</h1>
          <p className="text-sm text-slate-400 mt-1">Color-coded by review status and performance.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="rounded-2xl border border-[#1f3248] bg-[#122437] px-4 py-2 text-sm text-white"
          >
            <option value="all">All Sets</option>
            <option value="not-attempted">Not Attempted</option>
            <option value="passed">Mastered</option>
            <option value="failed">Needs Practice</option>
            <option value="stale">Review Due</option>
          </select>

          <Button
            onClick={fetchFlashcardSets}
            className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white px-6 py-3 rounded-full w-fit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Sets"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-black" /> Not reviewed yet
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#36718f]" /> Above 80% average
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" /> Below 80% average
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white">
          <span className="h-2.5 w-2.5 rounded-full bg-[#dc6505]" /> Not reviewed in 3 days
        </span>
      </div>

      {flashcardSets.length === 0 ? (
        <Card className="surface-card rounded-3xl p-8 text-center">
          <p className="text-white text-lg">No flashcard sets yet.</p>
          <p className="text-slate-400 text-sm mt-2">Create a note and convert it to flashcards to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets
            .map((set) => {
              const results = quizResults[set.id] || [];
              return { set, results, status: getSetStatus(results) };
            })
            .filter(({ status }) => filter === "all" || status.status === filter)
            .map(({ set, results, status }) => {
              const lastResult = results.length > 0 ? results[0] : null;
              return (
                <Card
                  key={set.id}
                  className={` rounded-3xl p-6 flex flex-col space-y-4 hover:shadow-2xl transition-shadow ${status.borderClass} ${status.cardClass}`}
                >
                  <CardHeader className="pb-0">
                    <CardTitle className="text-white text-lg font-['Poppins']">{set.title}</CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <p className="text-sm text-slate-400">
                        {new Date(set.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <p className="text-slate-400 text-sm">
                      {set.flashcards?.length || 0} cards
                    </p>
                    {lastResult && (
                      <p className="text-sm text-[var(--accent)] font-semibold mt-2">
                        Last Score: {lastResult.score}/{lastResult.total}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-4">
                  <Button
                    onClick={() => loadFlashcardSet(set)}
                    className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white py-2"
                  >
                    Start Quiz
                  </Button>
                  <Button
                    onClick={() => deleteFlashcardSet(set.id)}
                    className="flex-1 bg-[#dc6505] hover:bg-[#efb486] text-white rounded-md py-2"
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardDashboard;
