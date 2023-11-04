import writeSummary from "../utils/writeSummary";
import * as core from "@actions/core";
import { TestCase, TestCases } from "../classes/testCase";
import { expect, jest, describe, beforeEach, it } from "@jest/globals";

describe("writeSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should write the summary correctly for given test cases, no screenshots", async () => {
    process.env.GITHUB_STEP_SUMMARY = "./debug/summary.md";
    await core.summary.clear();
    writeSummary("./src/tests/files/example.xml", []);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly for given test cases, with screenshots", async () => {
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
