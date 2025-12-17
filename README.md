# Template MP

### [Development reference](https://alipayconnect-miniprogram.alipay.com/docs-alipayconnect/miniprogram_alipayconnect/mpdev/developer-guide)

## Git

### Do not ignore case

`git config --global core.ignorecase false`

### Branch Protection

- main: Protected branch, only administrators can merge code.
- dev: Protected branch, only administrators can merge code.
- feature/*: Feature branch, used for development of new features.
- bugfix/*: Bug fix branch, used for fixing bugs.

### Branch Convention

- Development basal branches, originating from dev (`feature/sprintx/x` corresponds to a stage number within a specific sprint, `ITBIZ-xxx` represents the corresponding Jira): `feature/sprintx` or `feature/sprintx/x` or `feature/ITIBIZxxx`. e.g., `feature/sprint5`, `feature/sprint5/1`, `feature/ITBIZ-123`. Normally, it's `feature/sprintx` or `feature/sx`.

- Collaborative development branches, originating from the development basal branch: `feature/lx`, `feature/wqy`, `feature/lmf`, `feature/zl`

- Independent bug fixes, originating from the dev branch: `bugfix/xxx`. eg., `bugfix/ITBIZ-123`.

### Commit Convention (Note: There is a space after the colon)

`git commit -m <type>[optional scope]: <description>`

- type: Used to indicate the type of change in this commit.
- optional scope: Optional, used to identify which module in the code this commit mainly involves.
- description: Briefly describe the main content of this commit.
  eg: `git commit -m 'fix(account): Fix the bug of xxx'`

#### Type

- build: Compilation - related modifications, such as releasing a version, changes to the project build or dependencies.
- chore: Other modifications, such as changing the build process or adding dependency libraries and tools.
- ci: Continuous integration modifications.
- docs: Documentation modifications.
- feat: New features.
- fix: Bug fixes.
- perf: Optimization - related, such as improving performance or user experience.
- refactor: Code refactoring.
- revert: Revert to the previous version.
- style: Code formatting modifications (note: not CSS modifications).
- test: Test case modifications.

## Important

### mini.project.json configures component2 Alipay and Alipay+ compatible writing
mini.project.json
```json
{
  "compileOptions": {   // Add for compatibility
    "component2": true
  },
  "component2": true
}
```

### It is not certain whether the new Alipay+ APP is compatible with the miniprogramRoot method. Developers need to confirm the packaging and subpackaging issues during development.

## Install antd-mimi
```sh
$ npm i antd-mini --save
```

### Modify mini.project.json
mini.project.json
```json
{
  "format": 2,
  "compileOptions": {   // Add for compatibility
    "component2": true
  },
  "component2": true
}
```

### Import components in JSON file
page.json
```json
{
  "usingComponents": {
    "ant-button": "antd-mini/es/Button/index"
  }
}
```

### Use components in AXML file
page.axml
```axml
<ant-button>This is a button</ant-button>
```

### [Component reference](https://mini.ant.design/components/overview)