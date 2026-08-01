import type { Interface } from 'node:readline/promises';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

type Mode = 'bug' | 'feature';

interface Config {
  baseURL: string;
  apiKey: string;
  chatModel: string;
  engineRoot: string;
  repoRoot: string;
  triageDir: string;
  maxCandidates: number;
  sourceTokenBudget: number;
  perFileTokenCap: number;
  thinking: boolean;
  githubRepo: string;
  githubToken?: string;
}

interface CodeMapEntry {
  path: string;
  lineCount: number;
  exports: string[];
  reExports: string[];
  leadingJSDoc: string;
  description?: string;
}

interface CodeMap {
  builtAt: string;
  sourceMtime: number;
  entries: CodeMapEntry[];
}

interface Candidate {
  path: string;
  reason: string;
}

interface BugLocation {
  path: string;
  lines: string;
  reason: string;
  snippet: string;
}

interface BugResult {
  likelihood: string;
  assessment: string;
  locations: BugLocation[];
}

interface FeatureStart {
  path: string;
  lines: string;
  approach: string;
  reason: string;
}

interface FeatureResult {
  assessment: string;
  startingPoints: FeatureStart[];
}

const DEFAULTS = {
  baseURL: 'http://192.168.0.250:1234/v1',
  apiKey: 'lm-studio',
  chatModel: 'qwen/qwen3-30b-a3b-2507',
  maxCandidates: 6,
  sourceTokenBudget: 14000,
  perFileTokenCap: 4000,
  thinking: false,
  githubRepo: 'excaliburjs/Excalibur'
};

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv: string[]): {
  rebuild: boolean;
  enrich: boolean;
  limit?: number;
  configPath?: string;
  mode?: Mode;
  desc?: string;
  issue?: string;
  repo?: string;
  help: boolean;
} {
  const out: {
    rebuild: boolean;
    enrich: boolean;
    help: boolean;
    limit?: number;
    configPath?: string;
    mode?: Mode;
    desc?: string;
    issue?: string;
    repo?: string;
  } = {
    rebuild: false,
    enrich: false,
    help: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--rebuild') out.rebuild = true;
    else if (a === '--enrich') out.enrich = true;
    else if (a === '--limit') {
      const n = Number(argv[++i]);
      if (Number.isFinite(n)) out.limit = n;
    } else if (a.startsWith('--limit=')) {
      const n = Number(a.slice('--limit='.length));
      if (Number.isFinite(n)) out.limit = n;
    } else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--config') out.configPath = argv[++i];
    else if (a.startsWith('--config=')) out.configPath = a.slice('--config='.length);
    else if (a === '--bug') out.mode = 'bug';
    else if (a === '--feature') out.mode = 'feature';
    else if (a === '--desc') out.desc = argv[++i];
    else if (a.startsWith('--desc=')) out.desc = a.slice('--desc='.length);
    else if (a === '--issue') out.issue = argv[++i];
    else if (a.startsWith('--issue=')) out.issue = a.slice('--issue='.length);
    else if (a === '--repo') out.repo = argv[++i];
    else if (a.startsWith('--repo=')) out.repo = a.slice('--repo='.length);
  }
  return out;
}

function readJson(file: string): any | undefined {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function loadConfig(opts: { configPath?: string }): Config {
  const repoRoot = REPO_ROOT;
  const triageDir = path.join(repoRoot, '.triage');
  const fileConfig = readJson(opts.configPath ?? path.join(triageDir, 'config.json')) ?? {};
  const pick = (env: string, key: string, def: string): string => process.env[env] ?? fileConfig[key] ?? def;
  const pickNum = (env: string, key: string, def: number): number => {
    const v = process.env[env] ?? fileConfig[key];
    const n = v !== undefined ? Number(v) : NaN;
    return Number.isFinite(n) ? (n as number) : def;
  };
  const pickBool = (env: string, key: string, def: boolean): boolean => {
    const v = process.env[env] ?? fileConfig[key];
    if (v === undefined) return def;
    return String(v).toLowerCase() === 'true' || v === 1 || v === '1';
  };
  return {
    baseURL: pick('TRIAGE_BASE_URL', 'baseURL', DEFAULTS.baseURL).replace(/\/$/, ''),
    apiKey: pick('TRIAGE_API_KEY', 'apiKey', DEFAULTS.apiKey),
    chatModel: pick('TRIAGE_MODEL', 'chatModel', DEFAULTS.chatModel),
    engineRoot: path.join(repoRoot, 'src', 'engine'),
    repoRoot,
    triageDir,
    maxCandidates: pickNum('TRIAGE_MAX_CANDIDATES', 'maxCandidates', DEFAULTS.maxCandidates),
    sourceTokenBudget: pickNum('TRIAGE_SOURCE_TOKEN_BUDGET', 'sourceTokenBudget', DEFAULTS.sourceTokenBudget),
    perFileTokenCap: pickNum('TRIAGE_PER_FILE_CAP', 'perFileTokenCap', DEFAULTS.perFileTokenCap),
    thinking: pickBool('TRIAGE_THINKING', 'thinking', DEFAULTS.thinking),
    githubRepo: pick('TRIAGE_GITHUB_REPO', 'githubRepo', DEFAULTS.githubRepo),
    githubToken: process.env.TRIAGE_GITHUB_TOKEN ?? fileConfig.githubToken
  };
}

interface IssueRef {
  repo: string;
  number: number;
}

function parseIssueRef(ref: string, defaultRepo: string): IssueRef {
  const s = ref.trim();
  if (/^\d+$/.test(s)) return { repo: defaultRepo, number: Number(s) };
  const m = s.match(/github\.com\/([^/]+\/[^/]+)\/(?:issues|pull)\/(\d+)/i);
  if (m) return { repo: m[1], number: Number(m[2]) };
  const m2 = s.match(/^([^/\s]+)\/([^/\s]+)#(\d+)$/);
  if (m2) return { repo: `${m2[1]}/${m2[2]}`, number: Number(m2[3]) };
  const m3 = s.match(/^([^/\s]+)\/([^/\s]+)\/(\d+)$/);
  if (m3) return { repo: `${m3[1]}/${m3[2]}`, number: Number(m3[3]) };
  throw new Error(`Could not parse issue reference: "${ref}". Use a number, owner/repo#N, owner/repo/N, or a GitHub URL.`);
}

interface FetchedIssue {
  repo: string;
  number: number;
  title: string;
  body: string;
  labels: string[];
  url: string;
  mode: Mode;
}

function inferMode(labels: string[]): Mode {
  const all = labels.map((l) => l.toLowerCase());
  if (all.some((l) => l.includes('bug') || l.includes('defect') || l.includes('error') || l.includes('crash'))) return 'bug';
  if (all.some((l) => l.includes('feature') || l.includes('enhancement') || l.includes('fr'))) return 'feature';
  return 'bug';
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .trim();
}

async function fetchIssue(config: Config, ref: string): Promise<FetchedIssue> {
  const { repo, number } = parseIssueRef(ref, config.githubRepo);
  const url = `https://api.github.com/repos/${repo}/issues/${number}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'excalibur-triage'
  };
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`;
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    throw new Error(`Could not reach GitHub API: ${(e as Error).message}`);
  }
  if (res.status === 404) throw new Error(`Issue not found: ${repo}#${number}`);
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error('GitHub API rate limit exceeded. Set TRIAGE_GITHUB_TOKEN (a personal access token) to raise it.');
    }
    throw new Error(`GitHub API returned 403 Forbidden.`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data: any = await res.json();
  const isPr = !!data.pull_request;
  const rawBody = data.body ?? '';
  const body = stripHtml(rawBody).slice(0, 2000);
  const labels: string[] = Array.isArray(data.labels)
    ? data.labels.map((l: any) => (typeof l === 'string' ? l : (l?.name ?? ''))).filter(Boolean)
    : [];
  return {
    repo,
    number,
    title: String(data.title ?? '').trim(),
    body,
    labels,
    url: data.html_url ?? `https://github.com/${repo}/issues/${number}`,
    mode: inferMode(isPr ? [...labels, 'feature'] : labels)
  };
}

function walkTs(dir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkTs(full, acc);
    else if (e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts') && !e.name.endsWith('.d.ts')) acc.push(full);
  }
  return acc;
}

function buildEntry(file: string): CodeMapEntry {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
  const lineCount = content.split('\n').length;
  const exports: string[] = [];
  const re = /export\s+(?:abstract\s+)?(?:class|interface|enum|function|const|let|var|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) exports.push(m[1]);
  const reExports: string[] = [];
  const reRe = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((m = reRe.exec(content)) !== null) reExports.push(m[1]);
  let leadingJSDoc = '';
  const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (jsdocMatch) {
    leadingJSDoc = jsdocMatch[1]
      .replace(/^\s*\*\s?/gm, '')
      .trim()
      .split('\n')
      .slice(0, 3)
      .join(' ')
      .slice(0, 200);
  }
  return { path: rel, lineCount, exports, reExports, leadingJSDoc };
}

function maxSourceMtime(files: string[]): number {
  let max = 0;
  for (const f of files) {
    try {
      const st = fs.statSync(f);
      if (st.mtimeMs > max) max = st.mtimeMs;
    } catch {
      /* ignore missing files */
    }
  }
  return max;
}

function saveMap(config: Config, map: CodeMap): void {
  if (!fs.existsSync(config.triageDir)) fs.mkdirSync(config.triageDir, { recursive: true });
  fs.writeFileSync(path.join(config.triageDir, 'code-map.json'), JSON.stringify(map, null, 2));
}

function buildIndex(config: Config, priorMap?: CodeMap): CodeMap {
  const files = walkTs(config.engineRoot);
  const entries = files.map(buildEntry);
  entries.sort((a, b) => a.path.localeCompare(b.path));
  if (priorMap) {
    const prior = new Map(priorMap.entries.map((e) => [e.path, e]));
    for (const e of entries) {
      const p = prior.get(e.path);
      if (p && p.description && p.lineCount === e.lineCount) e.description = p.description;
    }
  }
  const map: CodeMap = {
    builtAt: new Date().toISOString(),
    sourceMtime: maxSourceMtime(files),
    entries
  };
  saveMap(config, map);
  return map;
}

function loadIndex(config: Config, force: boolean): CodeMap {
  const cachePath = path.join(config.triageDir, 'code-map.json');
  const cached = !force ? readJson(cachePath) : undefined;
  if (cached && Array.isArray(cached.entries)) {
    const currentMtime = maxSourceMtime(walkTs(config.engineRoot));
    if (cached.sourceMtime && currentMtime <= cached.sourceMtime) {
      console.info(`Using cached code map (${cached.entries.length} files, built ${cached.builtAt})`);
      return cached;
    }
    console.info('Source changed since last build; rebuilding code map (preserving enriched descriptions)...');
    const map = buildIndex(config, cached);
    console.info(`Code map rebuilt: ${map.entries.length} files -> .triage/code-map.json`);
    return map;
  } else {
    console.info('No cached code map; building...');
  }
  const map = buildIndex(config);
  console.info(`Code map built: ${map.entries.length} files -> .triage/code-map.json`);
  return map;
}

function estTokens(s: string): number {
  return Math.ceil(s.length / 4);
}

function mapToString(map: CodeMap): string {
  return map.entries
    .map((e) => {
      const exp = e.exports.length ? ` exports:[${e.exports.slice(0, 12).join(', ')}]` : '';
      const re = e.reExports.length ? ` re-exports:[${e.reExports.slice(0, 6).join(', ')}]` : '';
      const doc = e.description || e.leadingJSDoc ? ` // ${e.description || e.leadingJSDoc}` : '';
      return `${e.path} (${e.lineCount}L)${exp}${re}${doc}`;
    })
    .join('\n');
}

function symbolOutline(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  const re = /^(?:export\s+)?(?:abstract\s+)?(?:class|interface|enum|function|const|let|var|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) out.push(`L${i + 1}:${m[1]}`);
  }
  return out.slice(0, 25).join(', ');
}

function thinkDirective(config: Config): string {
  return config.thinking ? '/think' : '/no_think';
}

function withThink(config: Config, messages: { role: string; content: string }[]): { role: string; content: string }[] {
  const tag = thinkDirective(config);
  if (!tag) return messages;
  return messages.map((m) => (m.role === 'system' ? { role: 'system', content: `${tag}\n${m.content}` } : m));
}

function buildBody(config: Config, messages: { role: string; content: string }[], opts: { maxTokens?: number }, stream: boolean): any {
  const body: any = {
    model: config.chatModel,
    messages: withThink(config, messages),
    temperature: 0.2,
    max_tokens: opts.maxTokens ?? 2048
  };
  if (stream) body.stream = true;
  if (typeof config.thinking === 'boolean') body.chat_template_kwargs = { enable_thinking: config.thinking };
  return body;
}

async function chat(config: Config, messages: { role: string; content: string }[], opts?: { maxTokens?: number }): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(buildBody(config, messages, opts ?? {}, false))
    });
  } catch (e) {
    throw new Error(`Could not connect to LLM at ${config.baseURL} (${(e as Error).message})`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 500)}`);
  }
  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function chatStream(
  config: Config,
  messages: { role: string; content: string }[],
  opts: { maxTokens?: number },
  onProgress?: () => void
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(buildBody(config, messages, opts, true))
    });
  } catch (e) {
    throw new Error(`Could not connect to LLM at ${config.baseURL} (${(e as Error).message})`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 500)}`);
  }
  if (!res.body) {
    const data: any = await res.json();
    const c = data?.choices?.[0]?.message?.content ?? '';
    if (onProgress) onProgress();
    return c;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let content = '';
  let sinceReport = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const nl = buf.lastIndexOf('\n');
    if (nl === -1) continue;
    const chunkLines = buf.slice(0, nl).split('\n');
    buf = buf.slice(nl + 1);
    for (const line of chunkLines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (payload === '' || payload === '[DONE]') continue;
      try {
        const j = JSON.parse(payload);
        const delta: string = j?.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          content += delta;
          sinceReport += delta.length;
          if (onProgress && sinceReport >= 50) {
            onProgress();
            sinceReport = 0;
          }
        }
      } catch {
        /* ignore keepalive / partial lines */
      }
    }
  }
  if (onProgress) onProgress();
  return content;
}

function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    /* fall through */
  }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* fall through */
    }
  }
  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');
  let start: number;
  let close: string;
  if (firstObj === -1 && firstArr === -1) {
    throw new Error('Could not parse JSON from LLM response:\n' + text.slice(0, 800));
  }
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    start = firstArr;
    close = ']';
  } else {
    start = firstObj;
    close = '}';
  }
  const end = text.lastIndexOf(close);
  if (end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }
  throw new Error('Could not parse JSON from LLM response:\n' + text.slice(0, 800));
}

async function warmup(config: Config): Promise<void> {
  process.stdout.write('Warming up model... ');
  try {
    await chat(config, [{ role: 'user', content: 'Reply with the single word: ready' }], { maxTokens: 8 });
    process.stdout.write('ready.\n');
  } catch (e) {
    process.stdout.write('failed.\n');
    console.error(`\nCould not reach LLM at ${config.baseURL}.`);
    console.error(`  ${(e as Error).message}`);
    console.error('Ensure LM Studio is running and the model is loaded.');
    printLmStudioTips();
    process.exit(1);
  }
}

async function pass1(config: Config, map: CodeMap, mode: Mode, desc: string): Promise<Candidate[]> {
  const system =
    'You are triaging issues for the Excalibur.js 2D game engine (TypeScript). You know the codebase structure. Return ONLY compact JSON, no prose.';
  const user = `Given the code map and the ${mode} description, identify the most likely source files to investigate. Return ONLY JSON: {"candidates":[{"path":"src/engine/...","reason":"short"}]} ranked by relevance, at most ${config.maxCandidates} entries. Use the exact path strings from the map.

${mode === 'bug' ? 'Bug' : 'Feature'} description:
"""
${desc}
"""

Code map (path, lineCount, exports, leading doc):
${mapToString(map)}
`;
  const raw = await chatStream(
    config,
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { maxTokens: 1024 },
    () => process.stdout.write('.')
  );
  const parsed = extractJson(raw);
  const candidates: Candidate[] = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
  const known = new Set(map.entries.map((e) => e.path));
  return candidates
    .filter((c) => c && typeof c.path === 'string')
    .map((c) => ({ path: String(c.path).replace(/\\/g, '/'), reason: String(c.reason ?? '').slice(0, 200) }))
    .filter((c) => known.has(c.path) || fs.existsSync(path.join(config.repoRoot, c.path)))
    .slice(0, config.maxCandidates);
}

function gatherSource(config: Config, candidates: Candidate[]): string {
  const parts: string[] = [];
  let totalTokens = 0;
  for (const c of candidates) {
    const full = path.join(config.repoRoot, c.path);
    if (!fs.existsSync(full)) {
      parts.push(`### ${c.path} (file not found)`);
      continue;
    }
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    let maxLines = lines.length;
    let truncated = false;
    if (estTokens(content) > config.perFileTokenCap) {
      maxLines = Math.max(50, Math.floor((config.perFileTokenCap * 4) / 60));
      truncated = true;
    }
    let block = lines
      .slice(0, maxLines)
      .map((l, i) => `${i + 1}|${l}`)
      .join('\n');
    let blockTokens = estTokens(block);
    if (totalTokens + blockTokens > config.sourceTokenBudget) {
      const remaining = config.sourceTokenBudget - totalTokens;
      if (remaining < 500) break;
      block = block.slice(0, remaining * 4);
      truncated = true;
      blockTokens = estTokens(block);
    }
    totalTokens += blockTokens;
    const header = truncated ? ` (truncated, ${lines.length} total lines; outline: ${symbolOutline(content)})` : '';
    parts.push(`### ${c.path}${header}\n\`\`\`ts\n${block}\n\`\`\``);
    if (totalTokens >= config.sourceTokenBudget) {
      parts.push(`(source budget reached at ~${totalTokens} tokens)`);
      break;
    }
  }
  return parts.join('\n\n');
}

async function pass2(config: Config, candidates: Candidate[], mode: Mode, desc: string): Promise<BugResult | FeatureResult> {
  const source = gatherSource(config, candidates);
  if (mode === 'bug') {
    const user = `Determine whether the reported symptom is plausible given this source, and pinpoint the most likely location. Return ONLY JSON: {"likelihood":"Low|Medium|High","assessment":"...","locations":[{"path":"...","lines":"12-45","reason":"...","snippet":"short code excerpt"}]}

Bug description:
"""
${desc}
"""

Candidate source files (line numbers prefixed, | separator):
${source}
`;
    const raw = await chatStream(
      config,
      [
        { role: 'system', content: 'You are a careful Excalibur.js engine debugger. Return ONLY JSON.' },
        { role: 'user', content: user }
      ],
      { maxTokens: 1200 },
      () => process.stdout.write('.')
    );
    return extractJson(raw) as BugResult;
  }
  const user = `Recommend where to start implementing this feature in the engine. Return ONLY JSON: {"assessment":"...","startingPoints":[{"path":"...","lines":"...","approach":"...","reason":"..."}]}

Feature description:
"""
${desc}
"""

Candidate source files (line numbers prefixed, | separator):
${source}
`;
  const raw = await chatStream(
    config,
    [
      { role: 'system', content: 'You are an Excalibur.js engine maintainer. Return ONLY JSON.' },
      { role: 'user', content: user }
    ],
    { maxTokens: 1200 },
    () => process.stdout.write('.')
  );
  return extractJson(raw) as FeatureResult;
}

const ENRICH_BATCH = 5;
const ENRICH_HEAD_LINES = 80;

function needsDescription(e: CodeMapEntry): boolean {
  return !e.description && !e.leadingJSDoc;
}

function fileHead(repoRoot: string, relPath: string, maxLines: number): string {
  const full = path.join(repoRoot, relPath);
  try {
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n').slice(0, maxLines);
    return lines.map((l, i) => `${i + 1}|${l}`).join('\n');
  } catch {
    return '(could not read file)';
  }
}

async function enrichMap(config: Config, map: CodeMap, limit?: number): Promise<void> {
  const todo = map.entries.filter(needsDescription);
  if (todo.length === 0) {
    console.info('All code map entries already have descriptions; nothing to enrich.');
    return;
  }
  const total = limit ? Math.min(limit, todo.length) : todo.length;
  const batches = Math.ceil(total / ENRICH_BATCH);
  console.info(`Enriching ${total} of ${todo.length} undescribed entries (batch size ${ENRICH_BATCH}, ${batches} batches)...`);
  const queue = todo.slice(0, total);
  let done = 0;
  for (let i = 0; i < queue.length; i += ENRICH_BATCH) {
    const batch = queue.slice(i, i + ENRICH_BATCH);
    const batchNo = Math.floor(i / ENRICH_BATCH) + 1;
    process.stdout.write(`Batch ${batchNo}/${batches} (${batch.length} files) `);
    const blocks = batch
      .map((e) => {
        const head = fileHead(config.repoRoot, e.path, ENRICH_HEAD_LINES);
        const exp = e.exports.length ? ` exports:[${e.exports.join(', ')}]` : '';
        return `### ${e.path} (${e.lineCount}L)${exp}\n\`\`\`ts\n${head}\n\`\`\``;
      })
      .join('\n\n');
    const user = `For each file below, write ONE concise sentence (max ~200 chars) describing what it does in the Excalibur.js engine. Return ONLY a JSON array: [{"path":"src/engine/...","description":"..."}]. Use the exact path strings.

${blocks}
`;
    let raw: string;
    try {
      raw = await chatStream(
        config,
        [
          { role: 'system', content: 'You describe Excalibur.js engine source files. Return ONLY a JSON array, no prose.' },
          { role: 'user', content: user }
        ],
        { maxTokens: 900 },
        () => process.stdout.write('.')
      );
    } catch (e) {
      process.stdout.write(' failed.\n');
      console.error(`  batch ${batchNo} error: ${(e as Error).message}`);
      continue;
    }
    process.stdout.write('\n');
    let arr: any;
    try {
      arr = extractJson(raw);
    } catch (e) {
      console.error(`  batch ${batchNo} parse error: ${(e as Error).message}`);
      continue;
    }
    if (!Array.isArray(arr)) arr = arr?.descriptions ?? arr?.items ?? [];
    const byPath = new Map<string, string>();
    for (const item of arr as any[]) {
      if (item && typeof item.path === 'string' && typeof item.description === 'string') {
        byPath.set(String(item.path).replace(/\\/g, '/'), String(item.description).trim().slice(0, 240));
      }
    }
    let batchDone = 0;
    for (const e of batch) {
      const d = byPath.get(e.path);
      if (d) {
        e.description = d;
        batchDone++;
        done++;
      }
    }
    saveMap(config, map);
    console.info(`  +${batchDone} descriptions (saved). ${done}/${total} total.`);
  }
  const stillMissing = map.entries.filter(needsDescription).length;
  console.info(`\nEnrichment complete: ${done} descriptions added, ${stillMissing} still missing.`);
}

async function askType(rl: Interface): Promise<Mode> {
  while (true) {
    const ans = (await rl.question('Is this a (b)ug or (f)eature request? ')).trim().toLowerCase();
    if (ans.startsWith('b')) return 'bug';
    if (ans.startsWith('f')) return 'feature';
    process.stdout.write('Please answer with "b" or "f".\n');
  }
}

async function askDescription(rl: Interface): Promise<string> {
  process.stdout.write('Describe it (end with a blank line):\n');
  const lines: string[] = [];
  while (true) {
    const line = await rl.question(lines.length === 0 ? '> ' : '... ');
    if (line.trim() === '') {
      if (lines.length > 0) break;
      continue;
    }
    lines.push(line);
  }
  return lines.join('\n');
}

function printBanner(config: Config): void {
  console.info('');
  console.info('=== Excalibur Triage ===');
  console.info(`Endpoint: ${config.baseURL}`);
  console.info(`Model:    ${config.chatModel}`);
  console.info(`Engine:   ${path.relative(process.cwd(), config.engineRoot) || config.engineRoot}`);
  console.info('');
}

function printLmStudioTips(): void {
  console.info('\nLM Studio configuration tips (for fast, resident qwen3):');
  console.info('  - Enable "Keep in RAM" / offload all layers to GPU; disable idle auto-unload.');
  console.info('  - Context length (num_ctx): 32768 (65536 if VRAM allows); KV cache: Q8.');
  console.info('  - Flash Attention: ON; ubatch: 512 (speeds up pre-loaded context eval).');
  console.info('  - Optionally load the model on LM Studio startup for instant first triage.');
  console.info('  - qwen3 reasoning (thinking) is OFF by default for speed; enable via TRIAGE_THINKING=true.');
  console.info('  - Override endpoint/model via .triage/config.json or TRIAGE_* env vars.\n');
}

function printHelp(): void {
  console.info('Usage: npm run triage [-- options]');
  console.info('  --rebuild           Force rebuild the code map index.');
  console.info('  --enrich            Walk source files lacking a description and have the model');
  console.info('                      generate one; persist into .triage/code-map.json, then exit.');
  console.info('  --limit <n>         With --enrich, stop after <n> entries (default: all).');
  console.info('  --config <path>     Path to a JSON config file (overrides .triage/config.json).');
  console.info('  --bug               Skip prompt; triage as a bug.');
  console.info('  --feature           Skip prompt; triage as a feature.');
  console.info('  --desc "<text>"     Provide description non-interactively.');
  console.info('  --issue "<ref>"     Fetch a GitHub issue and triage it. <ref> is a number (e.g.');
  console.info('                      1234 in the default repo), owner/repo#N, owner/repo/N, or a');
  console.info('                      github.com/.../issues/N URL. Labels infer bug vs feature.');
  console.info('  --repo <owner/name> Override the default GitHub repo for --issue number refs.');
  console.info('  -h, --help          Show this help.');
  console.info('');
  console.info('Config precedence: CLI --config > TRIAGE_* env > .triage/config.json > defaults.');
  console.info('Env vars: TRIAGE_BASE_URL, TRIAGE_API_KEY, TRIAGE_MODEL,');
  console.info('          TRIAGE_MAX_CANDIDATES, TRIAGE_SOURCE_TOKEN_BUDGET, TRIAGE_PER_FILE_CAP,');
  console.info('          TRIAGE_THINKING (set "true" to enable qwen3 reasoning — much slower),');
  console.info('          TRIAGE_GITHUB_REPO (default: excaliburjs/Excalibur),');
  console.info('          TRIAGE_GITHUB_TOKEN (optional; raises the GitHub API rate limit).');
  console.info('config.json keys: baseURL, apiKey, chatModel, maxCandidates, sourceTokenBudget,');
  console.info('                  perFileTokenCap, thinking, githubRepo, githubToken');
  printLmStudioTips();
}

function printCandidates(candidates: Candidate[]): void {
  console.info('\n--- Pass 1: candidate files ---');
  if (candidates.length === 0) {
    console.info('(no candidates returned)');
    return;
  }
  candidates.forEach((c, i) => console.info(`  ${i + 1}. ${c.path} — ${c.reason}`));
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map((l) => pad + l)
    .join('\n');
}

function printResult(result: BugResult | FeatureResult, mode: Mode): void {
  console.info(`\n--- Pass 2: ${mode === 'bug' ? 'bug assessment' : 'feature recommendation'} ---`);
  if (mode === 'bug') {
    const r = result as BugResult;
    console.info(`Likelihood: ${r.likelihood ?? 'unknown'}`);
    console.info(`Assessment: ${r.assessment ?? ''}`);
    const locs = Array.isArray(r.locations) ? r.locations : [];
    if (locs.length) {
      console.info('Likely locations:');
      locs.forEach((l, i) => {
        console.info(`  ${i + 1}. ${l.path}:${l.lines ?? '?'}`);
        if (l.reason) console.info(`     reason: ${l.reason}`);
        if (l.snippet) console.info(`     snippet:\n${indent(l.snippet, 8)}`);
      });
    }
  } else {
    const r = result as FeatureResult;
    console.info(`Assessment: ${r.assessment ?? ''}`);
    const pts = Array.isArray(r.startingPoints) ? r.startingPoints : [];
    if (pts.length) {
      console.info('Recommended starting points:');
      pts.forEach((p, i) => {
        console.info(`  ${i + 1}. ${p.path}:${p.lines ?? '?'}`);
        if (p.approach) console.info(`     approach: ${p.approach}`);
        if (p.reason) console.info(`     reason: ${p.reason}`);
      });
    }
  }
  console.info('');
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }
  const config = loadConfig(opts);
  printBanner(config);
  const map = loadIndex(config, opts.rebuild);
  await warmup(config);

  if (opts.enrich) {
    const t0 = Date.now();
    await enrichMap(config, map, opts.limit);
    console.info(`Enrichment took ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
    return;
  }

  if (opts.repo) config.githubRepo = opts.repo;

  let resolvedMode: Mode | undefined = opts.mode;
  let issue: FetchedIssue | undefined;
  if (opts.issue) {
    process.stdout.write(`Fetching GitHub issue ${opts.issue}... `);
    try {
      issue = await fetchIssue(config, opts.issue);
    } catch (e) {
      process.stdout.write('failed.\n');
      console.error(`  ${(e as Error).message}`);
      process.exit(1);
    }
    process.stdout.write('done.\n');
    console.info(`  ${issue.repo}#${issue.number}: ${issue.title}`);
    console.info(`  ${issue.url}`);
    if (issue.labels.length) console.info(`  labels: ${issue.labels.join(', ')}`);
    if (!resolvedMode) resolvedMode = issue.mode;
  }

  const needPrompt = (!resolvedMode || opts.desc === undefined) && !issue;
  let rl: Interface | undefined;
  if (needPrompt) rl = readline.createInterface({ input, output });

  const mode: Mode = resolvedMode ?? (await askType(rl!));
  let desc: string;
  if (issue) {
    desc = [issue.title, issue.body].filter(Boolean).join('\n\n---\n\n');
    rl?.close();
  } else {
    desc = opts.desc ?? (await askDescription(rl!));
    if (rl) rl.close();
  }

  if (!desc.trim()) {
    console.error('No description provided.');
    process.exit(1);
  }

  console.info(`\nTriage in progress (mode: ${mode})...`);
  const t0 = Date.now();
  process.stdout.write('Pass 1: scanning code map for candidates ');
  const candidates = await pass1(config, map, mode, desc);
  process.stdout.write('\n');
  printCandidates(candidates);
  if (candidates.length === 0) {
    console.error('No candidate files identified. Try refining the description.');
    process.exit(1);
  }
  process.stdout.write('\nPass 2: reading candidate source & analyzing (this can take a minute) ');
  const result = await pass2(config, candidates, mode, desc);
  process.stdout.write('\n');
  printResult(result, mode);
  console.info(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
}

main().catch((e) => {
  console.error('\nTriage failed:', (e as Error).message ?? e);
  process.exit(1);
});
