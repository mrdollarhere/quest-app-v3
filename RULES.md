
# DNTRNG™ - Technical Standard & Protocols (v18.9.7)

## 1. Stack Overview
*   **Framework**: Next.js 15 (App Router) with React 19.
*   **Registry (Database)**: Google Sheets™ via Registry Bridge Protocol v18.9.
*   **Security Protocol**: Server-Side Proxying via Next.js API Routes.
*   **AI Engine**: Genkit with Google AI (Gemini 2.5 Flash).

## 2. Security Protocols
*   **GAS Proxy**: `gas-proxy.ts` is server-only. Never import in client components.
*   **Registry Access**: All GAS calls must go through `/api/proxy/` routes. `NEXT_PUBLIC_API_URL` has been removed. All GAS calls use `APPS_SCRIPT_URL` via `gas-proxy.ts` server-side only.
*   **Scoring**: Assessment scores are always calculated server-side in `/api/proxy/submit`. Client-side scores are for visual feedback only and not trusted by the registry.
*   **Auth**: Admin routes require an `auth-session` cookie with `role === admin`.

## 3. Code Organization Rules

### Component Extraction Protocol (CEP)
*   **Extraction Trigger**: Any JSX block exceeding 50 lines of static markup or representing a distinct logical state MUST be extracted.
*   **Location**: Reusable components reside in `src/components/`, organized by domain.

### File Size Limits
*   **Components**: Must not exceed 250 lines.
*   **Pages**: Must not exceed 350 lines.
*   **Utility Files**: Must not exceed 150 lines.

## 4. Folder Structure Rules
*   `src/app`: Routing and page-level logic containers.
*   `src/app/api/proxy`: Secure infrastructure gateways.
*   `src/components`: Atomic interaction modules.

## 5. Visual Standards
*   **Rectangular Geometry**: All images, asset markers, and spatial containers must use `rounded-none` (sharp corners).

---
### INFRASTRUCTURE HARDENING - 2025-05-24 (v18.9.7)
- **Zero-Public-URL**: Removed `NEXT_PUBLIC_API_URL` from client bundles.
- **Proxy Enforced**: Transitioned all administrative and student telemetry to server-side proxy nodes.
- **Server-Side Classroom Integration**: Migrated Live Mode logic to use `gasPost` directly.
