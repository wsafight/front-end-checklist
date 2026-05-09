---
id: 04-perf
title_zh: 商品列表：渲染性能与副作用
title_en: Product Grid - rendering performance and side effects
stack: React + TypeScript
groups: [状态管理, 数据请求, 性能, UI 与渲染, 安全与健壮性, 无障碍访问（a11y）, 错误处理, 数据与类型, 代码质量]
severity: high
---

## 命中问题（共 16 项）

### 状态管理
- **状态更新保持不可变，避免直接修改已有对象或数组**
  - 位置：`showcase/cases/04-perf/bad.tsx:25`
  - 现状：`list.sort((a, b) => b.price - a.price)` 直接对 state 数组排序，会 mutate `list` 并影响下方 `filtered` 的顺序，引发隐式数据污染。
  - 建议：先复制再排序，如 `const featured = [...list].sort((a,b)=>b.price-a.price).slice(0,3)`，或用 `useMemo` 缓存。

- **不存储可以稳定计算得到的派生状态**
  - 位置：`showcase/cases/04-perf/bad.tsx:21-25`
  - 现状：`filtered` 与 `featured` 是从 `list` + `keyword` 派生的结果，每次渲染都重算，且未做缓存。
  - 建议：用 `useMemo(() => ..., [list, keyword])` 包裹派生计算，避免大数组重复遍历。

### 数据请求
- **每个请求都应考虑加载中、空数据、失败、重试和取消场景**
  - 位置：`showcase/cases/04-perf/bad.tsx:9-13`
  - 现状：`fetch` 只处理成功路径，无 loading、error、空数据分支，也没有 AbortController 取消。
  - 建议：加入 `loading`/`error` 状态，捕获 `.catch`，并用 `AbortController` 在 effect 清理时取消请求。

- **处理并发请求的竞态问题，避免旧响应覆盖新状态**
  - 位置：`showcase/cases/04-perf/bad.tsx:9-13`
  - 现状：依赖数组为空，但若未来依赖 `keyword` 重新发请求，没有取消或序号机制会导致旧响应覆盖新状态。
  - 建议：用 `AbortController` 或 request id 标记，卸载/新请求时忽略过期响应。

- **明确接口错误和业务错误的处理方式，不要只判断 HTTP 状态码**
  - 位置：`showcase/cases/04-perf/bad.tsx:10-12`
  - 现状：直接 `r.json()`，未检查 `r.ok`、未处理非 2xx 与 JSON 解析异常。
  - 建议：`if(!r.ok) throw new Error(...)`，再 `.catch` 上报并给用户兜底提示。

- **接口响应进入页面前完成必要的归一化、兜底和字段兼容**
  - 位置：`showcase/cases/04-perf/bad.tsx:12`
  - 现状：`setList(d)` 直接信任后端返回，未校验 `d` 是否为数组、字段是否齐全。
  - 建议：`setList(Array.isArray(d) ? d.map(normalize) : [])`，对 `tags/price/cover` 做兜底。

### 性能
- **避免在循环中频繁操作 DOM 或触发重排**
  - 位置：`showcase/cases/04-perf/bad.tsx:15-19`
  - 现状：scroll 监听未节流，每次滚动都 `setScrollY` 触发整棵树重渲染，外层 `transform` 还会引发合成层重算。
  - 建议：用 `requestAnimationFrame` 或 `throttle` 限频，或直接用 CSS `position: sticky` 避免 JS 参与。

- **对大组件、重计算、长列表和大型依赖进行按需加载或缓存优化**
  - 位置：`showcase/cases/04-perf/bad.tsx:41-53`
  - 现状：`filtered` 可能达 5000 条，全量渲染到 DOM，无虚拟滚动。
  - 建议：接入 `react-window` / `react-virtuoso`，或做分页/懒加载。

- **程序要懒惰，不到最后一刻不获取或处理数据**
  - 位置：`showcase/cases/04-perf/bad.tsx:10`
  - 现状：一次性拉 5000 条，无分页、无懒加载。
  - 建议：改为分页接口或按视窗懒加载，首屏只加载必要数据量。

### UI 与渲染
- **不在渲染中创建新组件，否则 React 会反复销毁并重建子组件树**（相关：不稳定 key）
  - 位置：`showcase/cases/04-perf/bad.tsx:31, 41, 63`
  - 现状：列表全部用 `key={i}` 作为索引 key，筛选或排序变化时会错位复用、丢状态。
  - 建议：用稳定唯一标识，如 `key={p.id}` / `key={t}`。

- **尽量不使用行内样式，即使通过 props 传递，也应在一定范围内传递 class**
  - 位置：`showcase/cases/04-perf/bad.tsx:28, 32, 46, 48, 64`
  - 现状：大量 `style={{...}}` 内联对象，每次渲染都生成新对象，既影响可维护性也影响子组件 memo。
  - 建议：抽到 CSS/CSS Module/utility class，动态条件改用 `className` 拼接。

### 无障碍访问（a11y）
- **图片必须有 `alt` 属性**
  - 位置：`showcase/cases/04-perf/bad.tsx:33, 48`
  - 现状：`<img src={p.cover} />` 没有 `alt`，屏幕阅读器无法识别商品。
  - 建议：`<img src={p.cover} alt={p.title} />`，装饰图用 `alt=""`。

- **交互元素（按钮、链接）必须有可读文本或 `aria-label`；页面可通过键盘完成核心操作**
  - 位置：`showcase/cases/04-perf/bad.tsx:42-47, 64`
  - 现状：用 `<div onClick>` / `<span onClick>` 模拟点击，无 `role`、无 `tabIndex`、无键盘事件，键盘/读屏用户无法操作。
  - 建议：换成 `<button type="button">` 或加 `role="button" tabIndex={0} onKeyDown={...}`。

### 安全与健壮性
- **所有用户输入和外部输入都应基于业务规则进行验证**
  - 位置：`showcase/cases/04-perf/bad.tsx:50`
  - 现状：`p.price.toFixed(2)` 未判空，若后端返回 `null`/非数字会直接抛错。
  - 建议：`Number(p.price ?? 0).toFixed(2)`，或在归一化阶段保证 `price` 必为 number。

### 错误处理
- **为关键业务模块添加错误边界，避免局部错误导致整个页面崩溃；不要吞掉异常**
  - 位置：`showcase/cases/04-perf/bad.tsx:9-13`
  - 现状：fetch 失败、JSON 解析失败、`price.toFixed` 抛错都会冒泡到 React 顶层无人处理。
  - 建议：`.catch` 上报 + 用户提示；外层包 `ErrorBoundary`。

### 代码质量
- **避免魔法数字，用命名常量替代；生产环境不输出敏感信息到 console**
  - 位置：`showcase/cases/04-perf/bad.tsx:10, 28, 45, 51`
  - 现状：`limit=5000`、`scrollY * 0.1`、`console.log('click', p)`、`console.log('tag', t)` 散落在代码中。
  - 建议：常量化（如 `PAGE_SIZE`、`PARALLAX_RATIO`），替换 `console.log` 为真实业务处理或统一日志工具。
