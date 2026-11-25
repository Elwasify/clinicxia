import { TranscriptionProvider, VoiceLanguage, VoiceState } from './TranscriptionProvider';

// Browser Web Speech API fallback for local dev / offline environments
export class BrowserSpeechProvider implements TranscriptionProvider {
  name = 'BrowserSpeechProvider';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  async start(options: {
    language: VoiceLanguage;
    onInterimResult?: (text: string) => void;
    onFinalResult: (text: string) => void;
    onError: (error: string) => void;
    onStateChange: (state: VoiceState) => void;
  }): Promise<void> {
    if (!this.isSupported()) {
      options.onError('المتصفح الحالي لا يدعم ميزة التعرف الصوتي المباشر');
      options.onStateChange('error');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = options.language;

      this.recognition.onstart = () => {
        options.onStateChange('listening');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript && options.onInterimResult) {
          options.onInterimResult(interimTranscript);
        }

        if (finalTranscript) {
          options.onFinalResult(finalTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          options.onError('تم رفض صلاحية استخدام الميكروفون');
        } else if (event.error === 'no-speech') {
          // No speech detected, ignore or keep listening
          return;
        } else {
          options.onError(`خطأ في التعرف الصوتي: ${event.error}`);
        }
        options.onStateChange('error');
      };

      this.recognition.onend = () => {
        options.onStateChange('ready');
      };

      this.recognition.start();
    } catch (err: unknown) {
      const e = err as { message?: string };
      options.onError(e.message || 'فشل تشغيل ميزة الإملاء الصوتي');
      options.onStateChange('error');
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
  }
}
