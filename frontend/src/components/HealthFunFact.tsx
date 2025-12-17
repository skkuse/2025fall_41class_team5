'use client';
import { useState, useEffect } from 'react';
import healthFacts from '../../health_fun_facts.json';

interface HealthFact {
  id: number;
  fact: string;
  source: string;
}

export default function HealthFunFact() {
  const [currentFact, setCurrentFact] = useState<HealthFact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomFact = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const randomIndex = Math.floor(Math.random() * healthFacts.length);
    setCurrentFact(healthFacts[randomIndex]);
    setIsLoading(false);
  };

  useEffect(() => {
    getRandomFact();
  }, []);

  if (!currentFact) return null;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200 dark:border-emerald-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">💡 건강 팁</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{currentFact.fact}</p>
        </div>
        <button
          onClick={getRandomFact}
          disabled={isLoading}
          className="ml-3 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="새로운 팁 보기"
        >
          <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>{isLoading ? '⟳' : '새 팁'}</span>
        </button>
      </div>
    </div>
  );
}
