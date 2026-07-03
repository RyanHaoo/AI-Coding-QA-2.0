# Phase 0 研究: 工单数据底座与只读详情

## 决策 1: 工单参与人引用 `project_memberships`

**Decision**: 工单的发起人、当前责任人和处理记录操作人均引用阶段 1 的 `project_memberships`，而不是只引用 `app_users`。

**Rationale**: 当前系统权限边界是“用户 + 项目 + 角色”。同一个用户可以在不同项目拥有不同角色，工单参与身份必须绑定项目角色，才能区分 Ryan 在上海项目管理员、苏州项目质检员和杭州项目施工方等场景。

**Alternatives considered**:

- 只引用 `app_users`: 无法表达同一用户在不同项目的角色身份。
- 在工单上冗余角色文本: 会在身份关系调整时产生不一致，不利于阶段 3 操作规则复用。

## 决策 2: 新增只读 RLS 策略覆盖角色数据范围

**Decision**: `tickets` 和 `ticket_activity_logs` 启用 RLS。质检员只能读当前项目中发起人为自己的工单，施工方只能读当前项目中当前责任人为自己的工单，管理员能读当前项目全部工单。处理记录继承所属工单的可见性。

**Rationale**: 阶段 2 的核心验收是不同身份看到不同工单范围。把边界放在数据库策略和服务端查询两层，可以避免直接访问详情时绕过列表限制。

**Alternatives considered**:

- 只在前端过滤: 直接访问详情或未来助手查单时容易泄露数据。
- 只在服务端查询过滤: 数据库层没有兜底，不符合当前 Supabase RLS 模式。

## 决策 3: 同项目成员资料可读用于姓名展示

**Decision**: 扩展 `app_users` select 策略，让已认证用户可以读取与自己存在同项目关系的成员资料。

**Rationale**: 工单列表和详情必须展示发起人、当前责任人和处理记录操作人姓名。阶段 1 的“只能读自己资料”策略会导致协作人姓名不可读。阶段 2 只扩大到同项目成员，仍以项目为边界。

**Alternatives considered**:

- 在工单和处理记录中冗余姓名: 简单但容易与用户资料不一致，也会让后续责任人变更和处理记录展示重复维护。
- 使用 service role 查询所有资料: 不适合应用运行时读取，会扩大权限面。

## 决策 4: 阶段 2 使用服务端只读查询层

**Decision**: 新增 `lib/tickets/` 封装列表、详情、状态筛选和排序查询，由 Server Components 调用；本阶段不新增 API route。

**Rationale**: 当前应用已经通过 `app/page.tsx` 和 Server Components 读取身份信息。阶段 2 是只读浏览，服务端查询可以直接复用 cookie 会话、减少客户端状态，并与 MVP 快速实现保持一致。

**Alternatives considered**:

- 新增 REST API route: 对只读页面没有必要，会增加接口层和错误处理复杂度。
- 客户端 Supabase 查询: 需要额外处理 loading、会话和权限错误；阶段 2 没有实时交互需求。

## 决策 5: 继续复用 `view` 查询参数承载页面切换

**Decision**: 工单列表、管理员工单中心和详情继续挂在当前首页壳层下，通过 `view`、`ticketId`、`ticketStatus` 和 `ticketSort` 等 query 参数表达当前视图状态。

**Rationale**: 阶段 1 已建立 `/?view=...` 的导航模型。阶段 2 使用同一模型可以最小化路由改造，并满足列表筛选、排序和详情打开的演示需求。

**Alternatives considered**:

- 新增 `/tickets/[id]` 路由: 更接近长期产品，但会扩大 App Router 页面结构调整范围。
- 完全客户端状态切换详情: URL 不可复现，无法直接验证未找到和无权限状态。

## 决策 6: 阶段 2 seed 脚本独立于阶段 1

**Decision**: 新增 `scripts/seed-stage2.mjs`，依赖阶段 1 的项目、用户和项目身份已存在，使用 service key upsert 至少 12 张工单和对应处理记录。

**Rationale**: 阶段 1 Auth 用户必须由 Auth Admin API 创建，阶段 2 只需要复用这些身份关系。独立 seed 脚本可以反复灌注工单样例，不影响账号创建流程。

**Alternatives considered**:

- 合并到 `seed-stage1.mjs`: 会让账号初始化和工单样例耦合，后续重复灌注不方便。
- 使用 `supabase/seed.sql`: 无法可靠引用 Auth 用户和动态身份关系。

## 决策 7: 现场图片阶段 2 仅保存 URL 数组

**Decision**: 工单现场图片在阶段 2 以 URL 数组或空数组保存，只做展示和占位，不接入上传存储。

**Rationale**: 规格要求阶段 2 只读展示图片，图片上传属于后续助手图片能力或编辑表单能力。URL 数组足以覆盖多图展示、空状态和演示样例。

**Alternatives considered**:

- 接入 Supabase Storage: 会把阶段 6 图片能力提前，增加配置和权限面。
- 单独图片表: 对阶段 2 的演示样例过重，当前不需要图片级元数据。
