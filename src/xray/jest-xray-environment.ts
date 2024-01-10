import NodeEnvironment from "jest-environment-node";

class JestXRayEnvironment extends NodeEnvironment {

  override async setup() {
    await super.setup();
  }

  async handleTestEvent(event: any) {
    if (event.name === "test_start") {
      let testNames = [];
      let currentTest = event.test;

      while (currentTest) {
        testNames.push(currentTest.name);
        currentTest = currentTest.parent;
      }

      if (typeof testNames[0] === 'string') {
        testNames[0] = testNames[0].trim();
      }
      if (typeof testNames[1] === 'string') {
        testNames[1] = testNames[1].trim();
      }
      this.global["testName"] = testNames[0]
      this.global["describeName"] = testNames[1]
    }

    if (event.name === "test_fn_failure") {
      this.global["testStatus"] = "failure"
    } else if (event.name === "test_fn_success") {
      this.global["testStatus"] = "success"
    }
  }
}

export { JestXRayEnvironment as default};
