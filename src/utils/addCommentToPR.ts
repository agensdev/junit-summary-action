import * as core from "@actions/core";
import * as github from "@actions/github";
import { context } from "@actions/github";

export default async (result: WriteSummaryResult) => {
  try {
    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);

    if (!context.payload.pull_request) {
      throw new Error("No pull request found.");
    }

    const pull_request_number = context.payload.pull_request.number;
    const { owner, repo } = context.repo;
    const botUsername = "github-actions";
    const commentIdentifier = "6bad11c4";

    let comment: string;
    if (result.numberOfFailedTests > 0) {
      comment = `⚠️ ${result.numberOfFailedTests} tests failed. See summary here.`;
    } else {
      comment = `✅ All ${result.numberOfPassedTests} tests passed.`;
    }

    const commentBody = `${comment}\n\n<sup>${commentIdentifier}</sup>`;

    // Retrieve the list of comments on the pull request
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_request_number,
    });

    core.info(`BODY: ${commentBody}`);

    // Find an existing comment made by the bot
    const existingComment = comments.find(
      (comment) =>
        comment.user?.login === botUsername &&
        comment.body?.includes(`<sup>${commentIdentifier}</sup>`)
    );

    if (existingComment) {
      // Update the existing comment
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: commentBody,
      });
      core.info(`Updated comment: ${existingComment.html_url}`);
    } else {
      // Create a new comment
      const response = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_request_number,
        body: commentBody,
      });
      core.info(`Created new comment: ${response.data.html_url}`);
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
};
