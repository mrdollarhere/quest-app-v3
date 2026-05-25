
# DNTRNG™ - Technical Standard & Protocols (v19.1.0)

## 1. Stack Overview
*   **Framework**: Next.js 15 (App Router) with React 19.
*   **Registry (Database)**: Google Sheets™ via Registry Bridge Protocol v19.0.
*   **Security Protocol**: Server-Side Proxying via Next.js API Routes.
*   **AI Engine**: Genkit with Google AI (Gemini 2.5 Flash).

## 2. Security Protocols
*   **GAS Proxy**: `gas-proxy.ts` is server-only. Never import in client components.
*   **Registry Access**: All GAS calls must go through `/api/proxy/` routes. `NEXT_PUBLIC_API_URL` has been removed. All GAS calls use `APPS_SCRIPT_URL` via `gas-proxy.ts` server-side only.
*   **Scoring**: Assessment scores are always calculated server-side in `/api/proxy/submit`. Client-side scores are for visual feedback only and not trusted by the registry.
*   **Auth**: Admin routes require an `auth-session` cookie with `role === admin`.
*   **join_mode setting**: open or whitelist, stored in Settings sheet.
*   **name_whitelist setting**: JSON string array of approved names, stored in Settings sheet.
*   **custom_blacklist setting**: JSON string array of blocked words/names, stored in Settings sheet.
*   **In whitelist mode**: Name matching is case-insensitive and trim-safe.
*   **validateStudentName**: Called in join-room route for open mode only.
*   **Settings fetch failure**: In join-room, defaults to open mode silently to ensure session availability.

## 3. Bug Reporting Registry
*   **Registry Sync**: BugReports sheet in GAS handles `saveBugReport`, `getBugReports`, `updateBugStatus` actions.
*   **Submission Proxy**: Bug reports submitted via `/api/proxy/bug-report` (public, no auth required).
*   **Student Interface**: `BugReportButton` component placed on quiz, results, join, and tests pages.
*   **Status Workflow**: Bug report statuses: `new`, `reviewing`, `resolved`, `dismissed`.

## 4. Code Organization Rules

### Component Extraction Protocol (CEP)
*   **Extraction Trigger**: Any JSX block exceeding 50 lines of static markup or representing a distinct logical state MUST be extracted.
*   **Location**: Reusable components reside in `src/components/`, organized by domain.

### File Size Limits
*   **Components**: Must not exceed 250 lines.
*   **Pages**: Must not exceed 350 lines.
*   **Utility Files**: Must not exceed 150 lines.

## 5. Folder Structure Rules
*   `src/app`: Routing and page-level logic containers.
*   `src/app/api/proxy`: Secure infrastructure gateways.
*   `src/components`: Atomic interaction modules.

## 6. Visual Standards
*   **Rectangular Geometry**: All images, asset markers, and spatial containers must use `rounded-none` (sharp corners).

---
### INFRASTRUCTURE HARDENING - 2025-05-24 (v19.1.0)
- **Bug Registry Established**: Launched unified issue reporting terminal and admin dashboard.
- **Zero-Public-URL**: Removed `NEXT_PUBLIC_API_URL` from client bundles.
- **Proxy Enforced**: Transitioned all administrative and student telemetry to server-side proxy nodes.
- **Server-Side Classroom Integration**: Migrated Live Mode logic to use `gasPost` directly.
- **Custom Blacklist Implemented**: Added admin-managed blocked term registry for callsign validation.
