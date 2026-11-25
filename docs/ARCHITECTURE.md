# CLINICXIA Architecture Documentation

## 1. System Overview
CLINICXIA is a clinic management frontend designed specifically for private clinics and healthcare centers operating in Arabic-speaking environments (RTL). It connects receptionists and doctors in real time, managing patient intake, live waiting queues, medical examinations with smart dictation, prescriptions, and historical medical records.

```
                          ┌────────────────────────┐
                          │   Reception Desk (UI)  │
                          │  (Waiting Queue / Add) │
                          └───────────┬────────────┘
                                      │
                         TanStack Query LAN Polling
                                      │
                          ┌───────────▼────────────┐
                          │    Doctor Desk (UI)    │
                          │  (Exam / Voice / Rx)   │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │ Typed API Client layer │
                          │ (docs/openapi.yaml)    │
                          └───────────┬────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  ▼                                       ▼
       [Backend API: /api/*]                 [Mock Adapter (MSW)]
      (Node/Go/Python/Docker)               (Dev/Test In-Memory)
```

## 2. Directory Structure
```
src/
├── api/             # Typed API client, error normalization, and mock server handlers
├── app/             # Application providers and context setup
├── components/
│   ├── layout/      # AppLayout, Header, Navigation
│   └── ui/          # Unified Design System (Button, Input, Select, Badge, Modal, Toast, Alert, LoadingSkeleton)
├── features/
│   ├── auth/        # Auth store (in-memory token), login, change password modal, guards
│   ├── doctor/      # Doctor dashboard, waiting lists, active consultation spotlight
│   ├── patients/    # Patient list, demographic forms, duplicate detection, allergy banners
│   ├── prescriptions/ # Prescription editor, A4 print layout & PDF export
│   ├── reception/   # Queue management, live counters, new visit modal, daily records
│   ├── visits/      # Examination form (7 fields), autosave, locking, addendum workflow, history
│   └── voice/       # TranscriptionProvider (Backend & Browser Web Speech fallback), F2 shortcut
├── routes/          # ProtectedRoute and AppRoutes
├── styles/          # Tailwind v4 configuration, brand design tokens, print CSS
├── test/            # Vitest unit test suite and mocks
└── types/           # TypeScript interfaces matching OpenAPI schema
```

## 3. Key Design Principles
1. **Medical Record Immutability:** An approved visit transitions into read-only mode immediately. Any later amendments are appended as medical addenda with author, timestamp, and audit trail.
2. **Audio & Data Privacy:** Patient records are never persisted to unencrypted `localStorage`. Audio streams are handled in memory and terminated immediately after upload.
3. **Resilient Offline/LAN Connectivity:** Periodic TanStack Query polling ensures multiple reception and doctor computers remain synchronized across a local network without relying on fragile browser-only channels.
