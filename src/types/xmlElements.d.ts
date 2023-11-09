interface TestSuite {
  attributes: any;
  elements: TestSuiteElement[];
}

interface TestSuiteElement {
  name: string;
  elements?: TestSuiteElement[];
  attributes?: TestSuiteAttributes;
  text?: string;
}

interface TestSuiteAttributes {
  message: string;
  classname: string;
  name?: string;
  time?: string;
}
