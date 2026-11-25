import * as fs from 'fs/promises';
import * as path from 'path';
import type { BrowserCommand } from 'vitest/node';

const ENGINE_DIR = path.resolve(import.meta.dirname, '../../../engine');

/**
 * Scans `src/engine/**\/*.ts` (excluding `node_cache`) on the Node side and
 * returns sorted POSIX-normalized paths (relative to `src/engine`) whose
 * contents match the given regular expression.
 */
export const findEngineFilesMatching: BrowserCommand<[pattern: string, flags?: string]> = async (_ctx, pattern, flags) => {
  const regex = new RegExp(pattern, flags);
  const entries = await fs.readdir(ENGINE_DIR, { recursive: true, withFileTypes: true });
  const tsFiles: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) {
      continue;
    }
    const fullPath = path.join(entry.parentPath, entry.name);
    const rel = path.relative(ENGINE_DIR, fullPath).split(path.sep).join('/');
    if (rel.startsWith('node_cache/')) {
      continue;
    }
    tsFiles.push(rel);
  }

  const matches = await Promise.all(
    tsFiles.map(async (rel) => {
      const content = await fs.readFile(path.join(ENGINE_DIR, rel), 'utf8');
      regex.lastIndex = 0;
      return regex.test(content) ? rel : null;
    })
  );

  return matches.filter((rel): rel is string => rel !== null).sort();
};

declare module 'vitest/browser' {
  interface BrowserCommands {
    findEngineFilesMatching: (pattern: string, flags?: string) => Promise<string[]>;
  }
}
