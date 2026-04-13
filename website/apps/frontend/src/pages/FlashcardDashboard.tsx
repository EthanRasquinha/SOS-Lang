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

export const FlashcardDashboard: React.FC = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult[]>>({});

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("http://localhost:8000/ai/flashcard-sets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcard sets");
      }

      const data = await response.json();
      setFlashcardSets(data.flashcard_sets || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load flashcard sets");
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
    <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-[var(--text-primary)] p-8 flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-['Poppins'] text-[#004d73]">Flashcard Sets</h1>

      <Button
        onClick={fetchFlashcardSets}
        className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white px-6 py-3 rounded-full w-fit"
        disabled={loading}
      >
        {loading ? "Loading..." : "Refresh Sets"}
      </Button>

      {flashcardSets.length === 0 ? (
        <Card className="surface-card rounded-3xl p-8 text-center">
          <p className="text-[#004d73] text-lg">No flashcard sets yet.</p>
          <p className="text-[#7c7f86] text-sm mt-2">Create a note and convert it to flashcards to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => {
            const results = quizResults[set.id] || [];
            const lastResult = results.length > 0 ? results[0] : null;
            
            return (
              <Card key={set.id} className="surface-card rounded-3xl p-6 flex flex-col space-y-4 hover:shadow-2xl transition-shadow">
                <CardHeader className="pb-0">
                  <CardTitle className="text-[#004d73] text-lg font-['Poppins']">{set.title}</CardTitle>
                  <p className="text-sm text-[#7c7f86] mt-1">
                    {new Date(set.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="pb-0">
                  <p className="text-[#7c7f86] text-sm">
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
