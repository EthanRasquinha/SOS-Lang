import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export const NoteDashboard: React.FC = () => {
  const [note, setNote] = useState({ title: "", content: "" });
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; showModal: boolean }>>([]); // start empty
  const [selectedNote, setSelectedNote] = useState<null | { id: string; title: string; content: string; showModal: boolean }>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    const response = await fetch("http://localhost:8000/notes/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
    });
    const data = await response.json();

    // Ensure each note has an 'id' field for React and delete function
    const formattedNotes = data.map((n: any) => ({
      ...n,
      id: n.note_id, // adjust depending on your backend field
    }));

    setNotes(formattedNotes);
  };

  const handleSubmit = async () => {
    const session = await supabase.auth.getSession();
    const response = await fetch("http://localhost:8000/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        note_title: note.title,      // match backend field names
        content: note.content,
      }),
    });

    if (response.ok) {
      setNote({ title: "", content: "" });
      fetchNotes(); // refresh the notes list
    } else {
      const data = await response.json();
      console.error(data);
    }
  };

  const deleteNote = async (noteId: string) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(`http://localhost:8000/notes/${noteId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
    });

    if (response.ok) {
      // Remove deleted note from state to refresh UI
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
      `http://localhost:8000/ai/flashcards/${note_id}/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
      }
    );

    const data = await response.json(); // ALWAYS parse

    if (response.ok) {
      toast.success("Flashcards generated successfully!");
      setSelectedNote(null);
      return data.flashcard_set;
    } else {
      console.error("Backend error:", data); // 🔥 KEY LINE
      toast.error(data.detail || "Failed to generate flashcards");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    toast.error("Network / server error");
  } finally {
    setIsGenerating(false);
  }
};

  const generateSummary = async (note_id: string, noteContent: string) => {
    try {
      const response = await fetch(`http://localhost:8000/ai/${note_id}/summarize/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: noteContent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Summary generated successfully!");
        return data.summary;
      } else {
        toast.error("Failed to generate summary");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Error generating summary");
    }
  };

  return (
    <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-white w-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#0c1a2d] text-white rounded-2xl px-6 py-4 flex justify-between items-center shadow-[0_20px_80px_-50px_rgba(0,0,0,0.6)] border border-white/10">
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
        <div className="min-h-screen bg-transparent md:w-1/2 flex flex-col ">
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
                <button
                  className="absolute top-4 right-4 text-[var(--accent)] text-2xl font-bold"
                  onClick={() => setSelectedNote(null)}
                >
                  ×
                </button>

                <div className="p-6 overflow-y-auto flex-grow">
                  <h2 className="text-2xl font-bold text-white mb-4">{selectedNote.title}</h2>
                  <div className="bg-[var(--surface-soft)] rounded-3xl p-5 max-h-96 overflow-y-auto">
                    <p className="text-slate-200 text-base text-left whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                </div>

                <div className="flex justify-center gap-3 p-6 border-t border-[var(--border)]">
                    <button
                    className="bg-[#dc6505] hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this note?")) {
                      deleteNote(selectedNote.id);
                      }
                    }}
                    >
                    Delete Note
                    </button>
                    <button
                    className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    onClick={() => {setSelectedNote({ ...selectedNote, showModal: true })}}
                    >
                    Generate Flashcards
                    </button>
                    
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