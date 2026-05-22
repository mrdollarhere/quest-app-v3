'use server';

import { askAssistant, ChatBotInput } from '@/ai/flows/chatbot-flow';

/**
 * AI ASSISTANT ACTION
 * 
 * Proxies the chatbot flow to the client.
 */
export async function sendMessageToAssistant(input: ChatBotInput) {
  try {
    const response = await askAssistant(input);
    return { success: true, text: response };
  } catch (error) {
    console.error('[Assistant Error]', error);
    return { success: false, text: "The intelligence node is currently offline. Please try again later." };
  }
}
