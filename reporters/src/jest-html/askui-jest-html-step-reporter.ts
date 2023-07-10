import fs from "fs";
import { Step, Reporter, ReporterConfig } from "askui";
import {convertPngDataUrlToBuffer} from "../utils/image-reporting-utils"
const { addAttach, addMsg } = require("jest-html-reporters/helper");
import { convertBase64StringToReadStream, writeWebmToMp4 } from '../utils/video-reporting-utils';

export class AskUIJestHtmlStepReporter implements Reporter {

  config: ReporterConfig = {
    withScreenshots: 'always',
    withDetectedElements: 'always'
  };

  constructor(config?: ReporterConfig) {
    if (config?.withScreenshots) {
      this.config.withScreenshots = config.withScreenshots; 
    }
    if (config?.withDetectedElements) {
      this.config.withDetectedElements = config.withDetectedElements; 
    }
  }

  async onStepBegin(step: Step): Promise<void> {
    await addMsg({ message: `Begin running "${step.instruction.valueHumanReadable}"` });
    await addMsg({ message: JSON.stringify(step) });
    if (step.begin?.screenshot) {
      await addAttach({
        attach: convertPngDataUrlToBuffer(step.begin.screenshot),
        description: `Screenshot before step`,
      });
    }
    if (step.begin?.detectedElements) {
      await addMsg({ message: `Detected elements: ${JSON.stringify(step.begin.detectedElements)}` });
    }
  }

  async onStepRetry(step: Step): Promise<void> {
    await addMsg({ message: `Retry running "${step.instruction.valueHumanReadable}" (retry ${step.retryCount})` });
    await addMsg({ message: JSON.stringify(step) });
    if (step.lastRun?.begin?.screenshot) {
      await addAttach({
        attach: convertPngDataUrlToBuffer(step.lastRun?.begin?.screenshot),
        description: `Screenshot on retry`,
      });
    }
    if (step.lastRun?.begin?.detectedElements) {
      await addMsg({ message: `Detected elements: ${JSON.stringify(step.lastRun?.begin?.detectedElements)}` });
    }
  }

  async onStepEnd(step: Step): Promise<void> {
    await addMsg({ message: `End running "${step.instruction.valueHumanReadable}"` });
    await addMsg({ message: JSON.stringify(step) });
    if (step.end?.screenshot) {
      await addAttach({
        attach: convertPngDataUrlToBuffer(step.end.screenshot),
        description: `Screenshot after step`,
      });
    }
    if (step.end?.detectedElements) {
      await addMsg({ message: `Detected elements: ${JSON.stringify(step.end.detectedElements)}` });
    }
  }

  static async writeVideoAttachment(video: string, output: string) {
    await writeWebmToMp4(convertBase64StringToReadStream(video), output);
    addAttach({
      attach: fs.readFileSync(output),
      description: "Video",
      bufferFormat: "mp4",
    });
    await fs.promises.unlink(output);
  }
}
