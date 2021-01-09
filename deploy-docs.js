const { Octokit } = require('@octokit/rest');

const isPullRequest = !!process.env.GITHUB_BASE_REF;

if (isPullRequest) {
  console.log('Skipping docs deployment, detected pull request');
  return;
}

const refName = process.env.GITHUB_REF?.split('/').pop();
const refType = process.env.GITHUB_REF?.startsWith('refs/tags/') ? 'tag' : 'branch';
const isMainBranch = refType === 'branch' && refName === 'main';

// build docs for tags and main only
if (refType === 'tag' || isMainBranch) {
  console.log(`Current ${refType} is ``${refName}```);
} else {
  console.log('Current ref is `' + refName + "` which isn't allowed, skipping docs deployment...");
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
