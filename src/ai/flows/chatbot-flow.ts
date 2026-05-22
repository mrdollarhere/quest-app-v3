'use server';
/**
 * @fileOverview DNTRNG Intelligence Assistant Flow.
 * 
 * - chatbotFlow - Handles conversational AI interactions for platform support.
 * - ChatBotInput - Schema for message history and user query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  text: z.string(),
});

const ChatBotInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The user\'s current query.'),
});

export type ChatBotInput = z.infer<typeof ChatBotInputSchema>;

const SYSTEM_PROMPT = `You are the DNTRNG Assistant, an expert AI guide for the DNTRNG (Dan Truong) Intelligence Platform. 

Your goal is to help students and teachers understand how the platform works.

Key Platform Information:
- DNTRNG is a high-performance assessment engine.
- It uses Google Sheets™ as its primary real-time database (Zero-Infrastructure Protocol).
- It supports 11+ interaction types including Hotspot, Matrix, Ordering, and Matching.
- It features "Live Mode" for teacher-led classroom sessions synchronized via Pusher.
- It is multi-lingual (English, Vietnamese, Spanish).
- It is free to host for teachers and organizations.

Guidelines:
- Be professional, technical, and helpful.
- Keep responses concise and focused on the platform.
- If asked about setup, mention the "Setup Guide" at /setup-guide.
- If asked about security, mention the "Zero-Retention Protocol" and "Daily Access Keys".
- You can respond in English or Vietnamese based on the user's language.`;

const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatBotInputSchema },
  system: SYSTEM_PROMPT,
  prompt: `
{{#if history}}
History:
{{#each history}}
- {{role}}: {{text}}
{{/each}}
{{/if}}

User: {{message}}
Assistant:`,
});

export const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatBotInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { text } = await chatbotPrompt(input);
    return text;
  }
);

export async function askAssistant(input: ChatBotInput): Promise<string> {
  return chatbotFlow(input);
}
