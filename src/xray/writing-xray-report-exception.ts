
export class WritingXRayReportException extends Error {
  constructor(reason: string) {
    super(`Writing XRay report failed: ${reason}`);
  }
}
