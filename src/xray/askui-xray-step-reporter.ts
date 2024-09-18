import { Reporter, Step, StepStatus, ReporterConfig } from 'askui';
import { convertPngDataUrlToBase64 } from '../utils/image-reporting-utils';
import { TestEntryUndefinedException } from './test-entry-undefined-exception';
import { LockNotAquiredException } from './lock-not-aquired-exception';
import { WritingXRayReportException } from './writing-xray-report-exception';
import { lock } from 'proper-lockfile';
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
  resetReportDirectory: boolean;
  appendToReport: boolean;
  isInsideStep = false;

  constructor(
    config?: ReporterConfig,
    outputDirectory = 'xray-report',
    resetReportDirectory = false,
    appendToReport = false
    ) {
    if (config !== undefined) {
      this.config = config;
    }
    this.outputDirectory = outputDirectory;
    this.resetReportDirectory = resetReportDirectory;
    if (this.resetReportDirectory === true) {
      this.resetReportsDirectory();
    }
    this.appendToReport = appendToReport;
  }

  private resetReportsDirectory() {
    if (fs.existsSync(this.outputDirectory)) {
      fs.rmSync(this.outputDirectory, { recursive: true, force: true })
    }
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
    this.isInsideStep = true;
  }

  private async getTestEntry(testTitle: string, array: Array<any>): Promise<any | undefined>  {
    return array.find(x => x.testKey === testTitle);
  }

  async finishTestEntry(
    testTitle: string,
    testStatus: StatusJest
  ): Promise<void> {
    const testEntry = await this.getTestEntry(testTitle, this.result);
    if (testEntry === undefined) {
      throw new TestEntryUndefinedException();
    }
    testEntry.finish = new Date().toISOString();
    testEntry.status = mapJestToXrayStatus(testStatus);
    this.isInsideStep = false;
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

  private getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  }

  private async last(array: Array<XRayTestObject>): Promise<XRayTestObject | undefined>  {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
  }

  async onStepEnd(
    step: Step
  ): Promise<void> {
    if (this.isInsideStep) {
      const testEntry = await this.last(this.result);
      if (testEntry === undefined) {
        throw new TestEntryUndefinedException();
      }
      testEntry.steps = [...(testEntry.steps ?? []), this.buildXRayStep(step)];
      return;
    }
    console.log('Not reporting step. Running beforeAll() or afterAll() inside a describe().');
  }

  async writeReport(): Promise<void> {
    if (this.appendToReport === true) {
      const outputFilePath = path.join(this.outputDirectory, `report.json`);
      if (!(fs.existsSync(this.outputDirectory))) {
        fs.mkdirSync(this.outputDirectory, { recursive: true });
      }
      if (!(fs.existsSync(outputFilePath))) {
        fs.writeFileSync(outputFilePath, '{"tests":[]}');
      }

      let release;
      try {
        release = await lock(outputFilePath, { retries: { retries: 5, maxTimeout: 1000 } })
      }
      catch {
         throw new LockNotAquiredException();
      }

      try {
          let existingData: { tests: XRayTestObject[]} = { tests: []};
          if (fs.existsSync(outputFilePath)) {
            const fileContent = fs.readFileSync(outputFilePath, { encoding: 'utf-8' });
            existingData = JSON.parse(fileContent);
          }
          existingData.tests.push(...this.result);
    
          fs.writeFileSync(
            outputFilePath,
            JSON.stringify(existingData, null, 2));
      }
      catch{
        throw new WritingXRayReportException('Error appending to report.json.')
      }
      finally {
        release && release();
      }
    }
    else {
      let timestamp = `_${this.getFormattedDate()}`;
      const outputFilePath = path.join(this.outputDirectory, `report${timestamp}.json`);
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
}
