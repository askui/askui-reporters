import NodeEnvironment from 'jest-environment-node';
import {Event} from 'jest-circus';

class JestXRayEnvironment extends NodeEnvironment {

  override async setup() {
    await super.setup();
  }

  async handleTestEvent(event: Event) {

    if (event.name === 'test_start') {
      this.global['testName'] = event.test.name
    }

    switch (event.name) {
      case 'test_fn_failure':
        this.global['testStatus'] = 'failure';
        break;
      case 'test_fn_success':
        this.global['testStatus'] = 'success';
        break;
    }
  }
}

export { JestXRayEnvironment as default};
