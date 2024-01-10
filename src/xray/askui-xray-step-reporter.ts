import { Reporter, Step, StepStatus, ReporterConfig } from 'askui';
import { convertPngDataUrlToBase64 } from '../utils/image-reporting-utils';
import path from 'path';
import fs from 'fs';

/*
 * Possible XRay status: PASS, FAIL, TODO
 */
enum Status {
  PASS = 'PASS',
  FAIL = 'FAIL',
  TODO = 'TODO',
}

type XRayTestObject = {
  testKey: string;
  status?: Status;
  start?: string;
  finish?: string;
  steps?: XRayStep[];
}

type XRayEvidence = {
  data: string;
  filename: string;
  contentType: string;
}

type XRayStep = {
  status?: Status;
  actualResult?: string;
  evidences: XRayEvidence[];
}

function mapAskuiToXrayStepStatus(status: StepStatus): Status {
  switch (status) {
    case 'passed':
      return Status.PASS;
    case 'failed':
      return Status.FAIL;
    case 'erroneous':
      return Status.FAIL;
    default:
      return Status.TODO;
  }
}

type StatusJest = 'success' | 'failure';

function mapJestToXrayStatus(status: StatusJest): Status {
  switch (status) {
    case 'success':
      return Status.PASS;
    default:
      return Status.FAIL;
  }
}

export class AskUIXRayStepReporter implements Reporter {
  config?: ReporterConfig;
  result: XRayTestObject[] = [];
  outputDirectory: string;

  constructor(
    config?: ReporterConfig,
    outputDirectory = 'xray-report'
    ) {
    if (config !== undefined) {
      this.config = config;
    }
    this.outputDirectory = outputDirectory;
  }

  async createNewTestEntry(
    testTitle: string
  ): Promise<void> {
    this.result.push(
      {
        testKey: testTitle,
        start: new Date().toISOString(),
        steps: []
      }
    );
  }

  async finishTestEntry(
    testStatus: StatusJest
  ): Promise<void> {
    if (this.result.length > 0) {
      const testEntry = this.result.pop();
      if (testEntry !== undefined) {
        testEntry.finish = new Date().toISOString();
        testEntry.status = mapJestToXrayStatus(testStatus);
        this.result.push(testEntry);
      }
    }
  }

  private createEvidence(screenshot: string, fileName: string) {
    return {
        data: convertPngDataUrlToBase64(screenshot),
        filename: fileName,
        contentType: 'image/png'
      };
  }

  private addSubStepToTestEntry(
    testEntry: XRayTestObject, step: Step
  ): XRayStep[] {
    let steps = testEntry.steps;
    if (steps === undefined) {
      steps = [];
    }
    const subStep: XRayStep = {
      status: mapAskuiToXrayStepStatus(step.status),
      evidences: []
    };

    if (step.lastRun?.begin?.screenshot) {
      subStep.evidences.push(
        this.createEvidence(step.lastRun?.begin?.screenshot, 'before.png'));
    }

    if (step.lastRun?.end?.screenshot) {
      subStep.evidences.push(
        this.createEvidence(step.lastRun?.end?.screenshot, 'after.png'));
    }
    steps.push(subStep);
    return steps;
  }

  async onStepEnd(
    step: Step
  ): Promise<void> {
    if (this.result.length > 0) {
      const testEntry = this.result.pop();
      if (testEntry !== undefined) {
        testEntry.steps = this.addSubStepToTestEntry(testEntry, step);
        this.result.push(testEntry);
      }
    }
  }

  async writeReport(): Promise<void> {
    const outputFilePath = path.join(this.outputDirectory, 'report.json');
    if (!(fs.existsSync(this.outputDirectory))) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify({
          tests: this.result
        }, null, 2));
  }
}
