import * as fs from "fs";
import convert from "xml-js";
import * as core from "@actions/core";
import { TestCases, TestCase } from "../classes/testCase";
import groupBy from "lodash.groupby";

const writeSummary = async (path: string, screenshots: Screenshot[]) => {
  const file = fs.readFileSync(path);

  const document = convert.xml2js(file.toString(), {
    compact: false,
  });

  const mergedTestCases = new TestCases();
  core.summary.addHeading("Test results");
  const testSuites: TestSuite[] = document.elements[0].elements;

  for (const element of testSuites) {
    const testSuitesElements = element.elements;

    testSuitesElements
      .filter((element) => element.name === "testcase")
      .forEach((testSuite) => {
        const errorMessage = testSuite.elements?.find(
          (element) => element.name === "failure"
        )?.attributes?.message;

        let status;

        if (!testSuite.elements) {
          status = "success";
        } else if (
          testSuite.elements.filter((element) => element.name === "skipped")
            .length === 1
        ) {
          status = "skipped";
        } else {
          status = "failed";
        }

        const test = new TestCase(
          element.attributes?.name,
          testSuite.attributes?.classname,
          testSuite.attributes?.name?.replace("()", ""),
          testSuite.attributes?.time,
          errorMessage,
          status
        );

        mergedTestCases.addTest(test);
      });
  }

  core.summary.addHeading("Summary", 2);
  core.summary.addTable([
    ["<strong>Overall result</strong>", mergedTestCases.testsEmoji],
    [
      "<strong>Total fails</strong>",
      mergedTestCases.numberOfFailedTests.toString(),
    ],
    [
      "<strong>Total skipped</strong>",
      mergedTestCases.numberOfSkippedTests.toString(),
    ],
    ["<strong>Total tests</strong>", mergedTestCases.numberOfTests.toString()],
  ]);

  // List skipped tests
  if (mergedTestCases.numberOfSkippedTests > 0) {
    core.summary.addHeading("Skipped tests", 2);
    mergedTestCases.skippedTests.forEach((test) => {
      core.summary.addTable([
        [
          `<h3 id='${test.id}'><a href="#${test.id}">🔗</a> <code>${test.fullTestName}</code></h3>`,
        ],
        [`<code>${test.errorMessage}</code>`],
      ]);
    });
  }

  // List failing tests
  if (mergedTestCases.numberOfFailedTests > 0) {
    core.summary.addHeading("Failing tests", 2);
    mergedTestCases.failedTests.forEach((test) => {
      const screenshot = screenshots
        ?.slice()
        .reverse()
        .find((screenshot) => {
          return (
            test.classname &&
            test.name &&
            screenshot.image.includes(test.classname) &&
            screenshot.image.includes(test.name + "()")
          );
        });
      core.summary.addTable([
        [
          `<h3 id='${test.id}'><a href="#${test.id}">🔗</a> <code>${test.fullTestName}</code></h3>`,
        ],
        [`<code>${test.errorMessage}</code>`],
      ]);
      screenshot && core.summary.addImage(screenshot.downloadUrl, "");
    });
  }

  // List all tests
  for (const testSuite of mergedTestCases.groupedTestsBySuite) {
    core.summary.addHeading(testSuite[0], 2);
    for (const [key, value] of groupedTests(testSuite[1])) {
      const testRows = value.map((test) => {
        return [
          {
            data: test.isSuccess
              ? test.name || ""
              : `<a href="#${test.id}">${test.name}</a>`,
            header: false,
          },
          { data: test.timeFormatted, header: false },
          { data: test.testEmoji, header: false },
        ];
      });
      core.summary.addHeading(key, 3);
      core.summary.addTable(headerRow.concat(testRows));
    }
  }

  core.setOutput("total", mergedTestCases.numberOfTests);
  core.setOutput("passed", mergedTestCases.numberOfPassedTests);
  core.setOutput("failed", mergedTestCases.numberOfFailedTests);
  core.setOutput("skipped", mergedTestCases.numberOfSkippedTests);
  core.setOutput("testSummary", mergedTestCases.testSummary);
  core.setOutput("passPercent", mergedTestCases.passPercent);

  await core.summary.write();
};

const headerRow = [
  [
    { data: "Test name", header: true },
    { data: "Time elapsed", header: true },
    { data: "Result", header: true },
  ],
];

const groupedTests = (tests: TestCase[]) =>
  Object.entries(groupBy(tests, "classname"));

export default writeSummary;
