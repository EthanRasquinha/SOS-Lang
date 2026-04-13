import * as React from "react";
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
export declare const QuizView: React.FC<QuizViewProps>;
export default QuizView;
