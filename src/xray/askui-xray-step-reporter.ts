import { Reporter, Step, StepStatus, ReporterConfig } from 'askui';
import { convertPngDataUrlToBase64 } from '../utils/image-reporting-utils';
import { TestEntryUndefinedException } from './test-entry-undefined-exception';
import path from 'path';
import fs from 'fs';

/*
 * Possible XRay status: PASS, FAIL, TODO
 */
enum Status {
  PASS = 'PASS',
  FAIL = 'FAIL',
  TODO = 'TODO',
  UNDEFINED = 'UNDEFINED',
}

interface XRayTestObject {
  testKey: string;
  status?: Status;
  start?: string;
  finish?: string;
  steps?: XRayStep[];
}

interface XRayEvidence {
  data: string;
  filename: string;
  contentType: string;
}

interface XRayStep {
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
    case 'pending':
      return Status.TODO;
    case 'running':
      return Status.TODO;
    default:
      return Status.UNDEFINED;
  }
}

type StatusJest = 'success' | 'failure';

function mapJestToXrayStatus(status: StatusJest): Status {
  switch (status) {
    case 'success':
      return Status.PASS;
    case 'failure':
      return Status.FAIL;
    default:
      return Status.UNDEFINED;
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

  private async last(array: Array<any>): Promise<any | undefined>  {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
  }

  async finishTestEntry(
    testStatus: StatusJest
  ): Promise<void> {
    const testEntry = await this.last(this.result);
    if (testEntry === undefined) {
      throw new TestEntryUndefinedException();
    }
    testEntry.finish = new Date().toISOString();
    testEntry.status = mapJestToXrayStatus(testStatus);
  }

  private createEvidence(screenshot: string, fileName: string): XRayEvidence {
    return {
        data: convertPngDataUrlToBase64(screenshot),
        filename: fileName,
        contentType: 'image/png'
      };
  }

  private buildXRayStep(
    step: Step
  ): XRayStep {
    const result: XRayStep = {
      status: mapAskuiToXrayStepStatus(step.status),
      evidences: []
    };
    if (step.lastRun?.begin?.screenshot) {
      result.evidences.push(
        this.createEvidence(step.lastRun?.begin?.screenshot, 'before.png'));
    }
    if (step.lastRun?.end?.screenshot) {
      result.evidences.push(
        this.createEvidence(step.lastRun?.end?.screenshot, 'after.png'));
    }
    return result;
  }

  async onStepEnd(
    step: Step
  ): Promise<void> {
    const testEntry = await this.last(this.result);
    if (testEntry === undefined) {
      throw new TestEntryUndefinedException();
    }
    testEntry.steps = [...(testEntry.steps ?? []), this.buildXRayStep(step)];
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
