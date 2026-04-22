# Troubleshooting

### "Script not found" or 404 Error
- **Cause**: The `NEXT_PUBLIC_API_URL` is wrong.
- **Fix**: Make sure you copied the FULL URL from Google, including the `/exec` at the end. Check for extra spaces!

### Changes in the Sheet aren't showing up
- **Cause**: Google Sheets sometimes caches data.
- **Fix**: Click the **"Sync Data"** button on the Admin Dashboard to force a fresh pull.

### Certificate doesn't download
- **Cause**: Pop-up blocker or missing Logo.
- **Fix**: Ensure your browser allows downloads. If you added a custom Logo, make sure the link is valid.

### Login Failed
- **Cause**: Incorrect email/password in the `Users` tab.
- **Fix**: Open your Google Sheet, go to `Users`, and make sure your password is exactly what you are typing. Case matters!

### White Screen on Startup
- **Cause**: API URL is missing.
- **Fix**: Ensure you added the environment variable in Vercel and redeployed the project.