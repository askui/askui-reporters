# 📊 askui-reporters
A `npm`-package containg a collection of reporters for AskUI. If existent we also provide a link to an example repository where you can inspect the code in action.

## 💾 Installation
🚧 **Under constuctions** 🚧

```bash
npm install --save-dev askui-reporters
```

## 🔌 Usage
Detailed examples on how to use the reporters provided in this package.

### Jest-Html-Reporter

TODO Do I need to install more dependencies or do they come with the askui-reporters package?

#### Enable Reporter
Add it to the `UiControlClient` in `jest.setup.ts` like this:

```typescript
// Do not forget the import at the start of the file!
import { AskUIJestHtmlStepReporter } from "askui-reporters";
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
// Do not forget the import at the start of the file
const { addAttach } = require("jest-html-reporters/helper");

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

#### Enable the Jest-Html-reporters in `jest.config.ts`

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

TODO Do I need to install more dependencies or do they come with the askui-reporters package?

#### Enable Reporter in `jest.setup.ts`
Add it to the `UiControlClient` in `jest.setup.ts` like this:

```typescript
// Do not forget the import at the start of the file
import { AskUIAllureStepReporter } from "askui-reporters";
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
// Do not forget the import at the start of the file
import "jest-allure-circus";

beforeEach(async () => {
  await aui.startVideoRecording();
});

afterEach(async () => {
  await aui.stopVideoRecording();
  const video = await aui.readVideoRecording();
  allure.createAttachment("Video", convertBase64StringToBuffer(video), ContentType.WEBM);
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

### 📇 Contributing
If you have implemented your own reporter and want it to be referenced here. Please open a pull request 🦄

### 🪴 Branching
Your branch name should conform to the format `<issue id>-<issue title lower-cased and kebab-cased>`, e.g., let's say you have an issue named *Hello World* with id *AS-101*, the the branch name would be `AS-101-hello-world`. We use the issue id prefix to prepend a link to the issue to the commit message header. In some cases, when doing a quick fix of a typo etc. when there is no issue, feel free to just use a descriptive name of what you are doing, e.g., `fix-typo-in-example-readme`.

### 🖋️ Commit Message Standard

Commit messages should conform to [Conventional Commits Message Standard](https://www.conventionalcommits.org/en/v1.0.0/). Exceptions to this rule may be merge commits.

## 📝 Implement Your Own Reporter
To write your own reporter you have to implement AskUIs `Reporter` interface.
It offers three optional methods you can overwrite to adapt to your specific reporter framework:

```typescript
export interface Reporter {
    config?: ReporterConfig;
    onStepBegin?(step: Step): Promise<void>;
    onStepRetry?(step: Step): Promise<void>;
    onStepEnd?(step: Step): Promise<void>;
}
```

See the _Example implementation for Allure: ([Sourcecode]())_ on how that is used to extract the screenshot before and after each step.

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

## 🧱 Build New Release
🚧 **Under construction** 🚧