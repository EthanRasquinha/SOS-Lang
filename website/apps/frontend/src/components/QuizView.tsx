import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

{/*
  This component implements a flashcard quiz interface. It displays one flashcard at a time, allowing the user to input their answer and check it against the correct answer. 
  The user can mark their answer as correct or wrong, and the component provides immediate feedback with sound effects and visual cues. 
  At the end of the quiz, it shows a summary of the user's performance, including their score and accuracy percentage. 
  The component also handles saving the quiz results to a backend server.
*/}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  flashcards: Flashcard[];
}

interface QuizViewProps {
  flashcardSet: FlashcardSet;
  onComplete: () => void;
  onBack: () => void;
}

// ── Sound synthesis via Web Audio API ──────────────────────────────────────
function useSound() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new AudioContext();
    return ctx.current;
  };

  const playCorrect = useCallback(() => {
    const ac = getCtx();
    const times = [0, 0.12, 0.24];
    const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5
    times.forEach((t, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.value = freqs[i];
      gain.gain.setValueAtTime(0, ac.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.25, ac.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.35);
      osc.start(ac.currentTime + t);
      osc.stop(ac.currentTime + t + 0.36);
    });
  }, []);

  const playWrong = useCallback(() => {
    const ac = getCtx();
    [0, 0.18].forEach((t) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, ac.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(120, ac.currentTime + t + 0.3);
      gain.gain.setValueAtTime(0.2, ac.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.32);
      osc.start(ac.currentTime + t);
      osc.stop(ac.currentTime + t + 0.33);
    });
  }, []);

  return { playCorrect, playWrong };
}

// ── Particle burst ─────────────────────────────────────────────────────────
const Particles: React.FC<{ active: boolean; correct: boolean }> = ({ active, correct }) => {
  if (!active) return null;
  const colors = correct
    ? ["#4ade80", "#86efac", "#fde68a", "#6ee7b7", "#a5f3fc"]
    : ["#f87171", "#fca5a5", "#fb923c", "#fcd34d", "#f472b6"];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => {
        const x = 30 + Math.random() * 40;
        const y = 20 + Math.random() * 30;
        const angle = Math.random() * 360;
        const dist = 80 + Math.random() * 160;
        const size = 6 + Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 0.15;
        const dur = 0.7 + Math.random() * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: color,
              animation: `particle-burst ${dur}s ease-out ${delay}s forwards`,
              ["--dx" as string]: `${Math.cos((angle * Math.PI) / 180) * dist}px`,
              ["--dy" as string]: `${Math.sin((angle * Math.PI) / 180) * dist}px`,
            }}
          />
        );
      })}
    </div>
  );
};

// ── Flash overlay ──────────────────────────────────────────────────────────
const FlashOverlay: React.FC<{ state: "correct" | "wrong" | null }> = ({ state }) => {
  if (!state) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        background: state === "correct" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.14)",
        animation: "flash-fade 0.6s ease-out forwards",
      }}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export const QuizView: React.FC<QuizViewProps> = ({ flashcardSet, onComplete, onBack }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"correct" | "wrong" | null>(null);
  const [particles, setParticles] = useState(false);
  const [cardAnim, setCardAnim] = useState<"idle" | "exit-right" | "exit-left" | "enter">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { playCorrect, playWrong } = useSound();

  const currentCard = flashcardSet.flashcards[currentCardIndex];
  const totalCards = flashcardSet.flashcards.length;
  const progress = ((currentCardIndex) / totalCards) * 100;

  // auto-focus input when new card arrives
  useEffect(() => {
    if (!showAnswer && !quizComplete) inputRef.current?.focus();
  }, [currentCardIndex, showAnswer, quizComplete]);

  const triggerFeedback = (correct: boolean) => {
    const state = correct ? "correct" : "wrong";
    setFeedbackState(state);
    if (correct) {
      playCorrect();
      setParticles(true);
      setTimeout(() => setParticles(false), 1200);
    } else {
      playWrong();
    }
    setTimeout(() => setFeedbackState(null), 600);
  };

  const advanceCard = (finalScore: number, lastCorrect: boolean) => {
    const exitDir = lastCorrect ? "exit-right" : "exit-left";
    setCardAnim(exitDir);
    setTimeout(() => {
      if (currentCardIndex < totalCards - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setShowAnswer(false);
        setUserAnswer("");
        setIsFlipped(false);
        setCardAnim("enter");
        setTimeout(() => setCardAnim("idle"), 400);
      } else {
        setQuizComplete(true);
        submitQuizResults(finalScore);
      }
    }, 350);
  };

  const submitAnswer = (isCorrect: boolean) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    triggerFeedback(isCorrect);
    setTimeout(() => advanceCard(newScore, isCorrect), 400);
  };

  const submitQuizResults = async (finalScore: number) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("https://sos-lang.onrender.com/ai/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          flashcard_set_id: flashcardSet.id,
          score: finalScore,
          total: totalCards,
        }),
      });
      if (response.ok) toast.success("Quiz results saved!");
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const handleSkip = () => {
    advanceCard(score, false);
  };

  const restartQuiz = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setUserAnswer("");
    setScore(0);
    setIsFlipped(false);
    setQuizComplete(false);
    setFeedbackState(null);
    setCardAnim("idle");
  };

  // ── Complete screen ──────────────────────────────────────────────────────
  if (quizComplete) {
    const pct = Math.round((score / totalCards) * 100);
    const grade = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good effort!" : "Keep practicing!";
    const gradeColor = pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#f87171";

    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <div className="quiz-bg min-h-screen flex items-center justify-center p-6">
          <div className="complete-card">
            <div className="complete-icon">{pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "📚"}</div>
            <h2 className="complete-title">Quiz Complete!</h2>
            <p className="complete-grade" style={{ color: gradeColor }}>{grade}</p>

            <div className="score-ring-wrap">
              <svg viewBox="0 0 120 120" className="score-ring">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={gradeColor} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <text x="60" y="56" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="'DM Sans', sans-serif">{pct}%</text>
                <text x="60" y="74" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="'DM Sans', sans-serif">accuracy</text>
              </svg>
            </div>

            <div className="stat-row">
              <div className="stat-pill">
                <span className="stat-label">Correct</span>
                <span className="stat-val" style={{ color: "#4ade80" }}>{score}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Wrong</span>
                <span className="stat-val" style={{ color: "#f87171" }}>{totalCards - score}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Total</span>
                <span className="stat-val">{totalCards}</span>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-ghost" onClick={restartQuiz}>Retake</button>
              <button className="btn-primary" onClick={onComplete}>Back to Sets</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  const autoMatch = showAnswer
    ? userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim()
    : false;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <Particles active={particles} correct={feedbackState === "correct"} />
      <FlashOverlay state={feedbackState} />

      <div className="quiz-bg min-h-screen p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="quiz-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <h1 className="quiz-title">{flashcardSet.title}</h1>
          <div className="card-counter">{currentCardIndex + 1} / {totalCards}</div>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          {/* Done segment */}
          <div className="progress-fill progress-done" style={{ width: `${((currentCardIndex) / totalCards) * 100}%` }} />
        </div>

        {/* Card */}
        <div className="card-stage">
          <div
            className={`flash-card ${isFlipped ? "flipped" : ""} card-anim-${cardAnim}`}
            onClick={() => setIsFlipped((v) => !v)}
          >
            <div className="card-face card-front">
              <span className="card-label">Question</span>
              <p className="card-text">{currentCard.front}</p>
              <span className="card-hint">tap to flip</span>
            </div>
            <div className="card-face card-back">
              <span className="card-label">Answer</span>
              <p className="card-text">{currentCard.back}</p>
              <span className="card-hint">tap to flip</span>
            </div>
          </div>
        </div>

        {/* Input zone */}
        {!showAnswer && (
          <div className="input-zone">
            <label className="input-label">Your Answer</label>
            <div className="input-row">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer…"
                className="answer-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userAnswer.trim()) setShowAnswer(true);
                }}
              />
            </div>
            <div className="action-row">
              <button
                className="btn-primary"
                disabled={!userAnswer.trim()}
                onClick={() => setShowAnswer(true)}
              >
                Check Answer
              </button>
              <button className="btn-ghost" onClick={handleSkip}>
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Feedback zone */}
        {showAnswer && (
          <div className="feedback-zone">
            <div className="your-answer-row">
              <span className="fa-label">You answered:</span>
              <span className="fa-text">{userAnswer || <em style={{ opacity: 0.4 }}>blank</em>}</span>
            </div>
            <div className="correct-answer-row">
              <span className="fa-label">Correct answer:</span>
              <span className="fa-text correct-text">{currentCard.back}</span>
            </div>

            {autoMatch && (
              <div className="auto-match-badge">✓ Looks like a match — confirm below</div>
            )}

            <p className="override-hint">You decide — mark as:</p>
            <div className="mark-row">
              <button
                className="btn-correct"
                onClick={() => submitAnswer(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Got It Right
              </button>
              <button
                className="btn-wrong"
                onClick={() => submitAnswer(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Got It Wrong
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ── All styles in one block ────────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0b0f1a;
  --surface: #131929;
  --surface2: #1a2234;
  --border: rgba(255,255,255,0.07);
  --accent: #4f8ef7;
  --accent-soft: rgba(79,142,247,0.15);
  --correct: #22c55e;
  --correct-soft: rgba(34,197,94,0.14);
  --wrong: #ef4444;
  --wrong-soft: rgba(239,68,68,0.14);
  --text: #e8edf5;
  --muted: rgba(232,237,245,0.45);
  --radius: 20px;
}

.quiz-bg {
  background: var(--bg);
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
}

/* Header */
.quiz-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.quiz-title {
  flex: 1;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-counter {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface2);
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid var(--border);
  white-space: nowrap;
}
.back-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; font-weight: 600;
  color: var(--muted);
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 7px 14px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}
.back-btn:hover { color: var(--text); background: var(--surface); }

/* Progress */
.progress-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: var(--surface2);
  border-radius: 100px;
  overflow: hidden;
}
.progress-fill {
  position: absolute;
  inset: 0;
  height: 100%;
  background: var(--accent);
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
}
.progress-done {
  background: var(--correct);
}

/* Card stage */
.card-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  perspective: 1200px;
}

.flash-card {
  width: 100%;
  max-width: 640px;
  min-height: 220px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(.4,0,.2,1);
  cursor: pointer;
}
.flash-card.flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px 36px;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0,0,0,0.35);
}
.card-back { transform: rotateY(180deg); }

.card-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 3px 10px;
  border-radius: 100px;
}
.card-back .card-label { color: var(--correct); background: var(--correct-soft); }

.card-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text);
}
.card-hint {
  font-size: 0.72rem;
  color: var(--muted);
  margin-top: 4px;
}

/* Card animations */
@keyframes card-exit-right {
  to { transform: translateX(120%) rotate(8deg); opacity: 0; }
}
@keyframes card-exit-left {
  to { transform: translateX(-120%) rotate(-8deg); opacity: 0; }
}
@keyframes card-enter {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.card-anim-exit-right { animation: card-exit-right 0.35s ease-in forwards; }
.card-anim-exit-left  { animation: card-exit-left  0.35s ease-in forwards; }
.card-anim-enter      { animation: card-enter      0.4s cubic-bezier(.4,0,.2,1) forwards; }

/* Input zone */
.input-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
}
.input-label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.answer-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 1rem;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.answer-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79,142,247,0.18);
}
.answer-input::placeholder { color: var(--muted); }

.action-row { display: flex; gap: 10px; }

/* Feedback zone */
.feedback-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  animation: card-enter 0.35s ease forwards;
}
.your-answer-row, .correct-answer-row {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.correct-answer-row { border-color: rgba(34,197,94,0.3); }
.fa-label { font-size: 0.72rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.fa-text { font-size: 1rem; font-weight: 600; color: var(--text); }
.correct-text { color: var(--correct); }

.auto-match-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--correct);
  background: var(--correct-soft);
  border-radius: 100px;
  padding: 5px 14px;
  text-align: center;
}
.override-hint {
  font-size: 0.78rem;
  color: var(--muted);
  font-weight: 500;
  text-align: center;
}
.mark-row { display: flex; gap: 10px; }

/* Buttons */
.btn-primary {
  flex: 1;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 13px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-primary:hover { opacity: 0.88; }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-ghost {
  flex: 1;
  background: var(--surface2);
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 13px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.btn-ghost:hover { color: var(--text); background: var(--surface); }

.btn-correct {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--correct-soft);
  color: var(--correct);
  border: 1.5px solid rgba(34,197,94,0.4);
  border-radius: 100px;
  padding: 13px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-correct:hover { background: rgba(34,197,94,0.22); }
.btn-correct:active { transform: scale(0.97); }

.btn-wrong {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--wrong-soft);
  color: var(--wrong);
  border: 1.5px solid rgba(239,68,68,0.4);
  border-radius: 100px;
  padding: 13px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-wrong:hover { background: rgba(239,68,68,0.22); }
.btn-wrong:active { transform: scale(0.97); }

/* Complete screen */
.complete-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 40px 32px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  animation: card-enter 0.5s ease forwards;
}
.complete-icon { font-size: 3rem; }
.complete-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
}
.complete-grade { font-size: 1rem; font-weight: 600; }

.score-ring-wrap { width: 140px; height: 140px; margin: 8px 0; }
.score-ring { width: 100%; height: 100%; }

.stat-row { display: flex; gap: 10px; width: 100%; }
.stat-pill {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-label { font-size: 0.68rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.stat-val { font-size: 1.3rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--text); }

.btn-row { display: flex; gap: 10px; width: 100%; margin-top: 4px; }

/* Particle animation */
@keyframes particle-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
}

/* Flash overlay */
@keyframes flash-fade {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
`;

export default QuizView;