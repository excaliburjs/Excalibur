/**
 * GitHub Action Script: Post Image Diff Comment
 *
 * Generates and posts a PR comment showing visual regression test failures
 * with embedded Expected/Actual/Diff images.
 *
 * This script is executed by github-script@v7 in the build workflow.
 *
 * @param {Object} github - GitHub API client (octokit)
 * @param {Object} context - GitHub Actions context
 */
module.exports = async ({ github, context }) => {
  const fs = require('fs');

  // Security: Sanitize markdown to prevent injection attacks
  function sanitizeMarkdown(str) {
    if (typeof str !== 'string') return 'Invalid data';
    return str
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/[`*_[\]()!#]/g, '\\$&') // Escape markdown special chars
      .replace(/</g, '&lt;') // Escape HTML
      .replace(/>/g, '&gt;')
      .substring(0, 500); // Limit length to prevent abuse
  }

  // Security: Validate base64 image data URIs
  function isValidImageDataURI(uri) {
    if (typeof uri !== 'string') return false;
    // Only allow PNG images with valid base64 characters
    return /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(uri);
  }

  // Security: Validate failure object structure
  function isValidFailure(f) {
    if (!f || typeof f !== 'object') return false;
    return (
      typeof f.testName === 'string' &&
      typeof f.testFile === 'string' &&
      typeof f.percentMatch === 'number' &&
      typeof f.tolerance === 'number' &&
      typeof f.pixelsDiff === 'number' &&
      typeof f.expected === 'string' &&
      typeof f.actual === 'string' &&
      typeof f.diff === 'string'
    );
  }

  // Helper to get workflow URLs (using environment variables from GitHub Actions)
  const workflowUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const commitSha = process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA;

  // Collect failures from all platforms
  const platforms = [
    { name: 'ubuntu-latest', emoji: '🐧 Ubuntu', path: './ubuntu-diffs/vitest-image-failures.json' },
    { name: 'windows-2025', emoji: '🪟 Windows', path: './windows-diffs/vitest-image-failures.json' }
  ];

  let allFailures = [];
  let processingError = false;

  for (const platform of platforms) {
    try {
      if (fs.existsSync(platform.path)) {
        const data = JSON.parse(fs.readFileSync(platform.path, 'utf8'));
        if (data.failures && Array.isArray(data.failures) && data.failures.length > 0) {
          // Security: Validate each failure object
          const validFailures = data.failures.filter((f) => {
            const valid = isValidFailure(f);
            if (!valid) {
              console.warn('Skipping invalid failure object');
            }
            return valid;
          });

          if (validFailures.length > 0) {
            allFailures.push({ ...platform, failures: validFailures });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ${platform.name}:`, error);
      processingError = true;
    }
  }

  // If there was an error and no failures were found, post error comment
  if (processingError && allFailures.length === 0) {
    const errorComment =
      '## 🖼️ Visual Regression Test Failures\n\n' +
      '⚠️ **Image diffs could not be processed**\n\n' +
      'There was an error reading the image comparison data. ' +
      `Please check the [workflow logs](${workflowUrl}) for details.\n\n` +
      `**Commit**: \`${commitSha}\`\n` +
      `**Workflow Run**: [View Details](${workflowUrl})`;

    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: errorComment
    });
    return;
  }

  if (allFailures.length === 0) {
    console.log('No image diff failures found');
    return;
  }

  // Calculate total failures
  const totalFailures = allFailures.reduce((sum, p) => sum + p.failures.length, 0);

  // Build markdown comment
  let comment = '## 🖼️ Visual Regression Test Failures\n\n';
  comment += `Found **${totalFailures}** image comparison failure(s)\n\n`;
  comment += `**Commit**: \`${commitSha}\`\n`;
  comment += `**Workflow Run**: [View Details](${workflowUrl})\n\n`;
  comment += '---\n\n';

  const MAX_FAILURES_TO_SHOW = 10;
  let shownFailures = 0;
  let hiddenFailures = 0;

  for (const platform of allFailures) {
    comment += `### ${platform.emoji}\n\n`;

    const failuresToShow = Math.min(platform.failures.length, MAX_FAILURES_TO_SHOW - shownFailures);

    for (let i = 0; i < failuresToShow; i++) {
      const f = platform.failures[i];

      // Security: Validate image data URIs before using
      const hasValidExpected = isValidImageDataURI(f.expected);
      const hasValidActual = isValidImageDataURI(f.actual);
      const hasValidDiff = isValidImageDataURI(f.diff);

      if (!hasValidExpected || !hasValidActual || !hasValidDiff) {
        console.warn(`Skipping failure with invalid image data: ${f.testName}`);
        continue;
      }

      // Security: Sanitize user-controlled strings
      const safeTestName = sanitizeMarkdown(f.testName);
      const safeTestFile = sanitizeMarkdown(f.testFile);

      comment += `#### ${shownFailures + 1}. \`${safeTestName}\`\n\n`;
      comment += `- **Location**: \`${safeTestFile}\`\n`;
      comment += `- **Match**: ${f.percentMatch.toFixed(2)}% (required: ${f.tolerance}%)\n`;
      comment += `- **Pixels Different**: ${f.pixelsDiff}\n\n`;

      // Check if image files are available
      if (f.imageFiles) {
        comment += '📊 View Images\n\n';
        comment += `> 🔗 [Download artifact with images](${workflowUrl}#artifacts)\n\n`;
      } else {
        comment += `> 📦 **Artifact**: \`image-diffs-${platform.name}\` - Download to view images\n\n`;
      }

      comment += '---\n\n';
      shownFailures++;
    }

    hiddenFailures += platform.failures.length - failuresToShow;
  }

  if (hiddenFailures > 0) {
    comment += `\n### ℹ️ Additional Failures\n\n`;
    comment += `**${hiddenFailures}** more failure(s) not shown. `;
    comment += `View the complete report in the [workflow logs](${workflowUrl}).\n\n`;
  }

  comment += `*⏰ Generated at: ${new Date().toISOString()}*`;

  // Security: Enforce maximum comment size (GitHub limit is ~65KB)
  const MAX_COMMENT_SIZE = 60000;
  if (comment.length > MAX_COMMENT_SIZE) {
    console.warn(`Comment size (${comment.length}) exceeds limit, truncating`);
    comment = comment.substring(0, MAX_COMMENT_SIZE);
    comment += '\n\n---\n\n⚠️ **Comment truncated due to size limits**\n';
    comment += `View the complete report in the [workflow artifacts](${workflowUrl}).`;
  }

  // Post comment (new comment each time)
  try {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: comment
    });
    console.log('Successfully posted image diff comment');
  } catch (error) {
    console.error('Failed to post comment:', error);
    throw error;
  }
};
