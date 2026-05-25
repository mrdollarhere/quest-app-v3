# DNTRNG — Real-Time Classroom Intelligence Platform

DNTRNG (pronounced "Dan-Truong") is a high-performance assessment engine that transforms Google Sheets™ into a real-time relational database for classroom intelligence.

## 🚀 Live Demo
Experience the student node here: [quest-dntrng.vercel.app](https://quest-dntrng.vercel.app)

## 🛠️ Key Features
*   **Real-Time Sync**: Sub-second synchronization between teachers and students via Pusher.
*   **Host Control**: Teachers advance questions, trigger reveal protocols, and terminate missions.
*   **Complex Interactions**: Supports Multi-row True/False, Multiple Choice (Single/Multi), Ordering, and Matching.
*   **Diagnostic Audit**: Immediate standing registry and intelligence audit upon completion.
*   **Zero Infrastructure**: Powered entirely by Google Sheets and Google Apps Script.
*   **Multi-Format Export**: Export assessments as JSON, Excel, Word, or PDF (Questions Only or Answer Keys).

## 🏗️ Technical Architecture
*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
*   **Websockets**: Pusher Channels for live classroom orchestration.
*   **Registry**: Google Sheets Bridge v19.2 (REST API).
*   **Deployment**: Vercel (Frontend) + Google Apps Script (Backend).

## 📋 Quick Start
1.  **Registry Setup**: Create a Google Sheet and inject the script from `src/lib/gas/latest.ts`.
2.  **Environment**: Configure `APPS_SCRIPT_URL` and Pusher credentials.
3.  **Deployment**: Push to Vercel and initialize your first assessment module.

## 🔧 Technical Notes
### High-Fidelity PDF Export
To ensure perfect rendering of Vietnamese diacritics and complex interaction modules, the platform utilizes a **Visual Capture Protocol** (`html2canvas` + `jsPDF`). This ensures that exported documents appear exactly as they do in the browser, bypassing standard PDF encoding limitations.

*Built for teachers who demand precision.*