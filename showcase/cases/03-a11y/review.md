---
id: 03-a11y
title_zh: 注册表单：无障碍与表单交互
title_en: Signup Form - accessibility and form UX
stack: React + TypeScript
groups: [无障碍访问（a11y）, 表单与交互, UI 与渲染, 数据请求, 安全与健壮性, 错误处理, 用户体验, 国际化（i18n）, 命名规范]
severity: high
---

## 命中问题（共 17 项）

### 安全与健壮性
- **所有用户输入和外部输入都应基于业务规则进行验证**
  - 位置：`showcase/cases/03-a11y/bad.tsx:9-22`
  - 现状：`submit` 仅判断邮箱/密码是否为空字符串与年龄 >= 18，未校验邮箱格式、密码强度、年龄是否为合法数字。
  - 建议：使用正则或 schema 库（如 zod/yup）校验邮箱格式，密码长度/复杂度，并对 `age` 先用 `Number.isFinite` 判断后再比较。
- **输入框根据业务添加长度、格式、范围、必填等限制**
  - 位置：`showcase/cases/03-a11y/bad.tsx:32-47`
  - 现状：密码 input 未设置 `type="password"`，明文显示；年龄 input 未限制为数字类型与范围；所有 input 都无 `maxLength`、`required`、`autoComplete`。
  - 建议：分别设置 `type="email"`、`type="password"`、`type="number" min="0" max="120"`，加上 `required`、`maxLength`、`autoComplete="email|new-password"`。

### 数据请求
- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/03-a11y/bad.tsx:18-21`
  - 现状：`fetch` 未 await、未处理 loading、未处理 error、未处理响应内容，也没有取消机制。
  - 建议：加 `submitting` state 禁用按钮，`try/catch` 捕获网络异常，配合 `AbortController` 在组件卸载时取消请求。
- **明确接口错误和业务错误的处理方式，不要只判断 HTTP 状态码**
  - 位置：`showcase/cases/03-a11y/bad.tsx:18-21`
  - 现状：完全未检查 `response.ok` 或业务错误码，请求失败也会被静默忽略。
  - 建议：await fetch 后判断 `res.ok` 并解析 body，按业务错误码展示不同提示。
- **避免重复请求，尤其是组件重复渲染、路由切换、依赖变化导致的请求放大**
  - 位置：`showcase/cases/03-a11y/bad.tsx:50-52`
  - 现状：提交按钮无 disabled 状态，用户连点会触发多次注册请求。
  - 建议：在请求发起时将按钮置为 disabled，请求结束再恢复。

### 错误处理
- **不要吞掉异常，无法处理的错误应继续抛出或进入统一错误处理**
  - 位置：`showcase/cases/03-a11y/bad.tsx:18-21`
  - 现状：`fetch` 未 `.catch`，网络错误或 reject 会变成未处理 Promise 异常被静默吞掉。
  - 建议：使用 `try/catch` + `await`，在 catch 中 `setErr` 并上报监控。

### 无障碍访问（a11y）
- **交互元素（按钮、链接）必须有可读文本或 `aria-label`**
  - 位置：`showcase/cases/03-a11y/bad.tsx:26-28,50-52,54-59`
  - 现状：「返回」「提交」「关闭(x)」均用 `<div onClick>` 实现，非语义化、不可聚焦、屏幕阅读器无法识别，且 `x` 没有 `aria-label="关闭"`。
  - 建议：改用 `<button type="button">` 并为纯图标按钮加 `aria-label`，如 `<button aria-label="关闭">×</button>`。
- **表单控件必须有对应的 `label`**
  - 位置：`showcase/cases/03-a11y/bad.tsx:30-48`
  - 现状：邮箱/密码/年龄都用 `<div>文案</div>` 代替 `<label>`，未与 input 关联。
  - 建议：改为 `<label htmlFor="email">邮箱</label><input id="email" ... />`，或嵌套 label 包裹 input。
- **图片必须有 `alt` 属性**
  - 位置：`showcase/cases/03-a11y/bad.tsx:53`
  - 现状：`<img src="/decorate.png" />` 无 `alt`。
  - 建议：装饰性图片写 `alt=""` 并加 `role="presentation"`，有含义的写具体 alt。
- **页面可通过键盘完成核心操作**
  - 位置：`showcase/cases/03-a11y/bad.tsx:26,50,54`
  - 现状：`<div onClick>` 不在 Tab 顺序中，回车/空格也不能触发，键盘用户无法返回、提交、关闭。
  - 建议：改用 `<button>` 原生支持键盘；若必须用 div 需加 `role="button"` + `tabIndex={0}` + 键盘事件。
- **颜色不能作为传递信息的唯一手段**
  - 位置：`showcase/cases/03-a11y/bad.tsx:49`
  - 现状：错误提示仅用红色文本表示，色弱用户无法区分；也未使用 `role="alert"` / `aria-live`。
  - 建议：加图标或前缀文案（如 "错误："）并加 `role="alert"` 让屏幕阅读器播报。
- **动态内容变化应通知屏幕阅读器（`aria-live`）**
  - 位置：`showcase/cases/03-a11y/bad.tsx:49`
  - 现状：错误消息动态插入 DOM 时未使用 aria-live 区域，屏幕阅读器不会播报。
  - 建议：`<div role="alert" aria-live="assertive" style={{color:'red'}}>{err}</div>`。

### 表单与交互
- **提交按钮应处理提交中、成功、失败和防重复提交状态**
  - 位置：`showcase/cases/03-a11y/bad.tsx:50-52`
  - 现状：仅有一个静态「提交」div，无 loading/disabled/成功态。
  - 建议：新增 `submitting` 状态控制按钮 disabled 与文案，成功后给用户反馈。
- **表单错误应定位到具体字段，而不是只给出笼统提示**
  - 位置：`showcase/cases/03-a11y/bad.tsx:10-16,49`
  - 现状：无论哪个字段缺失都只显示「请填写」；年龄错误也只展示在全局位置。
  - 建议：用 `errors: { email?: string; pwd?: string; age?: string }` 结构，在对应字段下方展示错误并 `aria-describedby` 关联。
- **用户操作后应有明确反馈，避免用户不知道操作是否生效**
  - 位置：`showcase/cases/03-a11y/bad.tsx:18-22`
  - 现状：fetch 未 await 也无成功提示，用户点击后不知道是否成功。
  - 建议：await 请求结果后展示成功态或跳转，失败时展示错误提示。

### UI 与渲染
- **轻易不要手动操作 DOM**
  - 位置：`showcase/cases/03-a11y/bad.tsx:56`
  - 现状：通过 `document.getElementById('modal')!.style.display = 'none'` 直接操作 DOM，绕过 React 状态；且使用非空断言，若元素不存在会运行时崩溃。
  - 建议：用 React state 管理模态框可见性，如 `setModalOpen(false)`。
- **尽量不使用行内样式**
  - 位置：`showcase/cases/03-a11y/bad.tsx:49`
  - 现状：错误文本用 `style={{ color: 'red' }}` 行内样式，未走设计变量。
  - 建议：提取为 `className="error-text"` 并在样式文件中集中定义颜色。

### 用户体验
- **错误提示应说明发生了什么，以及用户下一步可以做什么**
  - 位置：`showcase/cases/03-a11y/bad.tsx:11,15`
  - 现状：「请填写」「年龄不够」过于笼统，未说明哪个字段、应该填什么。
  - 建议：改为「请填写邮箱」「年龄需 ≥ 18 岁才能注册」等具体可执行文案。

### 国际化（i18n）
- **文案不硬编码，统一走翻译函数**
  - 位置：`showcase/cases/03-a11y/bad.tsx:11,15,27,29,31,39,43,51,58`
  - 现状：「返回」「注册」「邮箱」「密码」「年龄」「提交」「请填写」「年龄不够」均为硬编码中文。
  - 建议：抽到 i18n 资源，如 `t('signup.email')`，便于未来多语言扩展。

### 命名规范
- **变量缩写必须得到团队认可，否则使用完整单词**
  - 位置：`showcase/cases/03-a11y/bad.tsx:5,7`
  - 现状：`pwd`、`err` 使用非通用缩写。
  - 建议：改为 `password`、`error` 等完整词。
