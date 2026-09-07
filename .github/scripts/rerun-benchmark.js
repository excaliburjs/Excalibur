/**
 * GitHub Action Script: Re-run the Benchmark for a PR from a `/benchmark` comment
 *
 * Checks the commenter is a collaborator, finds the most recent Benchmark workflow run for the PR's head commit
 * (the pull_request run, unprivileged with an isolated cache scope) and re-runs it, then replies with a link. The
 * reply is built from API data only, the comment text is never echoed. Options are deliberately not supported:
 * a custom baseline, scenario list or repeat count is a "Run workflow" from the Actions UI on a branch of this repo.
 *
 * Executed by github-script@v7 in benchmark-comment.yml.
 *
 * @param {Object} github - GitHub API client (octokit)
 * @param {Object} context - GitHub Actions context
 * @param {Object} core - GitHub Actions core helpers
 */
module.exports = async ({ github, context, core }) => {
  const WORKFLOW_FILE = 'benchmark.yml';
  const ALLOWED_ASSOCIATIONS = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
  const repo = { owner: context.repo.owner, repo: context.repo.repo };

  const comment = context.payload.comment;
  if (!ALLOWED_ASSOCIATIONS.has(comment.author_association)) {
    await react(github, repo, comment.id, '-1');
    core.setFailed(`@${comment.user.login} is not a collaborator, ignoring /benchmark`);
    return;
  }
  const firstLine = String(comment.body || '')
    .split('\n')[0]
    .trim();
  if (firstLine !== '/benchmark') {
    await react(github, repo, comment.id, 'confused');
    core.setFailed(
      '/benchmark takes no options. For a custom baseline, scenarios or repeat count use "Run workflow" on the Benchmark workflow.'
    );
    return;
  }

  const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: context.issue.number });
  const { data } = await github.rest.actions.listWorkflowRuns({
    ...repo,
    workflow_id: WORKFLOW_FILE,
    event: 'pull_request',
    head_sha: pr.head.sha,
    per_page: 5
  });
  const run = data.workflow_runs[0];
  if (!run) {
    await react(github, repo, comment.id, 'confused');
    core.setFailed(`No Benchmark run found for ${pr.head.sha}, push a commit to start one`);
    return;
  }

  const login = String(comment.user.login).replace(/[^A-Za-z0-9-]/g, '');
  const sha = pr.head.sha.substring(0, 7);
  let body;
  if (run.status !== 'completed') {
    body = `The benchmark for ${sha} is still running: [see the run](${run.html_url}). Results land in its job summary.`;
  } else {
    await github.rest.actions.reRunWorkflow({ ...repo, run_id: run.id });
    body = `🚀 Re-running the benchmark for ${sha} at the request of @${login}: [see the run](${run.html_url}). Results land in its job summary.`;
  }
  await react(github, repo, comment.id, 'rocket');
  await github.rest.issues.createComment({ ...repo, issue_number: pr.number, body });
  core.info(`${run.status !== 'completed' ? 'already running' : 're-ran'} ${run.html_url} for PR #${pr.number} at ${pr.head.sha}`);
};

async function react(github, repo, commentId, content) {
  try {
    await github.rest.reactions.createForIssueComment({ ...repo, comment_id: commentId, content });
  } catch (error) {
    console.info(`Could not add reaction: ${error.message}`);
  }
}
