# Phase 0 研究结论: 路由切换 Loading 遮罩

## Decision: 组合使用根级 `app/loading.tsx` 与持久路由 Provider

**Rationale**: 当前应用只有根页面 `/`，`view`、`ticketId`、筛选和排序均通过查询参数触发异步 Server Component 重新渲染。根级 `loading.tsx` 能处理初次访问和段级加载，但 production 与人工验收确认同一路径查询参数导航可能复用当前段并跳过该 fallback。查询参数 keyed Suspense 虽能稳定触发遮罩，却会用 fallback 替换旧界面，透明遮罩下只剩页面底色并产生闪烁。最终在根布局持久挂载轻量 Provider：站内链接点击时记录当前 URL key并显示遮罩，路由提交导致 URL key 变化后自动隐藏，因此旧界面可一直保留在半透明遮罩下方。

**Alternatives considered**:

- 只使用根级 `app/loading.tsx`: 代码最少，但实测菜单查询参数切换不会可靠展示遮罩。
- 在 `app/page.tsx` 使用查询参数 keyed Suspense: 能触发遮罩，但会替换旧内容，无法实现真正覆盖旧界面的半透明效果。
- 逐个包装 `<Link>` 并使用 `useLinkStatus`: 需要改造大量链接，而且 pending 状态可能因预取完成而跳过，不适合作为统一全屏反馈。
- 引入第三方路由状态或逐链接 `useTransition`: 复杂度更高；当前 Provider 用 URL key 即可与路由提交同步。

## Decision: 遮罩立即拦截操作，视觉层延迟 150ms

**Rationale**: fallback 挂载后固定层立即占满视口并拦截指针事件；通过 CSS 让遮罩保持透明 150ms，再淡入可见。这样慢导航有明确反馈，快速导航在动画开始前卸载，不出现闪屏。

**Alternatives considered**:

- 立即显示遮罩: 反馈更强，但快速查询参数切换会产生短暂闪烁。
- 延迟挂载组件: 需要客户端计时状态，会增加不必要的边界和清理逻辑。

## Decision: 复用 `lucide-react` 与 CSS 动画

**Rationale**: 项目已有 `Loader2` 和 `animate-spin` 用法，无需新增加载组件库。淡入关键帧放在 `app/globals.css`，图标使用现有旋转工具类，并通过 reduced-motion 变体停止旋转。

**Alternatives considered**:

- 引入第三方 spinner: 增加依赖但没有额外用户价值。
- 纯 CSS 绘制圆环: 可行，但与项目既有图标模式不一致。

## Decision: 视觉组件无交互状态，导航状态集中在 Client Provider

**Rationale**: `RouteLoadingOverlay` 只渲染静态结构和 CSS 类，可同时供根级 fallback 与 Client Provider 复用；只有捕获链接点击和比较 URL key 的 Provider 使用客户端状态。这样客户端代码保持局部且不污染业务组件。

**Alternatives considered**:

- 把计时和视觉动画也放入 Client Component: CSS 延迟已经满足需求，不需要额外计时器。
