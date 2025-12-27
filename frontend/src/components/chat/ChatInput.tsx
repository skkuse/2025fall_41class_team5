'use client';
import { useState, KeyboardEvent, useRef, useEffect, useCallback } from 'react';
import HealthCheckupForm from '@/components/forms/HealthCheckupForm';
import { HealthCheckupFormData } from '@/types/health';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';

// 🔹 폼 참조를 위한 인터페이스 정의
interface HealthCheckupFormHandle {
  setFormData: (data: HealthCheckupFormData) => void;
}

interface ChatInputProps {
  onSend?: (message: string, formData?: HealthCheckupFormData) => void;
  onFormShow?: (show: boolean) => void;
  // any 대신 구체적인 콜백 함수 타입을 지정
  onFormRef?: (refCallback: ((data: HealthCheckupFormData) => void) | null) => void;
}

export default function ChatInput({ onSend, onFormShow, onFormRef }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [autoFillData, setAutoFillData] = useState<HealthCheckupFormData | null>(null);

  // any 제거 및 인터페이스 적용
  const formRef = useRef<HealthCheckupFormHandle>(null);

  const { isLoggedIn } = useAuthStore();
  const { isLoading } = useChatStore();

  const handleSendClick = () => {
    if (!input.trim() || !isLoggedIn || isLoading) return;
    onSend?.(input);
    setInput('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleFormSubmit = (formData: HealthCheckupFormData) => {
    const text = '건강검진 결과를 분석해 주세요.';
    onSend?.(text, formData);
    setShowForm(false);
    setAutoFillData(null);
    onFormShow?.(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setAutoFillData(null);
    onFormShow?.(false);
  };

  const handleFormShow = () => {
    setShowForm(true);
    onFormShow?.(true);
  };

  // 자동 채우기 콜백 함수 타입 지정
  const autoFillCallback = useCallback((data: HealthCheckupFormData) => {
    console.log('Auto-fill callback called with data:', data);
    setAutoFillData(data);

    if (formRef.current && typeof formRef.current.setFormData === 'function') {
      formRef.current.setFormData(data);
      console.log('Form data set via ref');
    } else {
      console.log('Form ref not available, data will be set via initialData prop');
    }
  }, []);

  // 폼 렌더링 상태에 따라 부모에게 콜백 전달
  useEffect(() => {
    if (showForm) {
      onFormRef?.(autoFillCallback);
    } else {
      onFormRef?.(null);
    }
  }, [showForm, onFormRef, autoFillCallback]);

  return (
    <>
      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-fadeIn">
            <HealthCheckupForm
              ref={formRef}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              initialData={autoFillData}
            />
          </div>
        </div>
      )}

      <div className="relative border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 p-6">
        <div className="flex items-end gap-4 max-w-6xl mx-auto">
          <button
            onClick={handleFormShow}
            disabled={!isLoggedIn}
            className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all disabled:opacity-50 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="궁금한 점을 BioLens에게 물어보세요..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all"
            />
          </div>

          <button
            onClick={handleSendClick}
            disabled={!input.trim() || isLoading}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white disabled:opacity-50 transition-all hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
