# QuestFlow / DNTRNG Platform Documentation

## 1. Overview
QuestFlow (internally referenced as DNTRNG™) is a high-performance, interactive assessment and intelligence engine. The platform is designed to transform Google Sheets™ into a real-time relational database, allowing organizations to manage tests, users, and analytics without complex backend infrastructure. It prioritizes speed, accessibility, and high-fidelity data synchronization.

## 2. Features

### Core Assessment Engine
*   **Dynamic Question Rendering**: Supports 11+ interaction types including:
    *   `Single Choice` & `Multiple Choice` (with high-fidelity cards).
    *   `Short Text` (manual entry).
    *   `Ordering` (drag-and-drop sequencing).
    *   `Matching` (pair allocation from a pool).
    *   `Hotspot` (spatial recognition on images).
    *   `Matrix Choice` & `Multiple True/False` (grid-based evaluation).
    *   `Rating` (star-based scale).
*   **Quiz Modes**:
    *   `Practice`: Fixed sequence, no timer, no instant feedback (results at end).
    *   `Test`: Randomized/shuffled order, timed session, results at end.
    *   `Race`: Accuracy-streak protocol; an incorrect answer terminates the session.
*   **Accessibility Control**: On-the-fly text size adjustment (Small, Normal, Large) and high-legibility layouts.

### Administrative Control (Terminal)
*   **Registry Management**: Full CRUD operations for Tests and Questions.
*   **Identity Management**: Manage student accounts, including bulk provisioning and password visibility.
*   **Global Analytics**: Real-time distribution charts, pass rate telemetry, and individual student performance audits.
*   **System Logs**: Detailed activity tracking including Login/Logout events, IP addresses, and device signatures.

### Security & Integrity
*   **Daily Access Keys**: Unpredictable alphanumeric keys that rotate every 24 hours based on a server-side salt.
*   **Domain Authorization**: Restrict platform access to specific email domains (e.g., `@company.com`).
*   **Session Management**: Configurable session timeouts (in hours) to enforce re-authentication.
*   **Guest Access Control**: Toggle-able permission for users to participate without a registered account.

### Visual & Branding
*   **Dynamic Branding**: Centralized control over the Platform Name, Logo URL, and Announcement Banners.
*   **Dark Mode Support**: Full system-wide theme switching.

## 3. Pages / Routes

### Public Routes
*   `/`: Landing page with feature highlights and entry points.
*   `/tests`: Intelligence library; searchable list of all available assessment modules.
*   `/quiz?id=[testId]`: The active assessment terminal.
*   `/login`: Identity verification gateway.
*   `/setup-guide`: Comprehensive self-hosting instructions for administrators.

### User Routes (Authenticated)
*   `/profile`: Personal identity registry showing session history and cumulative stats.

### Admin Routes (Role: admin)
*   `/admin`: Dashboard overview with high-level telemetry and quick actions.
*   `/admin/tests`: Master list of assessment modules.
*   `/admin/tests/new`: Visual builder for new test modules.
*   `/admin/tests/[id]`: Question editor and JSON direct-push terminal.
*   `/admin/users`: Student registry and bulk provisioning tools.
*   `/admin/users/detail?email=[email]`: Deep-dive audit of a specific student's history.
*   `/admin/responses`: Global log of every submitted assessment.
*   `/admin/activity`: System-wide access logs.
*   `/admin/settings`: Centralized configuration for branding, security, and calibration.

## 4. User Flow

### Student Flow
1.  **Discovery**: User enters the site and browses the `Test Library`.
2.  **Gatekeeper**: User enters the `Daily Access Key` (if protection is enabled).
3.  **Identity**: User enters a `Callsign` (Guest) or signs in with an account.
4.  **Mode Selection**: User chooses between `Practice`, `Test`, or `Race`.
5.  **Execution**: User completes the questions within the allocated time limit.
6.  **Real-Time Sync**: User submits results; data is committed to the Google Sheet.
7.  **Diagnostics**: User views a detailed breakdown of their performance, verdict, and percentile benchmarking.

### Administrator Flow
1.  **Login**: Admin enters credentials verified against the `Users` sheet.
2.  **Oversight**: Admin monitors the `Activity Trend` and `Recent Results` on the dashboard.
3.  **Configuration**: Admin updates the `Pass Threshold` or `Branding` via the Settings page.
4.  **Content Updates**: Admin creates or edits tests and questions in real-time.

## 5. Tech Stack
*   **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
*   **Styling**: Tailwind CSS, Lucide Icons, Shadcn UI.
*   **Analytics**: Recharts (Area, Bar, and Pie charts).
*   **Database**: Google Sheets™ via Google Apps Script (REST API Bridge).
*   **State Management**: React Context (Auth, Language, Settings).
*   **Utilities**: Date-fns (Temporal logic), Zod (Validation).
*   **AI Scaffolding**: [INCOMPLETE] Genkit and Firebase Auth/Firestore code exists but is currently secondary to the Google Sheets backend.

## 6. Project Structure
*   `src/app`: Route segments and page layouts.
*   `src/components/admin`: Management modules and dialogs.
*   `src/components/quiz`: Interaction modules and result diagnostics.
*   `src/components/ui`: Atomic Shadcn components.
*   `src/context`: Global providers for identity, localization, and system settings.
*   `src/lib`: Core logic for security hashing, score calculation, and API communication.
*   `src/locales`: Translation bundles (en, vi, es).
*   `src/types`: TypeScript definitions for the assessment schema.

## 7. Setup & Installation

1.  **Clone Repository**: `git clone [repository-url]`
2.  **Install Dependencies**: `npm install`
3.  **Database Provisioning**:
    *   Create a Google Sheet with tabs: `Tests`, `Users`, `Responses`, `Activity`, `Settings`.
    *   Copy the code from `src/app/lib/gas-template.ts` into the sheet's Apps Script editor.
    *   Deploy as a Web App (Access: Anyone).
4.  **Configure API**: Update `src/lib/api-config.ts` with your deployed script URL.
5.  **Run Locally**: `npm run dev` (Port 9002).

## 8. Environment Variables
*   `NEXT_PUBLIC_FIREBASE_API_KEY`: [INCOMPLETE] Configured in `src/firebase/config.ts` but not yet the primary auth driver.
*   `API_URL`: Defined in `src/lib/api-config.ts` (points to Google Apps Script).

## 9. API / Endpoints
The platform communicates with the Google Apps Script bridge via:

### GET Actions
*   `login`: Verifies email/password.
*   `getTests`: Fetches the module library.
*   `getUsers`: Fetches the student registry.
*   `getResponses`: Fetches historical submission logs.
*   `getQuestions&id=[testId]`: Fetches questions for a specific module.
*   `getActivity`: Fetches system access logs.
*   `getSettings`: Fetches global system preferences.

### POST Actions
*   `submitResponse`: Commits assessment results.
*   `saveTest`: Updates module metadata.
*   `deleteTest`: Purges a module and its questions.
*   `saveUser` / `saveUsers`: Updates student records.
*   `saveQuestions`: Overwrites the question set for a module.
*   `logActivity`: Records login/logout telemetry.
*   `saveSetting`: Updates a global system preference.
*   `deleteResponse`: Removes a specific submission log.
