# Open Assessment Platform

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo-name)

## What is this?
This is a high-performance, interactive assessment and quiz engine built with React and Next.js. It uses Google Sheets as a real-time database, allowing you to manage questions, users, and results directly from a spreadsheet without needing a complex database setup.

## Features
- **Interactive Question Types**: Supports multiple choice, drag-and-drop ordering, matching pairs, image hotspots, matrix choices, and more.
- **Google Sheets Backend**: Real-time synchronization with a spreadsheet for easy data management.
- **Admin Dashboard**: Full interface for managing tests, users, and viewing live analytics.
- **Multiple Modes**: Practice mode (instant feedback), Timed Test mode, and "Race" mode (accuracy streak).
- **Accessibility**: Built-in settings for adjustable text sizes and high-legibility layouts.
- **Analytics**: Visual charts showing performance trends and question difficulty.
- **Security**: Optional daily access keys that rotate automatically to protect assessment sessions.
- **Multilingual**: Support for English, Vietnamese, and Spanish.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **UI Components**: Shadcn UI, Lucide Icons.
- **Charts**: Recharts.
- **Database**: Google Sheets via Google Apps Script.
- **AI Integration**: Genkit with Google Gemini for assessment parsing.

## Project Structure
- `src/app`: Application routes and page-level layouts.
- `src/components`: Reusable UI components (Admin, Quiz, and Atomic UI).
- `src/context`: Global state management for authentication and localization.
- `src/lib`: Core utilities, security logic, and API configuration.
- `src/hooks`: Custom hooks for data filtering and shared logic.
- `src/types`: TypeScript interfaces for consistent data structures.

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the database**:
   - Create a new Google Sheet.
   - Set up the required tabs: `Tests`, `Users`, `Responses`, `Activity`, `Settings`.
   - Add the Google Apps Script (found in `src/app/lib/gas-template.ts`) to your sheet.
   - Deploy as a Web App and copy the provided URL.

4. **Set Environment Variables**:
   Update `src/lib/api-config.ts` with your Google Apps Script URL:
   ```typescript
   export const API_URL = "your-apps-script-url";
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to see the app.

## Self-Hosting Guide
Anyone can fork and deploy this project for free:
1. **Frontend**: Connect your GitHub repository to Vercel or Firebase App Hosting.
2. **Database**: Use the provided Apps Script template to turn any Google Sheet into a web API.
3. **Configuration**: Point the frontend to your sheet URL using the `API_URL` setting.

## Contributing
Contributions are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Submit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License. See `LICENSE` for more information.
