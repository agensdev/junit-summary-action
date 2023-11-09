import * as core from "@actions/core";
import * as github from "@actions/github";
import { context } from "@actions/github";
import * as http from "@actions/http-client";

export default async (result: WriteSummaryResult) => {
  try {
    const token = core.getInput("github-token", { required: false });
    const octokit = github.getOctokit(token);

    if (!context.payload.pull_request) {
      // No pull request found.
      return;
    }

    const pull_request_number = context.payload.pull_request.number;
    const { owner, repo } = context.repo;
    const botUsername = "github-actions[bot]";
    const commentIdentifier = "junit-summary-action";

    let comment: string;
    if (result.numberOfFailedTests > 0) {
      comment = `⚠️ ${result.numberOfFailedTests} tests failed.`;
    } else {
      const randomGif = await getRandomGif();
      comment = `<h2>✅ All ${result.numberOfPassedTests} tests passed</h2>![success](${randomGif})`;
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
    try {
      await Promise.all(
        existingComments.map(async (comment) => {
          await octokit.rest.issues.deleteComment({
            owner,
            repo,
            comment_id: comment.id,
          });
        })
      );
    } catch (error) {
      core.setFailed(`Could not delete existing comment: ${error}`);
    }

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

async function getRandomGif() {
  const httpClient = new http.HttpClient();
  const randomNumber = Math.floor(Math.random() * 101);
  const res = await httpClient.get(
    `https://api.giphy.com/v1/gifs/search?api_key=PFZ64SqzXhfNwVVWo6iwe1UjZzUomr1j&q=success&limit=1&offset=${randomNumber}&rating=g&lang=en&bundle=messaging_non_clips`
  );

  const body = await res.readBody();
  const responseJson: GiphyResponse = JSON.parse(body);
  if (responseJson.data.length > 0) {
    const fixedWidthImage = responseJson.data[0].images.original;
    return fixedWidthImage.url;
  }
  return undefined;
}

function getWorkflowRunSummaryUrl(): string {
  const { owner, repo } = context.repo;
  const runId = context.runId; // This is provided by the GitHub Actions environment
  return `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
}

// ChatGPT ftw
interface GiphyResponse {
  data: GiphyData[];
  pagination: Pagination;
  meta: Meta;
}

interface GiphyData {
  type: string;
  id: string;
  url: string;
  images: GiphyImages;
}

interface GiphyImages {
  original: ImageFormat;
  fixed_height: ImageFormat;
  fixed_height_downsampled: ImageFormat;
  fixed_height_small: ImageFormat;
  fixed_width: ImageFormat;
}

interface ImageFormat {
  height: string;
  width: string;
  url: string;
}

interface Pagination {
  total_count: number;
  count: number;
  offset: number;
}

interface Meta {
  status: number;
  msg: string;
  response_id: string;
}
