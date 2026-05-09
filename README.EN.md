# Front-End Development Checklist

Other languages: [中文](https://github.com/wsafight/front-end-checklist/blob/main/README.md) | Website: [Front-End Checklist](https://wsafight.github.io/front-end-checklist/)

> This is not a code style guide, but it will influence your coding habits.

This checklist was created to avoid repeating the same explanations during code reviews. Use it for self-review before submitting a PR, and to align standards during CR.

**Principles:**
- Complete a self-review against this checklist before submitting a PR
- Use checklist items to explain issues during CR, not personal preferences
- This is not a mechanical scoring rubric — prioritize business boundaries, error handling, maintainability, and UX
- If you must violate a rule, explain the reason, impact, and fallback in the PR description

---

## Use as an AI coding assistant Skill

This checklist is also packaged as a Skill for Claude Code / Kiro / Cursor / Codex. One-line install:

```bash
# Claude Code, global
curl -fsSL https://github.com/wsafight/front-end-checklist/releases/latest/download/install.sh | sh -s -- claude

# Project-level: add --local. Uninstall: add --uninstall.
# Other tools: replace `claude` with kiro / cursor / codex.
```

Windows (PowerShell):

```powershell
& ([scriptblock]::Create((irm https://github.com/wsafight/front-end-checklist/releases/latest/download/install.ps1))) -Tool claude
```

The installer verifies sha256 checksums, rolls back on failure, and cleans up temp files. After install, say `/frontend-checklist` or "review with the frontend checklist" in chat to trigger a review. See [Releases](https://github.com/wsafight/front-end-checklist/releases/latest).

---

## Table of Contents

- [Naming Conventions](#naming-conventions)
- [Data & Types](#data--types)
- [Function Design](#function-design)
- [State Management](#state-management)
- [Control Flow](#control-flow)
- [Async Handling](#async-handling)
- [Data Fetching](#data-fetching)
- [UI & Rendering](#ui--rendering)
- [Styles & Responsiveness](#styles--responsiveness)
- [Routing & Permissions](#routing--permissions)
- [Performance](#performance)
- [Security & Robustness](#security--robustness)
- [Forms & Interaction](#forms--interaction)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Accessibility (a11y)](#accessibility-a11y)
- [User Experience](#user-experience)
- [Code Quality](#code-quality)
- [Engineering](#engineering)
- [Internationalization (i18n)](#internationalization-i18n)
- [Logging & Monitoring](#logging--monitoring)
- [Dependency Management](#dependency-management)
- [Accessibility Supplement](#accessibility-supplement)
- [Documentation & Collaboration](#documentation--collaboration)
- [PR Self-Review](#pr-self-review)

---

## Naming Conventions

- [ ] Abbreviations must be approved by the team; otherwise use full words
- [ ] Constants are ALL_CAPS with underscores, semantically complete
- [ ] Functions use `verb + noun` (e.g. `sendSms`); in templates/JSX use `handle + noun + verb` (e.g. `handleSmsSend`)
- [ ] Use words like `for`, `by`, `from`, `when`, `then` to express function intent

## Data & Types

- [ ] Check data existence and type at boundaries: API responses, user input, route params, local cache, third-party SDK callbacks
- [ ] Minimize unnecessary type coercion — analyze why data isn't the expected type instead of converting
- [ ] Distinguish between "missing", "empty", "0", "empty array", and "empty string" in business terms
- [ ] In boolean expressions, clarify whether `false`, `0`, `''` are semantically equivalent to `null`/`undefined`
- [ ] Avoid `any` in TypeScript; define types and interfaces properly
- [ ] Prefer `interface` for object shapes; use `type` for unions and complex compositions
- [ ] All function parameters and return values should have explicit types; avoid implicit `any`
- [ ] Use union types, generics, and type guards to express real constraints instead of bypassing the type system
- [ ] Declare data objects in the smallest possible scope

## Function Design

- [ ] Be liberal in what you accept, strict in what you return
- [ ] Keep splitting functions until each does one thing and can be described in one sentence
- [ ] Return values must be clear and consistent — never mix sync and async results in one function
- [ ] Use object parameters when a function takes more than 3 arguments
- [ ] Avoid boolean parameters; use objects instead
- [ ] Hook functions should only contain calls, not logic
- [ ] Don't prematurely abstract repeated business code — it may be coincidence, not duplication

## State Management

- [ ] Distinguish server state from client state; don't copy API data into multiple states unnecessarily
- [ ] Don't store derived state that can be reliably computed
- [ ] State updates must be immutable — never mutate existing objects or arrays directly
- [ ] State origin, update path, and consumption scope must be clear; avoid implicit cross-component sharing
- [ ] Centralize complex state into reducers, state machines, or dedicated state management solutions

## Control Flow

- [ ] Handle error cases first, then normal business logic
- [ ] Maximum three levels of nesting for conditions and loops
- [ ] Order checks from broad to narrow: permissions → data permissions → business logic
- [ ] Add parentheses in complex boolean expressions for readability
- [ ] Always use `{ }` for `if`, `else`, `for`, `while`, `do`, `switch`, `try`, `catch`, `finally` bodies
- [ ] Watch for off-by-one errors; always distinguish `<=` from `<`
- [ ] Prefer early-terminating loops: `some`, `every`, `find` (note: `some` returns `false` and `every` returns `true` for empty arrays)

## Async Handling

- [ ] Don't mix synchronous and asynchronous data in the same statement
- [ ] Always handle exceptions in async code; Promises must settle via `resolve` or `reject` to avoid hanging
- [ ] Never use `setTimeout` to work around async issues — it creates hard-to-reproduce bugs

## Data Fetching

- [ ] Every request should handle: loading, empty, failure, retry, and cancellation
- [ ] Avoid duplicate requests caused by re-renders, route changes, or dependency updates
- [ ] Handle race conditions in concurrent requests — prevent stale responses from overwriting newer state
- [ ] Distinguish API errors from business errors; don't rely solely on HTTP status codes
- [ ] Normalize, provide fallbacks, and handle field compatibility before API responses reach the UI

## UI & Rendering

- [ ] Avoid manual DOM manipulation
- [ ] Avoid inline styles; pass class names instead of style objects when possible
- [ ] Use `forEach` instead of `map` when no return value is needed
- [ ] Never modify data inside render functions
- [ ] Never create random values in render functions (`Math.random()`, `Date.now()`)
- [ ] Never make network requests inside render functions
- [ ] Never create new components inside render — React will repeatedly destroy and recreate the subtree
- [ ] Put each prop on its own line for readability

## Styles & Responsiveness

- [ ] Pages must work across common mobile, tablet, and desktop sizes
- [ ] Long text, large numbers, empty data, and extreme values must not break layouts
- [ ] Use design tokens or shared conventions for styles; avoid scattered magic colors and sizes
- [ ] Cover all interaction states: hover, focus, active, disabled, loading
- [ ] Components should not depend on accidental styles from parent pages

## Routing & Permissions

- [ ] Consider page permissions, action permissions, and data permissions separately
- [ ] Handle direct URL access, page refresh, session expiry, and permission changes gracefully
- [ ] Validate route params — never assume they are valid
- [ ] Show distinct states for: unauthorized, no data, resource not found

## Performance

- [ ] Avoid querying large arrays; use `Object`, `Map`, or `Set` instead
- [ ] Avoid deep recursion over large datasets
- [ ] Be lazy — don't fetch or process data until necessary
- [ ] Don't optimize without a confirmed performance bottleneck
- [ ] Lazy-load images and resources to reduce initial page load
- [ ] Use code splitting, memoization, and virtualization for heavy components, lists, and large dependencies
- [ ] Control initial bundle size; monitor build output, dependency size, and critical path resources
- [ ] Avoid frequent DOM operations or layout thrashing inside loops

## Security & Robustness

- [ ] Validate all user and external input against business rules
- [ ] Add length, format, range, and required constraints to inputs
- [ ] Sanitize/filter values passed to HTML tags and attributes to prevent XSS
- [ ] Never store sensitive data on the frontend (store tokens in httpOnly cookies, not localStorage)
- [ ] Regularly audit third-party dependencies for vulnerabilities (`npm audit`)
- [ ] Always clear timers and event listeners to prevent memory leaks
- [ ] Follow lifecycle discipline: create on init, clean up before destroy
- [ ] Fix bugs by addressing root causes, not just symptoms
- [ ] Be alert to API call frequency changes, especially low-frequency becoming high-frequency

## Forms & Interaction

- [ ] Frontend validation rules must match backend constraints
- [ ] Submit buttons must handle: submitting, success, failure, and duplicate submission prevention
- [ ] Form errors should point to specific fields, not just show a generic message
- [ ] Dangerous actions require confirmation dialogs or undo mechanisms
- [ ] Users should receive clear feedback after every action

## Error Handling

- [ ] Add error boundaries to critical modules to prevent local errors from crashing the whole page
- [ ] Integrate an error reporting system so production exceptions are visible and traceable
- [ ] Preserve context when catching errors: endpoint, params, user action path, environment
- [ ] Never swallow exceptions — unhandled errors should be rethrown or routed to a central handler

## Testing

- [ ] Core business logic must have unit test coverage
- [ ] Component tests should focus on behavior, not implementation details
- [ ] Critical flows need integration or end-to-end test coverage
- [ ] When fixing a bug, write a test that reproduces it first
- [ ] Tests must cover: normal, error, edge, permission, and empty-data scenarios

## Accessibility (a11y)

- [ ] Interactive elements (buttons, links) must have readable text or `aria-label`
- [ ] Images must have `alt` attributes
- [ ] Form controls must have associated `label` elements
- [ ] Core operations must be completable via keyboard
- [ ] Text, backgrounds, and status colors must meet minimum contrast requirements

## User Experience

- [ ] Use declarative sentences in user-facing messages; avoid filler words and slang
- [ ] Error messages should explain what happened and what the user can do next
- [ ] Empty states must provide clear meaning and an actionable next step
- [ ] Avoid asking users to re-enter information they've already provided
- [ ] Irreversible actions (delete, leave, overwrite, submit) must be protected against accidental triggers

## Code Quality

- [ ] Replace magic numbers with named constants
- [ ] Self-review your PR before submitting — don't rely on others to catch basic mistakes
- [ ] Default to `const`; only use `let` when reassignment is needed
- [ ] Use destructuring to improve readability, not for style's sake
- [ ] Comments should explain WHY: data structure design > non-obvious business logic > regular functions; no insults in comments
- [ ] Delete unused code instead of commenting it out
- [ ] Avoid default exports
- [ ] Minimize unnecessary imports; use tree-shakeable imports from large libraries
- [ ] Pin dependency versions in `package.json`; avoid `^` and `~`
- [ ] Wrap third-party tools in a thin abstraction layer to reduce future migration cost
- [ ] Don't copy code carelessly; if you must, type it out to understand every line
- [ ] Use modern language features to improve robustness
- [ ] Enforce a per-file line limit (team-defined)
- [ ] Business logic must not rely on implicit language behavior

## Engineering

- [ ] Pass formatting, linting, type checking, and relevant tests before committing
- [ ] Explain dependency changes and check size, security, maintenance status, and license
- [ ] Environment variables, build config, and proxy settings must not be tied to local environments
- [ ] New scripts, configs, and directories must follow existing project naming conventions
- [ ] Automate checks in CI rather than relying on manual review

## Internationalization (i18n)

- [ ] Never hardcode copy — route all strings through a translation function
- [ ] Format dates, numbers, and currencies according to locale; don't concatenate manually
- [ ] Avoid constructing sentences by string concatenation — word order varies by language
- [ ] Don't embed text in images or icons

## Logging & Monitoring

- [ ] Key business actions (payments, submissions, permission changes) must be tracked
- [ ] Never log sensitive information to the console in production
- [ ] Frontend performance metrics (LCP, FID, CLS) should be observable
- [ ] Error reports should distinguish business exceptions from program exceptions

## Dependency Management

- [ ] Before adding a dependency, check if the project already has equivalent capability
- [ ] Avoid libraries that are no longer maintained
- [ ] Check license compatibility (GPL libraries cannot be used freely in commercial products)
- [ ] Prefer tree-shakeable imports for large dependencies to avoid bundling everything

## Accessibility Supplement

- [ ] Dynamic content changes should notify screen readers via `aria-live`
- [ ] When a modal opens, focus should move into it; when it closes, focus should return to the trigger
- [ ] Color must not be the only means of conveying information

## Documentation & Collaboration

- [ ] Complex components and functions should include usage examples
- [ ] Breaking changes (API, props, event names) must be explicitly noted in the PR
- [ ] Public API changes must be communicated to downstream consumers

## PR Self-Review

- [ ] Are loading, empty, failure, retry, and unauthorized states handled?
- [ ] Are invalid inputs, edge cases, and missing API fields handled?
- [ ] Are there duplicate requests, redundant renders, memory leaks, or race conditions?
- [ ] Does this affect existing pages, routes, permissions, analytics, API contracts, or caches?
- [ ] Are tests added or updated as needed?
- [ ] Does documentation, config, examples, or migration notes need updating?
