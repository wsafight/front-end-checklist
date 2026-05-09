---
id: 01-xss
title_zh: 评论列表：XSS 与未校验数据
title_en: Comment List - XSS and unvalidated data
stack: React + TypeScript
groups: [安全与健壮性, 数据与类型, 函数设计, UI 与渲染, 数据请求, 无障碍访问（a11y）, 控制流]
severity: high
---

## 命中问题（共 11 项）

### 安全与健壮性
- **HTML 标签和属性操作必须限定/过滤传入变量值，防止 XSS**
  - 位置：`showcase/cases/01-xss/bad.tsx:35`
  - 现状：直接把外部传入的 `props.tip` 塞进 `dangerouslySetInnerHTML`，未做任何转义或白名单过滤，攻击者可注入任意脚本。
  - 建议：默认用文本渲染 `<div id="tip">{props.tip}</div>`；确需富文本时用 DOMPurify 清洗后再注入，例如 `__html: DOMPurify.sanitize(props.tip)`。

- **HTML 标签和属性操作必须限定/过滤传入变量值，防止 XSS**
  - 位置：`showcase/cases/01-xss/bad.tsx:44`
  - 现状：`highlight` 用字符串拼接生成 HTML 后经 `dangerouslySetInnerHTML` 渲染，`c.body` 与 `keyword` 均未转义，存在存储型与反射型 XSS。
  - 建议：改为安全的分段渲染，不使用 `dangerouslySetInnerHTML`，例如用 `String.split` 后把命中段包到 `<mark>`：
    ```tsx
    const parts = body.split(new RegExp(`(${escapeReg(kw)})`, 'g'));
    return parts.map((p, i) => p.toLowerCase() === kw.toLowerCase() ? <mark key={i}>{p}</mark> : p);
    ```

- **所有用户输入和外部输入都应基于业务规则进行验证**
  - 位置：`showcase/cases/01-xss/bad.tsx:39`
  - 现状：使用 `eval(c.author.onClick)` 执行接口返回的字符串，等同于把远端数据当代码执行，RCE 风险极高。
  - 建议：彻底删除 `eval`；交互行为由前端静态定义，后端最多返回枚举 action 类型，前端根据类型映射到本地函数。

- **所有用户输入和外部输入都应基于业务规则进行验证**
  - 位置：`showcase/cases/01-xss/bad.tsx:39`
  - 现状：`href={'javascript:void(0)'}` 同时配合 onClick，既是 XSS 协议面，也会被 CSP 拦截。
  - 建议：用 `<button type="button" onClick={...}>` 语义化替代；需要链接时用真实 URL 并校验协议白名单（http/https）。

- **所有用户输入和外部输入都应基于业务规则进行验证**
  - 位置：`showcase/cases/01-xss/bad.tsx:38`
  - 现状：`<img src={c.avatar} />` 未校验 URL 协议，`javascript:` 或 `data:text/html` 可能被某些场景利用，也无 `alt`、错误兜底。
  - 建议：校验协议为 http/https，提供占位图与 `onError` 兜底，并补 `alt`。

### 数据请求
- **处理并发请求的竞态问题，避免旧响应覆盖新状态**
  - 位置：`showcase/cases/01-xss/bad.tsx:14-20`
  - 现状：`props.topic` 变化时发起新请求但没有取消/忽略旧请求，旧响应后到会覆盖新数据。
  - 建议：使用 `AbortController` 或 `ignore` 标志，在 effect cleanup 中置位：
    ```tsx
    let ignore = false;
    fetch(...).then(r => r.json()).then(d => { if (!ignore) setList(d.data); });
    return () => { ignore = true; };
    ```

- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/01-xss/bad.tsx:14-20`
  - 现状：没有 loading、error、空态处理；`r.json()` 失败或 `d.data` 缺失会直接抛未捕获异常。
  - 建议：引入 `loading/error` 状态，`.catch` 兜底，渲染时分别展示加载中、错误、空列表。

### 数据与类型
- **使用 TypeScript 时避免 `any`，合理定义类型和接口**
  - 位置：`showcase/cases/01-xss/bad.tsx:4,10,11,22,27`
  - 现状：`author: any`、`props: any`、`useState([] as any)`、`e: any`、`highlight` 参数无类型，绕过类型系统。
  - 建议：为 `props`、`Comment.author`、事件对象 `React.ChangeEvent<HTMLInputElement>`、`useState<Comment[]>([])` 补全类型。

### 函数设计
- **宽入严出：对接受的数据宽容，对输出的数据严格**
  - 位置：`showcase/cases/01-xss/bad.tsx:39,44`
  - 现状：直接访问 `c.author.name`、`c.author.onClick`、`c.body`，接口字段缺失会直接崩；`highlight` 未在 kw 含正则特殊字符时转义，`new RegExp(kw)` 可能抛错。
  - 建议：在进入渲染前对 `list` 做归一化（可选链 + 默认值），并对 `kw` 做 `escapeRegExp` 再构造正则。

### 控制流
- **优先处理异常情况，再处理正常业务逻辑**
  - 位置：`showcase/cases/01-xss/bad.tsx:17-19`
  - 现状：`.then` 直接 `setList(d.data)`，未校验 `d` 与 `d.data` 是否存在、是否为数组。
  - 建议：先判空/判类型再 set，异常分支走错误提示：`if (!Array.isArray(d?.data)) { setError(...); return; }`。

### UI 与渲染
- **不在渲染中创建新组件，否则 React 会反复销毁并重建子组件树**（相近项：列表 key 使用稳定业务 id）
  - 位置：`showcase/cases/01-xss/bad.tsx:37`
  - 现状：`key={i}` 使用数组下标做 key，列表增删/重排时会导致错位和不必要重建。
  - 建议：用业务稳定的 `c.id` 作为 key：`<div key={c.id} ...>`。

### 无障碍访问（a11y）
- **图片必须有 `alt` 属性；表单控件必须有对应的 `label`**
  - 位置：`showcase/cases/01-xss/bad.tsx:34,38`
  - 现状：搜索 `<input>` 无 `label`/`aria-label`；`<img>` 无 `alt`。
  - 建议：给 input 加 `aria-label="搜索评论"`；给 img 加 `alt={c.author?.name ?? '用户头像'}`。
