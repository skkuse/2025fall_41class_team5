'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';

type ChatRoom = {
  id: number;
  title: string;
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatList, setChatList] = useState<ChatRoom[]>([]);

  const { accessToken, isLoggedIn } = useAuthStore();
  const { currentChatId, setCurrentChatId, fetchMessages, resetChat } = useChatStore();

  useEffect(() => {
    const loadChatList = async () => {
      if (!isLoggedIn || !accessToken) return;
      try {
        const res = await fetch('/backend-api/chat', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            accept: 'application/json',
          },
        });
        const data = await res.json();
        setChatList(data.chatList || []);
      } catch (err) {
        console.error('채팅 목록 로드 실패:', err);
      }
    };

    loadChatList();
  }, [isLoggedIn, accessToken, currentChatId]);

  const handleChatSelect = async (chatId: number) => {
    if (!accessToken) return;
    setCurrentChatId(chatId);
    try {
      await fetchMessages(chatId, accessToken);
    } catch (err) {
      console.error('메시지 불러오기 실패:', err);
    }
  };

  const handleNewChat = () => {
    resetChat(); // currentChatId: null 및 메시지 초기화
  };

  return (
    <aside
      className={`transition-all duration-500 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-r border-gray-200/30 dark:border-gray-700/30 ${
        collapsed ? 'w-20' : 'w-80'
      } flex flex-col shadow-2xl h-screen sticky top-0 z-10`}
    >
      <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
        {!collapsed && (
          <button
            onClick={handleNewChat}
            className="w-full mb-6 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>새 대화 시작</span>
          </button>
        )}

        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white text-sm">채팅 기록</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{chatList.length}개의 대화</p>
              </div>
            </div>
          )}
          <button
            className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
        {chatList.map(chat => (
          <button
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${
              currentChatId === chat.id
                ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xl scale-105'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentChatId === chat.id ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}
              >
                <svg
                  className={`w-5 h-5 ${currentChatId === chat.id ? 'text-white' : 'text-emerald-600'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.964 9.964 0 01-5.09-1.337L3 20l1.337-3.91A9.964 9.964 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 text-left min-w-0">
                <span className="font-semibold text-sm truncate block">{chat.title}</span>
              </div>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
