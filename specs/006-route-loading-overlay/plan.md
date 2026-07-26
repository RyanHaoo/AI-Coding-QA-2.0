# 实施计划: 路由切换 Loading 遮罩

**分支**: `[006-route-loading-overlay]` | **日期**: 2026-07-26 | **规格**: [spec.md](./spec.md)

**输入**: `specs/006-route-loading-overlay/spec.md` 中的功能规格

**说明**: 本模板由 `/speckit-plan` 填写。所有内容使用中文，代码标识符、命令、路径和第三方 API 名称保留英文。

## 摘要

本功能为现有应用内导航补充统一等待反馈：当用户通过侧栏、工单详情、管理员大盘或筛选链接触发服务端页面重新渲染时，等待达到 150ms 后在当前界面上方显示半透明全屏遮罩、旋转图标和“页面加载中…”文案，完成后自动卸载。实现使用根布局中的轻量 Client Provider 捕获站内链接导航并比较当前 URL key，同时保留根级 `loading.tsx` 处理初次和段级加载；复用现有 `lucide-react`、Tailwind CSS v4，不逐个改造 `<Link>`，不新增依赖。

## 技术上下文

**语言/版本**: TypeScript strict mode；Next.js `16.2.10` App Router；React `19.2.4`；Tailwind CSS v4

**主要依赖**: 现有 Next.js、React、`lucide-react`；不新增依赖

**数据与存储**: 无持久化数据；Provider 仅保存发起导航时的瞬态 URL key

**静态检查**: `npm run check`；生产构建 `npm run build`

**测试**: 不新增自动化测试；使用内置浏览器完成桌面、移动、慢导航和 reduced-motion 人工验收

**目标平台**: 本地演示环境、Vercel、现代桌面和移动浏览器

**项目类型**: Next.js Web 应用，根页面为异步 Server Component，页面视图由查询参数驱动

**性能目标**: 导航等待不足 150ms 时不产生可见闪屏；超过 150ms 时提供稳定加载反馈

**约束**:
- 遮罩必须覆盖完整视口并高于现有移动菜单 `z-50`。
- 遮罩挂载后立即拦截指针操作，但视觉内容延迟 150ms 淡入。
- 不改变表单提交、图片上传、助手回复等非路由异步流程。
- 不增加第三方状态管理、逐链接包装组件或公共路由 API。
- Provider 只处理同源、非当前 URL 的普通左键链接导航；外链、下载、修饰键点击和当前链接不触发遮罩。
- 遮罩必须叠加在旧界面上方，不能以 fallback 替换现有业务内容。

**范围**: P1 全屏路由加载反馈；P2 延迟淡入与 reduced-motion；不涉及 API、Supabase、数据迁移或公共类型。

## Constitution Check

*门禁：Phase 0 研究前与 Phase 1 设计后均已通过。*

- **MVP核心路径**: “用户点击页面或工单导航 -> 系统等待服务端内容 -> 超过 150ms 显示全屏加载反馈 -> 新内容完成并自动移除遮罩”。
- **需求驱动快速实现**: 复用 `app/loading.tsx` 特殊文件、`components/app-shell/`、`app/globals.css`、`lucide-react` 和 Tailwind CSS v4；无新增依赖。
- **静态检查门槛**: 交付前运行 `npm run check` 和 `npm run build`。
- **复杂度控制**: 不新增状态管理、通用路由封装、权限、缓存、国际化或生产级监控。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档使用中文。
- **显式排除项**: 不新增自动化测试；辅助技术状态提示与 reduced-motion 仅作为本次已确认交互要求实现，不扩展为无障碍专项。

## 项目结构

### 文档（当前功能）

```text
specs/006-route-loading-overlay/
├── checklists/requirements.md
├── contracts/route-loading-ui.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### 源码（仓库根目录）

```text
app/
├── globals.css
├── layout.tsx
├── loading.tsx

components/
└── app-shell/
    ├── route-loading-overlay.tsx
    └── route-transition-provider.tsx

progress.md
```

**结构决策**: `app/loading.tsx` 处理初次访问和段级加载；`RouteTransitionProvider` 持久挂载在根布局，捕获当前站内链接点击并在 URL key 变化后自动结束 pending，使查询参数导航期间旧界面保留在半透明遮罩下方。视觉组件与 Provider 归入现有应用框架目录，延迟淡入动画放入全局样式；不要求逐个修改链接。

## 复杂度记录

无。
