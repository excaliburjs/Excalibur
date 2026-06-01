import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const docsRoot = path.join(siteRoot, 'docs');

export function buildDocsSidebar() {
  const seenSlugs = new Map();
  return readDirectory(docsRoot, seenSlugs).items;
}

function readDirectory(directory, seenSlugs) {
  const metadata = readCategoryMetadata(directory);
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => shouldIncludeEntry(entry, directory));

  const items = entries
    .map((entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        const childDirectory = readDirectory(fullPath, seenSlugs);
        return {
          label: childDirectory.metadata.label ?? cleanLabel(entry.name),
          collapsed: childDirectory.metadata.collapsed ?? true,
          items: childDirectory.items,
          order: childDirectory.metadata.position ?? getNumericPrefix(entry.name),
          name: entry.name
        };
      }

      const frontmatter = readFrontmatter(fullPath);
      const slug = buildDocsSlug(frontmatter.slug, fullPath);
      const existing = seenSlugs.get(slug);
      if (existing) {
        throw new Error(`Duplicate docs sidebar slug '${slug}' in ${fullPath} and ${existing}`);
      }
      seenSlugs.set(slug, fullPath);

      return {
        slug,
        label: frontmatter.title ?? readFirstHeading(fullPath) ?? cleanLabel(entry.name),
        order: getNumericPrefix(entry.name),
        name: entry.name
      };
    })
    .sort(compareSidebarItems)
    .map(({ order, name, ...item }) => item);

  return { metadata, items };
}

function shouldIncludeEntry(entry, directory) {
  if (entry.name.startsWith('.')) {
    return false;
  }

  if (entry.isDirectory()) {
    return directoryHasMdx(path.join(directory, entry.name));
  }

  return entry.isFile() && entry.name.endsWith('.mdx');
}

function directoryHasMdx(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      return true;
    }

    if (entry.isDirectory() && directoryHasMdx(fullPath)) {
      return true;
    }
  }

  return false;
}

function readCategoryMetadata(directory) {
  const categoryPath = path.join(directory, '_category_.json');
  const misspelledCategoryPath = path.join(directory, '_catagory_.json');
  const metadataPath = fs.existsSync(categoryPath)
    ? categoryPath
    : fs.existsSync(misspelledCategoryPath)
      ? misspelledCategoryPath
      : undefined;

  if (!metadataPath) {
    return {};
  }

  return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
}

function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }

  return parseYamlishFrontmatter(match[1], filePath);
}

function parseYamlishFrontmatter(frontmatter, filePath) {
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = normalizeFrontmatterValue(rawValue);
  }

  if (typeof data.slug !== 'string') {
    throw new Error(`Missing slug frontmatter in ${filePath}`);
  }

  return data;
}

function normalizeFrontmatterValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  return trimmed;
}

function readFirstHeading(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^---\n[\s\S]*?\n---/, '');
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim();
}

function buildDocsSlug(frontmatterSlug, filePath) {
  const normalized = frontmatterSlug.replace(/^\/+/, '').replace(/\/+$/, '');
  const slug = normalized ? `docs/${normalized}` : 'docs';

  if (!slug.startsWith('docs')) {
    throw new Error(`Generated sidebar slug '${slug}' for ${filePath} does not start with 'docs'`);
  }

  return slug;
}

function compareSidebarItems(a, b) {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

function getNumericPrefix(name) {
  const match = name.match(/^(\d+(?:\.\d+)?)(?:[-_]|\s|$)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function cleanLabel(name) {
  return name
    .replace(/\.(md|mdx)$/i, '')
    .replace(/^\d+(?:\.\d+)?[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
