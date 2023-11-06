import * as core from "@actions/core";
import github from "@actions/github";

export default async (result: WriteSummaryResult) => {
  try {
    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);

    const context = github.context;
    if (context.payload.pull_request == null) {
      core.setFailed("No pull request found.");
      return;
    }

    const pull_request_number = context.payload.pull_request.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    const comment = "This is a comment from the GitHub Action!";
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
