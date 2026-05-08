/**
 * gas-proxy.ts
 * 
 * SERVER ONLY: This utility handles secure communication with the Google Apps Script bridge.
 * It injects the APPS_SCRIPT_API_KEY which must never be exposed to the client.
 */

export async function gasGet(
  action: string,
  params: Record<string, string> = {}
) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('Infrastructure Error: NEXT_PUBLIC_API_URL is missing');
  }

  const url = new URL(process.env.NEXT_PUBLIC_API_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('apiKey', process.env.APPS_SCRIPT_API_KEY || "");
  
  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const text = await res.text();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Registry Sync Error: ' + text.slice(0, 100));
  }
}

export async function gasPost(
  action: string, 
  payload: object = {}
) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('Infrastructure Error: NEXT_PUBLIC_API_URL is missing');
  }

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action,
      apiKey: process.env.APPS_SCRIPT_API_KEY || "",
      ...payload 
    })
  });

  const text = await res.text();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Registry Sync Error: ' + text.slice(0, 100));
  }
}
