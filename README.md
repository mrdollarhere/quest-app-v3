# DNTRNG™ - Intelligence Simplified

[![DNTRNG Protocol](https://img.shields.io/badge/DNTRNG-Protocol_v18.2-blue?style=for-the-badge&logo=google-sheets)](https://dntrng.com)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**DNTRNG™** is a premium, high-performance interactive assessment and intelligence engine. Built for speed and scale, it bridges the gap between modern React frontends and the ubiquitous power of Google Sheets™, allowing you to deploy complex intelligence modules in seconds.

---

## 🚀 Core Features | Tính Năng Cốt Lõi

- **Direct Cloud Sync**: Real-time bi-directional synchronization with Google Sheets™ as your database.
- **Advanced Interaction Modules**: Hotspots (Visual mapping), Ordering, Matching (Drag & Drop), Matrix Choice, and Multiple True/False.
- **Intelligence Zone Mapper**: Built-in visual CAD tool for administrators to map hotspot coordinates on any image asset.
- **Daily Access Protocol**: Dynamic, time-sensitive security keys generated algorithmically for session protection.
- **Identity Registry**: Personalized operator dashboards with live performance analytics.

---

## 🖥️ Desktop Deployment (Electron)

To run or build the DNTRNG™ Desktop Application on your local machine:

### 1. Development Mode
Runs the app in a standalone window for testing.
1.  **Clone Source**: Download this repository to your local machine.
2.  **Install Dependencies**: Run `npm install` in your terminal.
3.  **Launch Node**: Execute `npm run electron:dev`.
    *   Starts the engine on port `9005`.
    *   The DNTRNG™ window opens automatically.

### 2. Building the Installer (.exe / .app)
Creates a file you can send to others to install the app.
1.  **Run Build**: Execute `npm run electron:build`.
2.  **Get Installer**: Look in the `dist/` folder for your `.exe` (Windows) or `.dmg` (Mac).

---

## 🇺🇸 Operational Protocol (English)

### Phase 01: Sheet Architecture
Create a new Google Sheet and provision the following core tabs (Case-Sensitive).

1.  **`Tests`**: `id`, `title`, `description`, `category`, `difficulty`, `duration`, `image_url`
2.  **`Users`**: `id`, `name`, `email`, `role`, `password`
3.  **`Responses`**: `Timestamp`, `User Name`, `User Email`, `Test ID`, `Score`, `Total`, `Duration (ms)`, `Raw Responses`
4.  **Module Tabs**: Create a tab for every test `id` using: `id`, `question_text`, `question_type`, `options`, `correct_answer`, `order_group`, `image_url`, `metadata`, `required`

### Phase 02: Logic Injection
1. Open Google Sheet > **Extensions > Apps Script**.
2. Paste code from `src/app/lib/gas-template.ts`.
3. **Deploy > New Deployment > Web App**.
4. Execute as: **Me**, Access: **Anyone**.
5. Copy the **Web App URL** and update `src/lib/api-config.ts`.

---

## 🔐 Identity Provisioning
Access the **DNTRNG™ Console** using default admin credentials:
*   **Identity:** `admin@dntrng.com`
*   **Secret:** `admin123`

## ⚖️ License
This project is part of the **DNTRNG™ Open Source Initiative**. All rights reserved.
