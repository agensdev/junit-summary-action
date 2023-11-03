import groupBy from "lodash.groupby";

class TestCase {
  suiteName?: string;
  classname?: string;
  name?: string;
  time?: string;
  errorMessage?: string;
  status?: string;

  constructor(
    suiteName?: string,
    classname?: string,
    name?: string,
    time?: string,
    errorMessage?: string,
    status?: string
  ) {
    this.suiteName = suiteName;
    this.classname = classname;
    this.name = name;
    this.time = time;
    this.errorMessage = errorMessage;
    this.status = status;
  }

  get id() {
    return `${this.classname}-${this.name}`.toLowerCase();
  }
  get timeFormatted() {
    return this.time ? `${parseFloat(this.time).toFixed(1)} s` : "";
  }
  get isSuccess() {
    return this.status === "success";
  }
  get fullTestName() {
    return `${this.classname} - ${this.name}`;
  }
  get testEmoji() {
    if (this.isSuccess) {
      return "✅";
    } else if (this.status === "skipped") {
      return "⏭️";
    } else {
      return "❌";
    }
  }
}

class TestCases {
  tests: TestCase[];
  constructor() {
    this.tests = [];
  }

  addTest(test: TestCase) {
    this.tests.push(test);
  }

  get isSuccess() {
    return this.numberOfPassedTests === this.numberOfTests;
  }
  get failedTests() {
    return this.tests.filter((test) => test.status === "failed");
  }
  get passedTests() {
    return this.tests.filter((test) => test.status === "success");
  }
  get skippedTests() {
    return this.tests.filter((test) => test.status === "skipped");
  }
  get numberOfTests() {
    return this.tests.length;
  }
  get numberOfFailedTests() {
    return this.failedTests.length;
  }
  get numberOfPassedTests() {
    return this.passedTests.length;
  }
  get numberOfSkippedTests() {
    return this.skippedTests.length;
  }
  get failedTestNames() {
    return this.failedTests.map((test) => {
      return test.fullTestName;
    });
  }
  get passPercent() {
    return Math.floor(
      ((this.numberOfTests -
        this.numberOfFailedTests -
        this.numberOfSkippedTests) /
        this.numberOfTests) *
        100
    );
  }
  get groupedTestsBySuite() {
    return Object.entries(groupBy(this.tests, "suiteName"));
  }
  get testsEmoji() {
    if (this.numberOfFailedTests === 0) {
      if (this.numberOfSkippedTests === 0) {
        return "✅";
      } else {
        return "✅ (⏭️)";
      }
    } else {
      return "❌";
    }
  }
  get testSummary() {
    if (this.isSuccess) {
      return (
        ">>>" +
        `🎉 No failures!\n✅ All *${this.numberOfPassedTests}* tests completed with success!\n:felles_pumpe: Keep up the good work! :felles_pumpe: `
      );
    } else if (this.numberOfFailedTests !== 0) {
      return ">>>" + this.failedTestNames.join("\n");
    } else {
      return (
        ">>>" +
        `🎉 No failures!\n✅ *${this.numberOfPassedTests}* tests completed with success!\n⏭️ *${this.numberOfSkippedTests}* tests skipped.\n:felles_pumpe: Keep up the good work! :felles_pumpe: `
      );
    }
  }
}

export { TestCase, TestCases };
