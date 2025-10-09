import { Reporter, Step, StepStatus, Annotation, DetectedElement, ReporterConfig } from "askui";
import { getGlobalTestRuntime, MessageTestRuntime  }  from "allure-js-commons/sdk/runtime";
import { getMessageAndTraceFromError  }  from "allure-js-commons/sdk";
import { attachment as allureAttachment, ContentType, Status }  from "allure-js-commons";
import { convertPngDataUrlToBuffer } from "../utils/image-reporting-utils";
import { RuntimeMessage } from "node_modules/allure-js-commons/dist/types/sdk/types";
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
  detectedElements?: Readonly<Readonly<DetectedElement>>[]) {
  if (detectedElements === undefined) {
    return {
      name,
      type: ContentType.PNG,
      content: convertPngDataUrlToBuffer(screenshot),
    };
  }
  const annotation = new Annotation(
    screenshot,
    detectedElements
  );
  return {
    name: `${name} (annotated)`,
    type: ContentType.HTML,
    content: annotation.toHtml().serialize(),
  };
}

export class AskUIAllureStepReporter implements Reporter {
  config?: ReporterConfig;

  private currentStep: RuntimeMessage | undefined;
  runtime: MessageTestRuntime;

  constructor(config?: ReporterConfig) {
    if (config !== undefined) {
      this.config = config;
    }
    this.runtime = getGlobalTestRuntime() as MessageTestRuntime
  }

  async onStepBegin(step: Step): Promise<void> {
    this.currentStep = {
      type: "step_start",
      data: {
        name: step.instruction.valueHumanReadable,
        start: Date.now(),
      }
    }
    this.runtime.sendMessage(this.currentStep)
  }

  async onStepEnd(step: Step): Promise<void> {
    if (this.currentStep === undefined) {
      return;
    }

    const status = mapAskuiToAllureStepStatus(step.status);
    const attachments = [];

    // FIX: Somehow the screenshot is there even when
    //      the config.withScreenshots setting is onFailure
    if (this.config?.withScreenshots === 'always' || (
      (this.config?.withScreenshots === 'onFailure' || this.config?.withScreenshots === undefined) &&
      step.status === 'failed'
    )) {
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
    }

    if (this.config?.withScreenshots === 'begin') {
      if (step.lastRun?.begin?.screenshot !== undefined) {
        attachments.push(createScreenshotAttachment(
          "Before Screenshot",
          step.lastRun?.begin?.screenshot,
          step.lastRun?.begin?.detectedElements
        ));
      }
    }

    let stepInfos = `Duration: ${step.duration}ms\nStatus: ${status}\nNumber of runs: ${step.runs.length}`;

    if (step.error !== undefined) {
      stepInfos += `\nError: ${step.error.message}\nStacktrace: ${step.error.stack}`;
    }

    attachments.push({
      name: "Step Infos",
      content: stepInfos,
      type: ContentType.TEXT,
    });
    for (const attachment of attachments) {
      await allureAttachment(attachment.name, attachment.content, attachment.type)
    }

    this.runtime.sendMessage({
      type: "step_stop",
      data: {
        status: status,
        stop: Date.now(),        
        ...( step.error   ?   {statusDetails: getMessageAndTraceFromError(step.error)} : {}),
      },
    })
    this.currentStep = undefined;
  }

  static attachVideo(webm: string) {
    allureAttachment("Video", convertBase64StringToBuffer(webm), ContentType.WEBM)
  }
}
