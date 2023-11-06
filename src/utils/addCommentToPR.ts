import * as core from "@actions/core";
import * as github from "@actions/github";
import { context } from "@actions/github";

export default async (result: WriteSummaryResult) => {
  try {
    const token = core.getInput("github-token", { required: false });
    const octokit = github.getOctokit(token);

    if (!context.payload.pull_request) {
      throw new Error("No pull request found.");
    }

    const pull_request_number = context.payload.pull_request.number;
    const { owner, repo } = context.repo;
    const botUsername = "github-actions[bot]";
    const commentIdentifier = "junit-summary-action";

    let comment: string;
    if (result.numberOfFailedTests > 0) {
      comment = `⚠️ ${result.numberOfFailedTests} tests failed.`;
    } else {
      comment = `✅ All ${result.numberOfPassedTests} tests passed`;
    }

    const commentBody = `**${comment}**\n\n[See summary](${getWorkflowRunSummaryUrl()})\n\n<sup>${commentIdentifier}</sup>`;

    // Retrieve the list of comments on the pull request
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_request_number,
    });

    // Find an existing comment made by the bot
    const existingComments = comments.filter(
      (comment) =>
        comment.user?.login === botUsername &&
        comment.body?.endsWith(`<sup>${commentIdentifier}</sup>`)
    );

    // Delete existing comments
    Promise.all(
      existingComments.map(async (comment) => {
        await octokit.rest.issues.deleteComment({
          owner,
          repo,
          comment_id: comment.id,
        });
      })
    );

    // Creating comment
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_request_number,
      body: commentBody,
    });
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
};

function getWorkflowRunSummaryUrl(): string {
  const { owner, repo } = context.repo;
  const runId = context.runId; // This is provided by the GitHub Actions environment
  return `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
}
