/**
 * GitHub Action Script: Post Benchmark Results Comment
 *
 * Runs in benchmark-results.yml on `workflow_run` (a Benchmark run completed) or `workflow_dispatch` (a collaborator
 * re-posting a run by id). Keeps ONE sticky comment per PR, updated in place.
 *
 * Trust model. The Benchmark run executed the PR's code with the PR's own copy of benchmark.yml, so everything about its
 * artifact (name, count, size, layout, bytes) is attacker controlled. This script is the only privileged consumer and:
 *   - takes the PR number, commit sha, branch and run url from the workflow_run payload / API only, never from the artifact
 *   - matches the PR on head repo + head branch + head sha + base repo (a stranger's PR at the same commit is not ours)
 *   - selects the artifact by API metadata (name, size cap, sha, freshness) before downloading a byte
 *   - extracts only results.json from the zip, with a byte cap, and never writes any other entry to disk
 *   - rebuilds the results from an allowlist: numbers, strictly shaped identifiers and fixed labels. No string from the
 *     artifact is ever echoed (error text becomes the fixed label ERROR; charts and report.md are never read)
 *   - only ever edits comments authored by the Actions bot that start with our marker, and never lets an older run
 *     overwrite a newer run's results
 *
 * @param {Object} github - GitHub API client (octokit)
 * @param {Object} context - GitHub Actions context
 * @param {Object} core - GitHub Actions core helpers
 * @param {Object} exec - GitHub Actions exec helpers
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const WORKFLOW_PATH = '.github/workflows/benchmark.yml';
const ARTIFACT_NAME = 'benchmark-results';
const RESULTS_FILE = 'results.json';
const BASELINE_SPEC = 'npm:excalibur@latest';
const WARN_PERCENT = 20;

const MARKER_RE = /^<!-- excalibur-benchmark-results run=(\d{1,20}) attempt=(\d{1,4}) sha=([0-9a-f]{40}) -->/;
// Comments are matched by author, not by marker alone: a person pasting the marker into their own comment is never edited
const COMMENT_AUTHORS = [{ login: 'github-actions[bot]', id: 41898282, type: 'Bot' }];
const ALLOWED_CONCLUSIONS = new Set(['success', 'failure']);

const MAX_ARTIFACT_BYTES = 1024 * 1024; // real results are ~150 KB
const MAX_RESULTS_BYTES = 2 * 1024 * 1024;
const MAX_COMMENT_SIZE = 60000; // GitHub limit is 65536
const LIMITS = { tests: 50, runs: 20, extras: 8, repeat: 20, number: 1e15 };

const TEST_NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VERSION_RE = /^[0-9A-Za-z.+-]{1,64}$/;
const CHROMIUM_RE = /^[0-9]+(\.[0-9]+){0,3}$/;
const EXTRAS_KEY_RE = /^[A-Za-z0-9]{1,32}$/; // plus a `key in Object.prototype` check: no __proto__, constructor, toString...
const SHA_RE = /^[0-9a-f]{40}$/;
const RUN_ID_RE = /^\d{1,20}$/;
const MODES = new Set(['step', 'realtime']);
const GLS = new Set(['swiftshader', 'hardware']);

module.exports = async ({ github, context, core, exec }) => {
  const repo = { owner: context.repo.owner, repo: context.repo.repo };
  const fullName = `${repo.owner}/${repo.repo}`;

  const run = await loadRun(github, context, repo);
  if (!run) {
    core.info('No Benchmark run to report');
    return;
  }
  if (run.path !== WORKFLOW_PATH || run.event !== 'pull_request' || !ALLOWED_CONCLUSIONS.has(run.conclusion)) {
    core.info(
      `Run ${run.id} is not a completed pull_request Benchmark run (${run.path}, ${run.event}, ${run.conclusion}), nothing to post`
    );
    return;
  }
  if (!isPlainObject(run.head_repository) || !isPlainObject(run.head_repository.owner) || !run.head_repository.owner.login) {
    core.info(`Run ${run.id} has no head repository (fork deleted?), nothing to post`);
    return;
  }
  if (!SHA_RE.test(run.head_sha) || !Number.isInteger(run.id) || !Number.isInteger(run.run_attempt)) {
    core.setFailed('Unexpected workflow_run payload');
    return;
  }

  const pr = await pickPr(github, repo, run);
  if (!pr) {
    core.info(`No pull request in ${fullName} matches run ${run.id} (${run.head_repository.full_name}@${run.head_sha}), nothing to post`);
    return;
  }

  const existing = await findStickyComment(github, repo, pr.number);
  if (existing && !isNewer(run, existing.marker)) {
    core.info(
      `PR #${pr.number} already shows run ${existing.marker.run} attempt ${existing.marker.attempt}, skipping run ${run.id} attempt ${run.run_attempt}`
    );
    return;
  }

  const trusted = {
    sha: run.head_sha,
    commitUrl: `${context.serverUrl}/${fullName}/commit/${run.head_sha}`,
    runUrl: run.html_url,
    attempt: run.run_attempt,
    conclusion: run.conclusion
  };

  let body;
  const picked = await pickArtifact(github, repo, run);
  if (!picked.artifact) {
    core.warning(`Not rendering results: ${picked.reason}`);
    body = renderNoResults(trusted, picked.reason);
  } else {
    const downloaded = await downloadResults(github, exec, repo, picked.artifact);
    if (!downloaded.raw) {
      core.warning(`Not rendering results: ${downloaded.reason}`);
      body = renderNoResults(trusted, downloaded.reason);
    } else {
      try {
        body = renderComment(validateResults(downloaded.raw), trusted);
      } catch (error) {
        core.warning(`Not rendering results: ${error.message}`);
        body = renderNoResults(trusted, 'the results did not have the expected shape');
      }
    }
  }
  body = `${marker(run)}\n${body}`;

  if (existing) {
    await github.rest.issues.updateComment({ ...repo, comment_id: existing.id, body });
    core.info(`Updated comment ${existing.id} on PR #${pr.number} for run ${run.id} attempt ${run.run_attempt}`);
  } else {
    const { data } = await github.rest.issues.createComment({ ...repo, issue_number: pr.number, body });
    core.info(`Created comment ${data.id} on PR #${pr.number} for run ${run.id} attempt ${run.run_attempt}`);
  }
};

/**
 * The workflow_run from the event, or for workflow_dispatch the run named by RESULTS_RUN_ID (re-fetched, same checks)
 */
async function loadRun(github, context, repo) {
  if (context.payload.workflow_run) {
    return context.payload.workflow_run;
  }
  if (context.eventName === 'workflow_dispatch') {
    const runId = String(process.env.RESULTS_RUN_ID || '');
    if (!RUN_ID_RE.test(runId)) {
      throw new Error('workflow_dispatch needs a numeric run_id input');
    }
    const { data } = await github.rest.actions.getWorkflowRun({ ...repo, run_id: Number(runId) });
    return data;
  }
  return null;
}

/**
 * The PR the run belongs to, from trusted run data only. All four of head sha, head repo, head branch and base repo
 * must match: another PR opened at the very same commit from a different fork must never receive these results.
 */
async function pickPr(github, repo, run) {
  const headRepo = run.head_repository;
  let candidates = [];
  try {
    const { data } = await github.rest.pulls.list({
      ...repo,
      state: 'all',
      head: `${headRepo.owner.login}:${run.head_branch}`,
      sort: 'updated',
      direction: 'desc',
      per_page: 10
    });
    candidates = data;
  } catch (error) {
    console.info(`pulls.list failed (${error.message}), falling back to the commit lookup`);
  }
  if (candidates.length === 0) {
    const { data } = await github.rest.repos.listPullRequestsAssociatedWithCommit({ ...repo, commit_sha: run.head_sha, per_page: 10 });
    candidates = data;
  }
  const matches = candidates.filter(
    (pr) =>
      pr &&
      pr.head &&
      pr.head.sha === run.head_sha &&
      pr.head.ref === run.head_branch &&
      pr.head.repo &&
      pr.head.repo.full_name === headRepo.full_name &&
      pr.base &&
      pr.base.repo &&
      pr.base.repo.full_name === `${repo.owner}/${repo.repo}`
  );
  matches.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  if (matches.length > 1) {
    console.info(`${matches.length} pull requests match, using #${matches[0].number}`);
  }
  return matches[0] || null;
}

async function findStickyComment(github, repo, issueNumber) {
  const comments = await github.paginate(github.rest.issues.listComments, { ...repo, issue_number: issueNumber, per_page: 100 });
  for (const comment of comments) {
    const marker = parseMarker(comment.body);
    if (marker && isCommentAuthor(comment.user)) {
      return { id: comment.id, marker };
    }
  }
  return null;
}

function isCommentAuthor(user) {
  return !!user && COMMENT_AUTHORS.some((a) => user.login === a.login && user.id === a.id && user.type === a.type);
}

function parseMarker(body) {
  const match = MARKER_RE.exec(String(body || ''));
  return match ? { run: BigInt(match[1]), attempt: Number(match[2]), sha: match[3] } : null;
}

/** Run ids are monotonic; a re-run keeps the id and bumps the attempt */
function isNewer(run, existingMarker) {
  const runId = BigInt(run.id);
  if (existingMarker.run !== runId) {
    return runId > existingMarker.run;
  }
  return run.run_attempt > existingMarker.attempt;
}

function marker(run) {
  return `<!-- excalibur-benchmark-results run=${run.id} attempt=${run.run_attempt} sha=${run.head_sha} -->`;
}

/**
 * Exactly one artifact with the expected name, unexpired, small, produced for this commit by this attempt
 */
async function pickArtifact(github, repo, run) {
  const { data } = await github.rest.actions.listWorkflowRunArtifacts({ ...repo, run_id: run.id, per_page: 100 });
  const named = (data.artifacts || []).filter((a) => a && a.name === ARTIFACT_NAME);
  if (named.length !== 1) {
    return { reason: named.length === 0 ? 'the run produced no results artifact' : 'the run produced more than one results artifact' };
  }
  const artifact = named[0];
  if (artifact.expired) {
    return { reason: 'the results artifact has expired' };
  }
  if (!Number.isFinite(artifact.size_in_bytes) || artifact.size_in_bytes > MAX_ARTIFACT_BYTES) {
    return { reason: 'the results artifact is larger than expected' };
  }
  if (!artifact.workflow_run || artifact.workflow_run.head_sha !== run.head_sha) {
    return { reason: 'the results artifact is not for this commit' };
  }
  const startedAt = Date.parse(run.run_started_at);
  if (Number.isFinite(startedAt) && Date.parse(artifact.updated_at) < startedAt) {
    return { reason: 'the results artifact is from an earlier attempt' };
  }
  return { artifact };
}

/**
 * Downloads the artifact zip and extracts only results.json, capped, into a fresh temp dir. Nothing else in the
 * archive is ever written to disk (no zip-slip, zip bombs are cut by the cap).
 */
async function downloadResults(github, exec, repo, artifact) {
  const response = await github.rest.actions.downloadArtifact({ ...repo, artifact_id: artifact.id, archive_format: 'zip' });
  const zip = Buffer.from(response.data);
  if (zip.length > MAX_ARTIFACT_BYTES) {
    return { reason: 'the results artifact is larger than expected' };
  }
  const dir = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'benchmark-results-'));
  const zipPath = path.join(dir, 'artifact.zip');
  const outPath = path.join(dir, RESULTS_FILE);
  fs.writeFileSync(zipPath, zip);
  await exec.exec('bash', ['-c', 'unzip -p "$ZIP" "$ENTRY" | head -c "$MAX" > "$OUT"'], {
    env: { ...process.env, ZIP: zipPath, ENTRY: RESULTS_FILE, MAX: String(MAX_RESULTS_BYTES), OUT: outPath },
    ignoreReturnCode: true,
    silent: true
  });
  let text;
  try {
    text = fs.readFileSync(outPath, 'utf8');
  } catch {
    return { reason: `the results artifact has no ${RESULTS_FILE}` };
  }
  if (text.length === 0 || Buffer.byteLength(text) >= MAX_RESULTS_BYTES) {
    return { reason: `${RESULTS_FILE} is missing, empty or larger than expected` };
  }
  try {
    return { raw: JSON.parse(text) };
  } catch {
    return { reason: `${RESULTS_FILE} is not valid JSON` };
  }
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function finite(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value < max ? value : null;
}

function matching(value, re) {
  return typeof value === 'string' && re.test(value) ? value : null;
}

function oneOf(value, set) {
  return typeof value === 'string' && set.has(value) ? value : null;
}

/**
 * Rebuilds the benchmark tool's results.json from an allowlist. Everything in the output is either a validated number,
 * a string that matched a strict pattern, or a fixed label. Throws (with a fixed message) on structural problems.
 * Mirrors `summarize()` in excalibur-benchmark/lib/report.mjs: the representative run per side is the one with the
 * lowest median, the spread of run medians is kept next to it.
 */
function validateResults(raw) {
  if (!isPlainObject(raw) || !isPlainObject(raw.meta) || !isPlainObject(raw.tests)) {
    throw new Error('results are not an object with meta and tests');
  }
  const meta = {
    repeat: Number.isInteger(raw.meta.repeat) && raw.meta.repeat >= 1 && raw.meta.repeat <= LIMITS.repeat ? raw.meta.repeat : 1,
    mode: oneOf(raw.meta.mode, MODES) || 'step',
    gl: oneOf(raw.meta.gl, GLS) || 'unknown',
    chromium: matching(raw.meta.chromium, CHROMIUM_RE) || 'unknown',
    baselineVersion: (isPlainObject(raw.meta.baseline) && matching(raw.meta.baseline.version, VERSION_RE)) || 'unknown',
    candidateVersion: (isPlainObject(raw.meta.candidate) && matching(raw.meta.candidate.version, VERSION_RE)) || 'unknown'
  };

  const names = Object.keys(raw.tests);
  if (names.length > LIMITS.tests) {
    throw new Error('too many tests');
  }
  const tests = [];
  for (const name of names.sort()) {
    if (!TEST_NAME_RE.test(name) || !Object.hasOwn(raw.tests, name)) {
      throw new Error('unexpected test name');
    }
    const byEngine = raw.tests[name];
    if (!isPlainObject(byEngine)) {
      throw new Error('unexpected test shape');
    }
    const entry = {
      name,
      baseline: validateSide(byEngine.baseline),
      candidate: validateSide(byEngine.candidate),
      delta: NaN,
      p95Delta: NaN
    };
    const b = entry.baseline;
    const c = entry.candidate;
    if (b && c && !b.error && !c.error && b.median > 0 && c.median > 0) {
      entry.delta = ((c.median - b.median) / b.median) * 100;
      entry.p95Delta = b.p95 > 0 ? ((c.p95 - b.p95) / b.p95) * 100 : NaN;
    }
    tests.push(entry);
  }
  return { meta, tests };
}

function validateSide(rawRuns) {
  if (rawRuns === undefined) {
    return null;
  }
  if (!Array.isArray(rawRuns) || rawRuns.length > LIMITS.runs) {
    throw new Error('unexpected runs shape');
  }
  const runs = [];
  let errors = 0;
  for (const r of rawRuns) {
    if (!isPlainObject(r)) {
      throw new Error('unexpected run shape');
    }
    if (r.error) {
      errors++;
      continue;
    }
    const run = {
      median: finite(r.median, 0, LIMITS.number),
      p95: finite(r.p95, 0, LIMITS.number),
      mean: finite(r.mean, 0, LIMITS.number),
      engineVersion: matching(r.engineVersion, VERSION_RE) || 'unknown',
      mode: oneOf(r.mode, MODES) || 'step',
      extras: validateExtras(r.extras)
    };
    if (run.median === null || run.p95 === null || run.mean === null) {
      throw new Error('run timings are not finite numbers');
    }
    runs.push(run);
  }
  if (runs.length === 0) {
    return { error: true, runs: 0, errors };
  }
  const medians = runs.map((r) => r.median);
  const representative = runs.reduce((best, r) => (r.median < best.median ? r : best), runs[0]);
  return {
    error: false,
    runs: runs.length,
    errors,
    minMedian: Math.min(...medians),
    maxMedian: Math.max(...medians),
    median: representative.median,
    p95: representative.p95,
    mean: representative.mean,
    engineVersion: representative.engineVersion,
    mode: representative.mode,
    extras: representative.extras
  };
}

/** Extras are kept as [key, value] pairs, never assigned by key into an object */
function validateExtras(rawExtras) {
  if (!isPlainObject(rawExtras)) {
    return [];
  }
  const pairs = [];
  for (const [key, value] of Object.entries(rawExtras)) {
    if (
      !EXTRAS_KEY_RE.test(key) ||
      key in Object.prototype ||
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      Math.abs(value) >= LIMITS.number
    ) {
      continue;
    }
    pairs.push([key, value]);
    if (pairs.length === LIMITS.extras) {
      break;
    }
  }
  return pairs;
}

const fmt = (v) => (Number.isFinite(v) ? v.toFixed(2) : '-');
const fmtDelta = (v) => (Number.isFinite(v) ? `${v > 0 ? '+' : ''}${v.toFixed(1)}%` : '-');
const cell = (s) => String(s).replace(/\|/g, '\\|');
const spread = (side) => (side.runs > 1 ? ` <sub>(${fmt(side.minMedian)}–${fmt(side.maxMedian)})</sub>` : '');
const extrasText = (pairs) => pairs.map(([k, v]) => `${k}=${Number.isInteger(v) ? v : v.toFixed(2)}`).join(', ');

/**
 * Markdown for the sticky comment, same table as the benchmark tool's job summary. Only validated data and fixed
 * strings go in; the header is built from the trusted run.
 */
function renderComment(clean, trusted) {
  const { meta } = clean;
  const unit = meta.mode === 'realtime' ? 'fps' : 'ms/frame';
  const lines = renderHeader(trusted);
  lines.push(
    `Baseline \`${BASELINE_SPEC}\` (${cell(meta.baselineVersion)}) · Candidate: this PR's build (${cell(meta.candidateVersion)}) · ${meta.repeat} interleaved run(s), best run shown with the min–max of run medians · ${unit} · Chromium ${cell(meta.chromium)} (${meta.gl})`
  );
  lines.push('');
  if (trusted.conclusion === 'failure') {
    lines.push('> ⚠️ The run finished with failures, these results may be partial. See the run for details.');
    lines.push('');
  }
  const rows = [];
  let warnings = 0;
  for (const t of clean.tests) {
    const b = t.baseline;
    const c = t.candidate;
    if (!b || !c || b.error || c.error) {
      rows.push(
        `| ${t.name} | ${!b || b.error ? 'ERROR' : fmt(b.median)} | | ${!c || c.error ? 'ERROR' : fmt(c.median)} | | | | see job summary | ❌ |`
      );
      continue;
    }
    const slower = Number.isFinite(t.delta) && t.delta > WARN_PERCENT;
    if (slower) {
      warnings++;
    }
    const flag = slower ? '⚠️' : Number.isFinite(t.delta) && t.delta < -WARN_PERCENT ? '🚀' : '';
    rows.push(
      `| ${t.name} | ${fmt(b.median)}${spread(b)} | ${fmt(b.p95)} | ${fmt(c.median)}${spread(c)} | ${fmt(c.p95)} | ${fmtDelta(t.delta)} | ${fmtDelta(t.p95Delta)} | ${cell(extrasText(c.extras))} | ${flag} |`
    );
  }
  const footer = [''];
  if (clean.tests.length === 0) {
    footer.push('The run produced no test results.');
  } else if (warnings > 0) {
    footer.push(
      `⚠️ ${warnings} test(s) are more than ${WARN_PERCENT}% slower than the baseline. Results are informational, shared CI runners are noisy: compare medians across a couple of runs before acting.`
    );
  } else {
    footer.push(`No test is more than ${WARN_PERCENT}% slower than the baseline. Results are informational, shared CI runners are noisy.`);
  }
  footer.push('');
  footer.push(
    `<sub>Produced by the code under test on a hosted runner without a GPU. Per-frame charts and full error text are in the [job summary and \`${ARTIFACT_NAME}\` artifact](${trusted.runUrl}). Collaborators can comment \`/benchmark\` to re-run.</sub>`
  );

  const table = [
    '| Test | Baseline median | Baseline p95 | Candidate median | Candidate p95 | Δ median | Δ p95 | Extras (candidate) | |',
    '|---|---:|---:|---:|---:|---:|---:|---|---|'
  ];
  const fixed = [...lines, ...table, ...footer].join('\n').length;
  let shown = 0;
  let used = fixed;
  for (const row of rows) {
    if (used + row.length + 1 + 80 > MAX_COMMENT_SIZE) {
      break;
    }
    used += row.length + 1;
    shown++;
  }
  const body = [...lines, ...table, ...rows.slice(0, shown)];
  if (shown < rows.length) {
    body.push(`| … ${rows.length - shown} more row(s) in the job summary | | | | | | | | |`);
  }
  body.push(...footer);
  return body.join('\n');
}

function renderNoResults(trusted, reason) {
  const lines = renderHeader(trusted);
  lines.push(`⚠️ No benchmark results to show: ${reason}. See the [run](${trusted.runUrl}) for logs and the job summary.`);
  lines.push('');
  lines.push('<sub>Collaborators can comment `/benchmark` to re-run.</sub>');
  return lines.join('\n');
}

function renderHeader(trusted) {
  return [
    '### Excalibur benchmark',
    '',
    `Commit [\`${trusted.sha.substring(0, 7)}\`](${trusted.commitUrl}) · [run](${trusted.runUrl}) attempt ${trusted.attempt}`,
    ''
  ];
}

module.exports.validateResults = validateResults;
module.exports.renderComment = renderComment;
module.exports.renderNoResults = renderNoResults;
module.exports.pickPr = pickPr;
module.exports.pickArtifact = pickArtifact;
module.exports.parseMarker = parseMarker;
module.exports.isNewer = isNewer;
module.exports.marker = marker;
module.exports.isCommentAuthor = isCommentAuthor;
module.exports.MAX_COMMENT_SIZE = MAX_COMMENT_SIZE;
