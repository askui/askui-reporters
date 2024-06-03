export class LockNotAquiredException extends Error {
  constructor() {
    super(`The lock could not be acquired.`);
  }
}
