'use client';
import { useEffect, useRef } from 'react';
import Message from './Message';
import { Message as MessageType, useChatStore } from '@/store/chat'; // 👈 useChatStore 임포트
import { useAuthStore } from '@/store/auth'; // 👈 useAuthStore 임포트

type ChatWindowProps = {
  messages: MessageType[];
};

export default function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fetchMessages, isLoading } = useChatStore(); // 👈 fetchMessages와 로딩 상태 가져오기
  const { isLoggedIn, user, accessToken } = useAuthStore(); // 👈 인증 상태 가져오기

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 💡 컴포넌트 마운트 시 채팅 기록 로드
  useEffect(() => {
    // 로그인 상태이고, 사용자 정보와 토큰이 있을 때만 로드 시도
    if (isLoggedIn && user?.userId && accessToken) {
      // 이미 메시지가 로드되어 있으면 다시 로드하지 않음 (선택 사항)
      // if (messages.length === 0) {
      fetchMessages(user.userId, accessToken);
      // }
    }
    // 의존성 배열에 인증 상태를 넣어 로그인/로그아웃 시 데이터를 새로 로드
  }, [isLoggedIn, user?.userId, accessToken]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin"></div>
          </div>
          <p className="text-lg font-medium bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            채팅 기록을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto p-6 space-y-4 min-h-0">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fadeIn">
          <div className="mb-6 relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-emerald-400 to-green-600 opacity-20 rounded-full"></div>
            <h1 className="relative text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              BioLens
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
            🧬 건강검진 결과를 입력하고<br />
AI 기반 맞춤형 건강 조언을 받아보세요
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            {[
              { icon: '📊', title: '정확한 분석', desc: '건강검진 데이터 기반' },
              { icon: '🤖', title: 'AI 추천', desc: '맞춤형 건강 조언' },
              { icon: '⚡', title: '빠른 응답', desc: '실시간 분석 결과' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        messages.map(msg => (
          <Message key={String(msg.id)} role={msg.role} text={msg.text} hasForm={msg.hasForm} formData={msg.formData} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
// Message.tsx는 수정할 필요 없음
