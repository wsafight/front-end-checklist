---
id: 02-race
title_zh: 用户资料页：竞态与未清理副作用
title_en: User Profile - race condition and leaked effects
stack: React + TypeScript
groups: [异步处理, 数据请求, 错误处理, 安全与健壮性, 数据与类型, UI 与渲染]
severity: high
---

## 命中问题（共 12 项）

### 数据请求
- **处理并发请求的竞态问题，避免旧响应覆盖新状态**
  - 位置：`showcase/cases/02-race/bad.tsx:9-25`
  - 现状：`userId` 变化时新旧请求并发，慢到的旧响应会覆盖新 `user`/`posts`，且 `onRefresh` 与定时器之间也可能相互覆盖。
  - 建议：用 `AbortController` 或本地 `ignore` 标志在 effect cleanup 中丢弃过期响应。
    ```tsx
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })...
    return () => ctrl.abort();
    ```

- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/02-race/bad.tsx:35-40`
  - 现状：`onRefresh` 既没有 loading/error 状态，也没有失败重试和取消逻辑。
  - 建议：统一走 `setLoading/setErr` 路径，失败时回退到上次有效数据并提示用户重试。

- **明确接口错误和业务错误的处理方式，不要只判断 HTTP 状态码**
  - 位置：`showcase/cases/02-race/bad.tsx:12,16,29,36,38`
  - 现状：所有 `fetch` 都直接 `r.json()`，未检查 `r.ok`，500/404 会被当成成功数据继续渲染。
  - 建议：封装 `request()`，统一校验 `r.ok` 和业务 `code` 字段后再返回数据。

### 安全与健壮性
- **定时器和事件监听记得清除，否则可能引发内存泄漏**
  - 位置：`showcase/cases/02-race/bad.tsx:27-33`
  - 现状：`setInterval` 没有返回 cleanup，组件卸载后仍每 3 秒请求一次，且 `userId` 变化会叠加多个定时器。
  - 建议：在 effect 中 `return () => clearInterval(t);`，并在请求回调中判断组件是否仍挂载。

- **注重事物生命周期：初始化时创建，结束前清理**
  - 位置：`showcase/cases/02-race/bad.tsx:9-33`
  - 现状：两个 effect 都缺少 cleanup，卸载后仍可能 `setUser/setPosts`，触发 "setState on unmounted component" 与内存泄漏。
  - 建议：统一 `AbortController` + cleanup 模式，卸载时中止所有在途请求与定时器。

### 异步处理
- **异步处理要考虑异常；Promise 必须通过 resolve 或 reject 进入下一状态，避免卡死**
  - 位置：`showcase/cases/02-race/bad.tsx:15-20`
  - 现状：内层 `fetch('/api/posts...')` 没有 `.catch`，且失败时 `setLoading(false)` 不会执行，loading 永远卡住。
  - 建议：改用 `async/await + try/catch/finally`，在 `finally` 中关闭 loading。

- **不在同一语句中混用同步数据和异步数据**
  - 位置：`showcase/cases/02-race/bad.tsx:13-20`
  - 现状：在 `setUser(u)` 后立即使用 `u.id` 发起下一次请求，外层 `.catch` 无法覆盖内层失败，流程难以推理。
  - 建议：拆成 `const u = await getUser(); const p = await getPosts(u.id);` 并集中处理异常。

### 错误处理
- **不要吞掉异常，无法处理的错误应继续抛出或进入统一错误处理**
  - 位置：`showcase/cases/02-race/bad.tsx:22-24,27-33,35-40`
  - 现状：外层 `catch` 后 loading 不会关闭；定时器与 `onRefresh` 完全无 `catch`，错误被静默丢弃。
  - 建议：统一 `try/catch/finally`，把错误送入 `setErr` 或全局错误上报。

- **捕获错误时保留必要上下文：接口、参数、用户操作路径和环境信息**
  - 位置：`showcase/cases/02-race/bad.tsx:22-24`
  - 现状：`setErr(e.message)` 丢失了接口 URL、userId、HTTP 状态等上下文。
  - 建议：记录 `{ url, userId, status, message }` 并上报；UI 上展示用户可理解的文案。

### 数据与类型
- **使用 TypeScript 时避免 any，合理定义类型和接口**
  - 位置：`showcase/cases/02-race/bad.tsx:4-5,13,17,31,49`
  - 现状：`user`、`posts`、fetch 回调参数、`map` 回调全部用 `any`，类型系统完全失效。
  - 建议：定义 `interface User { id: string; name: string; followers: number; online?: boolean }` 与 `interface Post { id: string; title: string }`，并给 state 指定类型。

- **在数据边界处（接口响应、用户输入、路由参数、本地缓存、第三方 SDK 回调）检查数据是否存在及类型**
  - 位置：`showcase/cases/02-race/bad.tsx:15`
  - 现状：直接使用 `u.id` 拼接 URL，未校验 `u` 是否为对象、`id` 是否存在或是否为合法字符串，也未对 `userId` 做 `encodeURIComponent`。
  - 建议：先判空再使用，URL 参数用 `encodeURIComponent(u.id)` 或改走 query builder。

### UI 与渲染
- **每个请求都应考虑加载中、空数据、失败、重试和取消场景（渲染侧）**
  - 位置：`showcase/cases/02-race/bad.tsx:42-54`
  - 现状：`user` 初始为 `null`，但渲染直接访问 `user.name`、`user.followers`，首次渲染即崩溃；`err` 也未在 UI 中展示；`posts` 空数组无空状态。
  - 建议：加空值守卫 `if (!user) return <Skeleton />`，并渲染 `err` 与 posts 空状态。
