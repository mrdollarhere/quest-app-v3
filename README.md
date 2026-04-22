# DNTRNG — Quiz & Assessment Platform

Welcome to **DNTRNG** (pronounced "Dan-Truong"). This is a professional quiz and testing platform that uses Google Sheets as its brain. It is designed to be powerful for schools and businesses, yet simple enough for anyone to set up in less than 30 minutes.

## Live Demo
Experience the platform as a student here: [quest-dntrng.vercel.app](https://quest-dntrng.vercel.app)

## What You Get
With this platform, you can create interactive tests and track your students' results in real-time.

*   **11 Question Types**: Includes simple multiple-choice, drag-and-drop ordering, matching pairs, and "Hotspots" where students click on parts of an image.
*   **Automatic Certificates**: Give students a professional PDF certificate automatically when they pass a test.
*   **Admin Dashboard**: A private "control center" where you can create tests, manage student lists, and see charts of everyone's scores.
*   **No Database Needed**: Your data lives in a Google Sheet you own. No complex server setup required.
*   **Works Everywhere**: Looks great on phones, tablets, and computers.

## What You Need Before Starting
You don't need to be a coder to set this up. You just need:
1.  **A Google Account** (Free) — to hold your data in Google Sheets.
2.  **A Vercel Account** (Free) — to host your website.
3.  **Node.js** installed on your computer (Free) — only needed if you want to run it locally first.
4.  **30 Minutes** of focused time.

---

## Setup Guide (Step by Step)

### Step 1 — Deploy the Website
The easiest way to get your site online is using **Vercel**.
1.  Upload this project to your GitHub account.
2.  Log in to [Vercel.com](https://vercel.com).
3.  Click **"Add New"** and then **"Project"**.
4.  Import your GitHub repository.
5.  **Stop!** Before clicking "Deploy," move to Step 2 to get your connection link.

### Step 2 — Set Up the Google Sheets "Brain"
This connects your website to your Google Sheet so it can save results.
1.  Create a new **Google Sheet**.
2.  Create 5 tabs (pages) at the bottom and name them exactly: `Tests`, `Users`, `Responses`, `Activity`, and `Settings`.
3.  In the top menu, go to **Extensions** > **Apps Script**.
4.  Delete any code you see there.
5.  Open the file in this project called `src/lib/gas/latest.ts`.
6.  Copy **everything** inside the backticks (the actual code) and paste it into your Google Apps Script window.
7.  Click the blue **"Deploy"** button at the top right, then choose **"New Deployment"**.
8.  Click the "Select type" gear icon and choose **"Web App"**.
9.  Set "Execute as" to **"Me"**.
10. Set "Who has access" to **"Anyone"** (this is important!).
11. Click **Deploy**. Google will ask you to "Authorize access"—click through the prompts to allow it.
12. Copy the **Web App URL** provided at the end. It should look like `https://script.google.com/macros/s/.../exec`.

### Step 3 — Connect Everything
Now we tell your website where to find your Google Sheet.
1.  Go back to your **Vercel** project settings.
2.  Look for the **"Environment Variables"** section.
3.  Add a new variable:
    *   **Key**: `NEXT_PUBLIC_API_URL`
    *   **Value**: Paste the URL you copied in Step 2.
4.  Now click **Deploy** in Vercel.

### Step 4 — Your First Login
Once the site is live, you need to log in as an administrator.
1.  Go to your Google Sheet in the `Users` tab.
2.  Manually add a row:
    *   **email**: your@email.com
    *   **name**: Your Name
    *   **role**: `admin`
    *   **password**: a-strong-password
3.  Go to your new website, click **"Sign In"**, and use those credentials.
4.  You can now access the **Admin Console** to start building tests!

---

## Customization
You can change almost everything without touching code:
*   **Branding**: Go to the "Settings" page in your Admin Console to change the Site Name, Logo URL, and colors.
*   **Access Keys**: You can set a "Daily Key" so only people you give the password to can take your tests.
*   **Certificates**: Toggle this on/off for each individual test in the test editor.

## Need Help?
If you run into trouble or have questions about using the platform:
*   **Email**: support@yourdomain.com
*   **Documentation**: Check the `DOCUMENTATION.md` file for more advanced details.

*Created with ❤️ for teachers and trainers everywhere.*