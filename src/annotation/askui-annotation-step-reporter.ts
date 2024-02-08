import fs from "fs";
import { Step, Reporter, Annotation, ReporterConfig } from "askui";
import path from "path";
import { JSDOM } from "jsdom";
import { InvalidStepStatusError } from "../error/invalid-step-status-error";
import { MissingStepContentsError } from "../error/missing-step-contents-error";
import { convertPngDataUrlToBuffer } from "../utils/image-reporting-utils";

export enum AnnotationLevel {
  ON_FAILURE = 'onFailure',
  ALL = 'all',
}

async function writeFile(folderPath: string, fileName: string, content: string | Buffer): Promise<void> {
  const filePath = path.join(folderPath, fileName);
  await fs.promises.mkdir(folderPath, { recursive: true });
  await fs.promises.writeFile(filePath, content);
}

function generateFileName(suffix: string, fileExtension: string = ""): string {
  const currentDateTime = new Date();
  const currentTimeStringOnlyNumbers = currentDateTime.toISOString().replace(/\D/g, '');
  return `${currentTimeStringOnlyNumbers}_${suffix}${fileExtension}`;
}

export class AskUIAnnotationStepReporter implements Reporter {
  config: ReporterConfig = {
    withScreenshots: 'onFailure',
    withDetectedElements: 'onFailure',
  }

  constructor(
    public annotationLevel = AnnotationLevel.ON_FAILURE,
    public folderPath = 'report',
    public fileNameSuffix = '_testStep_annotation',
    public withScreenshot = false,
  ) {
    if (this.annotationLevel === AnnotationLevel.ALL) {
      this.config.withScreenshots = 'always';
      this.config.withDetectedElements = 'always';
    }
  }

  async onStepEnd(step: Step): Promise<void> {
    if (step.status === 'running' || step.status === 'pending') {
      throw new InvalidStepStatusError(
        `Cannot report on a step with status '${step.status}'. This indicates an error in the step execution.`,
      );
    }

    if (this.annotationLevel === AnnotationLevel.ON_FAILURE && step.status === 'passed') {
      return;
    }

    if (step.lastRun?.end?.screenshot === undefined ||
      step.lastRun?.end?.detectedElements === undefined) {
    throw new MissingStepContentsError("'screenshot' or 'detectedElements' not defined");
  }

    const annotation = new Annotation(
      step.lastRun.end.screenshot,
      step.lastRun.end.detectedElements
    )

    const stepStatus = step.status=='passed' ? 'passed' : 'failed';

    const suffix = `${stepStatus}${this.fileNameSuffix}`
    const fileName = generateFileName(suffix);
    await writeFile(this.folderPath, `${fileName}.html`, annotation.toHtml().serialize());
    await writeFile(this.folderPath, `${fileName}_screenshot.png`, convertPngDataUrlToBuffer(step.lastRun.end.screenshot));
  }

  /**
   * @deprecated The method should not be used or overriden.
   */
  static async writeAnnotation(html: JSDOM, outputFolder = 'report', fileNameSuffix = 'annotation') {
    await writeFile(outputFolder, generateFileName(fileNameSuffix), html.serialize());
  }
}
