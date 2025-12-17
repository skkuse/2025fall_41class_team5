import { create } from 'zustand';
import { HealthCheckupFormData } from '@/types/health';

const API_BASE_URL = '/backend-api';

// =========================
// 🔹 API 응답 타입 정의
// =========================
type ConversationApiItem = {
  id: number | string;
  sender: string;
  content: string;
};

type ChatApiResponse = {
  conversationList: ConversationApiItem[];
};

// =========================
// 🔹 메시지 타입
// =========================
export type Message = {
  id: number | string;
  role: 'user' | 'ai';
  text: string;
  hasForm?: boolean;
  formData?: HealthCheckupFormData;
};

type ChatState = {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  removeMessage: (id: number | string) => void;
  fetchMessages: (userId: number, accessToken: string) => Promise<void>;
  mapApiToMessages: (apiData: ChatApiResponse) => Message[];
  resetChat: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  addMessage: message => set(state => ({ messages: [...state.messages, message] })),
  removeMessage: id => set(state => ({ messages: state.messages.filter(msg => msg.id !== id) })),

  // =========================
  // 🔹 API 데이터를 UI 메시지로 변환
  // =========================
  mapApiToMessages: (apiData: ChatApiResponse): Message[] => {
    console.log('📌 백엔드 응답:', apiData);

    if (!apiData || !Array.isArray(apiData.conversationList)) {
      console.warn('⚠ conversations 배열 없음:', apiData);
      return [];
    }

    return apiData.conversationList.map(
      (conv): Message => ({
        id: conv.id,
        role: conv.sender.toLowerCase() === 'user' ? 'user' : 'ai',
        text: conv.content,
        hasForm: false,
        formData: undefined,
      }),
    );
  },

  // =========================
  // 🔹 채팅 기록 가져오기
  // =========================
  fetchMessages: async (userId, accessToken) => {
    set({ isLoading: true });

    if (!userId || !accessToken) {
      set({ isLoading: false });
      console.warn('채팅 기록을 불러올 수 없습니다: 인증 정보 부족.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/chat/${userId}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data: ChatApiResponse = await res.json();
      const newMessages = get().mapApiToMessages(data);

      set({ messages: newMessages, isLoading: false });
    } catch (error) {
      console.error('채팅 기록 로드 오류:', error);
      set({ isLoading: false, messages: [] });
    }
  },

  // =========================
  // 🔹 로그아웃 시 채팅 초기화
  // =========================
  resetChat: () => set({ messages: [] }),
}));
