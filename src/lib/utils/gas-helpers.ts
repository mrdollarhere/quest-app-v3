import { gasGet, gasPost } from '@/lib/server/gas-proxy';

/**
 * DNTRNG™ REGISTRY BRIDGE WRAPPERS
 * 
 * Implements defensive execution for Google Apps Script handshakes.
 */

export async function safeGasGet(action: string, params: Record<string, string> = {}) {
  try {
    return await gasGet(action, params);
  } catch (e) {
    console.error(`[GAS GET Failure: ${action}]`, e);
    return null;
  }
}

export async function safeGasPost(action: string, payload: object = {}) {
  try {
    return await gasPost(action, payload);
  } catch (e) {
    console.error(`[GAS POST Failure: ${action}]`, e);
    return null;
  }
}
