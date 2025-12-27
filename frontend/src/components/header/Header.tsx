'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import LoginModal from '@/components/login/LoginModal';
import SignupModal from '@/components/login/SignupModal';

export default function Header() {
  const { login, logout, user, isLoggedIn } = useAuthStore();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const isAnyModalOpen = isLoginModalOpen || isSignupModalOpen;

  const handleSubmitLogin = async (userId: string) => {
    const result = await login(Number(userId));
    if (!result) throw new Error('invalid user');
  };

  const handleSubmitSignup = async (name: string) => {
    const res = await fetch('/backend-api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error('signup failed');
  };

  const openLoginModal = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openSignupModal = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  return (
    <>
      {isLoginModalOpen && <LoginModal onSubmit={handleSubmitLogin} onClose={() => setIsLoginModalOpen(false)} />}
      {isSignupModalOpen && <SignupModal onSubmit={handleSubmitSignup} onClose={() => setIsSignupModalOpen(false)} />}

      <div className={isAnyModalOpen ? 'pointer-events-none' : 'pointer-events-auto'}>
        <header className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-40 shadow-sm">
          <div className="flex justify-between items-center px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 opacity-20 blur-sm animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                  BioLens
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">건강 분석 AI 어시스턴트</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn && user ? (
                <>
                  <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">👋 {user.name}님</span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openSignupModal}
                    className="px-6 py-3 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 font-semibold text-sm hover:scale-105"
                  >
                    회원가입
                  </button>

                  <button
                    onClick={openLoginModal}
                    className="px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-sm"
                  >
                    로그인
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
