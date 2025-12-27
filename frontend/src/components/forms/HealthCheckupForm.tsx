'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';

export type HealthCheckupFormData = {
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  waist_cm: string;
  bmi: string;
  systolic: string;
  diastolic: string;
  cholesterol_total: string;
  cholesterol_ldl: string;
  cholesterol_hdl: string;
  triglyceride: string;
  glucose_fasting: string;
  hemoglobin: string;
  ast: string;
  alt: string;
  gamma_gtp: string;
  creatinine: string;
  bun: string;
  gfr: string;
  protein: string;
  glucose: string;
  ketone: string;
  occult_blood: string;
  drinking: string;
  smoking: string;
  exercise_per_week: string;
};

// 🔹 외부로 노출할 메서드 타입 정의 (any 대체)
export interface HealthCheckupFormHandle {
  setFormData: (data: HealthCheckupFormData) => void;
}

type HealthCheckupFormProps = {
  onSubmit: (data: HealthCheckupFormData) => void;
  onCancel?: () => void;
  initialData?: HealthCheckupFormData | null;
};

// forwardRef의 타입을 HealthCheckupFormHandle로 지정
const HealthCheckupForm = forwardRef<HealthCheckupFormHandle, HealthCheckupFormProps>(
  ({ onSubmit, onCancel, initialData }, ref) => {
    const defaultFormData: HealthCheckupFormData = {
      age: '',
      gender: '',
      height_cm: '',
      weight_kg: '',
      waist_cm: '',
      bmi: '',
      systolic: '',
      diastolic: '',
      cholesterol_total: '',
      cholesterol_ldl: '',
      cholesterol_hdl: '',
      triglyceride: '',
      glucose_fasting: '',
      hemoglobin: '',
      ast: '',
      alt: '',
      gamma_gtp: '',
      creatinine: '',
      bun: '',
      gfr: '',
      protein: '',
      glucose: '',
      ketone: '',
      occult_blood: '',
      drinking: '',
      smoking: '',
      exercise_per_week: '',
    };

    const [formData, setFormData] = useState<HealthCheckupFormData>(() => initialData || defaultFormData);

    // 부모 컴포넌트(ChatInput)에서 호출할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
      setFormData: (data: HealthCheckupFormData) => {
        setFormData(data);
      },
    }));

    React.useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultFormData);
      }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const renderInput = (
      label: string,
      name: keyof HealthCheckupFormData,
      type: 'number' | 'text' = 'text',
      step?: string,
      unit?: string,
    ) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <div className="relative">
          <input
            type={type}
            step={step}
            name={name}
            value={formData?.[name] || ''}
            onChange={handleChange}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {unit && (
            <span className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>
    );

    const renderSelect = (label: string, name: keyof HealthCheckupFormData, options: string[]) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <select
          name={name}
          value={formData?.[name] || ''}
          onChange={handleChange}
          className="w-full py-2.5 px-4 rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl max-w-5xl w-full border border-gray-200 dark:border-gray-700 animate-fadeIn mx-auto">
        <div className="flex justify-between items-center mb-8 pb-6 border-b">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-1">
              건강검진 결과 입력
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">정확한 데이터로 AI 분석을 받아보세요</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-300 hover:scale-125 text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[400px] overflow-y-auto p-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">성별</label>
              <div className="flex items-center gap-4">
                {['male', 'female'].map(g => (
                  <label key={g} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData?.gender === g}
                      onChange={handleChange}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="ml-2.5 text-gray-700 dark:text-gray-300 font-medium">
                      {g === 'male' ? '남성' : '여성'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {renderInput('나이', 'age', 'number')}
            {renderInput('신장', 'height_cm', 'number', undefined, 'cm')}
            {renderInput('체중', 'weight_kg', 'number', undefined, 'kg')}
            {renderInput('허리둘레', 'waist_cm', 'number', undefined, 'cm')}
            {renderInput('BMI', 'bmi', 'number', '0.1')}
            {renderInput('수축기 혈압', 'systolic', 'number')}
            {renderInput('이완기 혈압', 'diastolic', 'number')}
            {renderInput('총 콜레스테롤', 'cholesterol_total', 'number')}
            {renderInput('LDL 콜레스테롤', 'cholesterol_ldl', 'number')}
            {renderInput('HDL 콜레스테롤', 'cholesterol_hdl', 'number')}
            {renderInput('트리글리세라이드', 'triglyceride', 'number')}
            {renderInput('식전 혈당', 'glucose_fasting', 'number')}
            {renderInput('혈색소', 'hemoglobin', 'number', '0.1')}
            {renderInput('AST', 'ast', 'number')}
            {renderInput('ALT', 'alt', 'number')}
            {renderInput('감마 GTP', 'gamma_gtp', 'number')}
            {renderInput('크레아티닌', 'creatinine', 'number', '0.01')}
            {renderInput('BUN', 'bun', 'number')}
            {renderInput('GFR', 'gfr', 'number')}

            {renderSelect('요단백', 'protein', ['', 'negative', 'positive'])}
            {renderSelect('요당', 'glucose', ['', 'negative', 'positive'])}
            {renderSelect('케톤', 'ketone', ['', 'negative', 'positive'])}
            {renderSelect('요잠혈', 'occult_blood', ['', 'negative', 'positive'])}
            {renderSelect('흡연', 'smoking', ['', 'never', 'former', 'current'])}
            {renderSelect('음주', 'drinking', ['', 'none', 'occasional', 'frequent'])}
            {renderInput('주당 운동 횟수', 'exercise_per_week', 'number')}
          </div>

          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 font-medium hover:scale-105"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
            >
              분석 요청
            </button>
          </div>
        </form>
      </div>
    );
  },
);

// 🔹 에러 해결의 핵심: Display Name 설정
HealthCheckupForm.displayName = 'HealthCheckupForm';

export default HealthCheckupForm;
