import React from 'react';
import { VoiceState, VoiceLanguage } from './TranscriptionProvider';

export interface VoiceMicButtonProps {
  state: VoiceState;
  onToggle: () => void;
  language: VoiceLanguage;
  onLanguageChange: (lang: VoiceLanguage) => void;
  errorMessage?: string;
  interimText?: string;
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  state,
  onToggle,
  language,
  onLanguageChange,
  errorMessage,
  interimText,
  className = '',
}) => {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Language manual toggle (Arabic / English) */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => onLanguageChange('ar-EG')}
          className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
            language === 'ar-EG'
              ? 'bg-clinic-navy text-white'
              : 'text-slate-600 hover:text-clinic-navy'
          }`}
        >
          عربي
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('en-US')}
          className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
            language === 'en-US'
              ? 'bg-clinic-navy text-white'
              : 'text-slate-600 hover:text-clinic-navy'
          }`}
        >
          EN
        </button>
      </div>

      {/* Mic Action Button with F2 hint */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="تسجيل صوتي (F2)"
        title="انقر أو اضغط F2 للبدء/الإيقاف"
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isListening
            ? 'bg-red-600 text-white animate-pulse shadow-md'
            : isProcessing
            ? 'bg-amber-500 text-white'
            : 'bg-teal-50 text-clinic-teal border border-teal-200 hover:bg-teal-100/80'
        }`}
      >
        <span className="material-symbols-outlined text-base">
          {isListening ? 'mic' : isProcessing ? 'sync' : 'mic_none'}
        </span>
        <span>{isListening ? 'جاري الاستماع...' : isProcessing ? 'معالجة...' : 'إملاء (F2)'}</span>
      </button>

      {/* Interim Live Speech Feedback */}
      {interimText && (
        <span className="text-[11px] text-clinic-teal font-medium italic animate-pulse max-w-xs truncate">
          "{interimText}..."
        </span>
      )}

      {/* Error Message */}
      {errorMessage && (
        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
