# Architectural & Engineering Decisions - CLINICXIA MVP

This document records the architectural and design decisions made during the refactoring of CLINICXIA from a legacy HTML prototype to a production-grade React 19 + TypeScript frontend.

---

## 1. Tech Stack & State Management
- **Framework:** React 19 with Vite 7 and TypeScript (strict mode enabled).
- **Styling:** Tailwind CSS v4 using brand design tokens (`#0B2545` clinic-navy, `#0F7C82` clinic-teal, `#F7F9FC` clinic-bg, Cairo font, Material Symbols).
- **Server State:** TanStack Query v5 for data fetching, caching, deduplication, and polling queue synchronization across clients on the local network (LAN).
- **Client/Auth State:** Zustand store with in-memory token/session state to prevent storing sensitive patient data or tokens in unencrypted local storage.
- **Forms & Validation:** `react-hook-form` with `zod` schemas and native Arabic error validation messages.

---

## 2. API Contract & Mocks
- Defined OpenAPI 3.1 specification at `docs/openapi.yaml` covering all endpoints:
  - Auth (`/api/auth/login`, `/api/auth/me`, `/api/auth/change-password`, `/api/auth/logout`)
  - Doctors (`/api/doctors`)
  - Patients (`/api/patients`, `/api/patients/:id`, `/api/patients/search`)
  - Visits/Queue (`/api/visits`, `/api/visits/:id`, `/api/visits/:id/status`, `/api/visits/:id/draft`, `/api/visits/:id/approve`)
  - Prescriptions (`/api/prescriptions`)
  - Voice Transcription (`/api/voice/transcribe`)
- An in-memory MSW (Mock Service Worker) / Fetch interceptor adapter is implemented when `VITE_USE_MOCKS=true`. In production or staging, disabling this flag points the typed API client seamlessly to the real backend.

---

## 3. Data Protection & Privacy Compliance
- **Zero local persistence of patient data:** Patient medical histories, complaints, and examination notes are never written to `localStorage` or `sessionStorage`.
- **Audio Privacy:** Audio blobs recorded during speech-to-text dictation are processed in-memory, dispatched as multipart form uploads, and immediate garbage-collection cleanup of streams is enforced on completion or unmount.

---

## 4. Real-Time Queue Synchronization
- Default synchronization relies on TanStack Query automatic polling with `refetchInterval` (e.g., 4000ms), isolated behind the custom hook `useLiveQueue()`. This guarantees immediate cross-device synchronization on clinic LANs without depending on fragile single-tab `BroadcastChannel` or complex socket handshakes.

---

## 5. Visit Lifecycle & Immutability
- Visits have explicit states: `waiting` -> `in_consultation` -> `completed` (or `cancelled`).
- During examination, the doctor edits a draft (`draft` status with debounced autosave).
- When the doctor clicks "اعتماد وإنهاء الكشف" (Approve & Finish), the visit status transitions to `approved`.
- Approved visits are strictly immutable (read-only). Any necessary corrections must be submitted as an addendum (`addendum` entry), ensuring medical audit trail integrity.

---

## 6. Voice Documentation Architecture
- Provider abstraction `TranscriptionProvider` supporting:
  1. `BackendTranscriptionProvider`: Uploads audio chunk to `/api/voice/transcribe` and receives accurate transcribed text.
  2. `BrowserSpeechProvider`: Client-side Web Speech API fallback for offline or development environments.
- Keyboard shortcut `F2` toggles dictation for the currently active field.
- Transcription text is inserted at the user's cursor position without auto-approving or silently modifying the draft.
