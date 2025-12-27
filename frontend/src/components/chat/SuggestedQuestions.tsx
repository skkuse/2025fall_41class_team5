'use client';

type SuggestedQuestionsProps = {
  questions: string[];
  onQuestionClick: (question: string) => void;
};

export default function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-6 mb-2 animate-slideUp">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(question)}
          className="group relative px-5 py-3 text-sm font-medium bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-2xl hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm"
        >
          <span className="relative z-10">{question}</span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ))}
    </div>
  );
}
