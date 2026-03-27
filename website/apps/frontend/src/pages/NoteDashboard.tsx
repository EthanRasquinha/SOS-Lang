import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const NoteDashboard: React.FC = () => {
  const [note, setNote] = useState({ title: "", content: "" });
  const [notes, setNotes] = useState([{ id: 1, title: "Example", content: "This is a note" }]);
  const [selectedNote, setSelectedNote] = useState<null | typeof notes[0]>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!note.title || !note.content) {
      toast.error("Title and content are required");
      return;
    }
    setNotes((prev) => [...prev, { ...note, id: Date.now() }]);
    setNote({ title: "", content: "" });
    toast.success("Note added!");
  };

  return (
    <div className="min-h-screen bg-[#ebe9e8] w-full flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#004d73] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">SOS-Lang Notes Dashboard</h1>
      </header>

      {/* Main Workspace: Side-by-side */}
      <main className="flex-grow p-8 flex flex-col md:flex-row gap-6">

        {/* LEFT: Note Creation */}
        <section className="md:w-1/2">
          <h2 className="text-[#004d73] text-2xl mb-4">Create a New Note</h2>
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

        <div className="min-h-screen bg-[#ebe9e8] md:w-1/2 flex flex-col ">
          <h1 className="text-2xl text-[#004d73] mb-6">Your Notes</h1>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedNote(note)}
              >
                <CardHeader>
                  <CardTitle className="text-[#004d73] text-lg font-semibold">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#7c7f86] text-sm line-clamp-3">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full-screen modal */}
          {selectedNote && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
              <div className="bg-white w-full max-w-3xl h-full md:h-auto rounded-lg shadow-lg relative flex flex-col">
                {/* Close button */}
                <button
                  className="absolute top-4 right-4 text-[#dc6505] text-2xl font-bold"
                  onClick={() => setSelectedNote(null)}
                >
                  ×
                </button>

                <div className="p-6 overflow-y-auto flex-grow">
                  <h2 className="text-2xl font-bold text-[#004d73] mb-4">{selectedNote.title}</h2>
                  <p className="text-[#7c7f86] text-base">{selectedNote.content}</p>
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