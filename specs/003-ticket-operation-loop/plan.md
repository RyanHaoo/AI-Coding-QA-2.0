# 实施计划: 工单状态流转与操作记录

**分支**: `[003-ticket-operation-loop]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `/specs/003-ticket-operation-loop/spec.md` 中的功能规格

## 摘要

本阶段交付工单详情的操作闭环。核心 P1 演示闭环为：施工方或管理员打开待处理工单 -> 选择解决或拒绝 -> 填写必填业务说明 -> 系统更新工单状态和处理信息 -> 自动新增处理记录 -> 列表和详情刷新后展示一致结果。

技术实现方向是继续复用阶段 1/2 已建立的 Next.js App Router 壳层、当前身份 cookie、Supabase 数据表、`lib/tickets/` 查询层和 `components/tickets/` 详情组件，在此基础上新增服务端 action、操作权限判断、详情操作表单、图片新增/删除能力、处理记录生成和最小数据库写入策略。不引入新依赖，不新增独立 REST API route，不改变现有 `view` 查询参数导航模型。

## 技术上下文

**语言/版本**: TypeScript strict mode、Next.js 16.2.10 App Router、React 19.2.4

**主要依赖**: 复用现有 Next.js Server Components 与 Server Actions、Supabase SSR client、Supabase admin client、shadcn/ui 基础组件、Tailwind CSS v4、lucide-react

**数据与存储**: 复用 Supabase public schema 中的 `tickets`、`ticket_activity_logs`、`project_memberships`、`app_users`、`projects`；现场图片继续存入 `tickets.image_urls`，阶段 3 新上传图片使用 Supabase Storage 或可访问 URL 写回该数组

**静态检查**: `npm run check`

**测试**: 默认不要求自动化测试；使用 quickstart 人工验收解决、拒绝、编辑、指派、重新打开、越权拒绝和列表/详情同步

**目标平台**: 本地演示环境和现代浏览器；后续可部署到 Vercel

**项目类型**: Next.js Web 应用

**性能目标**: 阶段 3 继续面向约 12-20 张演示工单；单次操作提交后一次刷新或返回即可看到状态、责任人和处理记录一致结果；表单提交期间必须有清晰 pending 或禁用状态

**约束**: 严格沿用当前技术栈；不新增状态管理库、表单库、上传库或 API 框架；不实现智能助手建单/查单、管理员数据大盘、Coze 知识问答或生产级审计；写 Next.js 相关实现前需先查阅本地 `node_modules/next/dist/docs/` 对应文档

**范围**: P1 解决/拒绝待处理工单；P2 编辑待处理工单问题信息和指派他人；P3 重新打开已结束工单和完整角色/状态按钮可见性；核心实体为工单、工单操作、处理记录、当前责任人、现场图片和可操作范围

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是施工方或管理员在工单详情中将待处理工单解决或拒绝，并在处理记录中看到可追溯结果。
- **需求驱动快速实现**: 计划复用 `app/page.tsx`、`app/actions.ts`、`components/tickets/`、`components/ui/`、`lib/identity/`、`lib/tickets/`、`lib/supabase/`、`supabase/migrations/` 和现有 seed 脚本；新增依赖为无。
- **静态检查门槛**: 交付前运行 `npm run check`；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 不新增状态管理库、完整权限矩阵、审计系统、缓存、国际化、无障碍专项或生产级并发恢复；仅新增满足阶段 3 操作闭环的最小写入校验和反馈。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 自动化测试、无障碍专项、可扩展性和生产级防御性处理不默认纳入；本阶段明确排除助手能力、管理员大盘和 Coze 知识接口。

## 项目结构

### 文档（当前功能）

```text
specs/003-ticket-operation-loop/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ticket-operation-flow.md
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
│   ├── 202607030002_stage2_ticket_readonly.sql
│   └── 202607030003_stage3_ticket_operations.sql
└── seed.sql
```

**结构决策**: 阶段 3 继续把工单领域逻辑集中到 `lib/tickets/`，把详情、操作按钮和表单集中到 `components/tickets/`，把写入入口放到现有 `app/actions.ts` 或按既有模式拆出相邻 action 文件后再由页面引用。继续由 `app/page.tsx` 按 `view`、`ticketId` 和筛选 query 参数调度，不新增路由层级。数据库变更只补充写入所需的最小策略、Storage bucket 或辅助索引，避免重做阶段 2 表结构。

## 复杂度记录

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 服务端 action 使用受控 admin client 执行工单写入 | 阶段 3 要在一次用户操作中同时校验身份、更新工单并新增处理记录 | 直接客户端写入需要复杂 RLS 和多步失败处理；数据库 RPC 对 MVP 偏重。服务端 action 可复用当前身份校验并避免暴露 service key，复杂度更低 |
| 新增 Supabase Storage 或等效图片持久化配置 | 澄清结果要求阶段 3 在工单详情编辑态新增和删除现场图片 | 只保存本地路径无法支持运行时上传；把图片能力全部推迟到阶段 6 会违反已确认的阶段 3 范围 |

## 设计后 Constitution Check

- **MVP核心路径**: 设计产物保持 P1 优先，先完成解决/拒绝闭环，再扩展编辑、指派、重新打开和按钮规则。
- **需求驱动快速实现**: 研究、数据模型、契约和 quickstart 均复用现有 Next.js、Supabase、Tailwind、shadcn/ui 和阶段 2 工单结构，无新增依赖。
- **静态检查门槛**: quickstart 明确 `npm run check` 作为交付前门槛。
- **复杂度控制**: 复杂度仅限服务端写入封装和图片持久化配置，均由阶段 3 已确认需求直接触发。
- **中文文档**: 本阶段 plan、research、data-model、contract、quickstart 均使用中文。
- **显式排除项**: 设计文档继续排除助手能力、管理员大盘、Coze 知识问答、生产级审计和完整并发恢复。
