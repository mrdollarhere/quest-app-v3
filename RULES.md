# DNTRNG™ - Technical Standard & Protocols

## 🛠️ Stack Overview
- **Framework**: Next.js 15 (App Router) with React 19.
- **Desktop Node**: Electron with `electron-builder` for cross-platform distribution.
- **Registry (Database)**: Google Sheets™ via **Registry Bridge Protocol v18.2** (GAS).
- **Styling**: Tailwind CSS with Shadcn UI components.
- **AI Engine**: Genkit with Google AI (Gemini 2.5 Flash).
- **Language**: TypeScript (Strict Mode).

## 📁 Folder Structure
- `src/app`: Routing, layouts, and page-level logic.
- `src/components/ui`: Atomic Shadcn components.
- `src/components/admin`: Administrative modules and dialogs.
- `src/components/quiz`: Interaction modules and assessment logic.
- `src/context`: Global state (Auth, Language).
- `src/lib`: Core utilities, security hashing, and API configuration.
- `src/types`: Shared TypeScript interfaces.
- `docs`: Technical specifications and deployment guides.
- `main.js`: Electron engine and background server boot logic.

## 💻 Code Style
- **Components**: Use functional components with TypeScript interfaces.
- **Directives**: Always include `'use client';` for components using state or hooks.
- **Icons**: Use `lucide-react`. Ensure icons are available in the installed library version.
- **Safety**: Use `cn()` utility for conditional Tailwind classes.
- **Persistence**: When editing registry items, always ensure current values are preserved if input fields are left blank.

## 📊 Registry (Google Sheets) Protocols
- **Sync**: All data must flow through the `API_URL` defined in `src/lib/api-config.ts`.
- **Versioning**: Current standard is **Protocol v18.2**. Any changes to the GAS script must be synchronized across all `SetupGuide` and `README` references.
- **Stability**: Prefer `fetch` with `mode: 'no-cors'` for POST actions to avoid bridge handshake blocks.

## 🖥️ Desktop (Electron) Rules
- **Ports**: 
  - Web Development: `9002`
  - Electron Development: `9005`
- **Boot Protocol**: In production builds, `main.js` must spawn a background Next.js server (`next start`) and wait for the node to be live before showing the window.
- **Packaging**: Use `npm run electron:build`. Ensure `.next` and `node_modules` are included in the `files` array in `package.json`.

## 🎨 UI/UX Standards
- **Theme**: Support Light/Dark modes via `next-themes`.
- **Feedback**: Use the `AILoader` for all registry synchronization events.
- **Dialogs**: All administrative dialogs must include a "Change-Aware Guard" (disable save button if no changes are detected).
- **Security**: Use the "Eye" toggle pattern for all sensitive identity fields (passwords/keys).

## ⚠️ General Rules
1. **Zero Breakage**: Never modify the core `API_URL` or Auth logic without a full registry audit.
2. **Transparency**: Administrative visibility of student credentials is required per Protocol v18.2.
3. **No New Packages**: Ask before adding dependencies to keep the Electron bundle size optimal.
4. **Local Testing**: Always test Electron builds locally before committing changes to documentation.