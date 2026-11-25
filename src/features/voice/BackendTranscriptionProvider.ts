import { TranscriptionProvider, VoiceLanguage, VoiceState } from './TranscriptionProvider';
import { voiceApi } from '../../api';

export class BackendTranscriptionProvider implements TranscriptionProvider {
  name = 'BackendTranscriptionProvider';
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!window.MediaRecorder;
  }

  async start(options: {
    language: VoiceLanguage;
    onInterimResult?: (text: string) => void;
    onFinalResult: (text: string) => void;
    onError: (error: string) => void;
    onStateChange: (state: VoiceState) => void;
  }): Promise<void> {
    try {
      options.onStateChange('listening');
      this.audioChunks = [];

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          options.onStateChange('processing');
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioChunks = []; // Immediate memory cleanup

          const response = await voiceApi.transcribe(audioBlob, options.language);
          options.onFinalResult(response.text);
          options.onStateChange('ready');
        } catch (err: unknown) {
          const e = err as { message?: string };
          options.onError(e.message || 'فشل الاتصال بخدمة تحويل الصوت الطبية');
          options.onStateChange('error');
        } finally {
          this.cleanup();
        }
      };

      this.mediaRecorder.start();
    } catch (err: unknown) {
      this.cleanup();
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError') {
        options.onError('تم رفض الإذن بالوصول للميكروفون من المتصفح');
      } else if (e.name === 'NotFoundError') {
        options.onError('لم يتم العثور على ميكروفون متصل بالجهاز');
      } else {
        options.onError(e.message || 'تعذر تشغيل التسجيل الصوتي');
      }
      options.onStateChange('error');
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  abort(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
