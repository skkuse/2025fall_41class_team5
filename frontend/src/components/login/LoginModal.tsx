'use client';

import { useState } from 'react';

type LoginModalProps = {
  onSubmit: (id: string) => Promise<void>;
  onClose?: () => void;
};

export default function LoginModal({ onSubmit, onClose }: LoginModalProps) {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      setError('아이디를 입력하세요');
      return;
    }

    setError('');

    try {
      await onSubmit(userId);

      // 🔥 성공 시 모달 닫기
      if (onClose) onClose();
    } catch (err) {
      // 🔥 실패 시 에러 메시지 출력
      setError('존재하지 않는 계정입니다');
    }
  };

  return (
    <div
      className="
        fixed inset-0 bg-gray-900/20 dark:bg-black/30 backdrop-blur-sm 
        flex items-center justify-center z-50
        animate-fadeIn
      "
    >
      <div
        className="
          modal-container bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
          p-8 rounded-3xl shadow-2xl w-full max-w-md 
          border border-gray-200 dark:border-gray-700 relative
          animate-slideUp
        "
      >
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gradient-to-r from-emerald-200 to-green-200 dark:from-emerald-800 dark:to-green-800">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            로그인
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-300 hover:scale-125 text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">아이디</label>

            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className={`w-full py-2.5 px-4 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'
              }`}
            />

            {error && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl hover:from-emerald-700 hover:to-green-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold flex items-center justify-center gap-2"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
