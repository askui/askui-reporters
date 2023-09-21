import fs from "fs";
import { Step, Reporter, Annotation, ReporterConfig } from "askui";
import path from "path";
import { JSDOM } from 'jsdom';

export enum AnnotationLevel {
  DISABLED = 'disabled',
  ON_FAILURE = 'onFailure',
  ALL = 'all',
}

export interface AnnotationReporterConfig extends ReporterConfig {
  annotationLevel: AnnotationLevel;
  folderPath: string;
  fileNameTemplate: string;
}

export class AskUIAnnotationStepReporter implements Reporter {

  reporterConfig: AnnotationReporterConfig = {
    annotationLevel: AnnotationLevel.DISABLED,
    folderPath: 'report',
    fileNameTemplate: '_testStep_annotation',
  }

  config: ReporterConfig = {
    withScreenshots: 'always',
    withDetectedElements: 'always',
  }

  constructor(reporterConfig: AnnotationReporterConfig) {
    if (reporterConfig.annotationLevel !== undefined) {
      this.reporterConfig.annotationLevel = reporterConfig.annotationLevel;
    }
    if (reporterConfig.fileNameTemplate !== undefined) {
      this.reporterConfig.fileNameTemplate = reporterConfig.fileNameTemplate;
    }
    if (reporterConfig.folderPath !== undefined) {
      this.reporterConfig.folderPath = reporterConfig.folderPath;
    }
    if (reporterConfig.withScreenshots !== undefined) {
      this.config.withScreenshots = reporterConfig.withScreenshots;
    }
    if (reporterConfig.withDetectedElements !== undefined) {
      this.config.withDetectedElements = reporterConfig.withDetectedElements;
    }
  }

  async onStepEnd(step: Step): Promise<void> {
    if (( 
          (this.reporterConfig.annotationLevel === AnnotationLevel.ON_FAILURE && step.status !== 'passed') ||
          this.reporterConfig.annotationLevel === AnnotationLevel.ALL
        ) &&
        step.lastRun?.end?.screenshot !== undefined &&
        step.lastRun?.end?.detectedElements !== undefined) {
      const annotation = new Annotation(
        step.lastRun?.end?.screenshot,
        step.lastRun?.end?.detectedElements
      )

      const fileNamePrefix = `${step.status !== 'passed' ? 'failed' : step.status}${this.reporterConfig.fileNameTemplate}`
      await AskUIAnnotationStepReporter.writeAnnotation(
        annotation.toHtml(),
        this.reporterConfig.folderPath,
        fileNamePrefix);
    }
  }

  static async writeAnnotation(html: JSDOM, outputFolder = 'report', fileNamePrefix = 'annotation') {
    const currentDateTime = new Date();
    const currentTimeStringOnlyNumbers = currentDateTime.toISOString().replace(/\D/g, '');
    const fileName = `${currentTimeStringOnlyNumbers}_${fileNamePrefix}.html`;
    const outputFilePath = path.join(outputFolder, fileName);
    if (!(fs.existsSync(outputFolder))) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, html.serialize());
  }

}
