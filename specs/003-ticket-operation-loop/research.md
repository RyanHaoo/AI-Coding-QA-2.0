# Phase 0 研究: 工单状态流转与操作记录

## 决策 1: 阶段 3 继续沿用当前 Next.js App Router 和查询参数模型

**Decision**: 工单操作仍在现有首页壳层和 `view` 查询参数下完成，不新增 `/tickets/[id]` 路由或独立管理后台路由。

**Rationale**: 阶段 1/2 已通过 `app/page.tsx`、`PageContent`、`view`、`ticketId`、`ticketStatus` 和 `ticketSort` 建立可演示导航模型。阶段 3 的目标是补齐详情写入操作，沿用现有模型可以最小化路由改造，并保证操作完成后列表和详情刷新路径清晰。

**Alternatives considered**:

- 新增 `/tickets/[id]` 和 `/admin/tickets/[id]`: 更接近长期产品，但会扩大 App Router 结构调整范围。
- 完全客户端状态控制详情和弹窗: URL 不可复现，不利于验证无权限、未找到和刷新后状态一致性。

## 决策 2: 使用 Server Actions 承载工单写入

**Decision**: 编辑、解决、拒绝、指派他人和重新打开通过 Next.js Server Actions 提交，操作成功后 `revalidatePath("/")` 并回到当前列表或详情上下文。

**Rationale**: 当前项目已经在 `app/actions.ts` 使用 Server Actions 处理登录、身份选择和退出。阶段 3 写入表单天然来自工单详情页面，使用 Server Actions 可以复用表单提交、当前会话、cookie 身份、服务端校验和页面刷新，不需要新增 REST API route 或客户端数据缓存。

**Alternatives considered**:

- 新增 API route: 会增加接口层、错误格式和客户端请求处理，当前 MVP 不需要。
- 客户端 Supabase mutation: 会把权限、状态校验和失败处理推到浏览器，且需要额外处理多步写入一致性。

## 决策 3: 服务端 action 内集中执行身份、状态和字段校验

**Decision**: 新增 `lib/tickets/operations` 或同等模块集中判断当前身份是否可编辑、解决、拒绝、指派或重新打开，并生成处理记录内容。Server Actions 调用该模块后再写入 Supabase。

**Rationale**: 阶段 3 的核心复杂度是角色、状态和用户与工单关系的组合规则。把规则集中在工单领域模块可以让按钮可见性、提交校验和处理记录生成共享同一套判断，避免组件里重复散落条件。

**Alternatives considered**:

- 只在 UI 按钮层控制: 无法阻止直接提交或状态过期后的无权操作。
- 每个 action 独立写规则: 初期可行，但容易造成按钮和提交校验不一致。

## 决策 4: 使用受控 admin client 执行多表写入

**Decision**: Server Actions 先用普通 Supabase server client 验证登录用户和当前身份，再使用现有 `createAdminClient()` 读取目标工单、更新 `tickets` 并插入 `ticket_activity_logs`。

**Rationale**: 阶段 2 的表目前只授予 authenticated select。阶段 3 每次操作都需要同时更新工单并新增处理记录，还要在指派时读取项目内施工方。用受控服务端 action 包住 admin client，可以在不暴露 service key 的前提下保持实现简单，并符合当前“演示级权限控制”的项目决策。

**Alternatives considered**:

- 为所有写入补充细粒度 RLS insert/update 策略: 更接近生产安全，但会显著增加 SQL 策略复杂度和调试成本。
- 新增 Postgres RPC/security definer 函数: 原子性更好，但对当前 MVP 偏重，会把大量业务文案生成写进数据库。

## 决策 5: 图片新增/删除在阶段 3 仅服务工单详情编辑态

**Decision**: 阶段 3 支持在工单详情编辑态新增和删除当前工单现场图片，图片结果写回 `tickets.image_urls`；助手对话图片、图片理解和建单图片保留到阶段 6。

**Rationale**: 这是 clarify 已确认的范围边界。当前工单图片字段已经是 URL 数组，适合承载编辑态图片结果；阶段 3 不需要引入图片识别、对话上下文或建单草稿图片处理。

**Alternatives considered**:

- 图片上传全部推迟到阶段 6: 会使阶段 3 编辑态与原型和澄清结果不一致。
- 阶段 3 同时实现助手图片: 超出当前阶段范围，会引入 Coze 和助手上下文复杂度。

## 决策 6: 指派候选人来自当前项目施工方身份

**Decision**: 指派他人表单只展示当前项目内角色为施工方且不是当前责任人的项目身份。

**Rationale**: 原始规格要求新责任人必须是当前项目内另一名施工方。用 `project_memberships` 而不是 `app_users` 作为候选单位，能保持“用户 + 项目 + 角色”的身份边界，与阶段 2 工单参与人模型一致。

**Alternatives considered**:

- 展示所有施工方用户: 会跨项目泄露成员并破坏项目边界。
- 允许指派给管理员或质检员: 不符合工单责任人必须是施工方的规则。

## 决策 7: 处理记录内容由系统自动生成，原因由用户输入

**Decision**: `reason` 保存用户填写的拒绝原因、指派原因、重新打开原因等；`content` 由系统基于状态、责任人或字段变化自动生成中文摘要。

**Rationale**: 规格要求处理记录解释工单为何处于当前状态。自动生成 `content` 可以保持记录格式一致，用户只需要输入业务原因或结论，减少表单负担。

**Alternatives considered**:

- 让用户完整填写处理记录内容: 输入负担重，记录格式不稳定。
- 只记录操作类型不记录内容: 无法解释责任人、状态或字段变化。
