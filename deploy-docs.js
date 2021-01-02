const { Octokit } = require('@octokit/rest');

const isPullRequest = !!process.env.GITHUB_BASE_REF;

if (isPullRequest) {
  console.log('Skipping docs deployment, detected pull request');
  return;
}

const branch = process.env.GITHUB_REF?.split('/').pop();
const tag = process.env.GITHUB_REF?.startsWith('refs/tags/') ? branch : undefined;

// build docs for tags and main only
if (tag) {
  console.log('Current tag is `' + tag + '`');
} else if (branch == 'main') {
  console.log('Current branch is `' + branch + '`');
} else {
  console.log('Current branch is `' + branch + '`, skipping docs deployment...');
  return;
}

console.log('Triggering remote build of edge docs...');

const HTTP_204_CREATED = 204;
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
  userAgent: 'excaliburjs-deploy-docs'
});

(async () => {
  const { status, data } = await octokit.actions.createWorkflowDispatch({
    owner: 'excaliburjs',
    repo: 'excaliburjs.github.io',
    workflow_id: 'build.yml',
    ref: 'site'
  });

  if (status !== HTTP_204_CREATED) {
    console.error('Expected 204 Created success but instead got:', status, data);
  }
})();
