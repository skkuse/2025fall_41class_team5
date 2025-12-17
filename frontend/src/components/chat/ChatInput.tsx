'use client';
import { useState, KeyboardEvent } from 'react';
import HealthCheckupForm from '@/components/forms/HealthCheckupForm';
import { HealthCheckupFormData } from '@/types/health';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';

type ChatInputProps = {
  onSend: (message: string, formData?: HealthCheckupFormData) => void;
};

const API_BASE_URL = '/backend-api';

export default function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { isLoggedIn, accessToken, user } = useAuthStore();
  const { addMessage, removeMessage } = useChatStore();

  const CHAT_ID = 1;

  // -----------------------
  // 폼 데이터 -> 읽기 좋은 문자열로 변환하는 헬퍼
  // (HealthCheckupForm에서 사용한 LABELS과 대응)
  // -----------------------
  const LABELS: Record<string, string> = {
    age: '나이',
    gender: '성별',
    height_cm: '신장(cm)',
    weight_kg: '체중(kg)',
    waist_cm: '허리둘레(cm)',
    bmi: 'BMI',

    systolic: '수축기 혈압',
    diastolic: '이완기 혈압',

    cholesterol_total: '총 콜레스테롤',
    cholesterol_ldl: 'LDL 콜레스테롤',
    cholesterol_hdl: 'HDL 콜레스테롤',
    triglyceride: '트리글리세라이드',
    glucose_fasting: '식전 혈당',
    hemoglobin: '혈색소',

    ast: 'AST',
    alt: 'ALT',
    gamma_gtp: '감마 GTP',

    creatinine: '크레아티닌',
    bun: 'BUN',
    gfr: 'GFR',

    protein: '요단백',
    glucose: '요당',
    ketone: '케톤',
    occult_blood: '요잠혈',

    drinking: '음주',
    smoking: '흡연',
    exercise_per_week: '주당 운동 횟수',
  };

  function buildHealthContent(values?: HealthCheckupFormData) {
    if (!values) return '';
    const parts = Object.entries(values)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => {
        const label = LABELS[k] ?? k;
        return `${label}: ${v}`;
      });
    if (parts.length === 0) return '';
    return parts.join('\n');
  }

  // ==========================
  //   API 전송 통합 함수
  // ==========================
  const sendApiRequest = async (content: string, healthData?: HealthCheckupFormData) => {
    if (!accessToken || !user) {
      console.error('로그인 필요');
      return;
    }

    setIsSending(true);

    const loadingId = 'loading-' + Date.now();
    addMessage({
      id: loadingId,
      role: 'ai',
      text: 'loading...',
      hasForm: false,
    });

    try {
      // **중요**: healthData가 있으면 content 내부에 폼 내용을 포함시킨 문자열을 보낸다.
      const healthText = buildHealthContent(healthData);
      const combinedContent = healthText ? `${content}. ${healthText}` : content;

      const body = {
        content: combinedContent, // 합쳐진 문자열을 전송
        chatId: CHAT_ID,
        healthData: healthData || null,
      };

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);

      const data = await res.json();

      removeMessage(loadingId);
      addMessage({
        id: data.conversationId,
        role: 'ai',
        text: data.content,
        hasForm: false,
      });
    } catch (err) {
      console.error(err);
      removeMessage(loadingId);
    } finally {
      setIsSending(false);
    }
  };

  // ==========================
  //  텍스트 메시지 전송
  // ==========================
  const handleSendClick = () => {
    if (!input.trim() || isSending) return;

    // UI에 먼저 추가 (폼 없음)
    addMessage({
      id: Date.now(),
      role: 'user',
      text: input,
      hasForm: false,
    });

    // 외부 콜백 (유지)
    onSend(input);

    // API 전송 (폼 데이터 없으니 content 그대로)
    sendApiRequest(input);

    setInput('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // ==========================
  //   건강검진 폼 전송
  // ==========================
  const handleFormSubmit = (formData: HealthCheckupFormData) => {
    const userMessage = '건강검진 결과를 분석해주세요';

    // 폼 내용을 문자열로 만들고, UI에 **합쳐진 텍스트**로 한 번만 추가
    const healthText = buildHealthContent(formData);
    const combinedContent = healthText ? `${userMessage}\n${healthText}` : userMessage;

    addMessage({
      id: Date.now(),
      role: 'user',
      text: combinedContent, // ← 화면에 합쳐진 텍스트로 보이게 함
      hasForm: true,
      formData,
    });

    // API 전송: combinedContent를 content로 전송 (중요)
    sendApiRequest(userMessage, formData);

    setShowForm(false);
  };

  const isButtonDisabled = !isLoggedIn || isSending;

  return (
    <>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <HealthCheckupForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="flex p-4 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
        <button
          onClick={() => setShowForm(true)}
          disabled={isButtonDisabled}
          className={`p-3 mr-2 rounded-xl flex items-center justify-center transition-all duration-300 ${isButtonDisabled ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-900/20 dark:hover:to-green-900/20 hover:scale-110 hover:text-emerald-600'}`}
          title="건강검진결과 추가"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {' '}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.26279 3.25871C7.38317 2.12953 8.33887 1.25 9.5 1.25H14.5C15.6611 1.25 16.6168 2.12953 16.7372 3.25871C17.5004 3.27425 18.1602 3.31372 18.7236 3.41721C19.4816 3.55644 20.1267 3.82168 20.6517 4.34661C21.2536 4.94853 21.5125 5.7064 21.6335 6.60651C21.75 7.47348 21.75 8.5758 21.75 9.94339V16.0531C21.75 17.4207 21.75 18.523 21.6335 19.39C21.5125 20.2901 21.2536 21.048 20.6517 21.6499C20.0497 22.2518 19.2919 22.5107 18.3918 22.6317C17.5248 22.7483 16.4225 22.7483 15.0549 22.7483H8.94513C7.57754 22.7483 6.47522 22.7483 5.60825 22.6317C4.70814 22.5107 3.95027 22.2518 3.34835 21.6499C2.74643 21.048 2.48754 20.2901 2.36652 19.39C2.24996 18.523 2.24998 17.4207 2.25 16.0531V9.94339C2.24998 8.5758 2.24996 7.47348 2.36652 6.60651C2.48754 5.7064 2.74643 4.94853 3.34835 4.34661C3.87328 3.82168 4.51835 3.55644 5.27635 3.41721C5.83977 3.31372 6.49963 3.27425 7.26279 3.25871ZM7.26476 4.75913C6.54668 4.77447 5.99332 4.81061 5.54735 4.89253C4.98054 4.99664 4.65246 5.16382 4.40901 5.40727C4.13225 5.68403 3.9518 6.07261 3.85315 6.80638C3.75159 7.56173 3.75 8.56285 3.75 9.99826V15.9983C3.75 17.4337 3.75159 18.4348 3.85315 19.1901C3.9518 19.9239 4.13225 20.3125 4.40901 20.5893C4.68577 20.866 5.07435 21.0465 5.80812 21.1451C6.56347 21.2467 7.56458 21.2483 9 21.2483H15C16.4354 21.2483 17.4365 21.2467 18.1919 21.1451C18.9257 21.0465 19.3142 20.866 19.5910 20.5893C19.8678 20.3125 20.0482 19.9239 20.1469 19.1901C20.2484 18.4348 20.25 17.4337 20.25 15.9983V9.99826C20.25 8.56285 20.2484 7.56173 20.1469 6.80638C20.0482 6.07261 19.8678 5.68403 19.5910 5.40727C19.3475 5.16382 19.0195 4.99664 18.4527 4.89253C18.0067 4.81061 17.4533 4.77447 16.7352 4.75913C16.6067 5.87972 15.655 6.75 14.5 6.75H9.5C8.345 6.75 7.39326 5.87972 7.26476 4.75913ZM9.5 2.75C9.08579 2.75 8.75 3.08579 8.75 3.5V4.5C8.75 4.91421 9.08579 5.25 9.5 5.25H14.5C14.9142 5.25 15.25 4.91421 15.25 4.5V3.5C15.25 3.08579 14.9142 2.75 14.5 2.75H9.5ZM12 9.25C12.4142 9.25 12.75 9.58579 12.75 10L12.75 12.25H15C15.4142 12.25 15.75 12.5858 15.75 13C15.75 13.4142 15.4142 13.75 15 13.75H12.75V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V13.75H9C8.58579 13.75 8.25 13.4142 8.25 13C8.25 12.5858 8.58579 12.25 9 12.25H11.25L11.25 10C11.25 9.58579 11.5858 9.25 12 9.25Z"
              fill="#1C274C"
            />{' '}
          </svg>
        </button>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isButtonDisabled ? '궁금한 점을 BioLens에게 물어보세요.' : '궁금한 점을 BioLens에게 물어보세요.'}
          disabled={isButtonDisabled}
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-300"
        />

        <button
          onClick={handleSendClick}
          className={`ml-3 p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${isButtonDisabled ? 'text-gray-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800 shadow-lg hover:shadow-xl hover:scale-110'}`}
          title="전송"
          disabled={isButtonDisabled}
        >
          {' '}
          {/* SVG 아이콘 */}{' '}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            {' '}
            <path
              d="M3.32812 9.70312C4.20312 10.5781 5.26562 11.0156 6.51562 11.0156C7.76562 11.0156 8.82812 10.5781 9.70312 9.70312C10.5781 8.82812 11.0156 7.76562 11.0156 6.51562C11.0156 5.26562 10.5781 4.20313 9.70312 3.32812C8.82812 2.45312 7.76562 2.01562 6.51562 2.01562C5.26562 2.01562 4.20312 2.45312 3.32812 3.32812C2.45312 4.20313 2.01562 5.26562 2.01562 6.51562C2.01562 7.76562 2.45312 8.82812 3.32812 9.70312ZM12.5156 11.0156L17.4844 15.9844L15.9844 17.4844L11.0156 12.5156V11.7188L10.7344 11.4375C9.54688 12.4688 8.14062 12.9844 6.51562 12.9844C4.70312 12.9844 3.15625 12.3594 1.875 11.1094C0.625 9.85938 0 8.32812 0 6.51562C0 4.70312 0.625 3.17188 1.875 1.92188C3.15625 0.640625 4.70312 0 6.51562 0C8.32812 0 9.85938 0.640625 11.1094 1.92188C12.3594 3.17188 12.9844 4.70312 12.9844 6.51562C12.9844 7.17188 12.8281 7.92188 12.5156 8.76562C12.2031 9.57812 11.8438 10.2344 11.4375 10.7344L11.7188 11.0156H12.5156Z"
              fill="currentColor"
            />{' '}
          </svg>{' '}
        </button>
      </div>
    </>
  );
}
