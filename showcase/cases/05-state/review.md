---
id: 05-state
title_zh: 用户表格：派生状态与数据冗余
title_en: User Table - derived state and data duplication
stack: React + TypeScript
groups: [状态管理, 数据请求, 数据与类型, UI 与渲染, 错误处理, 安全与健壮性, 代码质量]
severity: high
---

## 命中问题（共 11 项）

### 数据请求
- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/05-state/bad.tsx:19-29`
  - 现状：`fetch('/api/users')` 未处理 loading、错误、空数据、重试，也没有取消逻辑，`.then` 链缺少 `catch`。
  - 建议：引入 `loading/error` 状态并捕获异常；组件卸载时通过 `AbortController` 取消请求。
    ```tsx
    const ctrl = new AbortController();
    fetch('/api/users', { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(setUsers)
      .catch(setError);
    return () => ctrl.abort();
    ```

- **明确接口错误和业务错误的处理方式，不要只判断 HTTP 状态码**
  - 位置：`showcase/cases/05-state/bad.tsx:47-53`
  - 现状：`onDelete` 直接乐观更新本地列表，未 `await` 请求结果，也没有处理失败回滚和并发删除。
  - 建议：`await` 删除结果，失败时回滚并提示用户；必要时禁用按钮防重复点击。

### 状态管理
- **不存储可以稳定计算得到的派生状态**
  - 位置：`showcase/cases/05-state/bad.tsx:7-12`
  - 现状：`userCount`、`adminCount`、`filteredUsers`、`sortedUsers`、`selectedUser` 都是可由 `users/keyword/sortKey/selectedId` 派生的状态，冗余存储导致多处需要手动同步。
  - 建议：用 `useMemo` 直接派生，删除这些 state。
    ```tsx
    const userCount = users.length;
    const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users]);
    const sortedUsers = useMemo(() => [...users.filter(...)].sort(...), [users, keyword, sortKey]);
    const selectedUser = users.find(u => u.id === selectedId) ?? null;
    ```

- **区分服务端状态和客户端状态，避免把接口数据无意义地复制到多个状态中**
  - 位置：`showcase/cases/05-state/bad.tsx:23-27`
  - 现状：一次接口响应被复制到 `users`、`filteredUsers`、`sortedUsers` 三个 state，后续更新需要分别同步，极易不一致。
  - 建议：仅保留 `users` 作为数据源，其他视图层数据通过派生得到。

- **状态的来源、更新路径和消费范围要清晰，避免跨组件隐式共享**
  - 位置：`showcase/cases/05-state/bad.tsx:31-45`
  - 现状：用多个 `useEffect` 级联同步派生状态，形成"state -> effect -> setState"的链式更新，渲染路径难以追踪且会多触发一次渲染。
  - 建议：删除这些 effect，用 `useMemo`/直接计算替代，保证单向数据流。

### 数据与类型
- **在数据边界处（接口响应、用户输入、路由参数、本地缓存、第三方 SDK 回调）检查数据是否存在及类型**
  - 位置：`showcase/cases/05-state/bad.tsx:20-22`
  - 现状：`r.json()` 结果直接断言为 `User[]`，未校验字段和数组结构；`r.ok` 也未判断，非 2xx 会把错误响应当作数据。
  - 建议：先校验 `r.ok`，再用运行时守卫（如 `zod` 或手写判断）校验返回结构，不合法时走错误分支。

- **使用 TypeScript 时避免 `any`，合理定义类型和接口**
  - 位置：`showcase/cases/05-state/bad.tsx:61`
  - 现状：`e.target.value as any` 绕过类型系统，失去排序键的枚举约束。
  - 建议：`setSortKey(e.target.value as 'name' | 'createdAt')` 或抽成类型常量并对 `value` 做校验。

### UI 与渲染
- **不在渲染函数中创建随机值（`Math.random()`、`Date.now()`）**（延伸为不直接读取可变外部状态）
  - 位置：`showcase/cases/05-state/bad.tsx:15-17`
  - 现状：`useState` 初始化时直接读 `location.search`，SSR 场景会 ReferenceError；并且 URL 变化后 `page` 不会同步。
  - 建议：在 `useEffect` 中读取/订阅 URL；SSR 下需判断 `typeof window !== 'undefined'`。若只在 CSR 使用请在 PR 描述中说明原因。

### 错误处理
- **不要吞掉异常，无法处理的错误应继续抛出或进入统一错误处理**
  - 位置：`showcase/cases/05-state/bad.tsx:20-28,48`
  - 现状：`fetch` 链和 `onDelete` 都没有 `catch`，网络错误或 JSON 解析错误会变成 unhandled promise rejection。
  - 建议：补充 `.catch` 或 `try/await`，统一上报并提示用户。

### 安全与健壮性
- **定时器和事件监听记得清除，否则可能引发内存泄漏；注重事物生命周期**
  - 位置：`showcase/cases/05-state/bad.tsx:19-29`
  - 现状：组件卸载时未取消 in-flight `fetch`，若卸载后请求返回会触发 `setState`，导致 React 警告和潜在竞态。
  - 建议：使用 `AbortController` 并在 cleanup 中 `abort()`；或用 `ignore` 标志位守卫 `setState`。

### 代码质量
- **优先使用 `const`，直到变量需要改变时再用 `let`；解构优先用于提升可读性**
  - 位置：`showcase/cases/05-state/bad.tsx:32-35`
  - 现状：`f`、`s`、`u` 等单字母命名削弱可读性，且与 `filteredUsers/sortedUsers` 概念重复。
  - 建议：删除这些中间变量（随派生状态一起移除），保留时改为 `filtered`、`sorted` 等语义化命名。
