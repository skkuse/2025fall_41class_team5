import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useChatStore } from '@/store/chat';

const API_BASE_URL = '/backend-api';

type User = {
  userId: number;
  name: string;
};

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;

  login: (userId: number) => Promise<boolean>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기값
      isLoggedIn: false,
      accessToken: null,
      user: null,

      // 로그인
      login: async (userId: number) => {
        try {
          const res = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (!res.ok) return false;

          const data = await res.json();
          const token = data.accessToken;

          // 토큰 저장
          set({
            accessToken: token,
            isLoggedIn: true,
          });

          // 사용자 정보 요청
          const userRes = await fetch(`${API_BASE_URL}/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!userRes.ok) return false;

          const userData = await userRes.json();

          // 사용자 정보 저장
          set({ user: userData });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      // 로그아웃
      logout: () => {
        set({
          isLoggedIn: false,
          accessToken: null,
          user: null,
        });

        useChatStore.getState().resetChat();
      },
    }),

    {
      name: 'auth-storage',

      // 🔥 localStorage에 저장할 내용만 선택
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
