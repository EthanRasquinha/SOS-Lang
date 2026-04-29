import * as React from "react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import MCQQuizView from "../components/MCQQuizView";
import sosLogo from '../../assets/sos-logo.png';
import { FileText, Eye, Pencil, BookOpen, Search, X, SlidersHorizontal, Plus, Tag, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MCQQuestion {
  id: string;
  created_at: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface MCQSet {
  title: string;
  id: string;
  note_id: string;
  created_at: string;
  questions: MCQQuestion[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  tag?: string;
}

const CUSTOM_CATEGORY_COLORS = [
  { pill: "bg-[#E3F5E3] text-[#1B6B2F]", accent: "#1B6B2F" },
  { pill: "bg-[#FDE8F5] text-[#8B1A6B]", accent: "#8B1A6B" },
  { pill: "bg-[#E8F4FD] text-[#0B5C8A]", accent: "#0B5C8A" },
  { pill: "bg-[#FFF3E0] text-[#8B4500]", accent: "#8B4500" },
  { pill: "bg-[#F3E5F5] text-[#6A1B9A]", accent: "#6A1B9A" },
  { pill: "bg-[#E0F7FA] text-[#006064]", accent: "#006064" },
  { pill: "bg-[#FCE4EC] text-[#880E4F]", accent: "#880E4F" },
  { pill: "bg-[#E8EAF6] text-[#283593]", accent: "#283593" },
  { pill: "bg-[#F9FBE7] text-[#558B2F]", accent: "#558B2F" },
  { pill: "bg-[#EFEBE9] text-[#4E342E]", accent: "#4E342E" },
];

const DEFAULT_TAGS = [
  { label: "Vocabulario",  pill: "bg-[#E6F1FB] text-[#185FA5]", accent: "#185FA5", desc: "Palabras nuevas y definiciones" },
  { label: "Gramática",    pill: "bg-[#FAEEDA] text-[#854F0B]", accent: "#dc6505", desc: "Reglas, tiempos, conjugaciones" },
  { label: "Frases",       pill: "bg-[#E1F5EE] text-[#0F6E56]", accent: "#0F6E56", desc: "Modismos y expresiones" },
  { label: "Escucha",      pill: "bg-[#EEEDFE] text-[#534AB7]", accent: "#534AB7", desc: "Apuntes de audio y vídeo" },
  { label: "Lectura",      pill: "bg-[#FAECE7] text-[#993C1D]", accent: "#993C1D", desc: "Textos y artículos" },
  { label: "Cultura",      pill: "bg-[#FBEAF0] text-[#993556]", accent: "#993556", desc: "Contexto cultural y costumbres" },
  { label: "Errores",      pill: "bg-[#FCEBEB] text-[#A32D2D]", accent: "#A32D2D", desc: "Errores para revisar y corregir" },
];

const CUSTOM_TAGS_KEY = "sos_lang_custom_tags";

const loadCustomTags = (): Array<{ label: string; pill: string; accent: string; desc: string }> => {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCustomTags = (tags: Array<{ label: string; pill: string; accent: string; desc: string }>) => {
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(tags));
};

const Markdown = ReactMarkdown as unknown as React.FC<{ children: string; className?: string }>;

const TUTORIAL_NOTE_ID = "__tutorial__";

const TUTORIAL_NOTE: Note = {
  id: TUTORIAL_NOTE_ID,
  title: "👋 Bienvenido a SOS-LANG — Empieza aquí",
  tag: "Vocabulario",
  content: `# ¡Bienvenido a SOS-LANG! 🎉

Esta es tu **nota de tutorial**. No se guardará en tu cuenta — siempre estará aquí como referencia cuando la necesites.

---

## 📝 1. Apuntes

Las notas son la base de todo en SOS-LANG. Así es como usarlas:

- Haz clic en **+ Nueva** en la barra lateral para crear una nota.
- Dale un **título** y elige una **etiqueta de categoría**:
  - \`Vocabulario\` — palabras nuevas y definiciones
  - \`Gramática\` — reglas, tiempos, conjugaciones
  - \`Frases\` — modismos y expresiones
  - \`Escucha\` — notas de audio y vídeo
  - \`Lectura\` — textos y artículos
  - \`Cultura\` — contexto cultural y costumbres
  - \`Errores\` — errores para revisar y corregir
- Escribe el contenido de tu nota en el editor. Puedes usar **Markdown** para dar formato — encabezados, negritas, listas con viñetas, tablas y más.
- Alterna entre el modo **Ver** (renderizado) y **Editar** (texto sin formato) en cualquier momento usando el botón en la barra superior.
- Pulsa **Guardar nota** para almacenarla.

> 💡 **Consejo:** Cuanto más detallada sea tu nota, mejores serán los conjuntos de estudio generados por IA.

---

## 🃏 2. Tarjetas de estudio

Una vez escrita una nota, conviértela en un juego de tarjetas con un solo clic:

1. Abre cualquier nota.
2. Haz clic en **Tarjetas** en la barra superior.
3. Confirma la generación — la IA lee tu nota y crea un juego de tarjetas automáticamente.
4. Haz clic en **Ir al material de estudio** para empezar a repasar.

Cada tarjeta tiene un anverso (pregunta / término) y un reverso (respuesta / definición). Repásalas y marca lo que ya sabes.

---

## ❓ 3. Exámenes de opción múltiple

Los exámenes de opción múltiple ponen a prueba tu comprensión real:

1. Abre cualquier nota.
2. Haz clic en **Examen** en la barra superior.
3. La IA genera varias preguntas con cuatro opciones de respuesta, extraídas directamente del contenido de tu nota.
4. Tu puntuación se registra cada vez que completas un examen.

---

## 📊 4. Página de material de estudio

La página de **Material de estudio** (accesible desde la barra de navegación) es donde viven todos tus conjuntos generados:

- Navega por todos tus juegos de tarjetas y exámenes en un solo lugar.
- Cada conjunto está **codificado por colores** según su estado:
  - 🟢 **Aprobado** — tu puntuación media es ≥ 80 %
  - 🔴 **Necesita repaso** — tu puntuación media es < 80 %
  - 🟡 **Pendiente** — no lo has repasado en más de 3 días
  - ⚪ **Sin comenzar** — aún no lo has intentado
- Abre cualquier conjunto para repasarlo de inmediato.

---

## 📈 5. Panel de control

El **Panel de control** (accesible desde la barra de navegación) te ofrece una visión general de tu progreso:

- **Total de conjuntos** — cuántos juegos de tarjetas y exámenes has creado.
- **Exámenes completados** — número total de intentos de examen.
- **Rendimiento medio** — tu puntuación media en todos los exámenes.
- **Racha actual** — cuántos días consecutivos has estudiado.
- **Tendencia de actividad** — un gráfico de líneas que muestra tu frecuencia de repaso a lo largo del tiempo.
- **Desglose de dominio** — un gráfico circular que muestra la distribución de Aprobado / Necesita repaso / Pendiente / Sin comenzar.
- **Actividad reciente** — tus últimos resultados de exámenes, filtrables por rango de puntuación.

---

## ✏️ 6. Resumir una nota

¿No sabes qué repasar? Usa el botón **Resumir** en la barra superior de una nota. La IA generará un resumen conciso del contenido de tu nota — útil para un repaso rápido antes de un examen.

---

## 🚀 ¿Listo para empezar?

1. Haz clic en **+ Nueva** en la barra lateral.
2. Escribe tu primera lista de vocabulario, regla gramatical o conjunto de frases.
3. Genera un juego de tarjetas o un examen de opción múltiple.
4. Repásalo en la página de Material de estudio.
5. Haz seguimiento de tu progreso en el Panel de control.

¡Feliz aprendizaje! 🌍
`,
};

// ── Skeleton ───────────────────────────────────────────
const Skeleton = ({ style = {} }: { style?: React.CSSProperties }) => (
  <div
    className="rounded-lg"
    style={{
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
      ...style,
    }}
  />
);

const NoteCardSkeleton = () => (
  <div className="rounded-xl p-4 bg-[#0d1f35] border border-white/[0.06] flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <Skeleton style={{ width: 64, height: 18, borderRadius: 9999 }} />
      <Skeleton style={{ flex: 1, height: 14, maxWidth: 140 }} />
    </div>
    <Skeleton style={{ height: 11, width: "80%" }} />
    <Skeleton style={{ height: 11, width: "55%" }} />
  </div>
);

// ── Componente ─────────────────────────────────────────────────────────────────
export const NoteDashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(TUTORIAL_NOTE_ID);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tag: "" });

  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loadingSet, setLoadingSet] = useState(false);
  const [mcqSet, setMcqSet] = useState<MCQSet | null>(null);
  const [showFlashcardConfirm, setShowFlashcardConfirm] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState<"flashcards" | "mcq" | null>(null);
  const [studyLink, setStudyLink] = useState<string | null>(null);

  const [isViewMode, setIsViewMode] = useState(true);
  const [editedNote, setEditedNote] = useState<Note | null>(TUTORIAL_NOTE);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ── Barra lateral redimensionable y plegable ───────────────────────────────
  const MIN_WIDTH = 220;
  const MAX_WIDTH = 900;
  const DEFAULT_WIDTH = 450;
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDragging = React.useRef(false);
  const dragStartX = React.useRef(0);
  const dragStartWidth = React.useRef(DEFAULT_WIDTH);

  const handleDragStart = (e: React.MouseEvent) => {
    if (sidebarCollapsed) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
      setSidebarWidth(newWidth);
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Búsqueda, filtro y categorías personalizadas ───────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [customTags, setCustomTags] = useState<Array<{ label: string; pill: string; accent: string; desc: string }>>(loadCustomTags);
  const [showCustomCatModal, setShowCustomCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const TAGS = useMemo(() => [...DEFAULT_TAGS, ...customTags], [customTags]);
  const getTag = (label?: string) => TAGS.find((t) => t.label === label) ?? DEFAULT_TAGS[0];

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === null || note.tag === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [notes, searchQuery, activeFilter]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => { if (n.tag) counts[n.tag] = (counts[n.tag] || 0) + 1; });
    return counts;
  }, [notes]);

  const isTutorialSelected = selectedId === TUTORIAL_NOTE_ID;
  const selectedNote = isTutorialSelected
    ? TUTORIAL_NOTE
    : (notes.find((n) => n.id === selectedId) ?? null);

  const handleCreateCustomCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) { toast.error("Por favor, introduce un nombre de categoría."); return; }
    if (TAGS.find((t) => t.label.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre.");
      return;
    }
    const colorIdx = customTags.length % CUSTOM_CATEGORY_COLORS.length;
    const color = CUSTOM_CATEGORY_COLORS[colorIdx];
    const newTag = {
      label: trimmed,
      pill: color.pill,
      accent: color.accent,
      desc: newCatDesc.trim() || "Categoría personalizada",
    };
    const updated = [...customTags, newTag];
    setCustomTags(updated);
    saveCustomTags(updated);
    setNewCatName("");
    setNewCatDesc("");
    setShowCustomCatModal(false);
    toast.success(`¡Categoría "${trimmed}" creada!`);
  };

  const updateNote = async () => {
    if (!editedNote || isTutorialSelected) return;
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
      toast.success("¡Cambios guardados!");
      setIsDirty(false);
      fetchNotes();
    } else {
      toast.error("No se pudieron guardar los cambios.");
    }
  };

  const fetchNotes = async () => {
    setNotesLoading(true);
    const session = await supabase.auth.getSession();
    const response = await fetch("https://sos-lang.onrender.com/notes/", {
      method: "GET",
      headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
    });
    const data = await response.json();
    setNotes(data.map((n: any) => ({ ...n, id: n.note_id })));
    setNotesLoading(false);
  };

  React.useEffect(() => { fetchNotes(); }, []);

  const openNewNote = () => {
    setNewNote({ title: "", content: "", tag: "" });
    setIsCreatingNew(true);
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!newNote.title.trim()) { toast.error("Por favor, añade un título."); return; }
    if (!newNote.tag) { toast.error("Por favor, elige una etiqueta."); return; }
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
      toast.success("¡Nota guardada!");
      setIsCreatingNew(false);
      await fetchNotes();
    } else {
      toast.error("No se pudo guardar la nota.");
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
      setSelectedId(TUTORIAL_NOTE_ID);
      setEditedNote(TUTORIAL_NOTE);
    } else {
      toast.error("No se pudo eliminar la nota.");
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
        setShowFlashcardConfirm(false);
        setSuccessType("flashcards");
        setStudyLink(`/studymaterial`);
        setShowSuccessModal(true);
        return data.flashcard_set;
      } else {
        toast.error(data.detail || "Error al generar las tarjetas.");
      }
    } catch { toast.error("Error de red / servidor."); }
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
        toast.success("¡Resumen generado!");
      } else {
        toast.error(data.detail || "Error al generar el resumen.");
      }
    } catch { toast.error("Error al generar el resumen."); }
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
      setSuccessType("mcq");
      setStudyLink(`/studymaterial`);
      setShowSuccessModal(true);
    } catch { toast.error("Error al generar el examen."); }
    finally { setLoadingSet(false); }
  };

  if (mcqSet) {
    return (
      <MCQQuizView
        mcqSet={mcqSet}
        onComplete={(score, total) => {
          console.log(`Puntuación: ${score}/${total}`);
          setMcqSet(null);
        }}
        onBack={() => setMcqSet(null)}
      />
    );
  }

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden bg-[#080f1a]"
      style={{ fontFamily: "'Poppins'" }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* BARRA SUPERIOR */}
      <header className="relative shrink-0 flex items-center px-6 py-3.5 bg-[#0a1628] border-b border-white/[0.07] overflow-hidden">
        <img
          src={sosLogo}
          alt="Logo SOS-LANG"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-20 opacity-10 pointer-events-none select-none"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <FileText size={20} />
          </div>
          <h1 className="text-[24px] font-[Poppins] font-semibold text-white tracking-wide">
            Mis apuntes
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Barra lateral plegada */}
        {sidebarCollapsed && (
          <div className="shrink-0 flex flex-col items-center bg-[#0a1628] border-r border-white/[0.07] py-4 gap-4" style={{ width: 48 }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              title="Expandir barra lateral"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight size={14} />
            </button>
            <div className="flex-1 flex flex-col items-center gap-3 overflow-hidden">
              {notes.slice(0, 12).map((note) => {
                const tag = getTag(note.tag);
                return (
                  <button
                    key={note.id}
                    title={note.title}
                    onClick={() => {
                      setSidebarCollapsed(false);
                      setSelectedId(note.id);
                      setIsCreatingNew(false);
                      setEditedNote(note);
                      setIsDirty(false);
                      setIsViewMode(true);
                    }}
                    className="w-5 h-5 rounded-md shrink-0 transition-all hover:scale-110"
                    style={{ background: tag.accent + "33", border: `1.5px solid ${tag.accent}55` }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ══ BARRA LATERAL ══ */}
        <aside
          className="shrink-0 flex flex-col bg-[#0a1628] border-r border-white/[0.07] overflow-hidden relative"
          style={{
            width: sidebarCollapsed ? 0 : sidebarWidth,
            minWidth: sidebarCollapsed ? 0 : MIN_WIDTH,
            transition: "width 0.18s ease, min-width 0.18s ease",
          }}
        >
          {/* Manejador de arrastre */}
          {!sidebarCollapsed && (
            <div
              onMouseDown={handleDragStart}
              className="absolute top-0 right-0 w-3 h-full z-20 cursor-col-resize group flex items-center justify-center"
            >
              <div className="w-px h-full bg-white/[0.04] group-hover:bg-[#dc6505]/40 transition-colors duration-150" />
              <div className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={11} className="text-slate-600" />
              </div>
            </div>
          )}

          {/* Encabezado */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Mis Apuntes</p>
              <p className="text-[12px] text-slate-400">
                {notesLoading ? (
                  <Skeleton style={{ width: 80, height: 12, display: "inline-block" }} />
                ) : filteredNotes.length !== notes.length
                  ? `${filteredNotes.length} de ${notes.length}`
                  : `${notes.length} nota${notes.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(true)}
                title="Plegar barra lateral"
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={openNewNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dc6505] hover:bg-[#b85204] text-white text-xs font-semibold transition-all duration-200"
              >
                <span className="text-base leading-none">+</span>
                Nueva
              </button>
            </div>
          </div>

          {/* ZONA DE BÚSQUEDA Y FILTRO */}
          <div className="px-4 pt-4 pb-4 flex flex-col gap-3 bg-[#060d1a] border-b-2 border-white/[0.1]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notas…"
                disabled={notesLoading}
                className="w-full bg-[#0d1e32] border-2 border-white/25 rounded-xl pl-9 pr-9 py-2.5 text-[13px] font-medium text-white placeholder:text-slate-500 outline-none focus:border-[#dc6505]/80 focus:bg-[#0f2438] transition-all disabled:opacity-50"
                style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterPanel((v) => !v)}
                disabled={notesLoading}
                className={`flex items-center gap-2 text-[12px] font-bold px-3 py-2 rounded-lg border-2 transition-all duration-150 flex-1 justify-center disabled:opacity-50
                  ${showFilterPanel || activeFilter
                    ? "bg-[#dc6505]/20 border-[#dc6505]/60 text-[#fb923c]"
                    : "bg-white/[0.06] border-white/20 text-slate-300 hover:border-white/35 hover:text-white hover:bg-white/[0.1]"
                  }`}
              >
                <SlidersHorizontal size={13} />
                {activeFilter ? `${activeFilter}` : "Filtrar por categoría"}
                {activeFilter && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-[#dc6505] text-white text-[9px] font-black flex items-center justify-center">1</span>
                )}
              </button>

              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  title="Eliminar filtro"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border-2 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-300 transition-all shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {showFilterPanel && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.12em] px-0.5">Seleccionar categoría</p>
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all duration-150
                    ${activeFilter === null
                      ? "bg-white/[0.12] border-white/50 text-white shadow-sm"
                      : "bg-white/[0.04] border-white/[0.14] text-slate-400 hover:bg-white/[0.08] hover:border-white/30 hover:text-slate-200"
                    }`}
                >
                  <span>Todas las notas</span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full
                    ${activeFilter === null ? "bg-white/25 text-white" : "bg-white/[0.08] text-slate-500"}`}>
                    {notes.length}
                  </span>
                </button>

                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {TAGS.map((tag) => {
                    const isActive = activeFilter === tag.label;
                    return (
                      <button
                        key={tag.label}
                        onClick={() => setActiveFilter(isActive ? null : tag.label)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 transition-all duration-150
                          ${isActive
                            ? "bg-[#0c1e30] border-white/30"
                            : "bg-white/[0.03] border-white/[0.1] hover:bg-[#0c1e30] hover:border-white/20"
                          }`}
                        style={isActive ? { boxShadow: `0 0 0 1px ${tag.accent}, inset 0 0 12px ${tag.accent}15` } : {}}
                      >
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tag.pill}`}>
                          {tag.label}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                          ${isActive ? "bg-white/20 text-white" : "bg-white/[0.07] text-slate-500"}`}>
                          {tagCounts[tag.label] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowCustomCatModal(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-white/25 text-[12px] font-bold text-slate-400 hover:text-white hover:border-[#dc6505]/60 hover:bg-[#dc6505]/[0.08] transition-all duration-150"
                >
                  <div className="w-5 h-5 rounded-md bg-white/[0.08] border border-white/20 flex items-center justify-center shrink-0">
                    <Plus size={11} />
                  </div>
                  Nueva categoría personalizada
                </button>
              </div>
            )}
          </div>

          {/* LISTA DE NOTAS */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">

            {/* Nota de tutorial */}
            <div className="px-1 pb-1">
              <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">Guía</p>
              <button
                onClick={() => {
                  if (isDirty) {
                    const save = window.confirm("Tienes cambios sin guardar. ¿Deseas guardarlos?");
                    if (save) updateNote();
                  }
                  setSelectedId(TUTORIAL_NOTE_ID);
                  setIsCreatingNew(false);
                  setEditedNote(TUTORIAL_NOTE);
                  setIsDirty(false);
                  setIsViewMode(true);
                }}
                className={`w-full text-left rounded-xl p-4 transition-all duration-200 border
                  ${isTutorialSelected && !isCreatingNew
                    ? "bg-[#122d4a] border-[#534AB7]/40"
                    : "bg-[#0d1b2e] border-[#534AB7]/15 hover:bg-[#0f2040] hover:border-[#534AB7]/30"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "rgba(83,74,183,0.15)", color: "#a78bfa" }}>
                    <BookOpen size={11} />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#534AB7]">Tutorial</span>
                </div>
                <p className="text-[12px] font-semibold text-slate-200 leading-tight text-left line-clamp-1">Bienvenido a SOS-LANG</p>
                <p className="text-[11px] text-slate-500 mt-1 text-left">Tutorial completo — empieza aquí</p>
                {isTutorialSelected && !isCreatingNew && (
                  <div className="mt-2.5 h-0.5 w-full rounded-full bg-[#534AB7]/50" />
                )}
              </button>
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-2 px-1 py-1">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest">
                {activeFilter ? activeFilter : searchQuery ? "Resultados" : "Mis Apuntes"}
              </p>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Skeleton loading state */}
            {notesLoading && (
              <div className="flex flex-col gap-2 px-1">
                {[...Array(5)].map((_, i) => (
                  <NoteCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!notesLoading && notes.length === 0 && !isCreatingNew && (
              <p className="text-left text-slate-600 text-xs mt-4 px-4 leading-relaxed">
                Aún no hay notas.<br />
                Pulsa <span className="text-[#dc6505] font-semibold">+ Nueva</span> para empezar.
              </p>
            )}
            {!notesLoading && notes.length > 0 && filteredNotes.length === 0 && (
              <div className="flex flex-col items-center gap-2 mt-8 px-4 text-center">
                <Search size={22} className="text-slate-700" />
                <p className="text-slate-600 text-xs leading-relaxed">
                  No hay notas que coincidan{searchQuery ? ` con "${searchQuery}"` : ""}{activeFilter ? ` en ${activeFilter}` : ""}.
                </p>
                {(searchQuery || activeFilter) && (
                  <button
                    onClick={() => { setSearchQuery(""); setActiveFilter(null); }}
                    className="text-[11px] text-[#dc6505] hover:underline"
                  >
                    Eliminar filtros
                  </button>
                )}
              </div>
            )}

            {/* Tarjeta borrador */}
            {isCreatingNew && (
              <div className="relative rounded-xl p-4 cursor-pointer bg-[#1a3050] ring-2 ring-[#dc6505]" onClick={openNewNote}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">Borrador</span>
                  <p className="text-sm font-semibold text-white leading-tight text-left line-clamp-1 flex-1">
                    {newNote.title || "Nota sin título"}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed text-left">
                  {newNote.content || "Empieza a escribir tu nota..."}
                </p>
                <div className="mt-3 h-px w-full bg-[#dc6505]/30" />
                <p className="text-[10px] text-[#dc6505] mt-2 font-medium text-left">Editando ahora</p>
              </div>
            )}

            {!notesLoading && filteredNotes.map((note) => {
              const tag = getTag(note.tag);
              const isActive = selectedId === note.id && !isCreatingNew;
              return (
                <button
                  key={note.id}
                  onClick={() => {
                    if (isDirty) {
                      const save = window.confirm("Tienes cambios sin guardar. ¿Deseas guardarlos?");
                      if (save) updateNote();
                    }
                    setSelectedId(note.id);
                    setIsCreatingNew(false);
                    setIsEditing(true);
                    setEditedNote(note);
                    setIsDirty(false);
                    setIsViewMode(true);
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
                      {searchQuery ? <HighlightMatch text={note.title} query={searchQuery} /> : note.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed text-left">{note.content}</p>
                  {isActive && (
                    <div className="mt-3 h-0.5 w-full rounded-full" style={{ background: tag.accent }} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* PANEL DERECHO */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080f1a]">

          {isCreatingNew && (
            <>
              <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-[#0a1628] border-b border-white/[0.07]">
                <span className="text-[11px] font-mono text-slate-600"># Apuntes / Borrador nuevo</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setIsCreatingNew(false); setNewNote({ title: "", content: "", tag: "" }); }}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-400 hover:bg-white/5 transition-all">
                    Descartar
                  </button>
                  <button onClick={handleSubmit} disabled={!newNote.title.trim() || !newNote.tag}
                    className="text-xs font-semibold px-5 py-1.5 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Guardar nota
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-12 py-10 flex flex-col gap-6">
                <input autoFocus value={newNote.title}
                  onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Título de la nota..."
                  className="w-full bg-transparent text-3xl font-semibold text-white text-left placeholder:text-slate-700 outline-none border-none" />
                <div className="h-px w-full bg-white/[0.06]" />
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Elige una categoría</p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {TAGS.map((tag) => (
                      <button key={tag.label} onClick={() => setNewNote((p) => ({ ...p, tag: tag.label }))}
                        className={`flex flex-col items-end px-3 py-2 rounded-xl border transition-all duration-150 text-left
                          ${newNote.tag === tag.label ? "border-white/30 bg-[#122d4a]" : "border-white/[0.06] bg-[#0d1f35] hover:border-white/[0.15] hover:bg-[#112540]"}`}
                        style={newNote.tag === tag.label ? { boxShadow: `0 0 0 2px ${tag.accent}` } : {}}>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 ${tag.pill}`}>{tag.label}</span>
                        <span className="text-[10px] text-slate-500">{tag.desc}</span>
                        {newNote.tag === tag.label && <div className="mt-1.5 h-0.5 w-full rounded-full" style={{ background: tag.accent }} />}
                      </button>
                    ))}
                    <button onClick={() => setShowCustomCatModal(true)}
                      className="flex flex-col items-center justify-center px-3 py-2 rounded-xl border border-dashed border-white/[0.12] text-slate-500 hover:text-slate-300 hover:border-white/25 hover:bg-white/[0.03] transition-all duration-150 min-w-[80px]">
                      <Plus size={14} className="mb-1" />
                      <span className="text-[10px]">Personalizada</span>
                    </button>
                  </div>
                </div>
                <div className="h-px w-full bg-white/[0.06]" />
                <textarea value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Empieza a escribir tu nota..." rows={14}
                  className="w-full bg-transparent text-sm text-slate-300 text-left leading-relaxed placeholder:text-slate-700 outline-none border-none resize-none" />
              </div>
            </>
          )}

          {!isCreatingNew && isTutorialSelected && (
            <>
              <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-[#0a1628] border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(83,74,183,0.15)", color: "#a78bfa" }}>
                    <BookOpen size={13} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#a78bfa]">Tutorial · Solo lectura</span>
                </div>
                <button onClick={openNewNote}
                  className="text-xs font-semibold px-5 py-1.5 rounded-full text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#dc6505,#f59e0b)", boxShadow: "0 0 16px rgba(220,101,5,0.25)" }}>
                  + Crear mi primera nota
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-12 py-10">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: "rgba(83,74,183,0.12)", border: "1px solid rgba(83,74,183,0.25)", color: "#a78bfa" }}>
                  <BookOpen size={11} />
                  Guía de inicio
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-left prose-headings:text-white prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-em:text-slate-300 prose-code:text-orange-300 prose-code:bg-orange-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0d1f35] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-blockquote:border-l-[#dc6505] prose-blockquote:text-slate-400 prose-blockquote:bg-[#0d1f35]/60 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:marker:text-[#dc6505] prose-hr:border-white/10 prose-a:text-[#185FA5] hover:prose-a:text-blue-300 prose-table:text-slate-300 prose-th:text-white prose-th:border-white/10 prose-td:border-white/10">
                  <Markdown>{TUTORIAL_NOTE.content}</Markdown>
                </div>
              </div>
            </>
          )}

          {!isCreatingNew && selectedNote && !isTutorialSelected && (
            <>
              <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-[#0a1628] border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${getTag(selectedNote.tag).pill}`}>
                    {getTag(selectedNote.tag).label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 truncate max-w-[200px]">{selectedNote.title}</span>
                  <div className="flex items-center rounded-lg border border-white/10 overflow-hidden ml-1">
                    <button onClick={() => setIsViewMode(true)} title="Ver (markdown renderizado)"
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-150
                        ${isViewMode ? "bg-[#122d4a] text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                      <Eye size={12} /> Ver
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button onClick={() => setIsViewMode(false)} title="Modo edición"
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-150
                        ${!isViewMode ? "bg-[#122d4a] text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                      <Pencil size={12} /> Editar
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <>
                      <button onClick={() => { setEditedNote(selectedNote); setIsDirty(false); }}
                        className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all">
                        Descartar
                      </button>
                      <button onClick={updateNote}
                        className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all">
                        Guardar
                      </button>
                    </>
                  )}
                  <button onClick={() => generateSummary(selectedNote.id)} disabled={isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40">
                    {isGenerating ? "..." : "Resumir"}
                  </button>
                  <button onClick={() => setShowFlashcardConfirm(true)} disabled={isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40">
                    Tarjetas
                  </button>
                  <button onClick={() => generateMCQSet(selectedNote.id)} disabled={loadingSet || isGenerating}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#185FA5] text-white hover:bg-[#0C447C] transition-all disabled:opacity-40">
                    {loadingSet ? "Generando..." : "Examen"}
                  </button>
                  <button onClick={() => { if (window.confirm("¿Eliminar esta nota?")) deleteNote(selectedNote.id); }}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full border border-red-600/30 text-red-400 hover:bg-red-600/10 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-12 py-10">
                {isViewMode ? (
                  <>
                    <h1 className="text-3xl font-semibold text-white mb-6 leading-snug text-left">
                      {editedNote?.title || selectedNote.title}
                    </h1>
                    <div className="h-px w-full bg-white/[0.06] mb-6" />
                    <div className="prose prose-invert prose-sm max-w-none text-left prose-headings:text-white prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-semibold prose-em:text-slate-300 prose-code:text-orange-300 prose-code:bg-orange-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0d1f35] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-blockquote:border-l-[#dc6505] prose-blockquote:text-slate-400 prose-blockquote:bg-[#0d1f35]/60 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:marker:text-[#dc6505] prose-hr:border-white/10 prose-a:text-[#185FA5] hover:prose-a:text-blue-300 prose-table:text-slate-300 prose-th:text-white prose-th:border-white/10 prose-td:border-white/10">
                      <Markdown>{editedNote?.content || selectedNote.content}</Markdown>
                    </div>
                  </>
                ) : (
                  <>
                    <input value={editedNote?.title || ""}
                      onChange={(e) => { setEditedNote((prev) => prev ? { ...prev, title: e.target.value } : prev); setIsDirty(true); }}
                      className="text-3xl font-semibold text-white mb-6 leading-snug text-left bg-transparent outline-none w-full" />
                    <div className="h-px w-full bg-white/[0.06] mb-6" />
                    <textarea value={editedNote?.content || ""}
                      onChange={(e) => { setEditedNote((prev) => prev ? { ...prev, content: e.target.value } : prev); setIsDirty(true); }}
                      className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap text-left bg-transparent outline-none w-full resize-none min-h-[400px] font-mono" />
                  </>
                )}
              </div>
            </>
          )}

          {!isCreatingNew && !selectedNote && !isTutorialSelected && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-700">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p className="text-sm text-slate-500">Selecciona una nota para verla aquí</p>
              <button onClick={openNewNote}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all">
                + Nueva nota
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Confirmar tarjetas */}
      {showFlashcardConfirm && selectedNote && !isTutorialSelected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] rounded-2xl border border-white/10 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h3 className="text-base font-semibold text-white">¿Generar tarjetas?</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Esto creará un juego de tarjetas a partir de <span className="text-white font-medium">"{selectedNote.title}"</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowFlashcardConfirm(false)}
                className="text-sm font-semibold px-5 py-2 rounded-full border border-white/10 text-slate-300 hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={async () => { await generateFlashcards(selectedNote.id); }} disabled={isGenerating}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all disabled:opacity-40">
                {isGenerating ? "Generando..." : "Generar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Generación exitosa */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] rounded-2xl border border-white/10 shadow-2xl p-7 max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center" style={{ width: 52, height: 52 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold text-white">
                {successType === "flashcards" ? "¡Tarjetas generadas!" : "¡Examen generado!"}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tu {successType === "flashcards" ? "juego de tarjetas" : "examen"} para{" "}
                <span className="text-slate-200 italic">"{selectedNote?.title}"</span> está listo para estudiar.
              </p>
            </div>
            <div className="w-full h-px bg-white/[0.07]" />
            <div className="flex flex-col gap-2 w-full">
              <a href={studyLink ?? "#"}
                className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-[#dc6505] text-white hover:bg-[#b85204] transition-all">
                Ir al material de estudio →
              </a>
              <button onClick={() => setShowSuccessModal(false)}
                className="w-full text-sm font-medium py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all">
                Quedarme aquí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Resumen */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] max-w-lg w-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc6505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">Resumen de IA</span>
              </div>
              <button onClick={() => setShowSummaryModal(false)}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-base leading-none transition-all">
                ×
              </button>
            </div>
            <div className="px-5 py-5 flex flex-col gap-3">
              {selectedNote && (
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{selectedNote.title}</p>
              )}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button onClick={() => setShowSummaryModal(false)}
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-[#dc6505] text-white hover:bg-[#b85204] transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Categoría personalizada */}
      {showCustomCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e1f35] rounded-2xl border border-white/10 shadow-2xl p-6 max-w-sm w-full flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Tag size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Nueva categoría personalizada</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Se asignará un color automáticamente</p>
              </div>
            </div>
            {newCatName.trim() && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <span className="text-[10px] text-slate-500">Vista previa:</span>
                {(() => {
                  const colorIdx = customTags.length % CUSTOM_CATEGORY_COLORS.length;
                  const color = CUSTOM_CATEGORY_COLORS[colorIdx];
                  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${color.pill}`}>{newCatName.trim()}</span>;
                })()}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Nombre de la categoría *</label>
                <input autoFocus value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCustomCategory()}
                  placeholder="p. ej. Pronunciación, Escritura..." maxLength={30}
                  className="w-full bg-[#0d1f35] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-white/20 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Descripción <span className="text-slate-700 normal-case font-normal">(opcional)</span>
                </label>
                <input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Breve descripción de esta categoría" maxLength={60}
                  className="w-full bg-[#0d1f35] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-white/20 transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setShowCustomCatModal(false); setNewCatName(""); setNewCatDesc(""); }}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-white/10 text-slate-400 hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleCreateCustomCategory} disabled={!newCatName.trim()}
                className="text-xs font-semibold px-5 py-2 rounded-full bg-[#dc6505] text-white hover:bg-[#b85204] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Crear categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Resaltar coincidencia de búsqueda ─────────────────────────────────────────
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-orange-500/25 text-orange-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export default NoteDashboard;