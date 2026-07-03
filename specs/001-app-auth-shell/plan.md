# 实施计划: 应用框架与身份入口

**分支**: `[001-app-auth-shell]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `/specs/001-app-auth-shell/spec.md` 中的功能规格

## 摘要

本阶段交付建筑施工质检情报员的登录入口、项目身份选择和响应式应用框架。核心 P1 演示闭环为：用户打开系统 -> 登录 -> 系统识别身份 -> 单身份直接进入应用或多身份选择后进入应用 -> 看到与角色匹配的导航。

## 技术上下文

**语言/版本**: TypeScript strict mode、Next.js 16 App Router、React 19

**主要依赖**: 复用现有 Next.js、Supabase SSR client、shadcn/ui 基础组件、Tailwind CSS v4、lucide-react

**数据与存储**: Supabase Auth 保存登录账号；public schema 保存用户资料、项目、项目身份；当前身份使用会话 cookie

**静态检查**: `npm run check`

**测试**: 默认不要求自动化测试；使用 quickstart 人工验收核心路径

**目标平台**: 本地演示环境和现代浏览器；后续可部署到 Vercel

**项目类型**: Next.js Web 应用

**性能目标**: 登录表单提交和身份选择在本地演示环境中给出即时 pending 状态；应用框架首屏不依赖工单数据

**约束**: 不直接写远程 Supabase；不实现工单 CRUD、助手对话、Coze；不新增状态管理库

**范围**: P1 登录与身份入口；P2 角色导航；P3 响应式框架和无权限页

## Constitution Check

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是登录并确定当前“用户 + 项目 + 角色”身份。
- **需求驱动快速实现**: 计划复用 `app/`、`components/ui/`、`lib/supabase/`、Tailwind v4 和 lucide-react；新增依赖为无。
- **静态检查门槛**: 交付前运行 `npm run check`。
- **复杂度控制**: 不引入完整权限矩阵、审计、缓存、国际化或生产级错误恢复；仅实现阶段 1 必需的身份边界。
- **中文文档**: spec、plan、tasks、quickstart 和交付说明使用中文。
- **显式排除项**: 不默认纳入自动化测试、无障碍专项、可扩展架构和生产级防御性处理。

## 项目结构

### 文档（当前功能）

```text
specs/001-app-auth-shell/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── identity-flow.md
└── tasks.md
```

### 源码（仓库根目录）

```text
app/
├── actions.ts
├── page.tsx
├── layout.tsx
└── globals.css

components/
├── app-shell/
├── auth/
└── ui/

lib/
├── identity/
└── supabase/

scripts/
└── seed-stage1.mjs

supabase/
├── migrations/
└── seed.sql
```

**结构决策**: 身份领域逻辑集中在 `lib/identity/`；交互组件按 `components/auth/` 和 `components/app-shell/` 分开；Supabase schema 和演示数据脚本放在 `supabase/` 与 `scripts/`，便于审查后手动执行。

## 复杂度记录

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 无 | 无 | 无 |
