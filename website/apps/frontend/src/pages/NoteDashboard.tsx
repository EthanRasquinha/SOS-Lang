import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import MCQQuizView from "../components/MCQQuizView";

interface MCQQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface MCQSet {
  title: string;
  questions: MCQQuestion[];
}

export const NoteDashboard: React.FC = () => {
  const [note, setNote] = useState({ title: "", content: "" });
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; showModal: boolean }>>([]);
  const [selectedNote, setSelectedNote] = useState<null | { id: string; title: string; content: string; showModal: boolean }>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // ✅ Added missing state for MCQ quiz
  const [loadingSet, setLoadingSet] = useState(false);
  const [mcqSet, setMcqSet] = useState<MCQSet | null>(null);

  const noteAccentBorders = [
    "border-l-4 border-[#dc6505]",
    "border-l-4 border-[#36718f]",
    "border-l-4 border-[#0ea5e9]",
    "border-l-4 border-[#8b5cf6]",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const fetchNotes = async () => {
    const session = await supabase.auth.getSession();
    const response = await fetch("https://sos-lang.onrender.com/notes/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
    });
    const data = await response.json();
    const formattedNotes = data.map((n: any) => ({
      ...n,
      id: n.note_id,
    }));
    setNotes(formattedNotes);
  };

  const handleSubmit = async () => {
    const session = await supabase.auth.getSession();
    const response = await fetch("https://sos-lang.onrender.com/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        note_title: note.title,
        content: note.content,
      }),
    });

    if (response.ok) {
      setNote({ title: "", content: "" });
      fetchNotes();
    } else {
      const data = await response.json();
      console.error(data);
    }
  };

  const deleteNote = async (noteId: string) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(`https://sos-lang.onrender.com/notes/${noteId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
    });

    if (response.ok) {
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
      setSelectedNote(null);
    } else {
      const data = await response.json();
      console.error(data);
    }
  };

  React.useEffect(() => {
    fetchNotes();
  }, []);

  const generateFlashcards = async (note_id: string) => {
    try {
      setIsGenerating(true);
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `https://sos-lang.onrender.com/ai/flashcards/${note_id}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Flashcards generated successfully!");
        setSelectedNote(null);
        return data.flashcard_set;
      } else {
        console.error("Backend error:", data);
        toast.error(data.detail || "Failed to generate flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Network / server error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = async (note_id: string) => {
    try {
      setIsGenerating(true);
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `https://sos-lang.onrender.com/ai/${note_id}/summarize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        setShowSummaryModal(true);
        toast.success("Summary generated!");
      } else {
        toast.error(data.detail || "Failed to generate summary");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating summary");
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Fixed: now sets mcqSet and quizMode so the quiz renders
  const generateMCQSet = async (noteId: string) => {
    setLoadingSet(true);

    try {
      const session = await supabase.auth.getSession();

      const response = await fetch(
        `https://sos-lang.onrender.com/ai/mcqs/${noteId}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();

      setMcqSet(data.mcq_set);
      setSelectedNote(null); // close the note modal

      toast.success("MCQ Quiz generated!");
    } catch (err) {
      toast.error("Failed to generate MCQ quiz");
    } finally {
      setLoadingSet(false);
    }
  };

  return (
    <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-white w-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#0c1a2d] text-white px-6 py-4 flex justify-between items-center shadow-[0_20px_80px_-50px_rgba(0,0,0,0.6)] border border-white/10">
        <h1 className="text-2xl font-['Poppins'] font-semibold">SOS-Lang Notes Dashboard</h1>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow p-8 flex flex-col md:flex-row gap-6">

        {/* LEFT: Note Creation */}
        <section className="md:w-1/2">
          <h2 className="text-white font-['Poppins'] text-3xl mb-4">Create a New Note</h2>
          <Card className="surface-card rounded-3xl p-6 flex flex-col space-y-4">
            <CardContent className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 text-[#dc6505] font-medium">Note Title</label>
                <Input
                  name="title"
                  value={note.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title"
                  className="w-full bg-[#122437] border border-[#1f3248] text-white focus:bg-[#152535] focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[#dc6505] font-medium">Note Content</label>
                <Textarea
                  name="content"
                  value={note.content}
                  onChange={handleChange}
                  placeholder="Write your note here..."
                  rows={15}
                  className="w-full bg-[#122437] border border-[#1f3248] text-white focus:bg-[#152535] focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              >
                Submit Note
              </button>
            </CardFooter>
          </Card>
        </section>

        {/* RIGHT: Notes List */}
        <div className="min-h-screen bg-transparent md:w-1/2 flex flex-col">
          <h1 className="text-3xl text-white font-['Poppins'] mb-6">Your Notes</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note, index) => {
              const accentClass = noteAccentBorders[index % noteAccentBorders.length];
              return (
                <Card
                  key={note.id}
                  className={`surface-card rounded-3xl p-4 font-['Poppins'] flex flex-col cursor-pointer hover:shadow-2xl transition-all hover:bg-[var(--surface-strong)] ${accentClass}`}
                  onClick={() => setSelectedNote(note)}
                >
                  <CardHeader>
                    <CardTitle className="text-[#dc6505] text-xl font-semibold">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Modal for Selected Note */}
          {selectedNote && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
              <div className="bg-[var(--surface)] w-full max-w-3xl h-full md:h-auto rounded-3xl shadow-2xl relative flex flex-col border border-[var(--border)]">

                <div className="p-6 overflow-y-auto flex-grow relative">

                  {/* Close button */}
                  <button
                    className="absolute top-5 right-5 w-10 h-10 mt-1 px-2 flex items-center justify-center rounded-full text-[var(--accent)] text-2xl font-bold transition-all duration-200 hover:bg-white/10 hover:scale-110"
                    onClick={() => setSelectedNote(null)}
                  >
                    ×
                  </button>

                  {/* Header row */}
                  <div className="flex justify-between items-center mb-4 pr-12">
                    <h2 className="text-2xl font-bold font-[Poppins] text-white">
                      {selectedNote.title}
                    </h2>

                    <button
                      className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this note?")) {
                          deleteNote(selectedNote.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Content */}
                  <div className="bg-[var(--surface-soft)] rounded-3xl p-5 max-h-96 overflow-y-auto">
                    <p className="text-slate-200 text-base whitespace-pre-wrap">
                      {selectedNote.content}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-3 p-6 border-t border-[var(--border)]">

                  <button
                    className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    onClick={() => generateSummary(selectedNote.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Summarize"}
                  </button>

                  <button
                    className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedNote({ ...selectedNote, showModal: true })}
                  >
                    Generate Flashcards
                  </button>

                  {/* ✅ Fixed: uses loadMCQSet with proper loading state */}
                  <button
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => generateMCQSet(selectedNote.id)}
                    disabled={loadingSet || isGenerating}
                  >
                    {loadingSet ? "Generating..." : "Generate MCQ Quiz"}
                  </button>

                  {/* Flashcard confirm modal */}
                  {selectedNote.showModal && (
                    <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex justify-center items-center p-4">
                      <div className="bg-[var(--surface)] rounded-3xl shadow-2xl p-6 max-w-sm border border-[var(--border)]">
                        <h3 className="text-lg font-bold text-white mb-4">Generate Flashcards?</h3>
                        <p className="text-slate-400 mb-6">This will create a set of flashcards from your note that you can use to quiz yourself.</p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => setSelectedNote({ ...selectedNote, showModal: false })}
                            className="px-4 py-2 rounded-full bg-[#004d73] hover:bg-[#36718f] text-white font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              toast.success("Generating flashcards...");
                              await generateFlashcards(selectedNote.id);
                              setSelectedNote({ ...selectedNote, showModal: false });
                            }}
                            disabled={isGenerating}
                            className="px-4 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? "Generating..." : "Generate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary modal */}
                  {showSummaryModal && (
                    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
                      <div className="bg-[var(--surface)] max-w-lg w-full rounded-3xl shadow-2xl border border-[var(--border)] p-6 relative">
                        <button
                          className="absolute top-4 right-4 text-xl text-[var(--accent)]"
                          onClick={() => setShowSummaryModal(false)}
                        >
                          ×
                        </button>
                        <h3 className="text-xl font-bold text-white mb-4">AI Summary</h3>
                        <div className="bg-[var(--surface-soft)] rounded-2xl p-4 max-h-64 overflow-y-auto">
                          <p className="text-slate-200 whitespace-pre-wrap">{summary}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowSummaryModal(false)}
                            className="px-4 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default NoteDashboard;
