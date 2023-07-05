# AskUI - Reporters

Collections of all reporters you can use out of the box in your AskUI executions.

## Allure-Reporter

```typescript

```

## Jest-HTML-Reporter


```typescript
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./helper/jest.setup.ts'],
  sandboxInjectedGlobals: [
    'Math',
  ],
  reporters: [
    "default",
    "jest-html-reporters"
  ],
};

// eslint-disable-next-line import/no-default-export
export default config;
```

```typescript
import { askuiJestHtmlStepReporter } from "askui-reporters";

aui = await UiControlClient.build({
    reporter: new askuiJestHtmlStepReporter(),
});

// UNCOMMENT THE FOLLOWING CODE TO RECORD VIDEOS OF YOUR TESTS

// IMPORTANT: With jest-html-reporters, you can have either 
// video reporting or the reporting of step details together 
// with screenshots. So make sure that if you want to use 
// video reporting, you disable the step details reporting by 
// commenting out line (`    reporter: new askuiJestHtmlStepReporter(),`).

beforeEach(async () => {
  await aui.startVideoRecording();
})

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  const output = path.join(__dirname, "./video.mp4");
  await writeWebmToMp4(convertBase64StringToReadStream(video), output);
  addAttach({
    attach: await fs.readFileSync(output),
    description: "Video",
    bufferFormat: "mp4",
  });
  await fs.promises.unlink(output);
});
```