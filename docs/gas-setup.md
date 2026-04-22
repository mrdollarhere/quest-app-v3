# Setting Up Your Backend (Google Apps Script)

Google Apps Script (GAS) is a free tool provided by Google. For this project, it acts like a free server that connects your website to your Google Sheets database.

## Step by Step Guide

1.  **Open the Editor**: Go to [script.google.com](https://script.google.com).
2.  **Create Project**: Click **"New Project"** at the top left.
3.  **Clear Code**: Delete the default code in the window so it is empty.
4.  **Copy our Code**: Open the file `src/lib/gas/latest.ts` in the project code you downloaded. Copy everything inside.
5.  **Paste & Save**: Paste the code into the Google Script editor. Click the **Floppy Disk** icon to save. Name it "DNTRNG Backend".
6.  **Deploy**: 
    - Click the blue **"Deploy"** button -> **"New Deployment"**.
    - Click the **Gear icon** and choose **"Web app"**.
    - Set "Execute as" to **"Me"**.
    - Set "Who has access" to **"Anyone"** (Critical!).
7.  **Authorize**: Click **Deploy**. Google will ask for permission. Click through the prompts (you may need to click "Advanced" -> "Go to DNTRNG Backend (unsafe)").
8.  **Get your URL**: Copy the **Web App URL** provided at the end. 

**This URL is your API Key.** Keep it safe! You will need to paste it into Vercel settings as `NEXT_PUBLIC_API_URL`.