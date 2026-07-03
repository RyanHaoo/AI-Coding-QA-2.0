# 任务清单: 工单数据底座与只读详情

**输入**: `/specs/002-ticket-readonly-foundation/` 下的设计文档

**前置文档**: plan.md、spec.md、research.md、data-model.md、contracts/

**测试**: 默认不创建自动化测试任务；通过 quickstart 人工验收和 `npm run check` 验证。

## Phase 1: 准备与结构确认

**目的**: 确认阶段 2 的实现落点、Next.js 文档依据和验收方式

- [X] T001 阅读阶段 2 涉及的本地 Next.js 文档 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
- [X] T002 [P] 阅读阶段 2 涉及的本地 Next.js 文档 `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`
- [X] T003 [P] 阅读阶段 2 涉及的本地 Next.js 文档 `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- [X] T004 对照 `specs/002-ticket-readonly-foundation/plan.md` 确认本阶段只修改 `app/`、`components/tickets/`、`lib/tickets/`、`supabase/migrations/`、`scripts/`、`package.json`
- [X] T005 [P] 对照 `specs/002-ticket-readonly-foundation/quickstart.md` 确认本阶段验收使用人工路径和 `npm run check`

---

## Phase 2: 基础实现（阻塞 P1）

**目的**: 建立工单领域代码目录、共享类型和查询参数约定

- [X] T006 创建工单组件目录占位和导出入口 `components/tickets/index.ts`
- [X] T007 [P] 创建工单领域类型、枚举和中文标签映射 `lib/tickets/types.ts`
- [X] T008 [P] 创建工单日期、状态、严重程度、专业类型格式化工具 `lib/tickets/formatters.ts`
- [X] T009 创建 `ticketStatus`、`ticketSort`、`ticketId` 查询参数解析工具 `lib/tickets/query-params.ts`
- [X] T010 扩展根页面 `searchParams` 类型以接收阶段 2 工单参数 `app/page.tsx`

**检查点**: P1 数据底座任务可以开始实现

---

## Phase 3: 用户故事 1 - 建立可演示工单数据底座（优先级: P1）

**目标**: 建立工单、处理记录、RLS 和阶段 2 演示数据，让当前身份能读取符合权限范围的真实工单样例

**独立验收**: 应用 migration 和 seed 后，阶段 1 的至少 4 个测试账号能在 Supabase 数据中对应到当前项目、当前角色可见的工单样例；每张工单至少有一条处理记录

### 实现任务

- [X] T011 [US1] 创建 `tickets`、`ticket_activity_logs` 表、枚举约束、索引、grant 和只读 RLS `supabase/migrations/202607030002_stage2_ticket_readonly.sql`
- [X] T012 [US1] 在 migration 中扩展同项目成员资料读取策略 `supabase/migrations/202607030002_stage2_ticket_readonly.sql`
- [X] T013 [P] [US1] 新增阶段 2 seed 脚本并按邮箱解析阶段 1 项目身份 `scripts/seed-stage2.mjs`
- [X] T014 [US1] 在 seed 脚本中 upsert 至少 12 张覆盖 3 项目、3 状态、4 严重程度、3 专业类型的工单 `scripts/seed-stage2.mjs`
- [X] T015 [US1] 在 seed 脚本中为每张工单 upsert 至少 1 条可解释状态的处理记录 `scripts/seed-stage2.mjs`
- [X] T016 [P] [US1] 在 npm scripts 中新增 `seed:stage2` 命令 `package.json`
- [X] T017 [US1] 更新 Supabase seed 说明以指向阶段 1 和阶段 2 seed 命令 `supabase/seed.sql`
- [X] T018 [US1] 执行阶段 2 migration 和 `npm run seed:stage2` 后按 quickstart 记录数据准备结果 `specs/002-ticket-readonly-foundation/quickstart.md`

**检查点**: P1 可独立演示，达到阶段 2 数据底座最小闭环

---

## Phase 4: 用户故事 2 - 按身份浏览我的工单列表（优先级: P2）

**目标**: 质检员只看自己发起的工单，施工方只看自己负责的工单，并支持待处理/已结束/全部筛选、最新/最旧排序和紧急置顶

**独立验收**: 使用 `li.qc@example.com` 和 `wang.builder@example.com` 分别进入工单列表，确认数据范围、筛选、排序和紧急置顶符合契约

### 实现任务

- [X] T019 [P] [US2] 实现按当前身份读取普通工单列表的服务端查询 `lib/tickets/queries.ts`
- [X] T020 [P] [US2] 实现工单状态筛选控件 `components/tickets/ticket-status-filter.tsx`
- [X] T021 [P] [US2] 实现工单排序控件 `components/tickets/ticket-sort-control.tsx`
- [X] T022 [P] [US2] 实现普通工单列表项和紧急工单高亮 `components/tickets/ticket-list-item.tsx`
- [X] T023 [US2] 实现普通工单列表、空状态和筛选摘要 `components/tickets/ticket-list.tsx`
- [X] T024 [US2] 在页面内容组件中用普通工单列表替换 `tickets` 占位内容 `components/app-shell/page-content.tsx`
- [X] T025 [US2] 在根页面按 `ticketStatus` 和 `ticketSort` 读取并传递普通工单列表数据 `app/page.tsx`
- [X] T026 [US2] 手工验证质检员和施工方列表范围、筛选、排序、紧急置顶并记录到 quickstart 验收结果 `specs/002-ticket-readonly-foundation/quickstart.md`

**检查点**: P1 和 P2 均可独立演示

---

## Phase 5: 用户故事 3 - 查看通用只读工单详情（优先级: P3）

**目标**: 所有有权访问工单的角色可打开同一套只读详情，完整查看基础信息、问题信息、处理信息和处理记录

**独立验收**: 从普通工单列表打开详情，确认四个信息分区完整、无写入按钮、现场图片和缺失字段展示正常，无权限和未找到状态可复现

### 实现任务

- [X] T027 [P] [US3] 实现按 `ticketId` 读取只读详情和处理记录的服务端查询 `lib/tickets/queries.ts`
- [X] T028 [P] [US3] 实现工单基础信息和问题信息展示组件 `components/tickets/ticket-detail.tsx`
- [X] T029 [P] [US3] 实现处理记录倒序展示组件 `components/tickets/ticket-activity-list.tsx`
- [X] T030 [P] [US3] 实现工单未找到和无权限状态组件 `components/tickets/ticket-detail-state.tsx`
- [X] T031 [US3] 在普通工单列表项中接入 `ticketId` 链接参数 `components/tickets/ticket-list-item.tsx`
- [X] T032 [US3] 在页面内容组件中接入只读详情渲染分支并确保不展示写入按钮 `components/app-shell/page-content.tsx`
- [X] T033 [US3] 在根页面按 `ticketId` 读取详情并区分正常、无权限、未找到状态 `app/page.tsx`
- [X] T034 [US3] 手工验证详情四分区、图片占位、缺失字段、无权限和未找到状态并记录到 quickstart 验收结果 `specs/002-ticket-readonly-foundation/quickstart.md`

**检查点**: 普通列表到只读详情的浏览闭环可独立演示

---

## Phase 6: 用户故事 4 - 管理员查看项目全部工单基础列表（优先级: P3）

**目标**: 管理员可查看当前项目全部工单基础列表，并从管理员列表打开同一套只读详情

**独立验收**: 使用 `chen.admin@example.com` 进入管理员工单中心，确认当前项目全部工单可见，列表包含发起人和当前责任人，并能打开详情

### 实现任务

- [X] T035 [P] [US4] 实现管理员项目全部工单列表查询分支 `lib/tickets/queries.ts`
- [X] T036 [P] [US4] 实现管理员工单表格行和紧急工单突出展示 `components/tickets/admin-ticket-table.tsx`
- [X] T037 [US4] 在页面内容组件中用管理员基础列表替换 `admin-tickets` 占位内容 `components/app-shell/page-content.tsx`
- [X] T038 [US4] 在根页面为 `admin-tickets` view 读取当前项目全部工单并传递详情数据 `app/page.tsx`
- [X] T039 [US4] 手工验证管理员列表项目范围、发起人、责任人、查看详情入口并记录到 quickstart 验收结果 `specs/002-ticket-readonly-foundation/quickstart.md`

**检查点**: 阶段 2 所有目标用户故事均可独立演示

---

## Phase 7: 收尾与静态检查

**目的**: 完成演示交付前的必要整理和项目进度更新

- [X] T040 [P] 对照原型和阶段 2 契约检查工单列表与详情中文文案 `components/tickets/ticket-list.tsx`
- [X] T041 [P] 对照原型和阶段 2 契约检查管理员基础列表中文文案 `components/tickets/admin-ticket-table.tsx`
- [X] T042 移除阶段 2 已替换页面中的过时占位说明 `components/app-shell/page-content.tsx`
- [X] T043 运行 `npm run check` 并依据结果修复或记录问题 `package.json`
- [X] T044 按阶段追踪规则更新阶段 2 状态、交付、验证结果和遗留问题 `progress.md`
- [X] T045 标记已完成任务并保留未完成原因（如有）`specs/002-ticket-readonly-foundation/tasks.md`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备与结构确认**: 无依赖，可立即开始
- **Phase 2 基础实现**: 依赖 Phase 1，阻塞所有用户故事
- **Phase 3 / US1**: 依赖 Phase 2，必须先完成数据结构、RLS 和 seed
- **Phase 4 / US2**: 依赖 US1 的数据底座和共享类型
- **Phase 5 / US3**: 依赖 US2 的列表入口和 US1 的处理记录数据
- **Phase 6 / US4**: 依赖 US1 的数据底座和 US3 的只读详情
- **Phase 7 收尾与静态检查**: 依赖计划内目标用户故事完成

### 用户故事依赖

- **US1 (P1)**: MVP 数据底座，必须最先完成
- **US2 (P2)**: 依赖 US1，可在数据底座可用后独立演示普通工单列表
- **US3 (P3)**: 依赖 US1 和 US2，可从普通列表打开详情独立验收
- **US4 (P3)**: 依赖 US1 和 US3，可复用只读详情并验证管理员项目范围

### 并行机会

- T002、T003、T005 可与 T001 并行完成。
- T007、T008 可与 T006 并行完成；T009 需在类型约定明确后完成。
- T013 可与 T011/T012 并行起草，但 T014/T015 需以最终 schema 为准。
- T020、T021、T022 可并行实现；T023 依赖这些控件和列表项。
- T028、T029、T030 可并行实现；T032 依赖详情查询和状态组件。
- T035、T036 可在 US3 详情组件稳定后并行推进。

---

## 实施策略

### MVP First（只完成 P1）

1. 完成 Phase 1 和 Phase 2。
2. 完成 Phase 3 的 migration、RLS、seed 和 npm script。
3. 应用 migration 并运行 `npm run seed:stage2`。
4. 确认至少 12 张工单、处理记录和多身份可见数据准备完成。

### 增量交付

1. P1 数据底座可用后进入 US2 普通工单列表。
2. 普通列表可演示后进入 US3 只读详情。
3. 只读详情稳定后进入 US4 管理员基础列表。
4. 每完成一个用户故事，都按 quickstart 复验已完成故事没有回归。
5. 最后运行 `npm run check` 并更新 `progress.md`。

## 注意事项

- 本阶段不实现创建、编辑、解决、拒绝、指派他人、重新打开、助手查单、助手建单、知识问答或管理员大盘。
- 不新增依赖、不新增状态管理库、不新增 API route，除非实现过程中发现现有结构无法满足 spec 并先更新 plan。
- 所有页面文案保持中文；代码标识符、枚举值、文件路径可使用英文。

