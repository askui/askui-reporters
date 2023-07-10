# AskUI - Reporters

Collections of all reporters you can use out of the box in your AskUI executions.

## 💾 Installation
Install `@askui/askui-reporters` as dev-dependency:

```bash
npm install --save-dev @askui/askui-reporters
```

## 🔌 Usage
Detailed examples on how to use the reporters are provided in this README.

### Jest-Html-Reporter

__IMPORTANT NOTE: Due to restrictions in jest-html-reporter you can either have screenshots or video with this reporter. For screenshots omit the `beforeEach()` and `afterEach()` hooks in `jest.setup.ts`. For video do not configure a `reporter` in your `UiControlClient`.

Install the following dependencies:

```bash
npm install --save-dev jest-html-reporters
```

#### Enable Reporter in `jest.setup.ts`
Add the reporter to the `UiControlClient` in `jest.setup.ts`:

```typescript
// Do not forget this import at the start of the file!
import { AskUIJestHtmlStepReporter } from "@askui/askui-reporters";
...
  aui = await UiControlClient.build({
    reporter: new AskUIJestHtmlStepReporter({
      withScreenshots: 'always' as const, // See below for possible values
      withDetectedElements: 'always' as const, // See below for possible values
    })
  });
...
```

The configuration values `withScreenshots` and `withDetectedElements` are defined as follows:

```typescript
/**
 * default: onFailure; makes step run slower
 * Possible Values: required, onFailure, begin, always
 */
withScreenshots?: SnapshotDetailLevel;

/**
 * overrides withScreenshot if higher level of detail as screenshot
 *  is required for detecting elements;
 * incurres additional cost; default: onFailure; makes step run slower
 * Possible Values: required, onFailure, begin, always
 */
withDetectedElements?: SnapshotDetailLevel;
```

Where `SnapshotDetailLevel` is by default `onFailure` but can be configured with the following:

* `'required'`: Details of snapshot, e.g., screenshot or detected elements, may or may not be available depending on if they are required by the step. There are not guarantees made.
* `'onFailure'`: Details are available when the step fails, e.g., for debugging. Includes everything of required.
* `'begin'`: Details are available also when the command is started, e.g., for detecting why a certain element was interacted with. Includes everything of onFailure.
* `'always'`: Details are available always, e.g., before and after a step has been run no matter if it failed or not for debugging.

#### Configure `beforeEach()` and `afterEach()` in `jest.setup.ts`

```typescript
// Do not forget these imports at the start of the file
import path from "path";
import { AskUIJestHtmlStepReporter } from "@askui/askui-reporters";

beforeEach(async () => {
  await aui.startVideoRecording();
})

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  const output = path.join(__dirname, "./video.mp4");
  await AskUIJestHtmlStepReporter.writeVideoAttachment(video, output);
});
```

#### Enable the Jest-Html-Reporters in `jest.config.ts`

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

### Allure Reporter
Install the following dependencies:

```bash
npm install --save-dev jest-allure-circus
```

#### Enable Reporter in `jest.setup.ts`
Add the reporter to the `UiControlClient` in `jest.setup.ts`:

```typescript
// Do not forget this import at the start of the file
import { AskUIAllureStepReporter } from "@askui/askui-reporters";
...
  aui = await UiControlClient.build({
    reporter: new AskUIAllureStepReporter({
      withScreenshots: 'always' as const, // See below for possible values
      withDetectedElements: 'always' as const, // See below for possible values
    })
  });
...
```

The configuration values `withScreenshots` and `withDetectedElements` are defined as follows:

```typescript
/**
 * default: onFailure; makes step run slower
 * Possible Values: required, onFailure, begin, always
 */
withScreenshots?: SnapshotDetailLevel;

/**
 * overrides withScreenshot if higher level of detail as screenshot
 *  is required for detecting elements;
 * incurres additional cost; default: onFailure; makes step run slower
 * Possible Values: required, onFailure, begin, always
 */
withDetectedElements?: SnapshotDetailLevel;
```

Where `SnapshotDetailLevel` is by default `onFailure` but can be configured with the following:

* `'required'`: Details of snapshot, e.g., screenshot or detected elements, may or may not be available depending on if they are required by the step. There are not guarantees made.
* `'onFailure'`: Details are available when the step fails, e.g., for debugging. Includes everything of required.
* `'begin'`: Details are available also when the command is started, e.g., for detecting why a certain element was interacted with. Includes everything of onFailure.
* `'always'`: Details are available always, e.g., before and after a step has been run no matter if it failed or not for debugging.

#### Configure `beforeEach()` and `afterEach()` in `jest.setup.ts`
The `UiControlClient` retrieves the videos and images from your `UiController`. You have to implement `beforeEach()` and `afterEach()` in `jest.setup.ts` to start the recording and then add it to your report:

1. Allure Reporter
```typescript
// Do not forget this import at the start of the file
import "jest-allure-circus";

beforeEach(async () => {
  await aui.startVideoRecording();
});

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  AskUIAllureStepReporter.createAllureAttachment(video);
});
```

#### Enable the TestEnvironment `jest-allure-circus` in `jest.config.ts`

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

## 🏗️ Example Repositories

* [allure-reporter](https://github.com/askui/askui-example-allure-reporter)
* [jest-html-reporter](https://github.com/askui/askui-example-jest-html-reporters)