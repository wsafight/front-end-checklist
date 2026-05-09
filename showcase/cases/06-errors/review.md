---
id: 06-errors
title_zh: 订单仪表盘：错误处理与用户反馈
title_en: Order Dashboard - error handling and user feedback
stack: React + TypeScript
groups: [错误处理, 异步处理, 数据请求, 安全与健壮性, 表单与交互, 用户体验, 数据与类型, UI 与渲染]
severity: high
---

## 命中问题（共 14 项）

### 错误处理
- **不要吞掉异常，无法处理的错误应继续抛出或进入统一错误处理**
  - 位置：`showcase/cases/06-errors/bad.tsx:19-21`
  - 现状：`loadOrders` 的 catch 分支只写了 `// ignore`，请求失败时没有任何反馈，用户看到的是空列表却无法判断是无数据还是出错。
  - 建议：至少设置错误状态并渲染错误提示，同时上报到监控；无法处理的错误应抛出到边界。
    ```tsx
    } catch (e) {
      setError(e); reportError(e);
    }
    ```

- **捕获错误时保留必要上下文：接口、参数、用户操作路径和环境信息**
  - 位置：`showcase/cases/06-errors/bad.tsx:28`、`showcase/cases/06-errors/bad.tsx:48-51`
  - 现状：`loadSummary` 的 `.catch(() => {})` 完全丢弃错误；`deleteOrder` 只做了 `console.log(e)` + `alert('出错了')`，没有接口、参数、userId 等上下文。
  - 建议：统一走错误上报函数，附带 url、method、params、userId 等字段。

- **为关键业务模块添加错误边界，避免局部错误导致整个页面崩溃**
  - 位置：`showcase/cases/06-errors/bad.tsx:64`
  - 现状：`summary.total.toFixed(2)` 在 `summary` 为 `{}`（初始值）或接口未返回 `total` 时会抛 `TypeError: Cannot read properties of undefined`，导致整个组件崩溃。
  - 建议：对 summary 做兜底（`summary?.total?.toFixed(2) ?? '-'`），并在路由层或组件外包裹 ErrorBoundary。

### 异步处理
- **异步处理要考虑异常**
  - 位置：`showcase/cases/06-errors/bad.tsx:31-36`
  - 现状：`retry` 没有 try/catch，`fetch` 或 `res.json()` 抛错会变成 unhandled rejection；同时未检查 `res.ok`，HTTP 4xx/5xx 仍然走成功分支。
  - 建议：包 try/catch，并显式判断 `if (!res.ok) throw new Error(...)`。

- **不在同一语句中混用同步数据和异步数据**（导出操作未等待异步完成就提示）
  - 位置：`showcase/cases/06-errors/bad.tsx:38-41`
  - 现状：`exportAll` 没有 `await` 就立即 `alert('导出成功')`，请求还未返回甚至失败时也会提示成功，严重误导用户。
  - 建议：`await` 响应并检查结果后再提示，失败时给出错误反馈。

### 数据请求
- **处理并发请求的竞态问题，避免旧响应覆盖新状态**
  - 位置：`showcase/cases/06-errors/bad.tsx:9-12`
  - 现状：`useEffect` 依赖 `userId`，快速切换用户时 `loadOrders`/`loadSummary` 多次触发，先发的响应可能晚到并覆盖新用户数据。
  - 建议：使用 AbortController 在 effect 清理函数中 abort，或用 ignore 标志位丢弃过期响应。
    ```tsx
    useEffect(() => {
      const ac = new AbortController();
      loadOrders(ac.signal);
      return () => ac.abort();
    }, [userId]);
    ```

- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/06-errors/bad.tsx:6-12`、`showcase/cases/06-errors/bad.tsx:67-75`
  - 现状：完全没有 loading / empty / error 状态，列表首次渲染时是空数组但无法区分"加载中"与"无订单"。
  - 建议：加入 `loading`、`error` 状态并渲染对应 UI；空数组时显示空状态提示。

- **明确接口错误和业务错误的处理方式，不要只判断 HTTP 状态码**
  - 位置：`showcase/cases/06-errors/bad.tsx:16-18`、`showcase/cases/06-errors/bad.tsx:32-34`、`showcase/cases/06-errors/bad.tsx:44`
  - 现状：所有 `fetch` 调用都没有检查 `res.ok`，也没有判断返回体里的业务 `code`/`success` 字段，HTTP 500 或 `{code:1, msg:'失败'}` 都会被当成成功。
  - 建议：统一封装 `request()`，同时处理 HTTP 状态与业务 code。

### 安全与健壮性
- **所有用户输入和外部输入都应基于业务规则进行验证 / HTML 操作必须限定传入变量值，防止 XSS**
  - 位置：`showcase/cases/06-errors/bad.tsx:16`、`showcase/cases/06-errors/bad.tsx:25`、`showcase/cases/06-errors/bad.tsx:32`、`showcase/cases/06-errors/bad.tsx:39`、`showcase/cases/06-errors/bad.tsx:44`、`showcase/cases/06-errors/bad.tsx:56`
  - 现状：`userId` 和订单 `id` 通过字符串拼接直接进入 URL，未做 encode，易被构造成 `?uid=1&admin=true` 等参数注入，也可能破坏 URL 结构。
  - 建议：使用 `encodeURIComponent(userId)`，或用 `URL` / `URLSearchParams` 构建查询串。
    ```tsx
    fetch(`/api/orders?uid=${encodeURIComponent(userId)}`)
    ```

- **解决 bug 要分析根本原因，而不只是修复表象 / 对 API 调用保持敏感**
  - 位置：`showcase/cases/06-errors/bad.tsx:54-59`
  - 现状：`batchPay` 串行 `await` 逐个调用支付接口，失败一个后面继续（无错误处理），支付属于敏感操作，部分成功/部分失败无法回溯，用户却看到"全部支付完成"。
  - 建议：优先让后端提供批量支付接口；否则记录每笔结果并汇总反馈（成功 N 笔、失败 M 笔），失败项允许重试。

### 表单与交互
- **危险操作需要二次确认或可撤销机制**
  - 位置：`showcase/cases/06-errors/bad.tsx:72`、`showcase/cases/06-errors/bad.tsx:43-52`
  - 现状：删除订单按钮点击即直接发起 DELETE 请求，无二次确认。
  - 建议：加确认弹窗（如 `window.confirm` 或自定义 Modal），或提供撤销机会。

- **提交按钮应处理提交中、成功、失败和防重复提基重复提交状态**
  - 位置：`showcase/cases/06-errors/bad.tsx:65-66`、`showcase/cases/06-errors/bad.tsx:71-72`
  - 现状：导出、一键支付、重试、删除按钮均无 loading/disabled 状态，用户连点会重复发请求，批量支付尤其危险（可能重复扣款）。
  - 建议：每个按钮维护独立 pending 状态，在请求进行中 `disabled={pending}`。

### 用户体验
- **错误提示应说明发生了什么，以及用户下一步可以做什么**
  - 位置：`showcase/cases/06-errors/bad.tsx:34`、`showcase/cases/06-errors/bad.tsx:40`、`showcase/cases/06-errors/bad.tsx:50`、`showcase/cases/06-errors/bad.tsx:58`
  - 现状：全部使用 `alert('重试结果：' + data.msg)`、`alert('出错了')`、`alert('导出成功')` 这类笼统/突兀提示，未说明后续动作，且阻塞浏览器。
  - 建议：使用应用内 Toast/Notification，区分成功/失败，失败提示给出原因与下一步（重试、联系客服）。

### 数据与类型
- **使用 TypeScript 时避免 `any`，合理定义类型和接口 / 在数据边界处检查数据是否存在及类型**
  - 位置：`showcase/cases/06-errors/bad.tsx:7`、`showcase/cases/06-errors/bad.tsx:17-18`、`showcase/cases/06-errors/bad.tsx:27`
  - 现状：`summary` 用 `any`，`data.list`、`d` 直接 setState，没有字段/类型校验，后端返回异常结构时会连环崩溃（如 `summary.total.toFixed` 已证）。
  - 建议：定义 `Summary` 接口，响应入口做字段归一化与兜底（`data?.list ?? []`），必要时 runtime 校验（zod 等）。

### UI 与渲染
- **状态更新保持不可变 / 使用最新 state（避免过期闭包）**
  - 位置：`showcase/cases/06-errors/bad.tsx:46`
  - 现状：`setOrders(orders.filter(...))` 使用闭包捕获的 `orders`，如果删除请求期间 `orders` 已更新（例如 `loadOrders` 回填），会用旧数组覆盖最新状态。
  - 建议：用函数式更新 `setOrders(prev => prev.filter(o => o.id !== id))`。
