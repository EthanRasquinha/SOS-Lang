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
      const response = await fetch("http://localhost:8000/ai/quiz-results", {
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
    const performanceColor = percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600";

    return (
      <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] p-8 flex flex-col items-center justify-center gap-6">
        <Card className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center flex flex-col space-y-6">
          <h1 className="text-3xl font-bold text-[#004d73]">Quiz Complete! 🎉</h1>
          
          <div className="space-y-3">
            <p className={`text-5xl font-bold ${performanceColor}`}>
              {score}/{totalCards}
            </p>
            <p className="text-lg text-[#7c7f86]">
              You scored <span className="font-semibold">{percentage}%</span>
            </p>
          </div>

          <div className="bg-[#ebe9e8] rounded-lg p-4 space-y-2 text-left">
            <p className="text-sm text-[#7c7f86]">
              <span className="font-semibold">Correct Answers:</span> {score}
            </p>
            <p className="text-sm text-[#7c7f86]">
              <span className="font-semibold">Total Questions:</span> {totalCards}
            </p>
            <p className="text-sm text-[#7c7f86]">
              <span className="font-semibold">Accuracy:</span> {percentage}%
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={restartQuiz}
              className="flex-1 bg-[#004d73] hover:bg-[#36718f] text-white rounded-md py-2"
            >
              Retake Quiz
            </Button>
            <Button
              onClick={() => {
                onComplete();
              }}
              className="flex-1 bg-[#dc6505] hover:bg-[#efb486] text-white rounded-md py-2"
            >
              Back to Sets
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004d73]">{flashcardSet.title}</h1>
        <Button
          onClick={onBack}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Back
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between mb-2 text-sm text-[#7c7f86] font-semibold">
          <span>Card {currentCardIndex + 1} of {totalCards}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[#ebe9e8] rounded-full h-3">
          <div
            className="bg-[#004d73] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex justify-center">
        <Card
          className="w-full max-w-2xl bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="p-12 flex items-center justify-center min-h-80">
            <div className="text-center space-y-4 w-full">
              <p className="text-sm font-semibold text-[#7c7f86] uppercase tracking-wide">
                {isFlipped ? "Answer" : "Question"}
              </p>
              <p className="text-3xl font-bold text-[#004d73] leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm text-[#dc6505] pt-4">Click to {isFlipped ? "show question" : "reveal answer"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input and Actions */}
      {!showAnswer && !isFlipped && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div>
            <label className="block text-[#7c7f86] font-medium mb-2">Your Answer:</label>
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-white border-2 border-[#004d73] focus:ring-2 focus:ring-[#dc6505]"
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
              className="flex-1 bg-[#004d73] hover:bg-[#36718f] text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </Button>
            <Button
              onClick={handleSkip}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Skip Card
            </Button>
          </div>
        </div>
      )}

      {/* Answer Feedback */}
      {showAnswer && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <Card className="bg-[#ebe9e8] rounded-xl p-6 border-2 border-[#004d73]">
            <p className="text-sm text-[#7c7f86] font-medium uppercase mb-2">Correct Answer:</p>
            <p className="text-lg font-semibold text-[#004d73]">{currentCard.back}</p>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => submitAnswer(userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim())}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Mark as Correct
            </Button>
            <Button
              onClick={() => submitAnswer(false)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
