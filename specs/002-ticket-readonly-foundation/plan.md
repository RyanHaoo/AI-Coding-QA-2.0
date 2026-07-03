# 实施计划: 工单数据底座与只读详情

**分支**: `[002-ticket-readonly-foundation]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `/specs/002-ticket-readonly-foundation/spec.md` 中的功能规格

## 摘要

本阶段交付建筑施工质检情报员的工单只读数据底座和浏览体验。核心 P1 演示闭环为：阶段 1 用户登录并确定当前身份 -> 系统读取当前项目下符合角色范围的工单样例 -> 用户可在列表中看到待处理、已结束、紧急等工单 -> 打开详情查看基础信息、问题信息、处理信息和处理记录。

技术实现方向是复用现有 Next.js 单页应用框架、Supabase 会话和 `project_memberships` 身份模型，新增工单与处理记录数据结构、阶段 2 seed 脚本、服务端只读查询层、工单列表组件和通用只读详情组件。不引入新依赖，不实现写入操作。

## 技术上下文

**语言/版本**: TypeScript strict mode、Next.js 16.2.10 App Router、React 19.2.4

**主要依赖**: 复用现有 Next.js Server Components、Supabase SSR client、shadcn/ui 基础组件、Tailwind CSS v4、lucide-react

**数据与存储**: Supabase public schema 保存工单、处理记录和图片 URL 数组；Supabase Auth 与阶段 1 `app_users`、`projects`、`project_memberships` 继续提供身份与项目边界；阶段 2 使用服务端只读查询

**静态检查**: `npm run check`

**测试**: 默认不要求自动化测试；使用 quickstart 人工验收角色范围、筛选排序、只读详情、无权限和未找到状态

**目标平台**: 本地演示环境和现代浏览器；后续可部署到 Vercel

**项目类型**: Next.js Web 应用

**性能目标**: 阶段 2 演示数据量约 12-20 张工单；列表和详情在本地演示环境中应在一次页面请求内返回结果，筛选或排序切换不出现空白闪烁

**约束**: 不直接写远程 Supabase；不实现创建、编辑、解决、拒绝、指派、重新打开、助手查单、助手建单、知识问答或管理员大盘；不新增状态管理库；写 Next.js 相关实现前需先查阅本地 `node_modules/next/dist/docs/` 对应文档

**范围**: P1 工单和处理记录数据底座；P2 质检员/施工方角色范围列表；P3 通用只读详情和管理员项目级基础列表

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是登录用户在当前身份下看到真实工单样例，并能打开只读详情理解问题和处理记录。
- **需求驱动快速实现**: 计划复用 `app/page.tsx`、`components/app-shell/`、`components/ui/`、`lib/identity/`、`lib/supabase/`、`supabase/migrations/` 和 `scripts/`；新增依赖为无。
- **静态检查门槛**: 交付前运行 `npm run check`；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 不新增状态管理库、完整权限矩阵、审计系统、缓存、国际化、无障碍专项或生产级错误恢复；仅新增满足阶段 2 数据可见性的最小 RLS 与只读查询。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 测试、无障碍、可扩展性和生产级防御性处理不默认纳入；本阶段明确排除所有工单写入和助手能力。

## 项目结构

### 文档（当前功能）

```text
specs/002-ticket-readonly-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ticket-readonly-flow.md
└── tasks.md
```

### 源码（仓库根目录）

```text
app/
├── page.tsx
├── layout.tsx
└── globals.css

components/
├── app-shell/
├── tickets/
└── ui/

lib/
├── identity/
├── supabase/
└── tickets/

scripts/
├── seed-stage1.mjs
└── seed-stage2.mjs

supabase/
├── migrations/
│   ├── 202607030001_stage1_identity.sql
│   └── 202607030002_stage2_ticket_readonly.sql
└── seed.sql
```

**结构决策**: 工单领域逻辑集中到 `lib/tickets/`，展示组件集中到 `components/tickets/`；继续由 `app/page.tsx` 按 `view` 和 query 参数调度，避免为阶段 2 引入新路由体系。Supabase schema 与演示数据分别放在 `supabase/migrations/` 和 `scripts/seed-stage2.mjs`，保持与阶段 1 的迁移和 seed 方式一致。

## 复杂度记录

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 扩展 `app_users` 读取策略为同项目成员资料可读 | 工单列表和详情必须展示发起人、当前责任人、处理记录操作人姓名 | 阶段 1 只允许读取本人资料，无法展示协作人姓名；把姓名冗余写入工单会让后续处理记录和责任人变更不一致 |

## 设计后 Constitution Check

- **MVP核心路径**: 设计产物保持 P1 先完成数据底座，再推进列表和详情；后续写入操作仍延后。
- **需求驱动快速实现**: 数据模型、契约和 quickstart 均复用现有身份、Supabase、App Router 和组件结构，无新增依赖。
- **静态检查门槛**: quickstart 明确 `npm run check` 作为交付前门槛。
- **复杂度控制**: 唯一复杂度记录为同项目成员资料读取策略，直接服务阶段 2 展示协作人姓名的需求。
- **中文文档**: 本阶段 plan、research、data-model、contract、quickstart 均使用中文。
- **显式排除项**: 设计文档继续明确排除工单写入、助手能力、管理员大盘和完整管理干预。
