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
      {/* 🔥 로그인 모달 */}
      {isLoginModalOpen && <LoginModal onSubmit={handleSubmitLogin} onClose={() => setIsLoginModalOpen(false)} />}

      {/* 🔥 회원가입 모달 */}
      {isSignupModalOpen && <SignupModal onSubmit={handleSubmitSignup} onClose={() => setIsSignupModalOpen(false)} />}

      {/* 🔥 모달이 떠 있을 때 헤더 클릭 막기 (pointer-events-none) */}
      <div className={isAnyModalOpen ? 'pointer-events-none' : 'pointer-events-auto'}>
        <header className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                BioLens
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn && user ? (
                <>
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">👋 {user.name}님</span>
                  </div>

                  <button
                    onClick={logout}
                    className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openSignupModal}
                    className="px-5 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 font-medium"
                  >
                    회원가입
                  </button>

                  <button
                    onClick={openLoginModal}
                    className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
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
