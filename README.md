# 📊 AskUI - Reporters

Collections of all reporters you can use out of the box in your AskUI runs.

## 🏗️ Example Repositories

- [allure-reporter](https://github.com/askui/askui-example-allure-reporter)
- [jest-html-reporters](https://github.com/askui/askui-example-jest-html-reporters)

## 💾 Installation

Install `@askui/askui-reporters` as a dev-dependency:

```bash
npm install --save-dev @askui/askui-reporters
```

## 🔌 Usage

Detailed examples on how to use the reporters are provided in this README.

### Allure Reporter

#### Enable Reporter in `jest.setup.ts`

Add the reporter to the `UiControlClient` in `jest.setup.ts`:

```typescript
import { AskUIAllureStepReporter } from "@askui/askui-reporters";
...
  aui = await UiControlClient.build({
    reporter: new AskUIAllureStepReporter({
      withScreenshots: 'begin' as const, // See below for possible values
      withDetectedElements: 'onFailure' as const, // See below for possible values
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
beforeEach(async () => {
  await aui.startVideoRecording();
});

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  AskUIAllureStepReporter.attachVideo(video);
});
```

#### Enable the TestEnvironment `@askui/jest-allure-circus` in `jest.config.ts`

```typescript
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["./helper/jest.setup.ts"],
  sandboxInjectedGlobals: ["Math"],
  testEnvironment: "@askui/jest-allure-circus",
};

// eslint-disable-next-line import/no-default-export
export default config;
```

### Jest-Html-Reporters

**IMPORTANT NOTE**: Due to restrictions of `jest-html-reporters` you can either have screenshots or video with this reporter but not both at the same time. For screenshots omit the `beforeEach()` and `afterEach()` hooks in `jest.setup.ts`. For video do not configure a `reporter` in your `UiControlClient`.

**IMPORTANT NOTE 2**: To use this reporter you have to have [ffmpeg](http://www.ffmpeg.org/) installed on your system (including all necessary encoding libraries like libmp3lame or libx264).

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
import path from "path";
import { AskUIJestHtmlStepReporter } from "@askui/askui-reporters";

beforeEach(async () => {
  await aui.startVideoRecording();
});

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  await AskUIJestHtmlStepReporter.attachVideo(video);
});
```

#### Enable the Jest-Html-Reporters in `jest.config.ts`

```typescript
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./helper/jest.setup.ts"],
  sandboxInjectedGlobals: ["Math"],
  reporters: ["default", "jest-html-reporters"],
};

// eslint-disable-next-line import/no-default-export
export default config;
```

## 📝 Implement Your Own Reporter

To write your own reporter you have to implement AskUI's `Reporter` interface.
It offers three optional methods you can overwrite to adapt to your specific reporter framework:

```typescript
export interface Reporter {
  config?: ReporterConfig;
  onStepBegin?(step: Step): Promise<void>;
  onStepRetry?(step: Step): Promise<void>;
  onStepEnd?(step: Step): Promise<void>;
}
```

See the _Example implementation for Allure: ([Sourcecode](src/allure/askui-allure-step-reporter.ts))_ on how that is used to extract the screenshot before and after each step.

## 📇 Contributing

If you have implemented your own reporter and want to make it available for others, please open a pull request 🦄

## 🪴 Branching

Your branch name should conform to the format `<issue id>-<issue title lower-cased and kebab-cased>`, e.g., let's say you have an issue named _Hello World_ with id _AS-101_, the branch name would be `AS-101-hello-world`. We use the issue id prefix to prepend a link to the issue to the commit message header. In some cases, when doing a quick fix of a typo etc. when there is no issue, feel free to just use a descriptive name of what you are doing, e.g., `fix-typo-in-example-readme`.

## 🖋️ Commit Message Standard

Commit messages should conform to [Conventional Commits Message Standard](https://www.conventionalcommits.org/en/v1.0.0/). Exceptions to this rule are merge commits.

## 🧱 Build New Release

```
cd reporters

npm config set scope askui
npm config set access public

npm login

npm run release
```
