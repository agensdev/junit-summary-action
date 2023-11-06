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

    const comment = result.testSummary;
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_request_number,
      body: comment,
    });

    core.info(`Comment created: ${response.data.html_url}`);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
};
