'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * SYSTEM AUDIT ACTION
 * 
 * Reads the CHANGELOG.md file from the project root.
 */
export async function getChangelog() {
  try {
    const filePath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error("Changelog read error:", error);
    return "# Changelog\n\nNo entries found.";
  }
}
