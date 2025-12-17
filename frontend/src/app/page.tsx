'use client';
import { useChatStore, Message } from '@/store/chat';
import { useAuthStore } from '@/store/auth'; // 👈 useAuthStore 추가
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';
import HealthFunFact from '@/components/HealthFunFact';
import { nanoid } from 'nanoid';
import { HealthCheckupFormData } from '@/types/health';

export default function HomePage() {
  const { messages, addMessage } = useChatStore();
  // 💡 useAuthStore에서 로그인 상태를 가져옵니다.
  const { isLoggedIn } = useAuthStore();

  const handleSend = (text: string, formData?: HealthCheckupFormData) => {
    // 💡 비로그인 상태일 때는 메시지 전송을 시도하지 않음
    if (!isLoggedIn) {
      console.warn('비로그인 상태: 메시지 전송 차단됨');
      return;
    }

    if (!text.trim()) return;

    // 1. 사용자 메시지 객체 생성
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      text,
      hasForm: !!formData,
      formData: formData,
    };

    console.log('사용자 메시지 추가:', userMessage);
    // 2. 사용자 메시지를 채팅 스토어에 추가
    addMessage(userMessage);

    // ----------------------------------------------------
    // ❌ AI 응답을 생성하고 추가하는 하드코딩된 로직 제거
    // AI 응답 처리는 이제 ChatInput 내에서 API 호출 후 진행됩니다.
    // ----------------------------------------------------
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-green-50/30 dark:from-gray-900 dark:via-emerald-900/10 dark:to-green-900/10 overflow-hidden">
      {isLoggedIn && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow messages={messages} />
          {!isLoggedIn && (
            <div className="p-4">
              <HealthFunFact />
            </div>
          )}
        </div>
        {isLoggedIn && <ChatInput onSend={handleSend} />}
      </div>
    </div>
  );
}
