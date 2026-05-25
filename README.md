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
*   **PDF Export**: Export assessments as student versions or teacher answer keys.

## 🏗️ Technical Architecture
*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
*   **Websockets**: Pusher Channels for live classroom orchestration.
*   **Registry**: Google Sheets Bridge v18.9 (REST API).
*   **Deployment**: Vercel (Frontend) + Google Apps Script (Backend).

## 📋 Quick Start
1.  **Registry Setup**: Create a Google Sheet and inject the script from `src/lib/gas/latest.ts`.
2.  **Environment**: Configure `NEXT_PUBLIC_API_URL` and Pusher credentials.
3.  **Deployment**: Push to Vercel and initialize your first assessment module.

## 🔧 Technical Notes
### Vietnamese Character Support in PDF
The default PDF export uses standard fonts. To support full Vietnamese diacritics in exported PDFs, you must install and register a UTF-8 compatible font (like Roboto or Inter) with jsPDF in the `handleExportPDF` function. Currently, some characters may appear incorrectly unless a custom font is added.

*Built for teachers who demand precision.*