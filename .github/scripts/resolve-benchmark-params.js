/**
 * GitHub Action Script: Resolve Benchmark Parameters
 *
 * Turns the triggering event into the benchmark run's parameters (step outputs):
 * - `ref`       commit to check out: the PR head sha for `/benchmark` comments, empty (default checkout) otherwise
 * - `head_sha`  commit the results are reported for
 * - `baseline`  engine spec to compare against (default npm:excalibur@latest)
 * - `tests`     comma separated scenario names, empty = all
 * - `repeat`    interleaved repetitions
 * - `trigger`   human readable description of what started the run (comment runs only)
 *
 * `/benchmark` comments accept `--baseline <npm spec>`, `--tests <a,b>` and `--repeat <n>`. Only collaborators may
 * trigger a run from a comment, and comment provided values are validated strictly since they end up in shell commands.
 *
 * Executed by github-script@v7 in the benchmark workflow, before checkout.
 *
 * @param {Object} github - GitHub API client (octokit)
 * @param {Object} context - GitHub Actions context
 * @param {Object} core - GitHub Actions core helpers
 */
module.exports = async ({ github, context, core }) => {
  const DEFAULT_BASELINE = 'npm:excalibur@latest';
  const DEFAULT_REPEAT = '2';
  // npm specs only from comments: a version, tag or range of the excalibur package. No URLs, no other packages.
  const BASELINE_PATTERN = /^npm:excalibur@[A-Za-z0-9.+^~<>=|* -]{1,64}$/;
  const TESTS_PATTERN = /^[a-z0-9-]+(,[a-z0-9-]+)*$/;
  const ALLOWED_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

  const outputs = {
    ref: '',
    head_sha: process.env.GITHUB_SHA || '',
    baseline: DEFAULT_BASELINE,
    tests: '',
    repeat: DEFAULT_REPEAT,
    trigger: ''
  };

  if (context.eventName === 'workflow_dispatch') {
    outputs.baseline = process.env.INPUT_BASELINE || DEFAULT_BASELINE;
    outputs.tests = process.env.INPUT_TESTS || '';
    outputs.repeat = process.env.INPUT_REPEAT || '3';
  } else if (context.eventName === 'pull_request') {
    outputs.head_sha = context.payload.pull_request.head.sha;
  } else if (context.eventName === 'issue_comment') {
    const comment = context.payload.comment;
    if (!ALLOWED_ASSOCIATIONS.has(comment.author_association)) {
      await react(github, context, comment.id, '-1');
      core.setFailed(`@${comment.user.login} is not a collaborator, ignoring /benchmark`);
      return;
    }

    const args = parseArgs(comment.body);
    const problems = [];
    if (args.baseline !== undefined) {
      if (BASELINE_PATTERN.test(args.baseline)) {
        outputs.baseline = args.baseline;
      } else {
        problems.push(`--baseline must look like npm:excalibur@<version|tag>, got "${args.baseline}"`);
      }
    }
    if (args.tests !== undefined && args.tests !== '') {
      if (TESTS_PATTERN.test(args.tests)) {
        outputs.tests = args.tests;
      } else {
        problems.push(`--tests must be comma separated scenario names, got "${args.tests}"`);
      }
    }
    if (args.repeat !== undefined) {
      const n = parseInt(args.repeat, 10);
      if (Number.isInteger(n) && n >= 1 && n <= 10) {
        outputs.repeat = String(n);
      } else {
        problems.push(`--repeat must be 1-10, got "${args.repeat}"`);
      }
    }
    for (const unknown of args.unknown) {
      problems.push(`unknown option "${unknown}"`);
    }
    if (problems.length) {
      await react(github, context, comment.id, 'confused');
      core.setFailed(`Invalid /benchmark command: ${problems.join('; ')}`);
      return;
    }

    const { data: pr } = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number
    });
    outputs.ref = pr.head.sha;
    outputs.head_sha = pr.head.sha;
    outputs.trigger = `@${comment.user.login} via \`${comment.body.split('\n')[0].trim()}\``;
    await react(github, context, comment.id, 'rocket');
  }

  for (const [key, value] of Object.entries(outputs)) {
    core.setOutput(key, value);
  }
  core.info(`benchmark parameters: ${JSON.stringify(outputs)}`);
};

/**
 * Parses `/benchmark --key value ...` (first line only), returns known keys plus a list of unknown tokens
 */
function parseArgs(body) {
  const line = (body || '').split('\n')[0].trim();
  const tokens = line.split(/\s+/).slice(1); // drop the /benchmark command itself
  const result = { unknown: [] };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const match = token.match(/^--(baseline|tests|repeat)(?:=(.*))?$/);
    if (!match) {
      result.unknown.push(token);
      continue;
    }
    const key = match[1];
    let value = match[2];
    if (value === undefined) {
      value = tokens[i + 1] && !tokens[i + 1].startsWith('--') ? tokens[++i] : '';
    }
    result[key] = value;
  }
  return result;
}

async function react(github, context, commentId, content) {
  try {
    await github.rest.reactions.createForIssueComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: commentId,
      content
    });
  } catch (error) {
    console.warn(`Could not add reaction: ${error.message}`);
  }
}
