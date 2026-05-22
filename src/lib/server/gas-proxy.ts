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
  const urlString = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!urlString) {
    console.error('[Infrastructure Error] APPS_SCRIPT_URL is not defined in environment variables.');
    throw new Error('Registry configuration missing: APPS_SCRIPT_URL');
  }

  try {
    const url = new URL(urlString);
    url.searchParams.set('action', action);
    if (apiKey) url.searchParams.set('apiKey', apiKey);
    
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    console.log('[GAS CALL]', action, url.origin);

    const res = await fetch(url.toString(), { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    const text = await res.text();
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('[GAS PARSE ERROR] Expected JSON but received:', text.slice(0, 300));
      throw new Error('Registry returned invalid data format.');
    }
  } catch (err: any) {
    console.error('[GAS PROXY FAILURE]', err.message);
    throw err;
  }
}

export async function gasPost(
  action: string, 
  payload: object = {}
) {
  const urlString = process.env.APPS_SCRIPT_URL;
  const apiKey = process.env.APPS_SCRIPT_API_KEY;

  if (!urlString) {
    console.error('[Infrastructure Error] APPS_SCRIPT_URL is not defined in environment variables.');
    throw new Error('Registry configuration missing: APPS_SCRIPT_URL');
  }

  try {
    console.log('[GAS POST]', action, urlString.slice(0, 60));

    const res = await fetch(urlString, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action,
        apiKey: apiKey || '',
        ...payload 
      })
    });

    const text = await res.text();
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('[GAS PARSE ERROR] Expected JSON but received:', text.slice(0, 300));
      throw new Error('Registry update returned invalid data format.');
    }
  } catch (err: any) {
    console.error('[GAS PROXY FAILURE]', err.message);
    throw err;
  }
}
