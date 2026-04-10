
# DNTRNG™ - Technical Standard & Protocols (v18.5)

## 1. Stack Overview
*   **Framework**: Next.js 15 (App Router) with React 19 for high-performance rendering.
*   **Desktop Node**: Electron with `electron-builder` for cross-platform distribution.
*   **Language**: TypeScript (Strict Mode) for type safety across assessment modules.
*   **Registry (Database)**: Google Sheets™ via the **Registry Bridge Protocol v18.5** (Google Apps Script).
*   **Styling**: Tailwind CSS with Shadcn UI for a premium, professional interface.
*   **AI Engine**: Genkit with Google AI (Gemini 2.5 Flash) for intelligent assessment parsing.
*   **State Management**: React Context (`auth-context`, `language-context`) for global identity and region settings.

## 2. Folder Structure Rules
*   `src/app`: Routing and page-level logic. Folders use **kebab-case**; page files are `page.tsx`.
*   `src/components/[category]`: React components. Files use **PascalCase** (e.g., `UserDialog.tsx`).
    *   `/ui`: Atomic Shadcn components.
    *   `/admin`: Administrative control modules.
    *   `/quiz`: Assessment interaction modules.
*   `src/context`: Global React Context providers.
*   `src/lib`: Core utilities, security hashing, and `api-config.ts`.
*   `src/types`: Shared TypeScript interfaces (`quiz.ts`).
*   `src/ai`: Genkit flows and AI prompt engineering templates.
*   **Naming**: Files and variables use `camelCase`; Components use `PascalCase`; Constants use `SCREAMING_SNAKE_CASE`.

## 3. Component Rules
*   **Max Size**: Components exceeding 250 lines must be decomposed into smaller sub-components.
*   **Directives**: Every interactive component must include the `'use client';` directive.
*   **Props**: Define interfaces directly above the component or in `src/types/`.
*   **Logic Extraction**: Complex validation or data mapping must be extracted to `src/lib/` or custom hooks.
*   **State**: Prefer local state for UI (dialogs, toggles). Use Context only for Identity (Auth) and Localization (Language).

## 4. Code Style Rules
*   **Async Patterns**: Use `async/await` exclusively. Raw `.then()` chains are prohibited unless used in standard Firestore-style background syncs.
*   **Error Handling**: Use `try/catch` blocks. Errors MUST be surfaced to the user via the `useToast` hook. Never swallow errors silently.
*   **Cleanliness**: No magic numbers. Use `api-config.ts` or local constants. Remove all `console.log` and commented-out code before pushing to the registry.
*   **Icons**: Use `lucide-react`. Ensure icons exist in the library (e.g., use `Target` for goals, `Zap` for energy/status).

## 5. Registry (Database) Rules
*   **Centralization**: All data mutations MUST flow through the `API_URL` defined in `src/lib/api-config.ts`.
*   **Queries**: Never write raw fetch calls inside components. Use the established `handlePost` pattern in page handlers.
*   **Integrity**: When editing a registry item (e.g., student password), always preserve existing values if fields are left blank.
*   **Transparency**: Admin visibility of credentials is required per **Protocol v18.5**.

## 6. API Rules
*   **Stability**: Use `mode: 'no-cors'` for POST actions to the Google Apps Script bridge to avoid handshake blocks.
*   **Validation**: Sanitize all input (especially emails and IDs) before sending to the Registry Bridge.
*   **Versioning**: Any change to the GAS backend must increment the Protocol version in README.md and RULES.md.

## 7. UI/UX Rules
*   **Feedback**: All registry sync events must display the `AILoader`.
*   **Transitions**: Use `tailwindcss-animate` for "fade-in" and "slide-in" effects on page loads.
*   **Safety**: All administrative dialogs must include a "Change-Aware Guard" (disable the Save button if no changes are detected).
*   **Security**: Use the "Eye" toggle pattern for all sensitive identity fields.
*   **Theme**: Support Light/Dark modes via `next-themes` and the `ModeToggle`.

## 8. Protocol for Changes
*   **Audit**: Before changing a shared component (e.g., `QuestionRenderer`), check all quiz modes (`training`, `test`, `race`) for breakage.
*   **Sync**: If the `API_URL` changes, update `src/lib/api-config.ts` and the `SetupGuide` simultaneously.
*   **Build**: After UI changes, verify the Electron build works locally (`npm run electron:dev`) to ensure no desktop-specific crashes.

## 9. GAS Code Management
*   Live GAS code always lives at `src/lib/gas/latest.ts`.
*   Before ANY change to GAS code:
    1. Copy latest.ts to `src/lib/gas/versions/vX.ts` (increment version number).
    2. Add entry to `CHANGELOG.md` describing what changed.
    3. Make changes to `latest.ts` only.
*   Never edit or delete version files — read-only backups.

## 10. Changelog & Activity Log Rules
System Changelog (CHANGELOG.md):
- Every time a significant code change is made, add an entry to CHANGELOG.md at project root BEFORE making the change.
- Format: `## v{X} — {date}` followed by bulleted changes.
- Increment version number for every entry.
- CHANGELOG.md is displayed in the Admin dashboard — keep entries clear and human readable.

Activity Log (automatic):
- Every admin operation that modifies data must call `logActivity(action, target)` after success.
- Never call `logActivity` on failed operations.
- The helper is at `src/lib/activity-log.ts`.
- Do not remove or skip `logActivity` calls.

## 11. General Rules
*   **No New Packages**: Ask before adding dependencies to keep the Electron bundle size optimal.
*   **Self-Documentation**: Use clear naming (e.g., `isProtectionEnabled`) instead of excessive comments.
*   **Zero Breakage**: Never modify the core authentication logic without a full registry audit.
