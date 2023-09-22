import fs from "fs";
import { Step, Reporter, Annotation, ReporterConfig } from "askui";
import path from "path";
import { JSDOM } from 'jsdom';

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

    if (step.status === 'running' || step.status === 'pending' || step.status === 'erroneous') {
      throw Error(`Step status must not be '{step.status}' this indicates an error in the execution.`);
    }

    if (this.annotationLevel === AnnotationLevel.ON_FAILURE && step.status === 'passed') {
      return;
    }

    if (step.lastRun?.end?.screenshot === undefined ||
        step.lastRun?.end?.detectedElements === undefined) {
      throw Error("'screenshot' or 'detectedElements' not defined");
    }

    const annotation = new Annotation(
      step.lastRun.end.screenshot,
      step.lastRun.end.detectedElements
    )

    const suffix = `${step.status}${this.fileNameSuffix}`
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
