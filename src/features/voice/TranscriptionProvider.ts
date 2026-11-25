export type VoiceLanguage = 'ar-EG' | 'en-US';

export type VoiceState = 'ready' | 'listening' | 'processing' | 'error';

export interface TranscriptionProvider {
  name: string;
  isSupported(): boolean;
  start(options: {
    language: VoiceLanguage;
    onInterimResult?: (text: string) => void;
    onFinalResult: (text: string) => void;
    onError: (error: string) => void;
    onStateChange: (state: VoiceState) => void;
  }): Promise<void>;
  stop(): void;
  abort(): void;
}
