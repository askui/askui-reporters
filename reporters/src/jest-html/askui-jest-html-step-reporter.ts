import { Step, Reporter } from "askui";
const { addAttach, addMsg } = require("jest-html-reporters/helper");

function convertPngDataUrlToBuffer(pngDataUrl: string): Buffer {
  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  return buffer;
}

export class askuiJestHtmlStepReporter implements Reporter {
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
}
