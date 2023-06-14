# 📊 AskUI-Reporters
Collection of reporters for askui. If existent we also provide a link to a comprehensive example repository where you can inspect the code and find integrations for your CI/CD-Pipeline.

## 🏗️ Example Repositories

* [allure-reporter](https://github.com/askui/askui-example-allure-reporter)
* [jest-html-reporter](https://github.com/askui/askui-example-jest-html-reporters)

## 📇 Contribute
If you have implemented your own reporter and want it to be referenced here. Please open a pull request 🦄

## 📝 Write Your Own Reporter
To write your own reporter you have to do the following things:

* Implement AskUIs `Reporter` interface
* Initialize and configure reporter
* Configure `beforeEach()` and `afterEach()`
* _Depending on Reporter_: Adapt `jest.config.ts`

### Implement AskUIs `Reporter` Interface
AskUIs interface for reporters offers three optinal methods you can overwrite to adapt to your specific reporter framework:

```typescript
export interface Reporter {
    config?: ReporterConfig;
    onStepBegin?(step: Step): Promise<void>;
    onStepRetry?(step: Step): Promise<void>;
    onStepEnd?(step: Step): Promise<void>;
}
```

See the _Example implementation for Allure: ([Sourcecode](https://github.com/askui/askui/blob/main/packages/askui-nodejs/src/core/reporting/reporter.ts))_ on how that is used to extract the screenshot before and after each step.

### Enable Your Reporter
To enable your reporter for askui, add it to the `UiControlClient` in `jest.setup.ts` like this:

```typescript
reporter: new askuiAllureStepReporter()
```

### Configure Your Reporter
Your `ReporterConfig` takes two optional arguments. Change it by editing the `config` variable in your reporter implementation:

```typescript
/**
 * default: onFailure; makes step run slower
 */
withScreenshots?: SnapshotDetailLevel;

/**
 * overrides withScreenshot if higher level of detail as screenshot
 *  is required for detecting elements;
 * incurres additional cost; default: onFailure; makes step run slower
 */
withDetectedElements?: SnapshotDetailLevel;
```

Where `SnapshotDetailLevel` is by default `onFailure` but can be configured with the following:

```typescript
export declare type SnapshotDetailLevel = 
  /**
   * Details of snapshot, e.g., screenshot or detected elements, may or may not be available
   *  depending on if they are required by the step. There are not guarantees made.
   */
  'required' | 
  /**
   * Details are available when the step fails, e.g., for debugging.
   * Includes everything of required.
   */
  'onFailure' | 
  /**
   * Details are available also when the command is started, e.g.,
   *  for detecting why a certain element was interacted with. Includes everything of onFailure.
   */
  'begin' | 
  /**
   * Details are available always, e.g.,
   *  before and after a step has been run no matter if it failed or not for debugging.
   */
  'always';
```

### Configure `beforeEach()` and `afterEach()`
The `UiControlClient` retrieves the videos and images from your `UiController`. You have to implement `beforeEach()` and `afterEach()` in `jest.setup.ts` to start the recording and then add it to your report. Here are two examples:

1. Allure Reporter
```typescript
beforeEach(async () => {
  await aui.startVideoRecording();
});

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  allure.createAttachment("Video", convertBase64StringToBuffer(video), ContentType.WEBM);
});
```

2. jest-html-reporter
```typescript
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

### Adapt `jest.config.ts`
Depending on your reporter you may have to edit you `jest.config.ts`.

#### Enable `jest-html-reporter`
The [jest-html-reporter](https://github.com/askui/askui-example-jest-html-reporters) uses [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters) and needs askuis `DefaultReporter` and `jest-html-reporters.

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

#### Set `testEnvironment` in `jest.config.ts`
The [Allure-reporter](https://github.com/askui/askui-example-allure-reporter) uses the hooks from `jest-circus` and thus needs the `jest-allure-circus` environment to work correctly:

```typescript
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./helper/jest.setup.ts'],
  sandboxInjectedGlobals: [
    'Math',
  ],
  testEnvironment: 'jest-allure-circus',
};

// eslint-disable-next-line import/no-default-export
export default config;
```
