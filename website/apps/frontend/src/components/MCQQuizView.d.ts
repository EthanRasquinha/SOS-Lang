import * as React from "react";
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
declare const MCQQuizView: React.FC<MCQQuizViewProps>;
export default MCQQuizView;
