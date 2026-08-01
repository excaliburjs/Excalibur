const ROUTE_KIND_BY_KIND_STRING = new Map([
  ['Class', 'class'],
  ['Interface', 'interface'],
  ['Enum', 'enum'],
  ['Function', 'function'],
  ['Namespace', 'namespace'],
  ['Module', 'namespace'],
  ['TypeAlias', 'interface']
]);

const KIND_STRING_BY_KIND = new Map([
  [1, 'Project'],
  [2, 'Module'],
  [4, 'Namespace'],
  [8, 'Enum'],
  [16, 'EnumMember'],
  [32, 'Variable'],
  [64, 'Function'],
  [128, 'Class'],
  [256, 'Interface'],
  [512, 'Constructor'],
  [1024, 'Property'],
  [2048, 'Method'],
  [4096, 'CallSignature'],
  [8192, 'IndexSignature'],
  [16384, 'ConstructorSignature'],
  [32768, 'Parameter'],
  [65536, 'TypeLiteral'],
  [131072, 'TypeParameter'],
  [262144, 'Accessor'],
  [524288, 'GetSignature'],
  [1048576, 'SetSignature'],
  [2097152, 'TypeAlias'],
  [4194304, 'Reference']
]);

const MEMBER_KIND_STRINGS = new Set([
  'Accessor',
  'Constructor',
  'EnumMember',
  'Function',
  'Method',
  'Property',
  'Reference',
  'TypeAlias',
  'Variable'
]);

export function normalizeTypedoc(project) {
  const pages = [];
  const symbols = new Map();
  const rootSymbols = [];

  for (const child of getChildren(project)) {
    visitTopLevel(child, { pages, symbols, rootSymbols });
  }

  const orderedPages = pages.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
  const orderedRootSymbols = rootSymbols.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: new Date().toISOString(),
    pages: orderedPages,
    rootSymbols: orderedRootSymbols,
    symbols: Object.fromEntries([...symbols.entries()].sort(([a], [b]) => a.localeCompare(b)))
  };
}

function visitTopLevel(node, context) {
  const kindString = getKindString(node);
  const routeKind = ROUTE_KIND_BY_KIND_STRING.get(kindString);

  if (routeKind) {
    const page = buildPage(node, routeKind);
    context.pages.push(page);
    addSymbol(context.symbols, node.name, page.url, node, false);

    if (routeKind === 'namespace') {
      for (const child of getChildren(node)) {
        addNestedNamespaceSymbol(child, node.name, page.url, context.symbols);
      }
    } else {
      for (const child of getChildren(node)) {
        addMemberSymbol(child, node.name, page.url, context.symbols, page.members);
      }
    }
    return;
  }

  if (kindString === 'Variable') {
    const symbol = buildSymbol(node, `/api/#${anchorFor(node.name)}`, false);
    context.rootSymbols.push(symbol);
    addSymbol(context.symbols, node.name, symbol.url, node, false);
  }
}

function buildPage(node, routeKind) {
  const url = `/api/${routeKind}/${pageNameFor(node.name)}`;

  return {
    id: String(node.id ?? node.name),
    kind: routeKind,
    name: node.name,
    title: node.name,
    url,
    summary: getSummary(node),
    members: []
  };
}

function addNestedNamespaceSymbol(node, namespaceName, namespaceUrl, symbols) {
  const fullName = `${namespaceName}.${node.name}`;
  const childKind = getKindString(node);
  const url = `${namespaceUrl}#${anchorFor(node.name)}`;

  addSymbol(symbols, fullName, url, node, childKind === 'Reference');

  for (const child of getChildren(node)) {
    const childName = `${fullName}.${child.name}`;
    addSymbol(symbols, childName, `${namespaceUrl}#${anchorFor(child.name)}`, child, true);
  }
}

function addMemberSymbol(node, ownerName, ownerUrl, symbols, members) {
  const kindString = getKindString(node);

  if (!MEMBER_KIND_STRINGS.has(kindString)) {
    return;
  }

  const memberName = node.name === 'constructor' ? 'constructor' : node.name;
  const symbolName = `${ownerName}.${memberName}`;
  const url = `${ownerUrl}#${anchorFor(memberName)}`;
  const member = buildSymbol(node, url, true);

  members.push(member);
  addSymbol(symbols, symbolName, url, node, false);

  if (memberName === 'constructor') {
    addSymbol(symbols, `${ownerName}#ctor`, url, node, true);
  }
}

function addSymbol(symbols, name, url, node, aliased) {
  if (!name || symbols.has(name)) {
    return;
  }

  symbols.set(name, buildSymbol(node, url, aliased));
}

function buildSymbol(node, url, aliased) {
  return {
    id: String(node.id ?? node.name),
    name: node.name,
    kind: getKindString(node),
    url,
    title: `View '${node.name}'`,
    summary: getSummary(node),
    aliased
  };
}

function getChildren(node) {
  return Array.isArray(node?.children) ? node.children : [];
}

function getKindString(node) {
  return node?.kindString ?? KIND_STRING_BY_KIND.get(node?.kind) ?? `Kind${node?.kind ?? 'Unknown'}`;
}

function getSummary(node) {
  const summary = node?.comment?.summary;
  if (!Array.isArray(summary)) {
    return '';
  }

  return summary.map((part) => part.text ?? part.target ?? '').join('').trim();
}

function pageNameFor(name) {
  return encodeURIComponent(name.replace(/[^a-z0-9_$-]/gi, '_'));
}

function anchorFor(name) {
  return encodeURIComponent(String(name).replace(/^#/, ''));
}
