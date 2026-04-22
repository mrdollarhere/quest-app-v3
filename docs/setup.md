# Full Setup Guide

Follow these steps to launch your own assessment platform from scratch.

## Prerequisites
1.  **A Google Account**: To hold your data in Google Sheets.
2.  **A Vercel Account**: To host your website (the "Hobby" plan is free).
3.  **The Code**: You should have the project files downloaded or on GitHub.

---

## Step 1: Deploy the Website
The easiest way to get your site online is using **Vercel**.

1.  Log in to [Vercel.com](https://vercel.com).
2.  Click **"Add New"** and then **"Project"**.
3.  Import your project repository.
4.  **Stop!** Before clicking "Deploy," you need your API URL. Move to Step 2.

## Step 2: Set Up the "Brain" (Google Sheets)
This is where all your tests, students, and results are stored.

1.  Follow the **[Google Apps Script Guide](gas-setup.md)** to create your backend.
2.  Once finished, you will have a URL that looks like `https://script.google.com/macros/s/.../exec`.

## Step 3: Connect the two
1.  Go back to your Vercel project settings.
2.  Find the **"Environment Variables"** section.
3.  Add a new variable:
    - **Key**: `NEXT_PUBLIC_API_URL`
    - **Value**: Paste the URL you got from Step 2.
4.  Now click **Deploy**.

## Step 4: Your First Login
Once the site is live:
1.  Open your Google Sheet.
2.  Go to the `Users` tab.
3.  Add a row with your email, name, password, and set the role to `admin`.
4.  Go to your website, click **Sign In**, and use those details.
5.  You can now access the **Admin Console**!