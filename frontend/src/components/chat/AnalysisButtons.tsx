'use client';
import { useState } from 'react';
import { AnalysisCategory } from '@/types/analysis';
import TermSelector from './TermSelector';

type AnalysisButtonsProps = {
  onAnalyze: (term: string, category: AnalysisCategory) => void;
};

export default function AnalysisButtons({ onAnalyze }: AnalysisButtonsProps) {
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory | null>(null);

  const buttons = [
    { category: AnalysisCategory.ACTION_GUIDE, label: '개선 방법', icon: '🎯' },
    { category: AnalysisCategory.CAUSE, label: '원인 분석', icon: '🔍' },
    { category: AnalysisCategory.DEFINITION, label: '용어 설명', icon: '📖' },
  ];

  const handleButtonClick = (category: AnalysisCategory) => {
    setSelectedCategory(category);
  };

  const handleTermSelect = (term: string, category: AnalysisCategory) => {
    onAnalyze(term, category);
    setSelectedCategory(null);
  };

  const handleCancel = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="mt-4 animate-slideUp">
      <div className="flex flex-wrap gap-3">
        {buttons.map(({ category, label, icon }) => (
          <button
            key={category}
            onClick={() => handleButtonClick(category)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-full hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>
      {selectedCategory && (
        <TermSelector category={selectedCategory} onTermSelect={handleTermSelect} onCancel={handleCancel} />
      )}
    </div>
  );
}
