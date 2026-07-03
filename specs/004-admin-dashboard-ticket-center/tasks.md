# 任务清单: 管理员态势大盘与工单中心

**输入**: `/specs/004-admin-dashboard-ticket-center/` 下的设计文档

**前置文档**: plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/admin-dashboard-ticket-center-flow.md、quickstart.md

**测试**: 默认不创建自动化测试任务；本阶段使用 `quickstart.md` 的人工验收路径和 `npm run check` 作为质量门槛。

**组织方式**: 任务按用户故事分组，先完成 P1 最小可演示闭环，再处理 P2/P3。

## 格式: `[ID] [P?] [Story] 任务描述`

- **[P]**: 可并行执行，前提是修改不同文件且没有顺序依赖
- **[Story]**: 对应用户故事，例如 US1、US2、US3
- 描述包含准确文件路径

## Phase 1: 准备与结构确认

**目的**: 确认阶段 5 实现落点、当前技术栈和本地 Next.js 16 文档约束。

- [ ] T001 查阅 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`、`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`、`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`，并在 `specs/004-admin-dashboard-ticket-center/research.md` 确认阶段 5 实现注意事项
- [ ] T002 对照 `specs/004-admin-dashboard-ticket-center/plan.md` 确认阶段 5 只修改 `app/page.tsx`、`components/app-shell/page-content.tsx`、`components/tickets/`、`lib/tickets/`、`lib/identity/`、`progress.md`
- [ ] T003 [P] 对照 `specs/004-admin-dashboard-ticket-center/contracts/admin-dashboard-ticket-center-flow.md` 确认管理员视图 URL、筛选查询参数、表格列和详情联动契约
- [ ] T004 [P] 对照 `specs/004-admin-dashboard-ticket-center/quickstart.md` 确认可用于验收的管理员、质检员、施工方和多身份测试账号

---

## Phase 2: 基础实现（阻塞 P1）

**目的**: 完成管理员大盘、指标下钻和工单中心共享的类型、查询参数和数据读取基础。

**关键规则**: 本阶段只放共享基础能力；大盘 UI、表格 UI 和具体交互放入对应用户故事。

- [ ] T005 在 `lib/tickets/types.ts` 增加 `AdminTicketStatusFilter`、`AdminTicketFilters`、`AdminTicketCollection`、`AdminDashboardMetrics` 类型和对应标签映射
- [ ] T006 在 `lib/tickets/query-params.ts` 增加管理员筛选参数解析函数、默认值、清空筛选 URL 和保留筛选上下文的详情 URL 生成函数
- [ ] T007 在 `lib/tickets/queries.ts` 增加当前项目管理员工单全集读取函数，返回未筛选集合并复用现有 `TicketSummary` 映射
- [ ] T008 在 `lib/tickets/queries.ts` 增加管理员筛选应用函数，支持状态、严重程度、专业类型、关键词和工单编号过滤
- [ ] T009 [P] 在 `lib/tickets/queries.ts` 增加当前项目大盘指标派生函数，计算总数、状态数量、严重程度数量和重点关注工单集合
- [ ] T010 在 `app/page.tsx` 扩展 `searchParams` 类型，读取管理员筛选参数，并在 `view=dashboard` 或 `view=admin-tickets` 时加载阶段 5 所需数据
- [ ] T011 在 `components/app-shell/page-content.tsx` 扩展 props，接收管理员大盘指标、管理员筛选条件和管理员工单集合

**检查点**: US1 数据大盘和 US2 指标下钻可以开始实现。

---

## Phase 3: 用户故事 1 - 查看项目质检态势（优先级: P1）

**目标**: 管理员可以在数据大盘查看当前项目信息、工单总数、状态分布、严重程度分布和紧急重点关注信息。

**独立验收**: 使用管理员身份打开 `/?view=dashboard`，确认所有指标仅统计当前项目，空数据展示为 0，紧急和待处理信息能被明确识别。

### 实现任务

- [ ] T012 [P] [US1] 在 `components/tickets/admin-dashboard.tsx` 创建管理员数据大盘组件，展示当前项目信息、工单总数、待处理、已完成、已拒绝和紧急数量
- [ ] T013 [P] [US1] 在 `components/tickets/admin-dashboard.tsx` 增加状态概览和严重程度分布展示，确保四类严重程度和三类状态缺失时显示 0
- [ ] T014 [US1] 在 `components/tickets/admin-dashboard.tsx` 增加紧急工单或重点关注区域，没有紧急工单时展示“当前无紧急工单”
- [ ] T015 [US1] 在 `components/app-shell/page-content.tsx` 将 `view=dashboard` 的占位状态替换为 `AdminDashboard`，并传入当前身份和大盘指标
- [ ] T016 [US1] 在 `components/tickets/index.ts` 导出 `AdminDashboard`，保持工单组件统一出口
- [ ] T017 [US1] 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 验收路径 1 人工走通管理员数据大盘，并记录发现的问题到 `progress.md`

**检查点**: 管理员数据大盘可独立演示。

---

## Phase 4: 用户故事 2 - 从重点指标进入工单中心（优先级: P1）

**目标**: 管理员点击大盘待处理、紧急或其他关键指标后，自动进入管理员工单中心并应用对应筛选条件。

**独立验收**: 使用管理员身份点击待处理和紧急指标，确认进入工单中心后筛选条件已自动生效，表格只展示符合该指标范围的工单。

### 实现任务

- [ ] T018 [P] [US2] 在 `lib/tickets/query-params.ts` 增加从大盘指标生成 `view=admin-tickets` 链接的 helper，覆盖待处理、已完成、已拒绝、紧急和全部工单入口
- [ ] T019 [US2] 在 `components/tickets/admin-dashboard.tsx` 为待处理、已完成、已拒绝、紧急和总数指标接入自动筛选下钻链接
- [ ] T020 [US2] 在 `components/tickets/admin-dashboard.tsx` 为重点关注区域中的紧急工单摘要接入 `adminSeverity=urgent` 或详情链接
- [ ] T021 [US2] 在 `components/tickets/admin-ticket-table.tsx` 显示来自大盘自动下钻的已生效筛选条件，确保管理员能看见筛选来源
- [ ] T022 [US2] 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 验收路径 2 人工走通待处理和紧急指标自动下钻，并记录发现的问题到 `progress.md`

**检查点**: P1 “大盘态势 -> 自动筛选明细”最小闭环可独立演示。

---

## Phase 5: 用户故事 3 - 筛选并浏览当前项目全部工单（优先级: P2）

**目标**: 管理员可以在工单中心查看当前项目全部工单，并按状态、严重程度、专业类型、关键词和工单编号筛选。

**独立验收**: 使用管理员身份进入工单中心，分别应用状态、严重程度、专业类型、关键词和工单编号筛选，确认结果只包含当前项目内符合条件的工单，并可清空筛选恢复全部结果。

### 实现任务

- [ ] T023 [P] [US3] 在 `components/tickets/admin-ticket-filters.tsx` 创建管理员筛选区组件，包含状态、严重程度、专业类型、关键词、工单编号和清空筛选入口
- [ ] T024 [P] [US3] 在 `components/tickets/admin-ticket-table.tsx` 将列表展示改为管理员表格布局，展示工单编号、状态、严重程度、专业类型、问题摘要、创建时间、当前责任人、发起人和查看详情入口
- [ ] T025 [US3] 在 `components/tickets/admin-ticket-table.tsx` 接入 `AdminTicketFilters` 和筛选结果数量，支持筛选无结果、当前项目无工单和读取失败三类状态
- [ ] T026 [US3] 在 `components/tickets/admin-ticket-table.tsx` 突出展示紧急工单，并保证问题描述过长时表格截断但详情仍可查看完整内容
- [ ] T027 [US3] 在 `components/app-shell/page-content.tsx` 将 `AdminTicketTable` 接入筛选条件和 `AdminTicketCollection`，替换旧的管理员卡片列表调用
- [ ] T028 [US3] 在 `lib/tickets/query-params.ts` 确保管理员查看详情链接保留当前 `adminStatus`、`adminSeverity`、`adminSpecialty`、`adminKeyword`、`adminTicketNumber` 筛选上下文
- [ ] T029 [US3] 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 验收路径 3 人工走通全部筛选、组合筛选、清空筛选和无结果状态，并记录发现的问题到 `progress.md`

**检查点**: 管理员工单中心筛选和表格可独立演示。

---

## Phase 6: 用户故事 4 - 打开详情并执行管理干预（优先级: P2）

**目标**: 管理员从工单中心打开详情后，复用阶段 3 详情和操作规则，并在操作后保持详情、表格和大盘统计一致。

**独立验收**: 使用管理员身份从工单中心打开待处理、已完成和已拒绝工单，分别执行允许的管理操作，确认操作记录新增，表格行和大盘指标同步更新。

### 实现任务

- [ ] T030 [US4] 在 `app/page.tsx` 确保 `view=admin-tickets&ticketId=<id>` 时加载工单详情、指派候选人和管理员筛选上下文
- [ ] T031 [US4] 在 `components/app-shell/page-content.tsx` 将管理员筛选上下文传递给 `TicketDetail`，确保详情返回工单中心时保留管理员筛选条件
- [ ] T032 [US4] 在 `components/tickets/ticket-detail.tsx` 和 `lib/tickets/query-params.ts` 支持管理员详情返回链接保留 `admin*` 筛选参数
- [ ] T033 [US4] 在 `components/tickets/admin-ticket-table.tsx` 确认查看详情入口与表格行点击均使用管理员详情 URL，并保持当前筛选上下文
- [ ] T034 [US4] 在 `lib/tickets/mutations.ts` 确认阶段 3 管理操作成功后继续触发 `revalidatePath("/")`，让大盘和管理员表格在页面更新后读取最新数据
- [ ] T035 [US4] 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 验收路径 4 人工走通管理员详情操作、处理记录新增、表格和大盘统计同步，并记录发现的问题到 `progress.md`

**检查点**: 管理员工单中心可以完成查看详情和管理干预闭环。

---

## Phase 7: 用户故事 5 - 限制非管理员访问（优先级: P3）

**目标**: 质检员或施工方访问管理员大盘或管理员工单中心时被阻止；管理员也只能查看和干预当前身份所在项目。

**独立验收**: 使用质检员、施工方和多项目多身份账号访问管理员页面，确认非管理员不能进入；切换为不同项目管理员身份后，只能看到对应项目数据。

### 实现任务

- [ ] T036 [US5] 在 `lib/identity/navigation.ts` 确认 `dashboard` 和 `admin-tickets` 仅对 `admin` 角色开放，并补充必要的导航说明文案
- [ ] T037 [US5] 在 `app/page.tsx` 确认非管理员访问 `view=dashboard` 或 `view=admin-tickets` 时不会加载管理员统计或管理员工单集合
- [ ] T038 [US5] 在 `lib/tickets/queries.ts` 确认管理员大盘、管理员筛选和详情读取均限定 `currentIdentity.project.id`，不返回其他项目工单
- [ ] T039 [US5] 在 `components/app-shell/no-permission.tsx` 确认无权限反馈适用于管理员视图直达访问，并提供返回当前身份可访问页面的入口
- [ ] T040 [US5] 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 验收路径 5 和路径 6 人工走通非管理员拒绝访问、多项目身份边界，并记录发现的问题到 `progress.md`

**检查点**: 阶段 5 管理员视图访问边界可信。

---

## Phase 8: 收尾与静态检查

**目的**: 完成演示交付前的必要整理和项目进度更新。

- [ ] T041 [P] 更新 `specs/004-admin-dashboard-ticket-center/quickstart.md`，补充实际开发服务地址和最终人工验收结果
- [ ] T042 [P] 更新 `progress.md` 的阶段 5 状态、完成日期、主要交付、验证结果、遗留问题和下一阶段入口条件
- [ ] T043 移除 `components/tickets/`、`lib/tickets/`、`components/app-shell/page-content.tsx` 中未使用代码、占位文案和与阶段 5 无关的临时逻辑
- [ ] T044 运行 `npm run check` 并修复 `app/`、`components/`、`lib/` 中出现的 TypeScript、Biome format 或 lint 问题
- [ ] T045 按 `specs/004-admin-dashboard-ticket-center/quickstart.md` 完成阶段 5 全路径人工验收，并在 `progress.md` 记录无法运行的检查及原因（如有）

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备与结构确认**: 无依赖，可立即开始。
- **Phase 2 基础实现**: 依赖 Phase 1，完成后才能开始 P1 页面和下钻实现。
- **Phase 3 / US1**: 依赖 Phase 2，是数据大盘基础展示，必须先完成。
- **Phase 4 / US2**: 依赖 US1 的大盘组件和 Phase 2 的筛选 URL helper。
- **Phase 5 / US3**: 依赖 Phase 2 的筛选解析和管理员工单集合，可在 US1/US2 后独立完善。
- **Phase 6 / US4**: 依赖 US3 的管理员表格和详情入口，复用阶段 3 操作能力。
- **Phase 7 / US5**: 可在 Phase 2 后部分并行，但最终验收依赖 US1-US4 的管理员视图完成。
- **Phase 8 收尾与静态检查**: 依赖目标用户故事完成。

### 用户故事依赖

- **US1 (P1)**: 独立展示管理员项目态势，是阶段 5 管理员视图入口。
- **US2 (P1)**: 依赖 US1 的大盘指标，完成大盘到工单中心的最小下钻闭环。
- **US3 (P2)**: 依赖 Phase 2 的筛选基础，可独立演示管理员筛选和表格。
- **US4 (P2)**: 依赖 US3 的表格详情入口，复用阶段 3 管理操作。
- **US5 (P3)**: 横向收敛访问控制和项目边界，最终验证需覆盖管理员视图。

### 单个用户故事内部顺序

- 类型和查询参数先于数据查询。
- 数据查询先于页面组件接入。
- 页面组件和展示样式可在数据契约稳定后并行。
- URL 链接 helper 先于大盘指标下钻和详情返回链接。
- 人工验收必须在对应故事实现完成后执行。

### 并行机会

- T003、T004 可并行确认 UI 契约和验收账号。
- T009 可与 T006/T007/T008 并行开发统计派生逻辑，但最终需统一类型。
- T012、T013 可并行开发大盘指标卡和分布展示。
- T018 可与 T019 的组件接入前半段并行。
- T023、T024 可并行开发筛选区和表格布局。
- T041、T042 可并行更新 quickstart 和 progress。

---

## 实施策略

### MVP First（只完成 P1）

1. 完成 Phase 1。
2. 完成 Phase 2 的共享基础能力。
3. 完成 Phase 3 / US1 数据大盘。
4. 完成 Phase 4 / US2 指标自动下钻。
5. 使用 `chen.admin@example.com` 走通大盘和待处理/紧急指标下钻。
6. 运行 `npm run check`，记录结果。

### 增量交付

1. P1 可演示后再进入管理员筛选表格。
2. 表格可用后再进入详情联动和阶段 3 操作同步。
3. 每完成一个用户故事，按 quickstart 对应路径人工验收，并确认 P1 没有回归。
4. 非管理员访问限制和多项目边界在最终交付前必须完成。
5. 全部完成后更新 `progress.md` 并运行静态检查。

## 注意事项

- 不新增状态管理库、图表库、表格库、数据缓存层或 API 框架。
- 不新增独立后台路由，不改写当前 `view` 查询参数导航模型。
- 管理员筛选必须进入 URL 查询参数，支持刷新、详情返回和大盘自动下钻。
- 管理员详情操作必须复用阶段 3 的 `TicketDetail`、`TicketOperationPanel` 和 Server Actions。
- 大盘统计只统计当前登录身份所在项目，不做跨项目或集团级汇总。
- 不默认创建自动化测试任务；本阶段以 quickstart 人工验收和 `npm run check` 为质量门槛。
