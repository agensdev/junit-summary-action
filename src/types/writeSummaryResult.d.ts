interface WriteSummaryResult {
  numberOfTests: number;
  numberOfPassedTests: number;
  numberOfFailedTests: number;
  numberOfSkippedTests: number;
  testSummary: string;
  passPercent: number;
}
