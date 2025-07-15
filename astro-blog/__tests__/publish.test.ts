import { promises as fs } from 'fs';
import path from 'path';
import { publishPost } from '../src/lib/publish';

describe('publishPost', () => {
  const testFilePath = path.join(__dirname, 'test-post.md');

  beforeEach(async () => {
    const content = '---\ntitle: Test Post\ndate: 2025-07-15\n---\n\n# Hello World';
    await fs.writeFile(testFilePath, content);
  });

  afterEach(async () => {
    await fs.unlink(testFilePath);
  });

  it('should add published: true to frontmatter', async () => {
    await publishPost(testFilePath);
    const updatedContent = await fs.readFile(testFilePath, 'utf-8');
    expect(updatedContent).toContain('published: true');
  });
});