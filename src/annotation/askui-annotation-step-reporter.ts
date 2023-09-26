import fs from "fs";
import { Step, Reporter, Annotation, ReporterConfig } from "askui";
import path from "path";
import { JSDOM } from "jsdom";
import { InvalidStepStatusError } from "@/error/invalid-step-status-Error";
import { MissingStepContentsError } from "@/error/missing-step-contents-error";

export enum AnnotationLevel {
  ON_FAILURE = 'onFailure',
  ALL = 'all',
}

export class AskUIAnnotationStepReporter implements Reporter {

  annotationLevel? = AnnotationLevel.ON_FAILURE;
  folderPath? = 'report';
  fileNameSuffix? = '_testStep_annotation';

  config: ReporterConfig = {
    withScreenshots: 'onFailure',
    withDetectedElements: 'onFailure',
  }

  constructor(annotationLevel?: AnnotationLevel, folderPath?: string, fileNameSuffix?: string) {
    if (annotationLevel !== undefined) {
      this.annotationLevel = annotationLevel;

      if (this.annotationLevel === AnnotationLevel.ALL) {
        this.config.withScreenshots = 'always';
        this.config.withDetectedElements = 'always';
      }
    }
    if (folderPath !== undefined) {
      this.folderPath = folderPath;
    }
    if (fileNameSuffix !== undefined) {
      this.fileNameSuffix = fileNameSuffix;
    }
  }

  async onStepEnd(step: Step): Promise<void> {

    if (step.status === 'running' || step.status === 'pending') {
      throw new InvalidStepStatusError(
        `Cannot report on a step with status '{step.status}'. 
        This indicates an error in the step execution.`);
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
    await AskUIAnnotationStepReporter.writeAnnotation(
      annotation.toHtml(),
      this.folderPath,
      suffix);
  }

  static async writeAnnotation(html: JSDOM, outputFolder = 'report', fileNameSuffix = 'annotation') {
    const currentDateTime = new Date();
    const currentTimeStringOnlyNumbers = currentDateTime.toISOString().replace(/\D/g, '');
    const fileName = `${currentTimeStringOnlyNumbers}_${fileNameSuffix}.html`;
    const outputFilePath = path.join(outputFolder, fileName);
    if (!(fs.existsSync(outputFolder))) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, html.serialize());
  }

}
