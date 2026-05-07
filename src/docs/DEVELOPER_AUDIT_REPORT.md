# DNTRNG™ Developer Audit Report & Technical Briefing
**Last Updated**: 2025-05-24
**System Version**: 18.9.5

## 1. Core Tech Stack
* **Framework**: Next.js 15.1 (App Router)
* **Language**: TypeScript (Strict)
* **Real-time**: Pusher Channels (Websockets)
* **Registry**: Google Sheets via GAS (REST API)
* **UI**: Shadcn UI + Tailwind CSS

## 2. Navigation & Architecture
* **Routing**: Segment-based routing in `src/app/`.
* **Security Layers**: 
  - `AdminLayout.tsx` handles role-based access.
  - `QuizGate.tsx` handles deterministic daily key verification.
* **Component Extraction**: Adheres to CEP protocol. Complex views (e.g., Live Mode) are split into `/live/HostQuestionView`, `/live/StudentLobby`, etc.

## 3. Data Protocols
* **Identity Protocol**:
  - `localStorage`: Stores `dntrng_guest_name` for cross-test continuity.
  - `tracker.ts`: Deterministic identity resolution for telemetry.
* **Registry actions (doGet/doPost)**:
  - `getTests`, `getQuestions`, `getResponses`, `getUserStats`.
  - `submitResponse`, `saveTest`, `saveSetting`, `logEvent`.

## 4. Key Logic Blocks
* **Live Sync**: Orchestrated via `/api/live/*` routes and in-memory Map in `src/lib/live-rooms.ts`.
* **Question Modules**: 11+ types managed by `QuestionRenderer.tsx`. 
  - *Complex Logic*: Hotspot spatial identification and Matrix Choice grid mapping.
* **daily_key_salt**: Cryptographic seed stored in the registry for daily access token generation.

## 5. UI Design Language
* **Typography**: Inter (400-900).
* **Radii**: Extreme rounding (2.5rem) on primary cards.
* **Palette**: 
  - Primary Blue: knowledge/stability.
  - SKY Blue: highlights.
  - ROSE: Real-time/Live indicators.

## 6. Development Debt
* **API Tester**: Infrastructure exists but diagnostic endpoints need implementation.
* **Server-side Scoring**: Scoring is currently client-side; needs server-side verification for integrity.
* **Component Splitting**: `QuestionDialog.tsx` is approaching the 350-line limit.
