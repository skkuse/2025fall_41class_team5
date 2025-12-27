'use client';
import { useEffect, useRef } from 'react';
import Message from './Message';
import { Message as MessageType, useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { AnalysisCategory } from '@/types/analysis';
import { HealthCheckupFormData } from '@/types/health';

type ChatWindowProps = {
  messages: MessageType[];
};

export default function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { fetchMessages, isLoading, addMessage, sendMessage, sendAdditionalAnalysis, sendHealthAnalysis } =
    useChatStore();

  const { isLoggedIn, user, accessToken } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isLoggedIn && user?.userId && accessToken) {
      // 컴포넌트 마운트 시 현재 채팅방 메시지 로드
      // store의 currentChatId를 활용하도록 설계됨
      fetchMessages(user.userId, accessToken);
    }
  }, [isLoggedIn, user?.userId, accessToken, fetchMessages]);

  const handleSuggestedClick = (question: string) => {
    if (!isLoggedIn || !accessToken || !user) return;
    addMessage({ id: Date.now(), role: 'user', text: question });
    sendMessage(question, accessToken, user);
  };

  const handleAnalysisClick = (term: string, category: AnalysisCategory) => {
    if (!isLoggedIn || !accessToken) return;
    addMessage({
      id: Date.now(),
      role: 'user',
      text: `${category === AnalysisCategory.ACTION_GUIDE ? '개선 방법' : category === AnalysisCategory.CAUSE ? '원인 분석' : '용어 설명'}에 대해 알려주세요`,
    });
    sendAdditionalAnalysis(term, category, accessToken);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-gray-50/50 via-emerald-50/20 to-green-50/20 dark:from-gray-900/50 dark:via-emerald-900/10 dark:to-green-900/10">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-emerald-500"></div>
          <p className="text-emerald-600 font-medium">기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto p-8 space-y-6 min-h-0 bg-gradient-to-br from-gray-50/30 via-emerald-50/10 to-green-50/10 dark:from-gray-900/30 dark:via-emerald-900/5 dark:to-green-900/5 no-scrollbar">
      {/* 💡 삭제되었던 초기 환영 화면 UI 추가 */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fadeIn">
          <div className="mb-6 relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-emerald-400 to-green-600 opacity-20 rounded-full"></div>
            <h1 className="relative text-7xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              BioLens
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
            🧬 건강검진 결과를 입력하고
            <br />
            <span className="font-semibold text-emerald-600">AI 기반 맞춤형 건강 조언</span>을 받아보세요
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {[
              { icon: '📊', title: '정확한 분석', desc: '건강검진 데이터 기반' },
              { icon: '🤖', title: 'AI 추천', desc: '맞춤형 건강 조언' },
              { icon: '⚡', title: '빠른 응답', desc: '실시간 분석 결과' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 메시지가 있을 때만 대화 내역 표시 */
        messages.map(msg => (
          <Message
            key={String(msg.id)}
            role={msg.role}
            text={msg.text}
            hasForm={msg.hasForm}
            formData={msg.formData}
            suggestedQuestions={msg.suggestedQuestions}
            showAnalysisButtons={msg.showAnalysisButtons}
            onSuggestedClick={handleSuggestedClick}
            onAnalysisClick={handleAnalysisClick}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
