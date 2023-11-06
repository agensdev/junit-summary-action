import * as core from "@actions/core";
import github from "@actions/github";
import writeSummary from "./utils/writeSummary.js";
import uploadScreenshots from "./utils/uploadScreenshots.js";
import addCommentToPR from "./utils/addCommentToPR.js";

let path = core.getInput("junit-path", { required: false });
let screenshotPath: string | undefined = core.getInput("screenshots-path", {
  required: false,
});
let xcresultPath: string | undefined = core.getInput("xcresult-path", {
  required: false,
});

let githubToken: string | undefined = core.getInput("github-token", {
  required: false,
});

if (xcresultPath === "") {
  xcresultPath = undefined;
}

if (screenshotPath === "") {
  screenshotPath = undefined;
}

if (githubToken === "") {
  githubToken = undefined;
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

try {
  let screenshots: Screenshot[] = [];
  if (serviceAccount && storageBucket) {
    screenshots = await uploadScreenshots(
      github.context.runId,
      xcresultPath,
      screenshotPath
    );
  }

  if (process.env.NODE_ENV === "development") {
    path = "./debug/example.xml";
    await core.summary.clear();
  }

  const result = await writeSummary(path, screenshots);
  if (githubToken) {
    await addCommentToPR(result);
  }
} catch (error) {
  let message = "An unknown error occured.";
  if (error instanceof Error) message = error.message;
  core.setFailed(message);
}
