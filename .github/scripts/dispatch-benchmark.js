/**
 * GitHub Action Script: Dispatch Benchmark from a PR comment
 *
 * Handles `/benchmark [--baseline <npm spec>] [--tests <a,b>] [--repeat <n>]` comments on pull requests:
 * checks the author is a collaborator, validates the options strictly (they end up as workflow inputs and in shell
 * commands), reacts to the comment, and dispatches benchmark.yml on the default branch with the PR's head sha.
 * The benchmark itself runs in that unprivileged workflow; this script never checks out or executes PR code.
 *
 * Executed by github-script@v7 in benchmark-comment.yml.
 *
 * @param {Object} github - GitHub API client (octokit)
 * @param {Object} context - GitHub Actions context
 * @param {Object} core - GitHub Actions core helpers
 */
module.exports = async ({ github, context, core }) => {
  const WORKFLOW_FILE = 'benchmark.yml';
  const DEFAULT_BASELINE = 'npm:excalibur@latest';
  const DEFAULT_REPEAT = '2';
  // npm specs only: a version or tag of the excalibur package. No URLs, no other packages, no ranges.
  const BASELINE_PATTERN = /^npm:excalibur@[A-Za-z0-9][A-Za-z0-9.+-]{0,63}$/;
  const TESTS_PATTERN = /^[a-z0-9-]+(,[a-z0-9-]+)*$/;
  const ALLOWED_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

  const comment = context.payload.comment;
  if (!ALLOWED_ASSOCIATIONS.has(comment.author_association)) {
    await react(github, context, comment.id, '-1');
    core.setFailed(`@${comment.user.login} is not a collaborator, ignoring /benchmark`);
    return;
  }

  const inputs = { baseline: DEFAULT_BASELINE, tests: '', repeat: DEFAULT_REPEAT };
  const args = parseArgs(comment.body);
  const problems = [];
  if (args.baseline !== undefined) {
    if (BASELINE_PATTERN.test(args.baseline)) {
      inputs.baseline = args.baseline;
    } else {
      problems.push(`--baseline must look like npm:excalibur@<version|tag>, got "${args.baseline}"`);
    }
  }
  if (args.tests !== undefined && args.tests !== '') {
    if (TESTS_PATTERN.test(args.tests)) {
      inputs.tests = args.tests;
    } else {
      problems.push(`--tests must be comma separated scenario names, got "${args.tests}"`);
    }
  }
  if (args.repeat !== undefined) {
    const n = parseInt(args.repeat, 10);
    if (Number.isInteger(n) && n >= 1 && n <= 10 && String(n) === args.repeat) {
      inputs.repeat = String(n);
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
  // rebuilt from the validated values, the raw comment text never reaches the workflow or the bot's comment
  const command = [
    '/benchmark',
    `--baseline ${inputs.baseline}`,
    inputs.tests ? `--tests ${inputs.tests}` : '',
    `--repeat ${inputs.repeat}`
  ]
    .filter(Boolean)
    .join(' ');
  const login = String(comment.user.login).replace(/[^A-Za-z0-9-]/g, '');

  await github.rest.actions.createWorkflowDispatch({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: WORKFLOW_FILE,
    ref: context.payload.repository.default_branch,
    inputs: {
      ...inputs,
      ref: pr.head.sha,
      pr: String(pr.number),
      trigger: `@${login} via \`${command}\``
    }
  });
  await react(github, context, comment.id, 'rocket');
  core.info(`dispatched ${WORKFLOW_FILE} for PR #${pr.number} at ${pr.head.sha}: ${command}`);
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
