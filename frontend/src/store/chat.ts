import { create } from 'zustand';
import { HealthCheckupFormData } from '@/types/health';
import { AnalysisCategory } from '@/types/analysis'; //

const API_BASE_URL = '/backend-api';

// ==========================
// 🔹 API 요청/응답 타입 정의
// ==========================

interface GeneralChatRequest {
  chatId?: number;
  content: string;
}

interface HealthAnalyzeRequest {
  chatId?: number;
  content: string;
  healthData: HealthCheckupFormData;
}

interface ConversationApiItem {
  id: number | string;
  sender: string;
  content: string;
  suggestedQuestions?: string[];
  showAnalysisButtons?: boolean;
}

interface ChatApiResponse {
  chatId?: number;
  conversationId?: number | string;
  content?: string;
  conversationList?: ConversationApiItem[];
  suggestedQuestions?: string[];
}

interface UserInfo {
  userId: number;
  [key: string]: unknown;
}

// ==========================
// 🔹 스토어 타입 정의
// ==========================

export type Message = {
  id: number | string;
  role: 'user' | 'ai';
  text: string;
  hasForm?: boolean;
  formData?: HealthCheckupFormData;
  suggestedQuestions?: string[];
  showAnalysisButtons?: boolean; //
};

type ChatState = {
  messages: Message[];
  currentChatId: number | null;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  removeMessage: (id: number | string) => void;
  setCurrentChatId: (id: number | null) => void;
  fetchMessages: (chatId: number, accessToken: string) => Promise<void>;
  sendMessage: (
    content: string,
    accessToken: string,
    user: UserInfo,
    healthData?: HealthCheckupFormData,
  ) => Promise<void>;
  sendAdditionalAnalysis: (term: string, category: AnalysisCategory, accessToken: string) => Promise<void>; //
  sendHealthAnalysis: (healthData: HealthCheckupFormData, accessToken: string) => Promise<void>; //
  mapApiToMessages: (apiData: ChatApiResponse) => Message[];
  resetChat: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentChatId: null,
  isLoading: false,

  addMessage: message => set(state => ({ messages: [...state.messages, message] })),
  removeMessage: id => set(state => ({ messages: state.messages.filter(msg => msg.id !== id) })),
  setCurrentChatId: id => set({ currentChatId: id }),

  sendMessage: async (content, accessToken, user, healthData) => {
    const { addMessage, removeMessage, currentChatId } = get();
    const loadingId = 'loading-' + Date.now();

    addMessage({ id: loadingId, role: 'ai', text: 'loading' });

    try {
      const isAnalyze = !!healthData;
      const url = `${API_BASE_URL}/chat${isAnalyze ? '/analyze-health' : ''}`;

      const body: GeneralChatRequest | HealthAnalyzeRequest =
        isAnalyze && healthData
          ? {
              ...(currentChatId ? { chatId: currentChatId } : {}),
              content,
              healthData,
            }
          : {
              content,
              ...(currentChatId ? { chatId: currentChatId } : {}),
            };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data: ChatApiResponse = await res.json();
      removeMessage(loadingId);

      if (data.chatId && currentChatId !== data.chatId) {
        set({ currentChatId: data.chatId });
      }

      addMessage({
        id: data.conversationId || Date.now(),
        role: 'ai',
        text: data.content || '',
        suggestedQuestions: data.suggestedQuestions || ['더 자세히 설명해줘', '고마워!'],
        showAnalysisButtons: isAnalyze,
      });
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      removeMessage(loadingId);
    }
  },

  sendAdditionalAnalysis: async (term, category, accessToken) => {
    const { addMessage, removeMessage } = get();
    const loadingId = 'loading-' + Date.now();
    addMessage({ id: loadingId, role: 'ai', text: 'loading' });

    try {
      const res = await fetch(`${API_BASE_URL}/chat/additional-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ term, category }),
      });
      const data: ChatApiResponse = await res.json();
      removeMessage(loadingId);
      addMessage({
        id: data.conversationId || Date.now(),
        role: 'ai',
        text: data.content || '',
        showAnalysisButtons: true,
      });
    } catch (error) {
      console.error('추가 분석 오류:', error);
      removeMessage(loadingId);
    }
  },

  sendHealthAnalysis: async (healthData, accessToken) => {
    const { addMessage, removeMessage, currentChatId } = get();
    const loadingId = 'loading-' + Date.now();
    addMessage({ id: loadingId, role: 'ai', text: 'loading' });

    try {
      const res = await fetch(`${API_BASE_URL}/chat/analyze-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...(currentChatId ? { chatId: currentChatId } : {}),
          healthData,
        }),
      });
      const data: ChatApiResponse = await res.json();
      removeMessage(loadingId);
      if (data.chatId && currentChatId !== data.chatId) {
        set({ currentChatId: data.chatId });
      }

      addMessage({
        id: data.conversationId || Date.now(),
        role: 'ai',
        text: data.content || '',
        showAnalysisButtons: true,
      });
    } catch (error) {
      console.error('건강 분석 오류:', error);
      removeMessage(loadingId);
    }
  },

  fetchMessages: async (chatId, accessToken) => {
    set({ isLoading: true, currentChatId: chatId });
    try {
      const res = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data: ChatApiResponse = await res.json();
      set({
        messages: get().mapApiToMessages(data),
        isLoading: false,
      });
    } catch (error) {
      console.error('메시지 로드 오류:', error);
      set({ isLoading: false });
    }
  },

  mapApiToMessages: (apiData: ChatApiResponse) => {
    if (!apiData || !Array.isArray(apiData.conversationList)) return [];
    return apiData.conversationList.map((conv: ConversationApiItem) => ({
      id: conv.id,
      role: conv.sender.toLowerCase() === 'user' ? 'user' : 'ai',
      text: conv.content,
      suggestedQuestions: conv.suggestedQuestions || [],
      showAnalysisButtons: conv.showAnalysisButtons || false, //
    }));
  },

  resetChat: () => set({ messages: [], currentChatId: null }),
}));
