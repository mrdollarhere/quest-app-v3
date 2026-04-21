# DNTRNG — Precision Assessment Platform

## What is DNTRNG?
DNTRNG (pronounced "Dan-Truong") is a high-performance assessment and intelligence engine designed to transform Google Sheets™ into a real-time relational database. It allows organizations to manage complex tests, student registries, and forensic analytics without traditional backend infrastructure.

## Live Demo
Experience the platform at: [quest-dntrng.vercel.app](https://quest-dntrng.vercel.app)

## Features
- **High-Fidelity Quiz Player**: A professional terminal supporting 11+ interaction types and multiple modes (Practice, Test, Race).
- **Admin Command Center**: Full structural oversight for managing tests, questions, and students.
- **Real-Time Registry Bridge**: Instant synchronization with Google Sheets via a specialized REST API.
- **Automated Certification**: Generation of high-precision PDF certificates for passing students.
- **Forensic Analytics**: Visual dashboards for performance trends, pass rates, and question-level success metrics.
- **Security Protocols**: Rotating daily access keys and domain-restricted authentication.
- **Global Localization**: Full support for English (US), Tiếng Việt, and Español.
- **Dynamic Branding**: Centralized control over platform names, logos, colors, and announcement banners.

## Question Types Supported
- **Single Choice**: Standard one-to-one response mapping.
- **Multiple Choice**: Multi-select interaction with high-fidelity checkboxes.
- **True/False**: Simple boolean verification.
- **Multiple T/F**: A vertical registry of multiple boolean claims.
- **Short Text**: Manual entry with exact-match logic.
- **Dropdown**: Collapsed selection from a defined pool.
- **Ordering**: Drag-and-drop sequence reordering.
- **Matching**: High-precision pair allocation between clusters.
- **Matrix Choice**: A grid system for mapping attributes across multiple rows.
- **Hotspot (Spatial)**: Precision identification on images using rectangular zones.
- **Rating**: Five-star qualitative evaluation scale.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS & Shadcn UI
- **Storage**: Google Sheets (via Google Apps Script REST Bridge)
- **Charts**: Recharts
- **PDF Engine**: jsPDF
- **Icons**: Lucide React
- **Deployment**: Vercel / Firebase App Hosting

## Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **NPM**: v9.0.0 or higher
- **Google Account**: Required for the Google Sheets backend

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/dntrng-platform.git
   cd dntrng-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```
   Add your Registry Bridge URL (see GAS Setup below):
   ```env
   NEXT_PUBLIC_API_URL=your_google_apps_script_url
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## Environment Variables
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The deployed Web App URL from Google Apps Script. | `https://script.google.com/macros/s/.../exec` |

## Google Apps Script Setup
DNTRNG uses Google Apps Script (GAS) as its backend engine.
1. Create a new **Google Sheet**.
2. Create five tabs named exactly: `Tests`, `Users`, `Responses`, `Activity`, `Settings`.
3. Open **Extensions > Apps Script**.
4. Copy the code from `src/lib/gas/latest.ts` and paste it into the script editor.
5. Click **Deploy > New Deployment**.
6. Select **Type: Web App**.
7. Set **Execute as: Me** and **Who has access: Anyone**.
8. Copy the provided **Web App URL** and paste it into your `NEXT_PUBLIC_API_URL` environment variable.

## Project Structure
```
src/
├── app/          — Routing, layouts, and page-level logic
├── components/   — Interaction modules, admin tabs, and UI atoms
├── context/      — Auth, Language, and Settings providers
├── lib/          — Registry Bridge (GAS), security logic, and utils
├── hooks/        — Custom React hooks for filtering and state
└── types/        — TypeScript interfaces for the assessment schema
public/
└── brand/        — Official logos, favicons, and visual assets
```

## Admin Panel
The Admin Panel is accessible at `/admin`. To initialize your first admin account:
1. Manually add a row to the `Users` tab in your Google Sheet.
2. Set the `role` column to `admin`.
3. Sign in via the `/login` page with the credentials defined in the sheet.
4. From the console, you can manage the intelligence library, audit student history, and calibrate system settings.

## Contributing
We welcome contributions to the DNTRNG protocol.
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes following the **Technical Standard** in `RULES.md`.
4. Open a Pull Request for review.

## License
Distributed under the **MIT License**. See `LICENSE` for more information.