# 任务清单: 路由切换 Loading 遮罩

**输入**: `specs/006-route-loading-overlay/` 下的设计文档

**前置文档**: plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md

**测试**: 不新增自动化测试；使用静态检查、生产构建和内置浏览器完成核心路径验收。

**组织方式**: 任务按用户故事分组，先完成 P1 全屏路由反馈，再处理 P2 防闪屏与 reduced-motion。

## Phase 1: 准备与结构确认

**目的**: 确认 Next.js 路由 fallback、现有层级和样式落点。

- [x] T001 对照 Next.js 16 本地文档与现有路由结构确认 `app/loading.tsx`、`components/app-shell/route-loading-overlay.tsx` 和 `app/globals.css` 的职责

---

## Phase 2: 用户故事 1 - 感知页面切换进度（优先级: P1）

**目标**: 为所有现有页面、详情和筛选导航提供统一的全屏加载反馈，并在加载期间阻止重复操作。

**独立验收**: 受限网络下点击侧栏、工单详情或筛选入口，等待超过 150ms 后看到覆盖完整视口的旋转加载状态，目标内容完成后自动消失。

### 实现任务

- [x] T002 [US1] 在 `components/app-shell/route-loading-overlay.tsx` 创建全屏遮罩、居中加载卡片、旋转图标和状态文案
- [x] T003 [US1] 在 `app/loading.tsx` 接入 `RouteLoadingOverlay` 作为根路由 fallback
- [x] T004 [US1] 在 `app/globals.css` 添加遮罩淡入动画并确保固定层立即拦截指针操作
- [x] T005 [US1] 在 `components/app-shell/route-transition-provider.tsx` 与 `app/layout.tsx` 接入站内链接 pending 和 URL key 完成判定，确保查询参数导航叠加遮罩且保留旧界面

**检查点**: 所有现有 Next.js `<Link>` 导航获得统一路由加载反馈，无需逐链接改造。

---

## Phase 3: 用户故事 2 - 避免快速切换闪屏（优先级: P2）

**目标**: 让遮罩延迟 150ms 后才可见，并在 reduced-motion 环境保留静态状态提示。

**独立验收**: 快速导航无明显闪屏；模拟减少动态效果后，慢导航显示遮罩与文案但图标不旋转。

### 实现任务

- [x] T006 [US2] 在 `app/globals.css` 将可见淡入延迟固定为 150ms，并在 `components/app-shell/route-loading-overlay.tsx` 停用 reduced-motion 下的旋转
- [x] T007 [US2] 使用内置浏览器验证桌面、移动、快速导航、慢导航、重复点击和 reduced-motion 场景

**检查点**: P1 与 P2 均符合 `contracts/route-loading-ui.md`。

---

## Phase 4: 收尾与静态检查

**目的**: 完成演示交付前的质量门禁与进度记录。

- [x] T008 运行 `npm run check` 并修复本功能引入的静态检查问题
- [x] T009 运行 `npm run build` 并确认根级 fallback 和 Client Provider 生产构建成功
- [x] T010 根据实际交付和验证结果更新 `progress.md`
- [x] T011 检查 `specs/006-route-loading-overlay/` 无未解释占位符并记录最终验证结果

---

## 依赖与执行顺序

- **Phase 1** 无依赖，先确认框架行为与落点。
- **US1 (P1)** 依赖 Phase 1，按组件、路由接入、样式顺序完成。
- **US2 (P2)** 依赖 US1，复用同一遮罩完成延迟与 reduced-motion。
- **收尾阶段** 依赖 US1、US2 实现完成；浏览器结果必须在 `progress.md` 中如实记录。

## 并行机会

本功能修改文件少且任务存在直接依赖，不安排并行代码任务，避免同一组件与样式被并发修改。

## 实施策略

1. 先完成 P1 遮罩组件和根路由 fallback，确认慢导航可见。
2. 再完成 P2 延迟淡入和 reduced-motion，避免快速导航闪屏。
3. 最后依次执行静态检查、生产构建、内置浏览器验收和进度更新。
