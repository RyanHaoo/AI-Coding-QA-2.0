# 任务清单: 工单状态流转与操作记录

**输入**: `/specs/003-ticket-operation-loop/` 下的设计文档

**前置文档**: plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/ticket-operation-flow.md、quickstart.md

**测试**: 默认不创建自动化测试任务；本阶段使用 `quickstart.md` 的人工验收路径和 `npm run check` 作为质量门槛。

**组织方式**: 任务按用户故事分组，先完成 P1 最小可演示闭环，再处理 P2/P3。

## 格式: `[ID] [P?] [Story] 任务描述`

- **[P]**: 可并行执行，前提是修改不同文件且没有顺序依赖
- **[Story]**: 对应用户故事，例如 US1、US2、US3
- 描述包含准确文件路径

## Phase 1: 准备与结构确认

**目的**: 确认阶段 3 实现落点、当前技术栈和本地 Next.js 16 文档约束。

- [ ] T001 查阅 `node_modules/next/dist/docs/` 中 Server Actions、forms、redirect、revalidatePath 相关本地文档，并在 `specs/003-ticket-operation-loop/research.md` 确认实现注意事项
- [ ] T002 对照 `specs/003-ticket-operation-loop/plan.md` 确认阶段 3 只修改 `app/actions.ts`、`app/page.tsx`、`components/tickets/`、`lib/tickets/`、`lib/supabase/`、`supabase/migrations/`、`progress.md`
- [ ] T003 [P] 对照 `specs/003-ticket-operation-loop/quickstart.md` 确认可用于验收的阶段 1/2 测试账号和阶段 2 工单样例数据
- [ ] T004 [P] 对照 `specs/003-ticket-operation-loop/contracts/ticket-operation-flow.md` 确认五类操作表单字段和失败反馈文案

---

## Phase 2: 基础实现（阻塞 P1）

**目的**: 完成所有工单操作共享且 P1 解决/拒绝无法绕开的基础能力。

**关键规则**: 本阶段只放共享基础能力；编辑图片、指派和重新打开的专属 UI 放入对应用户故事。

- [ ] T005 在 `supabase/migrations/202607030003_stage3_ticket_operations.sql` 创建阶段 3 最小写入支持，包括 authenticated 必要权限、Storage bucket 或等效图片持久化配置、以及不破坏阶段 2 RLS 的策略说明
- [ ] T006 在 `lib/tickets/types.ts` 增加 `TicketOperationState`、`TicketOperationPermission`、五类操作输入类型和指派候选人类型
- [ ] T007 [P] 在 `lib/tickets/formatters.ts` 增加阶段 3 处理记录内容、字段变化和操作错误提示所需的中文格式化函数
- [ ] T008 在 `lib/tickets/operations.ts` 新建工单操作权限判断、状态流转校验、必填字段校验和处理记录内容生成逻辑
- [ ] T009 在 `lib/tickets/mutations.ts` 新建服务端写入函数骨架，使用当前身份校验后通过受控 admin client 更新 `tickets` 并插入 `ticket_activity_logs`
- [ ] T010 在 `app/actions.ts` 新增阶段 3 Server Actions 的共同表单状态类型、当前身份解析、失败返回和成功 `revalidatePath("/")` 处理
- [ ] T011 在 `components/tickets/ticket-operation-panel.tsx` 新建详情操作区骨架，根据 `TicketOperationPermission` 展示允许按钮和表单容器
- [ ] T012 在 `components/tickets/ticket-detail.tsx` 接入 `TicketOperationPanel` 并传入当前工单、当前身份、返回视图、筛选和排序上下文
- [ ] T013 在 `app/page.tsx` 将 `currentIdentity` 传递给工单详情组件，保持 `view`、`ticketId`、`ticketStatus`、`ticketSort` 查询参数模型不变

**检查点**: P1 解决/拒绝工单可以开始实现。

---

## Phase 3: 用户故事 1 - 处理待处理工单（优先级: P1）

**目标**: 施工方或管理员可以将待处理工单解决或拒绝，并生成可追溯处理记录。

**独立验收**: 使用施工方或管理员身份打开待处理工单，分别完成解决和拒绝；详情和列表刷新后状态、处理信息和处理记录一致。

### 实现任务

- [ ] T014 [P] [US1] 在 `components/tickets/ticket-resolve-form.tsx` 创建解决工单表单，包含问题归因必填、预防建议选填、提交 pending 和错误提示
- [ ] T015 [P] [US1] 在 `components/tickets/ticket-reject-form.tsx` 创建拒绝工单表单，包含拒绝原因必填、提交 pending 和错误提示
- [ ] T016 [US1] 在 `app/actions.ts` 实现 `resolveTicketAction` 和 `rejectTicketAction`，解析 `FormData` 并调用 `lib/tickets/mutations.ts`
- [ ] T017 [US1] 在 `lib/tickets/mutations.ts` 实现解决工单写入：校验当前责任人或管理员、状态为待处理、写入 `root_cause`/`preventive_action`、状态改为 `completed`、新增 `resolved` 处理记录
- [ ] T018 [US1] 在 `lib/tickets/mutations.ts` 实现拒绝工单写入：校验当前责任人或管理员、状态为待处理、状态改为 `rejected`、新增 `rejected` 处理记录
- [ ] T019 [US1] 在 `components/tickets/ticket-operation-panel.tsx` 接入解决和拒绝表单，并确保已完成或已拒绝工单不展示解决/拒绝入口
- [ ] T020 [US1] 按 `specs/003-ticket-operation-loop/quickstart.md` 验收路径 1 和路径 2 人工走通解决/拒绝流程并记录发现的问题到 `progress.md`

**检查点**: P1 可独立演示，达到阶段 3 MVP 最小闭环。

---

## Phase 4: 用户故事 2 - 编辑待处理工单问题信息（优先级: P2）

**目标**: 发起人、当前责任人或管理员可以编辑待处理工单的问题信息和现场图片，保存后生成编辑记录，取消后不改变已保存内容。

**独立验收**: 使用有权身份进入编辑模式，修改字段和图片后保存；详情更新且处理记录新增“编辑”。取消编辑时恢复原内容。

### 实现任务

- [ ] T021 [P] [US2] 在 `components/tickets/ticket-edit-form.tsx` 创建编辑工单表单，覆盖严重程度、专业类型、问题描述、详细位置、问题详情、保留图片和新增图片
- [ ] T022 [P] [US2] 在 `components/tickets/ticket-image-editor.tsx` 创建现场图片编辑组件，支持已有图片删除、新图片选择、图片数量展示和错误提示
- [ ] T023 [US2] 在 `lib/tickets/image-storage.ts` 新建图片上传辅助函数，将阶段 3 新增图片转换为可写入 `tickets.image_urls` 的可访问 URL
- [ ] T024 [US2] 在 `app/actions.ts` 实现 `editTicketAction`，解析编辑字段、保留图片 URL 和新增图片
- [ ] T025 [US2] 在 `lib/tickets/mutations.ts` 实现编辑工单写入：校验发起人/当前责任人/管理员、状态为待处理、仅更新问题信息字段和 `image_urls`、新增 `edited` 处理记录
- [ ] T026 [US2] 在 `components/tickets/ticket-operation-panel.tsx` 接入编辑模式、保存和取消流程，并确保只读字段不可编辑
- [ ] T027 [US2] 按 `specs/003-ticket-operation-loop/quickstart.md` 验收路径 3 人工走通编辑字段、图片新增/删除、保存和取消流程并记录发现的问题到 `progress.md`

**检查点**: P1 和 US2 均可独立演示。

---

## Phase 5: 用户故事 3 - 指派他人继续处理（优先级: P2）

**目标**: 当前责任人或管理员可以把待处理工单指派给当前项目内另一名施工方，责任人变化后列表范围同步变化。

**独立验收**: 使用施工方或管理员身份完成指派；原责任人列表不再展示该工单，新责任人列表展示该工单，处理记录说明责任人变化。

### 实现任务

- [ ] T028 [P] [US3] 在 `lib/tickets/queries.ts` 增加当前项目施工方指派候选人查询函数，排除当前责任人
- [ ] T029 [P] [US3] 在 `components/tickets/ticket-reassign-form.tsx` 创建指派他人表单，包含候选施工方选择、指派原因必填、无候选人状态和错误提示
- [ ] T030 [US3] 在 `app/page.tsx` 为打开的工单详情加载指派候选人，并只在有权指派时传入组件
- [ ] T031 [US3] 在 `app/actions.ts` 实现 `reassignTicketAction`，解析新责任人和指派原因
- [ ] T032 [US3] 在 `lib/tickets/mutations.ts` 实现指派写入：校验当前责任人或管理员、状态为待处理、新责任人为当前项目另一名施工方、更新 `assignee_membership_id`、新增 `reassigned` 处理记录
- [ ] T033 [US3] 在 `components/tickets/ticket-operation-panel.tsx` 接入指派表单，并处理无其他施工方可指派的禁用或提示状态
- [ ] T034 [US3] 按 `specs/003-ticket-operation-loop/quickstart.md` 验收路径 4 人工走通指派、原责任人列表消失、新责任人列表出现并记录发现的问题到 `progress.md`

**检查点**: P1、US2、US3 均可独立演示。

---

## Phase 6: 用户故事 4 - 重新打开已结束工单（优先级: P3）

**目标**: 发起人或管理员可以将已完成或已拒绝工单重新打开，状态恢复待处理且当前责任人不变。

**独立验收**: 使用发起人或管理员身份重新打开已完成和已拒绝工单；状态、责任人、处理记录和责任人待处理列表符合预期。

### 实现任务

- [ ] T035 [P] [US4] 在 `components/tickets/ticket-reopen-form.tsx` 创建重新打开表单，包含重新打开原因必填、提交 pending 和错误提示
- [ ] T036 [US4] 在 `app/actions.ts` 实现 `reopenTicketAction`，解析工单 id 和重新打开原因
- [ ] T037 [US4] 在 `lib/tickets/mutations.ts` 实现重新打开写入：校验发起人或管理员、状态为已完成或已拒绝、状态改为 `pending`、责任人保持不变、新增 `reopened` 处理记录
- [ ] T038 [US4] 在 `components/tickets/ticket-operation-panel.tsx` 接入重新打开表单，并确保待处理工单不展示重新打开入口
- [ ] T039 [US4] 按 `specs/003-ticket-operation-loop/quickstart.md` 验收路径 5 人工走通已完成和已拒绝工单重新打开并记录发现的问题到 `progress.md`

**检查点**: 已结束工单可恢复到待处理并重新进入责任人列表。

---

## Phase 7: 用户故事 5 - 按角色和状态展示可用操作（优先级: P3）

**目标**: 工单详情只展示当前身份和状态允许的操作，服务端提交也拒绝越权或过期状态操作。

**独立验收**: 使用质检员、施工方和管理员分别查看待处理、已完成、已拒绝工单，核对按钮可见性并尝试越权提交。

### 实现任务

- [ ] T040 [US5] 在 `lib/tickets/operations.ts` 统一导出按钮可见性和服务端提交共用的 `getTicketOperationPermission` 规则
- [ ] T041 [US5] 在 `components/tickets/ticket-operation-panel.tsx` 使用 `getTicketOperationPermission` 的结果统一控制编辑、解决、拒绝、指派、重新打开入口
- [ ] T042 [US5] 在 `lib/tickets/mutations.ts` 为所有写入路径补齐工单不存在、无权限、状态过期、项目不匹配和必填字段缺失的统一错误返回
- [ ] T043 [US5] 在 `components/tickets/ticket-detail.tsx` 和 `components/tickets/ticket-operation-panel.tsx` 确保操作成功后返回详情或列表时状态、责任人、处理信息和处理记录显示最新结果
- [ ] T044 [US5] 按 `specs/003-ticket-operation-loop/quickstart.md` 验收路径 6 和异常验收人工核对三类角色、三种状态、越权提交和状态过期提示并记录发现的问题到 `progress.md`

**检查点**: 所有阶段 3 操作入口、服务端权限和失败反馈一致。

---

## Phase 8: 收尾与静态检查

**目的**: 完成演示交付前的必要整理和项目进度更新。

- [ ] T045 [P] 更新 `specs/003-ticket-operation-loop/quickstart.md`，补充实际开发服务地址、迁移/Storage 应用方式和最终人工验收结果
- [ ] T046 [P] 更新 `progress.md` 的阶段 3 状态、完成日期、主要交付、验证结果、遗留问题和下一阶段入口条件
- [ ] T047 移除 `components/tickets/`、`lib/tickets/`、`app/actions.ts` 中未使用代码、占位文案和与阶段 3 无关的临时逻辑
- [ ] T048 运行 `npm run check` 并修复 `app/`、`components/`、`lib/`、`supabase/` 中出现的 TypeScript、Biome format 或 lint 问题
- [ ] T049 按 `specs/003-ticket-operation-loop/quickstart.md` 完成阶段 3 全路径人工验收，并在 `progress.md` 记录无法运行的检查及原因（如有）

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备与结构确认**: 无依赖，可立即开始。
- **Phase 2 基础实现**: 依赖 Phase 1，完成后才能开始 P1 写入。
- **Phase 3 / US1**: 依赖 Phase 2，是 MVP 最小闭环，必须最先完成。
- **Phase 4 / US2**: 依赖 Phase 2 和 US1 的基础 action/权限框架，不应破坏 US1。
- **Phase 5 / US3**: 依赖 Phase 2 和 US1 的基础 action/权限框架，可与 US2 在不同文件上部分并行。
- **Phase 6 / US4**: 依赖 Phase 2 和 US1 的基础状态流转框架。
- **Phase 7 / US5**: 依赖 US1-US4 的操作入口和写入路径完成后统一收敛。
- **Phase 8 收尾与静态检查**: 依赖目标用户故事完成。

### 用户故事依赖

- **US1 (P1)**: 独立 MVP，完成解决和拒绝闭环。
- **US2 (P2)**: 可独立演示编辑，但复用 US1 建立的操作面板、action 状态和 mutation 结构。
- **US3 (P2)**: 可独立演示指派，但复用 US1 建立的操作面板、action 状态和 mutation 结构。
- **US4 (P3)**: 可独立演示重新打开，但复用同一权限和 mutation 结构。
- **US5 (P3)**: 横向收敛所有操作入口和服务端拒绝规则，必须在各操作路径存在后完成。

### 单个用户故事内部顺序

- 类型和校验规则先于 action。
- action 先于表单最终接入。
- 表单和 mutation 可在字段契约稳定后并行。
- 人工验收必须在对应故事实现完成后执行。

### 并行机会

- T003、T004 可并行做验收资料和表单字段确认。
- T006、T007 可并行扩展类型和格式化函数。
- T014、T015 可并行开发解决和拒绝表单。
- T021、T022 可并行开发编辑表单和图片编辑组件。
- T028、T029 可并行开发指派候选查询和指派表单。
- T045、T046 可并行更新 quickstart 和 progress。

---

## 实施策略

### MVP First（只完成 P1）

1. 完成 Phase 1。
2. 完成 Phase 2 的共享基础能力。
3. 完成 Phase 3 / US1。
4. 使用 `wang.builder@example.com` 或 `chen.admin@example.com` 走通解决和拒绝流程。
5. 运行 `npm run check`，记录结果。

### 增量交付

1. P1 可演示后再进入编辑和指派。
2. 每完成一个用户故事，按 quickstart 对应路径人工验收，并确认 P1 没有回归。
3. 重新打开和全量按钮规则在不影响 P1/P2 的前提下推进。
4. 全部完成后更新 `progress.md` 并运行静态检查。

## 注意事项

- 不新增状态管理库、表单库、上传库或 API 框架。
- 不新增独立 REST API route，不改写当前 `view` 查询参数导航模型。
- Server Actions 必须在服务端重新校验当前身份、项目、角色、工单状态和指派候选人。
- 阶段 3 图片能力只服务工单详情编辑态；助手图片、图片理解和建单图片保留到阶段 6。
- 不默认创建自动化测试任务；本阶段以 quickstart 人工验收和 `npm run check` 为质量门槛。
