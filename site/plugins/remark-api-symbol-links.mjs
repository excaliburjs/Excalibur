import fs from 'node:fs';
import { visit } from 'unist-util-visit';

export function remarkApiSymbolLinks(options = {}) {
  const symbols = loadSymbolIndex(options.indexPath);

  return function transformer(tree) {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number' || typeof node.value !== 'string' || !node.value.includes('[[')) {
        return;
      }

      const replacements = buildReplacementNodes(node.value, symbols);
      if (replacements) {
        parent.children.splice(index, 1, ...replacements);
      }
    });
  };
}

function loadSymbolIndex(indexPath) {
  if (!indexPath) {
    return new Map();
  }

  try {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return new Map(Object.entries(index.symbols ?? {}));
  } catch {
    return new Map();
  }
}

function buildReplacementNodes(value, symbols) {
  const nodes = [];
  const symbolPattern = /\[\[([^\]]+)\]\]/g;
  let cursor = 0;
  let match;

  while ((match = symbolPattern.exec(value))) {
    const [raw, linkText] = match;
    if (match.index > cursor) {
      nodes.push({ type: 'text', value: value.slice(cursor, match.index) });
    }

    nodes.push(buildLinkNode(linkText, symbols));
    cursor = match.index + raw.length;
  }

  if (!nodes.length) {
    return null;
  }

  if (cursor < value.length) {
    nodes.push({ type: 'text', value: value.slice(cursor) });
  }

  return nodes;
}

function buildLinkNode(linkText, symbols) {
  const [symbolPath, ...aliasParts] = linkText.split('|');
  const displayValue = aliasParts.length ? aliasParts.join('|') : linkText;
  const symbol = symbols.get(symbolPath.trim());
  const classNames = ['tsdoc-link'];

  if (aliasParts.length) {
    classNames.push('tsdoc-link--aliased');
  }

  if (!symbol?.url) {
    classNames.push('tsdoc-link--missing');
  }

  return {
    type: 'link',
    url: symbol?.url ?? '',
    title: symbol?.title ?? `Could not resolve link to '${symbolPath.trim()}'`,
    data: {
      hProperties: {
        className: classNames
      }
    },
    children: [{ type: 'text', value: displayValue }]
  };
}
