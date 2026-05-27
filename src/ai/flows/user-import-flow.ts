'use server';
/**
 * @fileOverview DNTRNG Identity Extraction Flow.
 * 
 * - userImportFlow - Extracts student identities from raw text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UserImportInputSchema = z.object({
  rawText: z.string().describe('The raw text containing names or user info.'),
  defaultRole: z.string().default('user'),
  defaultPassword: z.string().default('student123'),
  emailDomain: z.string().default('student.dntrng.edu.vn')
});

const UserOutputSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string(),
  password: z.string()
});

const UserImportOutputSchema = z.array(UserOutputSchema);

export async function importUsersAI(input: z.infer<typeof UserImportInputSchema>) {
  return userImportFlow(input);
}

const userImportPrompt = ai.definePrompt({
  name: 'userImportPrompt',
  input: { schema: UserImportInputSchema },
  output: { schema: UserImportOutputSchema },
  prompt: `You are an administrative assistant for the DNTRNG Intelligence Platform.
Your task is to parse the following raw text and extract a list of full names.

For each student name found:
1. Normalize the name (e.g., "nguyen van an" -> "Nguyen Van An").
2. Generate a unique email address using the domain "{{{emailDomain}}}". 
   Format: lowercase, remove all Vietnamese accents/diacritics. 
   Strategy: [firstname].[lastname][random_suffix]@{{{emailDomain}}}.
3. Assign the role: "{{{defaultRole}}}".
4. Assign the password: "{{{defaultPassword}}}".

Raw Text:
{{{rawText}}}

Return ONLY a valid JSON array of user objects. No markdown.`,
});

export const userImportFlow = ai.defineFlow(
  {
    name: 'userImportFlow',
    inputSchema: UserImportInputSchema,
    outputSchema: UserImportOutputSchema,
  },
  async (input) => {
    const { output } = await userImportPrompt(input);
    return output!;
  }
);
