'use client';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';
import HealthFunFact from '@/components/HealthFunFact';
import DevTools from '@/components/DevTools';
import { nanoid } from 'nanoid';
import { HealthCheckupFormData } from '@/types/health';
import { useState } from 'react';

// 🔹 자동 채우기 콜백 함수를 위한 타입 정의
type FormAutoFillCallback = (data: HealthCheckupFormData) => void;

export default function HomePage() {
  const { messages, addMessage, sendMessage } = useChatStore();
  const { isLoggedIn, accessToken, user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  // any를 제거하고 구체적인 함수 타입을 지정하여 상태를 관리합니다
  const [currentFormRef, setCurrentFormRef] = useState<FormAutoFillCallback | null>(null);

  const handleSend = (message: string, formData?: HealthCheckupFormData) => {
    if (!isLoggedIn) return;

    // 사용자 메시지를 스토어에 추가합니다
    addMessage({
      id: nanoid(),
      role: 'user',
      text: message,
      hasForm: !!formData,
      formData: formData,
    });

    // 서버로 메시지와 건강검진 데이터를 전송합니다
    sendMessage(message, accessToken!, user!, formData);
  };

  const handleAutoFill = (data: HealthCheckupFormData) => {
    console.log('handleAutoFill 호출 데이터:', data);
    if (currentFormRef) {
      // 전달받은 폼 참조 콜백을 실행하여 ChatInput 내 폼 데이터를 업데이트합니다
      currentFormRef(data);
      console.log('성공: currentFormRef를 통해 데이터가 설정되었습니다.');
    } else {
      console.log('실패: 사용 가능한 currentFormRef가 없습니다.');
    }
  };

  const handleSetFormRef = (ref: FormAutoFillCallback | null) => {
    console.log('폼 참조(Ref) 설정:', ref);
    // 함수 자체를 상태로 저장하기 위해 함수형 업데이트 패턴을 사용합니다
    setCurrentFormRef(() => ref);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-green-50/20 dark:from-gray-900 dark:via-emerald-900/5 dark:to-green-900/5 overflow-hidden">
      {/* 로그인 상태일 때만 사이드바를 표시합니다 */}
      {isLoggedIn && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 채팅창에 메시지 목록을 전달합니다 */}
          <ChatWindow messages={messages} />
          {!isLoggedIn && (
            <div className="p-6">
              <HealthFunFact />
            </div>
          )}
        </div>
        {/* 채팅 입력창 및 폼 제어 프롭을 전달합니다 */}
        {isLoggedIn && <ChatInput onSend={handleSend} onFormShow={setShowForm} onFormRef={handleSetFormRef} />}
      </div>

      {/* 폼이 활성화된 상태에서만 개발 도구(자동 채우기)를 표시합니다 */}
      {showForm && <DevTools onAutoFill={handleAutoFill} />}
    </div>
  );
}
