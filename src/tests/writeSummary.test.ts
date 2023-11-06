import writeSummary from "../utils/writeSummary";
import * as core from "@actions/core";
import { expect, jest, describe, beforeEach, it } from "@jest/globals";

jest.spyOn(core.summary, "write").mockImplementation(
  (options) =>
    new Promise((resolve, _) => {
      resolve("" as any);
    })
);

describe("writeSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should write the summary correctly, no screenshots", async () => {
    process.env.GITHUB_STEP_SUMMARY = "./debug/summary.md";
    await core.summary.clear();
    await writeSummary("./src/tests/files/example.xml", []);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, with screenshots", async () => {
    process.env.GITHUB_STEP_SUMMARY = "./debug/summary.md";
    await core.summary.clear();
    const screenshots: Screenshot[] = [
      {
        image: "ExampleUITests.testExample()",
        downloadUrl: "https://url.to/img",
      },
    ];

    await writeSummary("./src/tests/files/example.xml", screenshots);
    expect(core.summary).toMatchSnapshot();
  });
});
