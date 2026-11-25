import '@testing-library/jest-dom/vitest';

// Mock Web Speech API SpeechRecognition
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'ar-EG';
  onstart = null;
  onend = null;
  onerror = null;
  onresult = null;

  start() {
    if (this.onstart) (this.onstart as () => void)();
  }
  stop() {
    if (this.onend) (this.onend as () => void)();
  }
  abort() {
    if (this.onend) (this.onend as () => void)();
  }
}

// @ts-expect-error Mock global speech
window.SpeechRecognition = MockSpeechRecognition;
// @ts-expect-error Mock global webkit speech
window.webkitSpeechRecognition = MockSpeechRecognition;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
