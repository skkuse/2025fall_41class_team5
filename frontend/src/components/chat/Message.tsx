import { HealthCheckupFormData } from '@/types/health';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

type MessageProps = {
  role: 'user' | 'ai';
  text: string;
  hasForm?: boolean;
  formData?: HealthCheckupFormData;
};

export default function Message({ role, text, hasForm, formData }: MessageProps) {
  const isUser = role === 'user';
  const maxWidthClass = isUser ? 'max-w-md' : 'max-w-2xl';
  const isLoading = text === 'loading';

  if (isLoading) {
    return (
      <div className="flex flex-col w-full items-start mb-4 animate-fadeIn">
        <div className="p-4 rounded-2xl max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} mb-4 animate-fadeIn`}>
      <div
        className={`p-4 rounded-2xl ${maxWidthClass} shadow-lg hover:shadow-xl transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="prose dark:prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              p: ({ node, ...props }) => <p className="mb-0" {...props} />,
              br: () => (
                <>
                  <br />
                  <br />
                </>
              ),
              ol: ({ children, ...props }) => (
                <ol className="!list-decimal !list-inside [&>li::marker]:text-current" {...props}>
                  {children}
                </ol>
              ),
              strong: ({ children, ...props }) => <strong {...props}>{children}</strong>,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
