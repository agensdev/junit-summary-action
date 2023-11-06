import writeSummary from "../utils/writeSummary";
import * as core from "@actions/core";
import {
  expect,
  jest,
  describe,
  beforeEach,
  afterEach,
  it,
} from "@jest/globals";

jest
  .spyOn(core.summary, "write")
  .mockReturnValue(Promise.resolve("test" as any));

describe("writeSummary", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await core.summary.clear();
    process.env.GITHUB_STEP_SUMMARY = "./debug/summary.md";
  });

  afterEach(() => {
    delete process.env.GITHUB_STEP_SUMMARY;
    jest.clearAllMocks();
  });

  it("should write the summary correctly, failure, no screenshots", async () => {
    await writeSummary("src/tests/exampleFiles/failure.xml", []);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, failure, with screenshots", async () => {
    const screenshots: Screenshot[] = [
      {
        image: "ExampleUITests.testExample()",
        downloadUrl: "https://url.to/img",
      },
    ];

    await writeSummary("src/tests/exampleFiles/failure.xml", screenshots);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, success, no screenshots", async () => {
    await writeSummary("src/tests/exampleFiles/success.xml", []);
    expect(core.summary).toMatchSnapshot();
  });
});
