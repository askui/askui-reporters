# 📊 askui-reporters
An `npm`-package containing a collection of reporters for AskUI. We also provide links to example repository where you can see how to use the reporters in your code.

## 🏗️ Example Repositories

* [allure-reporter](https://github.com/askui/askui-example-allure-reporter)
* [jest-html-reporters](https://github.com/askui/askui-example-jest-html-reporters)

### 📇 Contributing
If you have implemented your own reporter and want to make it available for others, please open a pull request 🦄

### 🪴 Branching
Your branch name should conform to the format `<issue id>-<issue title lower-cased and kebab-cased>`, e.g., let's say you have an issue named *Hello World* with id *AS-101*, the branch name would be `AS-101-hello-world`. We use the issue id prefix to prepend a link to the issue to the commit message header. In some cases, when doing a quick fix of a typo etc. when there is no issue, feel free to just use a descriptive name of what you are doing, e.g., `fix-typo-in-example-readme`.

### 🖋️ Commit Message Standard

Commit messages should conform to [Conventional Commits Message Standard](https://www.conventionalcommits.org/en/v1.0.0/). Exceptions to this rule are merge commits.

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

See the _Example implementation for Allure: ([Sourcecode]())_ on how that is used to extract the screenshot before and after each step.

### Adapt `jest.config.ts`
Depending on your reporter you may have to edit your `jest.config.ts`.

#### Enable `jest-html-reporters`
The [askui-example-jest-html-reporters](https://github.com/askui/askui-example-jest-html-reporters) uses [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters).

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
The [askui-example-allure-reporter](https://github.com/askui/askui-example-allure-reporter) uses the hooks from `jest-circus` and thus needs the `jest-allure-circus` environment to work correctly:

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

```
cd reporters

npm config set scope askui
npm config set access public

npm login

npm run release
```