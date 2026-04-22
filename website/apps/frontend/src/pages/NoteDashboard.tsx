import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import MCQQuizView from "../components/MCQQuizView";
import sosLogo from '../../assets/sos-logo.png';
import { FileText } from "lucide-react";


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

interface Note {
  id: string;
  title: string;
  content: string;
  tag?: string;
}

const TAGS = [
  { label: "Vocabulary", pill: "bg-[#E6F1FB] text-[#185FA5]", accent: "#185FA5", desc: "New words & definitions" },
  { label: "Grammar",    pill: "bg-[#FAEEDA] text-[#854F0B]", accent: "#dc6505", desc: "Rules, tenses, conjugations" },
  { label: "Phrases",    pill: "bg-[#E1F5EE] text-[#0F6E56]", accent: "#0F6E56", desc: "Idioms & expressions" },
  { label: "Listening",  pill: "bg-[#EEEDFE] text-[#534AB7]", accent: "#534AB7", desc: "Audio & video notes" },
  { label: "Reading",    pill: "bg-[#FAECE7] text-[#993C1D]", accent: "#993C1D", desc: "Texts & articles" },
  { label: "Culture",    pill: "bg-[#FBEAF0] text-[#993556]", accent: "#993556", desc: "Cultural context & customs" },
  { label: "Mistakes",   pill: "bg-[#FCEBEB] text-[#A32D2D]", accent: "#A32D2D", desc: "Errors to review & fix" },
];

const getTag = (label?: string) =>
  TAGS.find((t) => t.label === label) ?? TAGS[0];

export const NoteDashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tag: "" });

  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loadingSet, setLoadingSet] = useState(false);
  const [mcqSet, setMcqSet] = useState<MCQSet | null>(null);
  const [showFlashcardConfirm, setShowFlashcardConfirm] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const [editedNote, setEditedNote] = useState<Note | null>(null);
const [isDirty, setIsDirty] = useState(false);
const [isEditing, setIsEditing] = useState(false);

const updateNote = async () => {
  if (!editedNote) return;

  const session = await supabase.auth.getSession();

  const response = await fetch(
    `https://sos-lang.onrender.com/notes/${editedNote.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        note_title: editedNote.title,
        content: editedNote.content,
        tag: editedNote.tag,
      }),
    }
  );

  if (response.ok) {
    toast.success("Changes saved!");
    setIsDirty(false);
    fetchNotes();
  } else {
    toast.error("Failed to save changes");
  }
};

  const fetchNotes = async () => {
    const session = await supabase.auth.getSession();
    const response = await fetch("https://sos-lang.onrender.com/notes/", {
      method: "GET",
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    const data = await response.json();
    setNotes(data.map((n: any) => ({ ...n, id: n.note_id })));
  };

  React.useEffect(() => { fetchNotes(); }, []);

  const openNewNote = () => {
    setNewNote({ title: "", content: "", tag: "" });
    setIsCreatingNew(true);
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!newNote.title.trim()) { toast.error("Please add a title."); return; }
    if (!newNote.tag) { toast.error("Please choose a tag."); return; }
    const session = await supabase.auth.getSession();
    const response = await fetch("https://sos-lang.onrender.com/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        note_title: newNote.title,
        content: newNote.content,
        tag: newNote.tag,
      }),
    });
    if (response.ok) {
      toast.success("Note saved!");
      setIsCreatingNew(false);
      await fetchNotes();
    } else {
      toast.error("Failed to save note.");
    }
  };

  const deleteNote = async (noteId: string) => {
    const session = await supabase.auth.getSession();
    const response = await fetch(`https://sos-lang.onrender.com/notes/${noteId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    if (response.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setSelectedId(null);
    } else {
      toast.error("Failed to delete note.");
    }
  };

  const generateFlashcards = async (note_id: string) => {
    try {
      setIsGenerating(true);
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/flashcards/${note_id}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Flashcards generated!");
        setShowFlashcardConfirm(false);
        return data.flashcard_set;
      } else {
        toast.error(data.detail || "Failed to generate flashcards");
      }
    } catch { toast.error("Network / server error"); }
    finally { setIsGenerating(false); }
  };

  const generateSummary = async (note_id: string) => {
    try {
      setIsGenerating(true);
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/${note_id}/summarize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
        setShowSummaryModal(true);
        toast.success("Summary generated!");
      } else {
        toast.error(data.detail || "Failed to generate summary");
      }
    } catch { toast.error("Error generating summary"); }
    finally { setIsGenerating(false); }
  };

  const generateMCQSet = async (noteId: string) => {
    setLoadingSet(true);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`https://sos-lang.onrender.com/ai/mcqs/${noteId}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setMcqSet(data.mcq_set);
      toast.success("MCQ Quiz generated!");
    } catch { toast.error("Failed to generate MCQ quiz"); }
    finally { setLoadingSet(false); }
  };

  if (mcqSet) {
    return <MCQQuizView mcqSet={mcqSet} onClose={() => setMcqSet(null)} />;
  }

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden bg-[#080f1a]"
      style={{ fontFamily: "'Poppins'" }}
    >
      {/* TOP BAR */}

<header className="relative shrink-0 flex items-center px-6 py-3.5 bg-[#0a1628] border-b border-white/[0.07] overflow-hidden">

  {/* Background Logo */}
  <img
    src={sosLogo}
    alt="SOS-Lang Logo"
    className="absolute right-4 top-1/2 -translate-y-1/2 h-20 opacity-10 pointer-events-none select-none"
  />

  {/* LEFT: Icon + Title */}
  <div className="relative z-10 flex items-center gap-3">
    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
      <FileText size={20} />
    </div>

    <h1 className="text-[24px] font-[Poppins] font-semibold text-white tracking-wide">
      SOS-Lang Notes
    </h1>
  </div>

</header>

      <div className="flex flex-1 overflow-hidden">

        {/* ══════════════════════════════
            LEFT PANEL
        ══════════════════════════════ */}
        <aside className="w-80 shrink-0 flex flex-col bg-[#0a1628] border-r border-white/[0.07] overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">My Notes</p>
              <p className="text-[12px] text-slate-400">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={openNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dc6505] hover:bg-[#b85204] text-white text-xs font-semibold transition-all duration-200"
            >
              <span className="text-base leading-none">+</span>
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
            {notes.length === 0 && !isCreatingNew && (
              <p className="text-center text-slate-600 text-xs mt-8 px-4 leading-relaxed">
                No notes yet.<br />
                Hit <span className="text-[#dc6505] font-semibold">+ New</span> to get started.
              </p>
            )}

            {/* Draft card */}
            {isCreatingNew && (
              <div
                className="relative rounded-xl p-4 cursor-pointer bg-[#1a3050] ring-2 ring-[#dc6505]"
                onClick={openNewNote}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">
                    Draft
                  </span>
                  <p className="text-sm font-semibold text-white leading-tight text-left line-clamp-1 flex-1">
                    {newNote.title || "Untitled note"}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed text-left">
                  {newNote.content || "Start typing your note..."}
                </p>
                <div className="mt-3 h-px w-full bg-[#dc6505]/30" />
                <p className="text-[10px] text-[#dc6505] mt-2 font-medium text-left">Editing now</p>
              </div>
            )}

            {notes.map((note) => {
              const tag = getTag(note.tag);
              const isActive = selectedId === note.id && !isCreatingNew;
              return (
                <button
                  key={note.id}
                  onClick={() => {
  if (isDirty) {
    const save = window.confirm("You have unsaved changes. Save them?");
    if (save) updateNote();
  }

  setSelectedId(note.id);
  setIsCreatingNew(false);
  setIsEditing(true);
  setEditedNote(note);
  setIsDirty(false);
}}
                  className={`w-full text-left rounded-xl p-4 transition-all duration-200 border
                    ${isActive
                      ? "bg-[#122d4a] border-white/20"
                      : "bg-[#0d1f35] border-white/[0.06] hover:bg-[#112540] hover:border-white/[0.12]"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tag.pill}`}>
                      {tag.label}
                    </span>
                    <p className="text-sm font-semibold text-slate-100 leading-tight text-left line-clamp-2 flex-1">
                      {note.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed text-left">
                    {note.content}
                  </p>
                  {isActive && (
                    <div className="mt-3 h-0.5 w-full rounded-full" style={{ background: tag.accent }} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ══════════════════════════════
            RIGHT PANEL
        ══════════════════════════════ */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080f1a]">

          {/* ── NEW NOTE MODE ── */}
          {isCreatingNew && (
            <>
              <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-[#0a1628] border-b border-white/[0.07]">
                <span className="text-[11px] font-mono text-slate-600"># Notes / New draft</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsCreatingNew(false); setNewNote({ title: "", content: "", tag: "" }); }}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!newNote.title.trim() || !newNote.tag}
                    className="text-xs font-semibold px-5 py-1.5 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-10 flex flex-col gap-6">
                {/* Title */}
                <input
                  autoFocus
                  value={newNote.title}
                  onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Note title..."
                  className="w-full bg-transparent text-3xl font-semibold text-white text-left placeholder:text-slate-700 outline-none border-none"
                />

                <div className="h-px w-full bg-white/[0.06]" />

                {/* Tag picker */}
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Choose a category
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {TAGS.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => setNewNote((p) => ({ ...p, tag: tag.label }))}
                        className={`flex flex-col items-end px-3 py-2 rounded-xl border transition-all duration-150 text-left
                          ${newNote.tag === tag.label
                            ? "border-white/30 bg-[#122d4a]"
                            : "border-white/[0.06] bg-[#0d1f35] hover:border-white/[0.15] hover:bg-[#112540]"
                          }`}
                        style={newNote.tag === tag.label ? { boxShadow: `0 0 0 2px ${tag.accent}` } : {}}
                      >
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 ${tag.pill}`}>
                          {tag.label}
                        </span>
                        <span className="text-[10px] text-slate-500">{tag.desc}</span>
                        {newNote.tag === tag.label && (
                          <div
                            className="mt-1.5 h-0.5 w-full rounded-full"
                            style={{ background: tag.accent }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-white/[0.06]" />

                {/* Content */}
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Start writing your note..."
                  rows={14}
                  className="w-full bg-transparent text-sm text-slate-300 text-left leading-relaxed placeholder:text-slate-700 outline-none border-none resize-none"
                />
              </div>
            </>
          )}

          {/* ── EXISTING NOTE VIEW ── */}
          {!isCreatingNew && selectedNote && (
            <>
              <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-[#0a1628] border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${getTag(selectedNote.tag).pill}`}>
                    {getTag(selectedNote.tag).label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 truncate max-w-[200px]">
                    {selectedNote.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && (
  <>
    <button
      onClick={() => {
        setEditedNote(selectedNote);
        setIsDirty(false);
      }}
      className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
    >
      Discard
    </button>

    <button
      onClick={updateNote}
      className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all"
    >
      Save
    </button>
  </>
)}
                  <button
                    onClick={() => generateSummary(selectedNote.id)}
                    disabled={isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40"
                  >
                    {isGenerating ? "..." : "Summarize"}
                  </button>
                  <button
                    onClick={() => setShowFlashcardConfirm(true)}
                    disabled={isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40"
                  >
                    Flashcards
                  </button>
                  <button
                    onClick={() => generateMCQSet(selectedNote.id)}
                    disabled={loadingSet || isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#185FA5] text-white hover:bg-[#0C447C] transition-all disabled:opacity-40"
                  >
                    {loadingSet ? "Generating..." : "MCQ Quiz"}
                  </button>
                  <button
                    onClick={() => { if (window.confirm("Delete this note?")) deleteNote(selectedNote.id); }}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-red-600/30 text-red-400 hover:bg-red-600/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-12 py-10">

  {/* TITLE (now editable) */}
  <input
    value={editedNote?.title || ""}
    onChange={(e) => {
      setEditedNote((prev) =>
        prev ? { ...prev, title: e.target.value } : prev
      );
      setIsDirty(true);
    }}
    className="text-3xl font-semibold text-white mb-6 leading-snug text-left bg-transparent outline-none w-full"
  />

  <div className="h-px w-full bg-white/[0.06] mb-6" />

  {/* CONTENT (now editable) */}
  <textarea
    value={editedNote?.content || ""}
    onChange={(e) => {
      setEditedNote((prev) =>
        prev ? { ...prev, content: e.target.value } : prev
      );
      setIsDirty(true);
    }}
    className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap text-left bg-transparent outline-none w-full resize-none min-h-[400px]"
  />

</div>
            </>
          )}

          {/* ── EMPTY STATE ── */}
          {!isCreatingNew && !selectedNote && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-700">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p className="text-sm text-slate-500">Select a note to view it here</p>
              <button
                onClick={openNewNote}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all"
              >
                + New Note
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ════ MODAL: Flashcard Confirm ════ */}
      {showFlashcardConfirm && selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] rounded-2xl border border-white/10 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h3 className="text-base font-semibold text-white">Generate Flashcards?</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This will create a flashcard set from{" "}
              <span className="text-white font-medium">"{selectedNote.title}"</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFlashcardConfirm(false)}
                className="text-sm font-semibold px-5 py-2 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => { toast.info("Generating..."); await generateFlashcards(selectedNote.id); }}
                disabled={isGenerating}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all disabled:opacity-40"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: Summary ════ */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] max-w-lg w-full rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">AI Summary</h3>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="bg-[#122437] rounded-xl p-4 max-h-64 overflow-y-auto border border-white/10">
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDashboard;