'use client';
import { AnalysisCategory } from '@/types/analysis';

type TermSelectorProps = {
  category: AnalysisCategory;
  onTermSelect: (term: string, category: AnalysisCategory) => void;
  onCancel: () => void;
};

const healthTerms = [
  'BMI', '혈압', '콜레스테롤', '혈당', '중성지방',
  'HDL', 'LDL', 'AST', 'ALT', '크레아티닌',
  'BUN', 'GFR', '혈색소', '요단백', '요당'
];

export default function TermSelector({ category, onTermSelect, onCancel }: TermSelectorProps) {
  const categoryLabel = category === AnalysisCategory.ACTION_GUIDE ? '개선 방법' : 
                       category === AnalysisCategory.CAUSE ? '원인 분석' : '용어 설명';

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg animate-slideUp">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {categoryLabel}할 항목을 선택하세요
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {healthTerms.map(term => (
          <button
            key={term}
            onClick={() => onTermSelect(term, category)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}