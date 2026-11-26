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

---

## 7. Role-Based Entry And Shared Demo Data
- The authenticated user returned by `/auth/login` controls route access and the landing destination. A requested role in the login URL is only a visual hint; it never changes the session role.
- The authentication store starts signed out. Login/logout and identity changes clear cached server state, and the mock API issues a per-session token and checks role access on each protected request.
- `VITE_DEMO_MODE=true` only reveals the quick-demo controls and administrator reset action. Demo sign-in still calls the regular login endpoint.
- A single fabricated seed in `src/api/mocks/data.ts` supplies users, doctors, patients, visits, and activity to the mock API. Its names and phone numbers are synthetic and the interface identifies the demo data.
- Cross-device queue synchronization uses the shared visit endpoint through `useLiveQueue()` polling. Dashboard totals and activity are derived by the API layer from those same records.

## 8. Welcome Experience And Dashboard Data
- The welcome page takes its navy/teal palette and Clinicxia identity from the project presentation, while focusing the hero visual on the actual clinic management product rather than consumer medical marketing.
- The hero preview reuses aggregate values from `/public/summary`; it contains no patient-specific information. Authenticated dashboards read `/dashboard/summary` for counts, seven-day visit totals, and recorded activity.
- Cairo, JetBrains Mono, and Material Symbols are bundled locally so the application renders without external font requests.
- Navigation only exposes operational destinations backed by current API data: the doctor workspace, reception queue and patient registration, patient records, and administrator read-only directories. Appointment booking, laboratory/imaging orders, finance, permission editing, and generic reports remain out of the interface until their data and API operations exist.
- Doctor examination mode uses the existing visit endpoint for the journey, examination draft, approval, medical history, prescription, and addendum. The examination form retains unsaved-change protection and a visible save/approval action.

## 9. Clinic-Independent Product Identity
- CLINICXIA is a multi-clinic product. No clinic or clinician identity is embedded in user-facing components; the active `ClinicProfile` is fetched once through `GET /clinic/profile` and shared through `ClinicProvider` / `useClinic()`.
- The profile owns the clinic name, optional logo, address, contact numbers, specialties, and working hours. The CLINICXIA product mark and core colors remain fixed; an uploaded clinic logo is shown alongside the product logo.
- Administrators create the profile during first run and edit it from **بيانات العيادة**. Other users cannot enter the workspace before setup is complete.
- Each visit stores the assigned clinician separately from the clinician who approved it. Printed prescriptions identify the approving clinician and read clinic details from `useClinic()`.
- Synthetic clinic and clinician identities remain only in the central `src/api/mocks/data.ts` demo seed. Mock login/profile/stats do not expose demo records when `VITE_DEMO_MODE` is disabled.
