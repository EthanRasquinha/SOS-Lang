import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";


interface MCQQuestion {
  id: string;
  created_at: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface MCQSet {
  id: string;
  title: string;
  note_id: string;
  created_at: string;
  questions: MCQQuestion[];
}

interface MCQQuizViewProps {
    mcqSet: MCQSet;
    onComplete: (score: number, total: number) => void;
    onBack: () => void;
}

const MCQQuizView: React.FC<MCQQuizViewProps> = ({ mcqSet, onComplete, onBack }) => {
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [finished, setFinished] = useState(false);

    const questions = mcqSet.questions;
    const q = questions[index];
            const submitMCQResults = async (finalScore: number) => {
            try {
                const session = await supabase.auth.getSession();

                const response = await fetch("http://localhost:8000/ai/quiz-results", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.data.session?.access_token}`,
                    },
                    body: JSON.stringify({
                        mcq_set_id: mcqSet.id,
                        score: finalScore,
                        total: questions.length,
                    }),
                });

                if (response.ok) {
                    toast.success("Results saved!");
                }
            } catch (error) {
                console.error("Error saving MCQ results:", error);
            }
        };
    const normalizeOptions = (options: unknown): string[] => {
        if (Array.isArray(options)) return options;



        if (typeof options === "string") {
            try {
                return JSON.parse(options);
            } catch {
                return [];
            }
        }

        return [];
    };
    const normalizedOptions = normalizeOptions(q.options);
    const isLast = index === questions.length - 1;

    const handleAnswer = (option: string) => {
        if (selected) return; // prevent re-selection
        setSelected(option);
        setShowExplanation(true);
        if (option === q.correct_answer) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLast) {
            setFinished(true);
        } else {
            setIndex((prev) => prev + 1);
            setSelected(null);
            setShowExplanation(false);
        }
    };

    const getOptionClass = (opt: string) => {
        if (!selected) {
            return "bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer";
        }
        if (opt === q.correct_answer) {
            return "bg-green-600/40 border border-green-400 cursor-default";
        }
        if (opt === selected && opt !== q.correct_answer) {
            return "bg-red-600/40 border border-red-400 cursor-default";
        }
        return "bg-white/5 border border-white/10 cursor-default opacity-50";
    };

    if (finished) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <div className="min-h-screen bg-[var(--page-bg)] text-white flex flex-col items-center justify-center p-8 gap-6">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                    <h2 className="text-3xl font-bold mb-2">{mcqSet.title}</h2>
                    <p className="text-slate-400 mb-8">Quiz Complete!</p>

                    <div className="text-6xl font-bold mb-2" style={{ color: percent >= 80 ? "#22c55e" : percent >= 50 ? "#f59e0b" : "#ef4444" }}>
                        {percent}%
                    </div>
                    <p className="text-slate-300 mb-8">
                        You scored <span className="text-white font-semibold">{score}</span> out of{" "}
                        <span className="text-white font-semibold">{questions.length}</span>
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onBack}
                            className="px-6 py-2 rounded-full bg-[#1f3248] hover:bg-[#36718f] text-white font-semibold transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => {
                                onComplete(score, questions.length);
                                submitMCQResults(score);
                            }}
                            className="px-6 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                    >
                        ← Back
                    </button>
                    <span className="text-slate-400 text-sm">
                        Question {index + 1} / {questions.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className="bg-[var(--accent)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((index + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question card */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
                    <h2 className="text-xl font-semibold leading-relaxed">{q.question}</h2>

                    <div className="grid gap-3">
                        {normalizedOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 font-medium ${getOptionClass(opt)}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* Explanation */}
                    {showExplanation && q.explanation && (
                        <div className="bg-[var(--surface-soft)] rounded-2xl p-4 border border-white/10 text-slate-300 text-sm">
                            <span className="text-[var(--accent)] font-semibold">Explanation: </span>
                            {q.explanation}
                        </div>
                    )}

                    {/* Next button */}
                    {selected && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleNext}
                                className="bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
                            >
                                {isLast ? "Finish Quiz" : "Next →"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Score tracker */}
                <p className="text-center text-slate-500 text-sm">
                    Score so far: {score} / {index + (selected ? 1 : 0)}
                </p>
            </div>
        </div>
    );
};

export default MCQQuizView;
