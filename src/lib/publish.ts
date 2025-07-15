
import { promises as fs } from 'fs';
import path from 'path';

export async function publishPost(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  if (lines[0] !== '---') {
    // Not a valid frontmatter file
    return;
  }

  // Find the end of the frontmatter
  let frontmatterEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      frontmatterEndIndex = i;
      break;
    }
  }

  if (frontmatterEndIndex === -1) {
    // No closing '---' found
    return;
  }

  // Check if 'published:' key already exists
  const frontmatterLines = lines.slice(1, frontmatterEndIndex);
  const hasPublished = frontmatterLines.some(line => line.trim().startsWith('published:'));

  if (!hasPublished) {
    // Add 'published: true' after the opening '---'
    lines.splice(1, 0, 'published: true');
    const newContent = lines.join('\n');
    await fs.writeFile(filePath, newContent);
  }
}
