# 实施计划: 管理员态势大盘与工单中心

**分支**: `[004-admin-dashboard-ticket-center]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `/specs/004-admin-dashboard-ticket-center/spec.md` 中的功能规格

## 摘要

本阶段交付管理员查看当前项目质检态势、从大盘指标下钻到管理员工单中心、筛选当前项目全部工单并打开详情执行阶段 3 管理操作的闭环。核心 P1 演示闭环为：管理员打开数据大盘 -> 查看项目总量、待处理和紧急指标 -> 点击待处理或紧急指标 -> 自动进入工单中心并应用对应筛选 -> 打开工单详情继续管理干预。

技术实现方向是继续复用阶段 1/2/3 已建立的单页 App Router 壳层、`view` 查询参数导航、当前身份 cookie、`lib/tickets/` 查询与操作模块、`components/tickets/` 详情与操作组件、Tailwind v4 和 shadcn/ui 基础组件。阶段 5 只扩展管理员大盘统计、管理员筛选参数、管理员表格和详情联动，不新增依赖，不新增独立后台路由，不改变阶段 3 工单操作规则。

## 技术上下文

**语言/版本**: TypeScript strict mode、Next.js 16.2.10 App Router、React 19.2.4

**主要依赖**: 复用现有 Next.js Server Components、Server Actions、Supabase SSR client、Supabase admin client、shadcn/ui 基础组件、Tailwind CSS v4、lucide-react

**数据与存储**: 复用 Supabase public schema 中的 `tickets`、`ticket_activity_logs`、`project_memberships`、`app_users`、`projects`；阶段 5 不新增数据库表，必要时只新增最小查询索引或视图级派生统计函数

**静态检查**: `npm run check`

**测试**: 默认不要求自动化测试；使用 quickstart 人工验收大盘指标、指标下钻筛选、管理员筛选、详情操作同步和非管理员拒绝访问

**目标平台**: 本地演示环境和现代浏览器；后续可部署到 Vercel

**项目类型**: Next.js Web 应用

**性能目标**: 面向当前演示数据量约 12-30 张工单；管理员进入大盘或工单中心时应在一次页面加载内看到指标和列表；筛选变化通过 URL 查询参数刷新后立即反映；管理操作成功后一次刷新、返回或页面更新即可看到详情、表格和大盘统计一致结果

**约束**: 严格沿用当前技术栈；不新增状态管理库、图表库、表格库、数据缓存层、API 框架或完整后台路由；不实现助手建单/查单、Coze 知识问答、跨项目报表、导出报表、复杂审计或生产级实时推送；写 Next.js 相关实现前需先查阅本地 `node_modules/next/dist/docs/` 对应文档

**范围**: P1 管理员大盘和指标下钻；P2 管理员工单中心筛选、表格、详情联动和阶段 3 操作复用；P3 非管理员访问限制和多项目身份边界；核心实体为管理员态势指标、重点关注工单集合、管理员筛选条件、管理员工单表格行、工单详情联动和当前项目边界

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是管理员查看当前项目态势，从待处理或紧急指标自动下钻到工单中心，并定位需要跟进的工单。
- **需求驱动快速实现**: 计划复用 `app/page.tsx`、`components/app-shell/page-content.tsx`、`components/tickets/`、`components/ui/`、`lib/identity/`、`lib/tickets/`、`lib/supabase/` 和现有工单操作 Server Actions；新增依赖为无。
- **静态检查门槛**: 交付前运行 `npm run check`；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 不新增状态管理库、图表库、表格库、完整权限矩阵、审计系统、缓存、国际化、无障碍专项或生产级实时同步；只增加阶段 5 演示所需的最小查询、筛选和组件。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 自动化测试、无障碍专项、可扩展性和生产级防御性处理不默认纳入；本阶段明确排除助手能力、Coze 知识问答、跨项目报表、导出报表和复杂审计分析。

## 项目结构

### 文档（当前功能）

```text
specs/004-admin-dashboard-ticket-center/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── admin-dashboard-ticket-center-flow.md
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

supabase/
└── migrations/
```

**结构决策**: 阶段 5 继续由 `app/page.tsx` 根据 `view=dashboard` 和 `view=admin-tickets` 读取数据并传入 `PageContent`。大盘组件可放在 `components/tickets/` 或按既有模块粒度新增 `components/tickets/admin-dashboard.tsx`；管理员表格继续扩展 `components/tickets/admin-ticket-table.tsx`。筛选解析和 URL 生成扩展 `lib/tickets/query-params.ts`；管理员统计和筛选查询扩展 `lib/tickets/queries.ts`；枚举、筛选类型和统计类型扩展 `lib/tickets/types.ts`。阶段 3 的 `TicketDetail`、`TicketOperationPanel` 和 mutation 保持复用。

## 复杂度记录

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 无 | 无 | 当前计划完全沿用既有技术栈和单页查询参数模型 |

## 设计后 Constitution Check

- **MVP核心路径**: 设计产物保持 P1 优先，先完成大盘指标和自动筛选下钻，再扩展完整筛选、表格和详情操作同步。
- **需求驱动快速实现**: 研究、数据模型、契约和 quickstart 均复用现有 Next.js、Supabase、Tailwind、shadcn/ui 和阶段 2/3 工单结构，无新增依赖。
- **静态检查门槛**: quickstart 明确 `npm run check` 作为交付前门槛。
- **复杂度控制**: 设计不引入新架构层、图表库、表格库、缓存层、跨项目报表或实时推送。
- **中文文档**: 本阶段 plan、research、data-model、contract、quickstart 均使用中文。
- **显式排除项**: 设计文档继续排除助手建单/查单、Coze 知识问答、跨项目集团级报表、导出报表和复杂审计分析。
