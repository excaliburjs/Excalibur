import fs from 'node:fs';
import path from 'node:path';

const apiDataPath = path.join(process.cwd(), 'astro', 'generated', 'api-data.json');

export type ApiSymbol = {
  id: string;
  name: string;
  kind: string;
  url: string;
  title: string;
  summary: string;
};

export type ApiPage = ApiSymbol & {
  members: ApiSymbol[];
};

export function loadApiData(): { pages: ApiPage[]; rootSymbols: ApiSymbol[]; generatedAt?: string } {
  try {
    return JSON.parse(fs.readFileSync(apiDataPath, 'utf8'));
  } catch {
    return { pages: [], rootSymbols: [] };
  }
}

export function getApiPageParam(page: ApiPage) {
  return page.url.split('/').filter(Boolean).at(-1) ?? page.name;
}
