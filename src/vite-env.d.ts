/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_DEMO_MODE: string;
  readonly VITE_TRANSCRIPTION_PROVIDER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
