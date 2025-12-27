'use client';

import { HealthCheckupFormData } from '@/types/health';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import SuggestedQuestions from './SuggestedQuestions';
import AnalysisButtons from './AnalysisButtons';
import { parseTemplateLinks } from '@/utils/templateParser';
import { AnalysisCategory } from '@/types/analysis';
import { useState } from 'react';

type MessageProps = {
  role: 'user' | 'ai';
  text: string;
  hasForm?: boolean;
  formData?: HealthCheckupFormData;
  suggestedQuestions?: string[];
  showAnalysisButtons?: boolean;
  onSuggestedClick?: (question: string) => void;
  onAnalysisClick?: (term: string, category: AnalysisCategory) => void;
};

export default function Message({
  role,
  text,
  suggestedQuestions,
  showAnalysisButtons,
  onSuggestedClick,
  onAnalysisClick,
}: MessageProps) {
  const isUser = role === 'user';
  const maxWidthClass = isUser ? 'max-w-md' : 'max-w-4xl';
  const isLoading = text === 'loading';
  const [isCopied, setIsCopied] = useState(false); // boolean 타입으로 명시적 관리

  // Parse template links from text
  const { text: cleanText, links } = parseTemplateLinks(text);

  // 클립보드 복사 핸들러 (순수하지 않은 함수는 이벤트 핸들러 내부에서 처리)
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      // null 대신 false를 할당하여 타입 에러 방지
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="flex flex-col w-full items-start mb-6 animate-slideUp">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BioLens</span>
        </div>
        <div className="p-6 rounded-3xl max-w-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">분석 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} mb-6 animate-slideUp`}>
      {!isUser && (
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BioLens</span>
        </div>
      )}

      <div className="relative group">
        <div
          className={`p-6 rounded-3xl ${maxWidthClass} shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm ${
            isUser
              ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700 text-white shadow-emerald-200 dark:shadow-emerald-900/50'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 shadow-gray-200 dark:shadow-gray-900/50'
          }`}
        >
          {!isUser && (
            <button
              onClick={() => copyToClipboard(cleanText)} // Math.random()을 제거하여 순수성 유지
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="복사"
            >
              {isCopied ? (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}

          <div
            className={`prose dark:prose-invert max-w-none break-words ${isUser ? 'prose-invert' : 'prose-gray dark:prose-invert'}`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                p: ({ ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                // inline 프로퍼티 타입 에러 해결을 위해 className으로 판단
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  return isInline ? (
                    <code
                      className={`px-2 py-1 rounded text-sm font-mono ${isUser ? 'bg-emerald-800/30 text-emerald-100' : 'bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400'}`}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className={`block p-4 rounded-lg text-sm font-mono overflow-x-auto ${isUser ? 'bg-emerald-800/30 text-emerald-100' : 'bg-gray-100 dark:bg-gray-700'}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ ...props }) => (
                  <blockquote
                    className={`border-l-4 pl-4 py-2 my-4 italic ${isUser ? 'border-emerald-300 bg-emerald-800/20' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}
                    {...props}
                  />
                ),
                ul: ({ ...props }) => <ul className="list-disc list-inside space-y-1 my-3" {...props} />,
                ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-1 my-3" {...props} />,
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table
                      className={`min-w-full border-collapse border ${isUser ? 'border-emerald-400' : 'border-gray-300 dark:border-gray-600'}`}
                      {...props}
                    />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th
                    className={`border px-4 py-2 font-semibold text-left ${isUser ? 'border-emerald-400 bg-emerald-800/30' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className={`border px-4 py-2 ${isUser ? 'border-emerald-400' : 'border-gray-300 dark:border-gray-600'}`}
                    {...props}
                  />
                ),
              }}
            >
              {cleanText}
            </ReactMarkdown>
          </div>

          {links.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">📚 관련 논문</p>
              <div className="flex flex-wrap gap-2">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-full hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isUser && suggestedQuestions && suggestedQuestions.length > 0 && onSuggestedClick && (
        <div className="w-full max-w-4xl">
          <SuggestedQuestions questions={suggestedQuestions} onQuestionClick={onSuggestedClick} />
        </div>
      )}

      {!isUser && showAnalysisButtons && onAnalysisClick && (
        <div className="w-full max-w-4xl">
          <AnalysisButtons onAnalyze={onAnalysisClick} />
        </div>
      )}
    </div>
  );
}
