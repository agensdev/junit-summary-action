import writeSummary from "../utils/writeSummary";
import * as fs from "fs";
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

const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="1">
    <testsuite name="ExampleTests" tests="1" failures="1" skipped="0" time="65.83285999298096">
        <properties>
          <property name="Configuration" value="Configuration 1"/>
        </properties>
        <testcase classname="ExampleUITests" name="testExample()" time="10.829154968261719">
            <failure message="XCTAssertEqual failed: (&quot;expected result&quot;) is not equal to (&quot;unexpected result&quot;) (/path/to/test.swift#CharacterRangeLen=0&amp;EndingLineNumber=15&amp;StartingLineNumber=15)">
            </failure>
        </testcase>
    </testsuite>
</testsuites>`;

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockImplementation((_) => mockXml),
  promises: {
    access: jest.fn().mockImplementation(() => Promise.resolve()),
  },
}));

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

  it("should write the summary correctly, no screenshots", async () => {
    await writeSummary("./src/tests/files/example.xml", []);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, with screenshots", async () => {
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
