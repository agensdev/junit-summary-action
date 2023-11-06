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

const mockXmlFail = `<?xml version="1.0" encoding="UTF-8"?>
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

const mockXmlSuccess = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="jest tests" tests="4" failures="0" errors="0" time="5.004">
  <testsuite name="uploadScreenshots" errors="0" failures="0" skipped="0" timestamp="2023-11-06T09:52:41" time="4.435" tests="2">
    <testcase classname="uploadScreenshots throws an error if the Firebase service account is missing" name="uploadScreenshots throws an error if the Firebase service account is missing" time="0.015">
    </testcase>
    <testcase classname="uploadScreenshots successfully uploads screenshots and returns download URLs" name="uploadScreenshots successfully uploads screenshots and returns download URLs" time="0.011">
    </testcase>
  </testsuite>
  <testsuite name="writeSummary" errors="0" failures="0" skipped="0" timestamp="2023-11-06T09:52:46" time="0.476" tests="2">
    <testcase classname="writeSummary should write the summary correctly, no screenshots" name="writeSummary should write the summary correctly, no screenshots" time="0.012">
    </testcase>
    <testcase classname="writeSummary should write the summary correctly, with screenshots" name="writeSummary should write the summary correctly, with screenshots" time="0.003">
    </testcase>
  </testsuite>
</testsuites>
`;

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockImplementation((path) => {
    if ((path as string).includes("fail")) {
      return mockXmlFail;
    } else {
      return mockXmlSuccess;
    }
  }),
  existsSync: jest.fn(),
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

  it("should write the summary correctly, failure, no screenshots", async () => {
    await writeSummary("fail.xml", []);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, failure, with screenshots", async () => {
    const screenshots: Screenshot[] = [
      {
        image: "ExampleUITests.testExample()",
        downloadUrl: "https://url.to/img",
      },
    ];

    await writeSummary("./fail.xml", screenshots);
    expect(core.summary).toMatchSnapshot();
  });

  it("should write the summary correctly, success, no screenshots", async () => {
    await writeSummary("success.xml", []);
    expect(core.summary).toMatchSnapshot();
  });
});
