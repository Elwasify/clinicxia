import { useState, useRef, useEffect, useCallback } from 'react';
import { TranscriptionProvider, VoiceLanguage, VoiceState } from './TranscriptionProvider';
import { BackendTranscriptionProvider } from './BackendTranscriptionProvider';
import { BrowserSpeechProvider } from './BrowserSpeechProvider';

export function useVoiceDictation(onInsertText: (text: string) => void) {
  const [state, setState] = useState<VoiceState>('ready');
  const [language, setLanguage] = useState<VoiceLanguage>('ar-EG');
  const [errorMessage, setErrorMessage] = useState('');
  const [interimText, setInterimText] = useState('');
  const [lastInsertedText, setLastInsertedText] = useState<string | null>(null);

  const providerRef = useRef<TranscriptionProvider | null>(null);

  useEffect(() => {
    const providerType = import.meta.env.VITE_TRANSCRIPTION_PROVIDER;
    if (providerType === 'backend') {
      providerRef.current = new BackendTranscriptionProvider();
    } else {
      providerRef.current = new BrowserSpeechProvider();
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!providerRef.current) return;
    setErrorMessage('');
    setInterimText('');

    await providerRef.current.start({
      language,
      onInterimResult: (text) => setInterimText(text),
      onFinalResult: (text) => {
        setInterimText('');
        setLastInsertedText(text);
        onInsertText(text);
      },
      onError: (err) => setErrorMessage(err),
      onStateChange: (newState) => setState(newState),
    });
  }, [language, onInsertText]);

  const stopListening = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [state, startListening, stopListening]);

  // Global F2 Keyboard shortcut toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  return {
    state,
    language,
    setLanguage,
    errorMessage,
    interimText,
    lastInsertedText,
    toggleListening,
    startListening,
    stopListening,
  };
}
