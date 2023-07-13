# AskUI - Reporters

Collections of all reporters you can use out of the box in your AskUI executions.

## 💾 Installation
Install `@askui/askui-reporters` as a dev-dependency:

```bash
npm install --save-dev @askui/askui-reporters
```

## 🔌 Usage
Detailed examples on how to use the reporters are provided in this README.

### Jest-Html-Reporters

__IMPORTANT NOTE__: Due to restrictions of `jest-html-reporters` you can either have screenshots or video with this reporter but not both at the same time. For screenshots omit the `beforeEach()` and `afterEach()` hooks in `jest.setup.ts`. For video do not configure a `reporter` in your `UiControlClient`.

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

You can pass a `ReporterConfig` object to the reporter to configure the level of detail for screenshots and detected elements. The default values are `'onFailure'` for both:

```typescript
/**
 * SnapshotDetailLevel represents various levels of detail for the snapshot.
 * There are four possible values for this type.
 *
 * @typedef {'required'|'onFailure'|'begin'|'always'} SnapshotDetailLevel
 *
 * @property {'required'} required - Snapshot details, like screenshots or detected elements, may be available if required by the step. However, their presence is not guaranteed.
 * @property {'onFailure'} onFailure - Snapshot details are available when the step fails, primarily for debugging purposes. This level includes everything provided by 'required'.
 * @property {'begin'} begin - Snapshot details are available when the command starts, useful for determining why certain elements were interacted with. This level includes everything provided by 'onFailure'.
 * @property {'always'} always - Snapshot details are consistently available, irrespective of whether a step has failed or not, aiding in debugging. 
 */

/**
 * The ReporterConfig interface encapsulates the configuration options for the reporter.
 *
 * @interface ReporterConfig
 *
 * @property {SnapshotDetailLevel} [withScreenshots='onFailure'] - Defines the detail level for screenshots. Acceptable values: 'required', 'onFailure', 'begin', 'always'. Note: Higher levels of detail may impede step execution speed.
 * @property {SnapshotDetailLevel} [withDetectedElements='onFailure'] - Defines the detail level for detecting elements. Acceptable values: 'required', 'onFailure', 'begin', 'always'. Note: Higher levels of detail may impede step execution speed and incur additional costs.
 */
```

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
  await AskUIJestHtmlStepReporter.attachVideo(video);
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

You can pass a `ReporterConfig` object to the reporter to configure the level of detail for screenshots and detected elements. The default values are `'onFailure'` for both:

```typescript
/**
 * SnapshotDetailLevel represents various levels of detail for the snapshot.
 * There are four possible values for this type.
 *
 * @typedef {'required'|'onFailure'|'begin'|'always'} SnapshotDetailLevel
 *
 * @property {'required'} required - Snapshot details, like screenshots or detected elements, may be available if required by the step. However, their presence is not guaranteed.
 * @property {'onFailure'} onFailure - Snapshot details are available when the step fails, primarily for debugging purposes. This level includes everything provided by 'required'.
 * @property {'begin'} begin - Snapshot details are available when the command starts, useful for determining why certain elements were interacted with. This level includes everything provided by 'onFailure'.
 * @property {'always'} always - Snapshot details are consistently available, irrespective of whether a step has failed or not, aiding in debugging. 
 */

/**
 * The ReporterConfig interface encapsulates the configuration options for the reporter.
 *
 * @interface ReporterConfig
 *
 * @property {SnapshotDetailLevel} [withScreenshots='onFailure'] - Defines the detail level for screenshots. Acceptable values: 'required', 'onFailure', 'begin', 'always'. Note: Higher levels of detail may impede step execution speed.
 * @property {SnapshotDetailLevel} [withDetectedElements='onFailure'] - Defines the detail level for detecting elements. Acceptable values: 'required', 'onFailure', 'begin', 'always'. Note: Higher levels of detail may impede step execution speed and incur additional costs.
 */
```

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
  AskUIAllureStepReporter.attachVideo(video);
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
* [jest-html-reporters](https://github.com/askui/askui-example-jest-html-reporters)