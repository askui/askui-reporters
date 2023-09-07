import { Reporter, Step, StepStatus, Annotation, DetectedElement, ReporterConfig } from "askui";
import { Status } from "@askui/jest-allure-circus";
import { ContentType } from "allure-js-commons";
import { convertPngDataUrlToBuffer } from "../utils/image-reporting-utils";
import { convertBase64StringToBuffer } from "../utils/video-reporting-utils";

function mapAskuiToAllureStepStatus(status: StepStatus): Status {
  switch (status) {
    case "passed":
      return Status.PASSED;
    case "failed":
      return Status.FAILED;
    case "erroneous":
      return Status.BROKEN;
    default:
      return Status.SKIPPED;
  }
}

function createScreenshotAttachment(
  name: string,
  screenshot: string,
  detectedElements?: Readonly<Readonly<DetectedElement>>[])
{
  if (detectedElements === undefined) {
    return {
      name,
      type: "image/png",
      content: convertPngDataUrlToBuffer(screenshot),
    };
  }
  const annotation = new Annotation(
    screenshot,
    detectedElements
  );
  return {
    name: `${name} (annotated)`,
    type: {
      contentType: "text/html",
      fileExtension: ".html",
    },
    content: annotation.toHtml().serialize(),
  };
}

export class AskUIAllureStepReporter implements Reporter {
  config?: ReporterConfig;

  constructor(config?: ReporterConfig) {
    if (config !== undefined) {
      this.config = config;
    }
  }

  async onStepEnd(step: Step): Promise<void> {
    const status = mapAskuiToAllureStepStatus(step.status);
    const attachments = [];

    if (step.lastRun?.begin?.screenshot !== undefined) {
      attachments.push(createScreenshotAttachment(
        "Before Screenshot",
        step.lastRun?.begin?.screenshot,
        step.lastRun?.begin?.detectedElements
      ));
    }
    if (step.lastRun?.end?.screenshot !== undefined) {
      attachments.push(createScreenshotAttachment(
        "After Screenshot",
        step.lastRun?.end?.screenshot,
        step.lastRun?.end?.detectedElements
      ));
    }
    allure.logStep(
      step.instruction.valueHumanReadable,
      status,
      attachments,
    );
  }

  static attachVideo(webm: string) {
    allure.createAttachment(
      "Video",
      convertBase64StringToBuffer(webm),
      ContentType.WEBM
    );
  }
}
