# DNTRNG™ Intelligence Platform - Technical Blueprint (v19.2)

## 1. PLATFORM OVERVIEW
*   **Core Logic**: High-performance interaction engine that transforms Google Sheets into a real-time relational database.
*   **Target Users**: Educators (Hosts/Admins) and Students (Operators).
*   **Primary Tech Stack**: Next.js 15, React 19, Tailwind CSS, Lucide Icons, Shadcn UI, Pusher (Real-time), Google Apps Script (Backend).

## 2. ENVIRONMENT VARIABLES (.env.local)
| Variable Name | Purpose | Scope | Location |
| :--- | :--- | :--- | :--- |
| `APPS_SCRIPT_URL` | The deployed Web App URL from Google. | Server Only | `gas-proxy.ts` |
| `APPS_SCRIPT_API_KEY`| Master secret shared between Next.js and GAS. | Server Only | `gas-proxy.ts` |
| `PUSHER_APP_ID` | Real-time orchestration node ID. | Server Only | `pusher.ts` |
| `PUSHER_SECRET` | Real-time orchestration secret. | Server Only | `pusher.ts` |
| `NEXT_PUBLIC_PUSHER_KEY` | Public access key for Pusher. | Public | Client Components |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Regional cluster for Pusher. | Public | Client Components |
| `GEMINI_API_KEY` | Intelligence generation key. | Server Only | `/api/ai/*` |

## 3. GOOGLE SHEETS REGISTRY STRUCTURE
| Tab Name | Column Headers | Description | Actions |
| :--- | :--- | :--- | :--- |
| `Tests` | `id, title, category, difficulty, duration, image_url, certificate_enabled, passing_threshold` | Metadata for assessment modules. | `getTests`, `saveTest` |
| `Users` | `id, name, email, role, password, image_url` | Identity node registry. | `login`, `getUsers`, `saveUser` |
| `Responses` | `Timestamp, User Name, User Email, Test ID, Score, Total, Duration, Raw Responses, Certificate ID` | Mission log archive. | `submitResponse`, `getResponses` |
| `System_Activity` | `timestamp, user_name, user_email, user_role, event_type, context, details, ip_address, device, browser, status` | Unified telemetry stream. | `logEvent`, `getActivity` |
| `BugReports` | `id, timestamp, user_name, user_email, category, description, page_url, status, admin_note` | Issue registry. | `saveBugReport`, `getBugReports` |
| `[TestID]` | `id, question_text, question_type, options, correct_answer, order_group, image_url, metadata, required` | Dynamic question banks. | `getQuestions`, `saveQuestions` |

## 4. FEATURES INVENTORY
| Feature Name | Status | Key Logic |
| :--- | :--- | :--- |
| **Quiz Interaction** | COMPLETE | `QuestionRenderer.tsx` + 11 Interaction Modules. |
| **Live Classroom** | COMPLETE | Pusher integration via `/api/live/*`. |
| **Progress Recovery** | REMOVED | Feature deactivated (Stateless Reversion). |
| **AI Assessment** | COMPLETE | Gemini-powered generation of questions and explanations. |
| **Anti-Cheat** | COMPLETE | Tab-switch detection and terminal quarantine. |
| **Forensic Audit** | COMPLETE | Real-time system activity hub with IP/Device tracking. |

## 5. REBUILD CHECKLIST
1.  **Clone Source**: Initialize local repository.
2.  **Infrastructure Node**: Create Google Sheet with the 6 mandatory tabs.
3.  **Bridge Injection**: Copy `src/lib/gas/latest.ts` into GAS Editor and deploy as Web App (Anyone).
4.  **Environment Calibration**: Populate `.env.local` with APPS_SCRIPT and Pusher keys.
5.  **Role Provisioning**: Manually add an `admin` role user to the `Users` tab to access the console.
6.  **Frontend Deployment**: Push to Vercel or initialize locally via `npm run dev`.

---
*DNTRNG™ Technical Standard v19.2 — Operational Integrity: 100%*
