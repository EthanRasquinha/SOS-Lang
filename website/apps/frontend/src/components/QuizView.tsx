import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

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

export const QuizView: React.FC<QuizViewProps> = ({ flashcardSet, onComplete, onBack }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());

  const currentCard = flashcardSet.flashcards[currentCardIndex];
  const totalCards = flashcardSet.flashcards.length;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;

  const submitAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success("Correct!");
    } else {
      toast.error("Incorrect. The answer was: " + currentCard.back);
    }

    setAnsweredCards(prev => new Set([...prev, currentCardIndex]));
    setShowAnswer(false);
    setUserAnswer("");
    setIsFlipped(false);

    // Move to next card
    if (currentCardIndex < totalCards - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 1500);
    } else {
      // Quiz complete
      setTimeout(() => {
        setQuizComplete(true);
        submitQuizResults(isCorrect ? score + 1 : score);
      }, 1500);
    }
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

      if (response.ok) {
        toast.success("Quiz results saved!");
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const handleSkip = () => {
    setAnsweredCards(prev => new Set([...prev, currentCardIndex]));
    setShowAnswer(false);
    setUserAnswer("");
    setIsFlipped(false);

    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      submitQuizResults(score);
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setUserAnswer("");
    setScore(0);
    setIsFlipped(false);
    setQuizComplete(false);
    setAnsweredCards(new Set());
  };

  if (quizComplete) {
    const percentage = Math.round((score / totalCards) * 100);
    const performanceColor = percentage >= 80 ? "text-green-400" : percentage >= 60 ? "text-yellow-300" : "text-red-400";

    return (
      <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] p-8 flex flex-col items-center justify-center gap-6 text-white">
        <Card className="surface-card rounded-3xl p-8 max-w-md w-full text-center flex flex-col space-y-6 border border-[var(--border)]">
          <h1 className="text-3xl font-bold">Quiz Complete! 🎉</h1>
          
          <div className="space-y-3">
            <p className={`text-5xl font-bold ${performanceColor}`}>
              {score}/{totalCards}
            </p>
            <p className="text-lg text-slate-400">
              You scored <span className="font-semibold text-white">{percentage}%</span>
            </p>
          </div>

          <div className="bg-[var(--surface-soft)] rounded-3xl p-4 space-y-2 text-left text-white">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">Correct Answers:</span> {score}
            </p>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">Total Questions:</span> {totalCards}
            </p>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">Accuracy:</span> {percentage}%
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={restartQuiz}
              className="flex-1 rounded-full bg-[var(--surface-soft)] hover:bg-[#36718f] text-white py-2"
            >
              Retake Quiz
            </Button>
            <Button
              onClick={() => {
                onComplete();
              }}
              className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white py-2"
            >
              Back to Sets
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Poppins'] bg-[var(--page-bg)] text-white p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{flashcardSet.title}</h1>
        <Button
          onClick={onBack}
          className="rounded-full bg-[var(--surface-soft)] hover:bg-[#36718f] text-white px-4 py-2"
        >
          Back
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-[var(--surface)] rounded-3xl p-4 shadow-lg border border-[var(--border)]">
        <div className="flex justify-between mb-2 text-sm text-slate-400 font-semibold">
          <span>Card {currentCardIndex + 1} of {totalCards}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[var(--surface-soft)] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[var(--accent)] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex justify-center">
        <Card
          className="w-full max-w-2xl surface-card rounded-[32px] cursor-pointer hover:shadow-2xl transition-all"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="p-12 flex items-center justify-center min-h-80">
            <div className="text-center space-y-4 w-full">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                {isFlipped ? "Answer" : "Question"}
              </p>
              <p className="text-3xl font-bold text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm text-[var(--accent)] pt-4">Click to {isFlipped ? "show question" : "reveal answer"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input and Actions */}
      {!showAnswer && !isFlipped && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div>
            <label className="block text-slate-400 font-medium mb-2">Your Answer:</label>
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-[#122437] border border-[#1f3248] text-black focus:ring-2 focus:ring-[var(--accent)]"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setShowAnswer(true);
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowAnswer(true)}
              disabled={userAnswer.trim() === ""}
              className="flex-1 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-soft)] text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </Button>
            <Button
              onClick={handleSkip}
              className="flex-1 rounded-full bg-[var(--surface-soft)] hover:bg-[#36718f] text-white px-4 py-2"
            >
              Skip Card
            </Button>
          </div>
        </div>
      )}

      {/* Answer Feedback */}
      {showAnswer && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <Card className="bg-[var(--surface-soft)] rounded-3xl p-6 border-2 border-[var(--accent)]">
            <p className="text-sm text-slate-400 font-medium uppercase mb-2">Correct Answer:</p>
            <p className="text-lg font-semibold text-white">{currentCard.back}</p>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => submitAnswer(userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim())}
              className="flex-1 rounded-full bg-[#36718f] hover:bg-[#004d73] text-white px-4 py-2"
            >
              Mark as Correct
            </Button>
            <Button
              onClick={() => submitAnswer(false)}
              className="flex-1 rounded-full bg-[#dc6505] hover:bg-[#efb486] text-white px-4 py-2"
            >
              Mark as Incorrect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
