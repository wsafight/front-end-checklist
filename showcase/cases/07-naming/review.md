---
id: 07-naming
title_zh: 列表组件：命名与代码质量
title_en: List - naming and code quality
stack: React + TypeScript
groups: [命名规范, 代码质量, 控制流, 异步处理, 函数设计, 数据与类型]
severity: low
---

## 命中问题（共 10 项）

### 异步处理
- **不用 `setTimeout` 解决异步问题，这会制造难以复现的 bug**
  - 位置：`showcase/cases/07-naming/bad.tsx:30`
  - 现状：`smsSendHandle` 用 `setTimeout(..., t)` 模拟/延迟发送短信，既非真实异步请求，也没有清理定时器。
  - 建议：改为真实异步调用并在组件卸载时取消，例如 `await sendSms(u.e)`，或在 `useEffect` 中保存 timer 并 `clearTimeout`。

### 命名规范
- **变量缩写必须得到团队认可，否则使用完整单词**
  - 位置：`showcase/cases/07-naming/bad.tsx:3`、`6`、`8`、`9`、`10`、`12`、`17`、`21`
  - 现状：`t`、`Usr`、`Lst`、`k`、`ck`、`doIt`、`chk`、`handle`、`x` 等大量单字母/无意义缩写，阅读时无法推断含义。
  - 建议：改为完整语义命名，如 `DEBOUNCE_MS`、`User`、`UserList`、`keyword`、`expanded`、`truncateName`、`isValidEmail`、`toggleExpanded`、`user`。

- **函数命名用 `动词 + 名词`（如 `sendSms`）；模板/JSX 中用 `handle + 名词 + 动词`（如 `handleSmsSend`）**
  - 位置：`showcase/cases/07-naming/bad.tsx:29`、`21`
  - 现状：`smsSendHandle` 词序颠倒；`handle` 作为切换函数名缺少动作对象。
  - 建议：业务函数命名 `sendSms(user)`，JSX 事件处理器命名 `handleSmsSend`；切换函数命名 `handleToggleExpanded`。

- **常量全大写，单词间用下划线分隔，语义完整清晰**
  - 位置：`showcase/cases/07-naming/bad.tsx:3`
  - 现状：`const t = 300` 既用单字母又无单位语义。
  - 建议：改为 `const SEND_DELAY_MS = 300` 或明确其真实用途。

### 代码质量
- **避免魔法数字，用命名常量替代**
  - 位置：`showcase/cases/07-naming/bad.tsx:13`
  - 现状：`u.n.length > 10` 与 `slice(0, 10)` 直接散落在函数体内，`10` 没有语义。
  - 建议：抽出 `const NAME_MAX_LENGTH = 10;`，并在 `truncateName` 中复用该常量。

- **尽量不使用默认导出**
  - 位置：`showcase/cases/07-naming/bad.tsx:8`
  - 现状：此处为命名导出，符合要求；但类型 `Usr` 未导出且命名过短，不便于复用（若刻意为之请在 PR 描述中说明原因）。
  - 建议：将类型重命名为 `User` 并考虑按需 `export`。

### 函数设计
- **钩子函数中只写调用，不写具体逻辑**
  - 位置：`showcase/cases/07-naming/bad.tsx:21-27`
  - 现状：`handle` 内用 `if/else` 手动翻转布尔值，逻辑冗长且不体现意图。
  - 建议：简化为 `const handleToggleExpanded = () => setExpanded((v) => !v);`。

### 控制流
- **优先处理异常情况，再处理正常业务逻辑**
  - 位置：`showcase/cases/07-naming/bad.tsx:17-19`
  - 现状：`chk` 用 `indexOf('@') > 0` 近似判断邮箱，既不处理 `undefined/空串` 异常情况，也无法识别格式错误。
  - 建议：先校验存在性与基本格式，例如 `if (!u.e) return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.e);`。

### 数据与类型
- **优先用 `interface` 描述对象结构，`type` 用于联合类型等复合场景**
  - 位置：`showcase/cases/07-naming/bad.tsx:6`
  - 现状：`type Usr = { id: number; n: string; e: string }` 是纯对象结构，却用 `type` 定义，且字段名 `n`、`e` 无语义。
  - 建议：改为 `interface User { id: number; name: string; email: string }`。

- **在数据边界处（接口响应、用户输入、路由参数、本地缓存、第三方 SDK 回调）检查数据是否存在及类型**
  - 位置：`showcase/cases/07-naming/bad.tsx:35`、`13`
  - 现状：`data.filter((x) => x.n.includes(k))` 与 `u.n.slice(0, 10)` 默认 `data`、`u.n` 非空，若上游返回 `null/undefined` 会直接抛错。
  - 建议：对 `data` 做 `(data ?? []).filter(...)`，对 `u.name` 做存在性兜底，例如 `(u.name ?? '').slice(0, NAME_MAX_LENGTH)`。
