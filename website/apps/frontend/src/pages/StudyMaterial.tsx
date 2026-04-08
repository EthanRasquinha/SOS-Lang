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

export const AIStudyMaterial: React.FC = () => {
  const [materials, setMaterials] = useState<Array<{ id: string; title: string; content: string; date: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [loadingSet, setLoadingSet] = useState(false);

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
      const formattedMaterials = (data.flashcard_sets || []).map((set: any) => ({
        id: set.id,
        title: set.title,
        content: `${set.flashcards?.length || 0} flashcards`,
        date: new Date(set.created_at).toLocaleDateString()
      }));
      setMaterials(formattedMaterials);
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

  return (
    <>
      {selectedSet ? (
        <QuizView
          flashcardSet={selectedSet}
          onComplete={handleQuizComplete}
          onBack={() => setSelectedSet(null)}
        />
      ) : (
        <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold font-['Poppins'] text-[#004d73]">Study Material Storage</h1>

          <Button
            onClick={fetchStoredMaterials}
            className="bg-[#004d73] hover:bg-[#36718f] text-white px-6 py-3 rounded-md"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Materials"}
          </Button>

          {materials.length === 0 && !loading ? (
            <Card className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-[#7c7f86] text-lg">No flashcard sets yet.</p>
              <p className="text-[#7c7f86] text-sm mt-2">Create a note and convert it to flashcards to get started!</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-[#004d73] text-lg font-['Poppins']">{material.title}</CardTitle>
                    <p className="text-sm text-[#7c7f86]">{material.date}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col space-y-4">
                    <p className="text-[#7c7f86]">{material.content}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartQuiz(material.id)}
                        disabled={loadingSet}
                        className="flex-1 bg-[#004d73] hover:bg-[#36718f] text-white px-4 py-2 rounded-md"
                      >
                        {loadingSet ? "Loading..." : "Start Quiz"}
                      </Button>
                      <Button
                        onClick={() => deleteMaterial(material.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
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
