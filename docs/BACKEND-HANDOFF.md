# CLINICXIA Backend Handoff Guide

This document defines what the backend engineering team must implement to connect with the CLINICXIA frontend.

> **CRITICAL NOTE:** The current frontend includes an in-memory mock adapter (`VITE_USE_MOCKS=true`) for development and testing. The features below are **NOT** simulated for production use and must be provided by the real backend service.

---

## 1. Endpoints & API Contract
Follow the formal contract defined in [docs/openapi.yaml](file:///d:/programming/clinicxia/docs/openapi.yaml). All endpoints must return standard JSON with HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 500).

### Authentication & Sessions
- `POST /api/auth/login`: Issue a secure session token (JWT or httpOnly cookie) containing `{ id, username, fullName, role, doctorId }`.
- `GET /api/auth/me`: Validate session and return user profile.
- `POST /api/auth/change-password`: Require `oldPassword` and `newPassword` (min 6 chars).
- `POST /api/auth/logout`: Revoke active token or session cookie.

### Patients & Validation
- `GET /api/patients`: Support `query` parameter (searching name, phone, or patient code).
- `POST /api/patients`:
  - Check for duplicate phone numbers. Return `409 Conflict` if existing patient is found.
  - Automatically generate sequential patient code (e.g. `CX-1048`).
  - Persist `drugAllergies` and `chronicDiseases` arrays.
- `GET /api/patients/:id`: Return patient profile together with array of previous visits.

### Queue & Visits Lifecycle
- `GET /api/visits`: Filter by `doctorId` and date (today).
- `POST /api/visits`: Create visit record with sequential `queueNumber` (01, 02, ...).
- `PATCH /api/visits/:id/status`: Update queue status (`waiting` -> `in_consultation` -> `completed` / `cancelled`).
- `PUT /api/visits/:id/draft`: Save debounced examination draft. Reject with `403` if visit status is already `approved`.
- `POST /api/visits/:id/approve`: Lock visit as approved, record `approvedAt` timestamp, and mark visit status as `completed`.
- `POST /api/visits/:id/addendum`: Append an official addendum to an approved visit with author and server timestamp.

### Voice Transcription Service
- `POST /api/voice/transcribe`:
  - Multipart form upload accepting `audio` binary (WebM/WAV) and `language` (`ar-EG` or `en-US`).
  - Pass audio to speech-to-text service (e.g. Whisper, Google Speech-to-Text, Azure Speech).
  - Return `{ text: string, confidence: number }`.
  - Discard audio chunks immediately after processing to comply with medical privacy standards.

---

## 2. Environment Configuration
When connecting the frontend to the real backend:
```env
VITE_API_BASE_URL=https://api.yourclinic.com/api
VITE_USE_MOCKS=false
VITE_TRANSCRIPTION_PROVIDER=backend
```
No frontend code changes are needed.
