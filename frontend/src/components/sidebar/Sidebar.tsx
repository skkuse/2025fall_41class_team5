'use client';
import { useState } from 'react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const menuItems = [
    {
      id: 'chat',
      label: '채팅',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.964 9.964 0 01-5.09-1.337L3 20l1.337-3.91A9.964 9.964 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
  ];

  return (
    <aside
      className={`transition-all duration-300 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-r border-gray-200/50 dark:border-gray-700/50 ${
        collapsed ? 'w-20' : 'w-64'
      } flex flex-col shadow-xl h-screen sticky top-0 z-10`}
    >
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-center items-center">
        <button
          className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/20 dark:hover:to-green-900/20 transition-all duration-300 hover:scale-110"
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg scale-105'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg
              className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} transition-transform group-hover:scale-110`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-fadeIn">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">🚀 팁</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">건강검진 결과를 입력하면 AI가 분석해드려요!</p>
          </div>
        </div>
      )}
    </aside>
  );
}
