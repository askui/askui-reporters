export class TestEntryUndefinedException extends Error {
    constructor() {
      super(`TestEntry can not be undefined here, because we initialised it in createNewTestEntry(). Did you run your workflow serially?`);
    }
  }