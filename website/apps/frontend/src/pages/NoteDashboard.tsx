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

  return (
    <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] w-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#004d73] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-['Poppins'] font-semibold">SOS-Lang Notes Dashboard</h1>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow p-8 flex flex-col md:flex-row gap-6">

        {/* LEFT: Note Creation */}
        <section className="md:w-1/2">
          <h2 className="text-[#004d73] font-['Poppins'] text-3xl mb-4">Create a New Note</h2>
          <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4">
            <CardContent className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 text-[#7c7f86] font-medium">Note Title</label>
                <Input
                  name="title"
                  value={note.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title"
                  className="w-full bg-[#ebe9e8] focus:bg-white focus:ring-2 focus:ring-[#dc6505]"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-[#7c7f86] font-medium">Note Content</label>
                <Textarea
                  name="content"
                  value={note.content}
                  onChange={handleChange}
                  placeholder="Write your note here..."
                  rows={15}
                  className="w-full bg-[#ebe9e8] focus:bg-white focus:ring-2 focus:ring-[#dc6505]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-[#dc6505] hover:bg-[#efb486] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 "
              >
                Submit Note
              </button>
            </CardFooter>
          </Card>
        </section>

        {/* RIGHT: Notes List */}
        <div className="min-h-screen bg-[#ebe9e8] md:w-1/2 flex flex-col ">
          <h1 className="text-3xl text-[#004d73] font-['Poppins'] mb-6">Your Notes</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="bg-white shadow-md rounded-lg p-4 font-['Poppins'] flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedNote(note)}
              >
                <CardHeader>
                  <CardTitle className="text-[#004d73] text-xl font-semibold">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#7c7f86] text-sm line-clamp-3">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modal for Selected Note */}
          {selectedNote && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
              <div className="bg-white w-full max-w-3xl h-full md:h-auto rounded-lg shadow-lg relative flex flex-col">
                <button
                  className="absolute top-4 right-4 text-[#dc6505] text-2xl font-bold"
                  onClick={() => setSelectedNote(null)}
                >
                  ×
                </button>

                <div className="p-6 overflow-y-auto flex-grow">
                  <h2 className="text-2xl font-bold text-[#004d73] mb-4">{selectedNote.title}</h2>
                  <div className="bg-[#ebe9e8] rounded-lg p-5 max-h-96 overflow-y-auto">
                    <p className="text-[#7c7f86] text-base text-left whitespace-pre-wrap">{selectedNote.content}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                    <button
                    className="bg-red-600 hover:bg-red-700 m-5 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this note?")) {
                      deleteNote(selectedNote.id);
                      }
                    }}
                    >
                    Delete Note
                    </button>
                    <button
                    className="bg-[#004d73] hover:bg-[#003a5f] m-5 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    onClick={() => setSelectedNote({ ...selectedNote, showModal: true })}
                    >
                    Convert to Study Material
                    </button>
                    
                    {selectedNote.showModal && (
                      <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex justify-center items-center p-4">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
                        <h3 className="text-lg font-bold text-[#004d73] mb-4">Summarize Note?</h3>
                        <p className="text-[#7c7f86] mb-6">Would you like to convert this note to study material?</p>
                        <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setSelectedNote({ ...selectedNote, showModal: false })}
                          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                          toast.success("Summarizing note...");
                          setSelectedNote({ ...selectedNote, showModal: false });
                          }}
                          className="px-4 py-2 rounded-lg bg-[#004d73] hover:bg-[#003a5f] text-white font-semibold"
                        >
                          Summarize
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