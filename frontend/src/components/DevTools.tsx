'use client';
import React, { useState, useRef } from 'react';
import { HealthCheckupFormData } from '@/types/health';

type DevToolsProps = {
  onAutoFill: (data: HealthCheckupFormData) => void;
};

const testHealthData: HealthCheckupFormData = {
  age: '26',
  gender: 'male',
  height_cm: '172.3',
  weight_kg: '69.8',
  waist_cm: '82.5',
  bmi: '23.5',
  systolic: '118',
  diastolic: '76',
  cholesterol_total: '186',
  cholesterol_ldl: '112',
  cholesterol_hdl: '53',
  triglyceride: '145',
  glucose_fasting: '92',
  hemoglobin: '15.1',
  ast: '23',
  alt: '29',
  gamma_gtp: '38',
  creatinine: '0.94',
  bun: '14.2',
  gfr: '92',
  protein: 'negative',
  glucose: 'negative',
  ketone: 'negative',
  occult_blood: 'negative',
  drinking: 'none',
  smoking: 'never',
  exercise_per_week: '3',
};

export default function DevTools({ onAutoFill }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: typeof window !== 'undefined' ? window.innerHeight - 80 : 600 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const maxX = typeof window !== 'undefined' ? window.innerWidth - 200 : 800;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 600;
    setPosition({
      x: Math.max(0, Math.min(maxX, e.clientX - dragRef.current.startX)),
      y: Math.max(0, Math.min(maxY, e.clientY - dragRef.current.startY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleAutoFillClick = () => {
    console.log('Auto-fill clicked, calling onAutoFill with:', testHealthData);
    onAutoFill(testHealthData);
    setIsOpen(false);
  };

  return (
    <div 
      className="fixed z-[10000]" 
      style={{ left: position.x, top: position.y }}
    >
      {!isOpen ? (
        <button
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setIsOpen(true)}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-move"
          title="Dev Tools"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 min-w-48">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleAutoFillClick}
            className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors duration-200"
          >
            Auto-fill Health Data
          </button>
        </div>
      )}
    </div>
  );
}