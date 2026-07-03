# Phase 0 研究: 管理员态势大盘与工单中心

## 决策 1: 阶段 5 继续沿用当前单页 App Router 和 `view` 查询参数模型

**Decision**: 管理员数据大盘使用 `/?view=dashboard`，管理员工单中心使用 `/?view=admin-tickets`，不新增 `/admin`、`/dashboard` 或 `/tickets` 独立路由。

**Rationale**: 阶段 1/2/3 已通过 `app/page.tsx`、`PageContent`、角色导航和查询参数建立演示导航模型。阶段 5 的目标是补齐现有管理员视图，而不是重构路由。沿用现有模型可以复用身份选择、无权限判断、详情联动、工单操作和 `revalidatePath("/")` 刷新策略。

**Alternatives considered**:

- 新增 `/admin/dashboard` 和 `/admin/tickets`: 更接近长期后台结构，但会扩大路由、导航和权限调整范围。
- 把大盘和工单中心合并为单个页面: 初期更简单，但会削弱规格中“大盘态势 -> 工单中心明细”的演示路径。

## 决策 2: 管理员筛选状态进入 URL 查询参数

**Decision**: 管理员工单中心的状态、严重程度、专业类型、关键词和工单编号筛选使用 URL 查询参数表达，并由 `lib/tickets/query-params.ts` 统一解析和生成链接。

**Rationale**: 当前普通工单列表已经使用 `ticketStatus`、`ticketSort` 和 `ticketId` 查询参数。管理员筛选也放入 URL，可以支持大盘指标自动下钻、刷新后保留筛选、详情返回后恢复上下文，并保持 Server Component 数据读取模型。

**Alternatives considered**:

- 仅用客户端状态保存筛选: 刷新和详情返回会丢失上下文，不利于验收。
- 使用全局状态管理库: 超出 MVP，且现有查询参数模型已经满足需求。

## 决策 3: 大盘指标点击自动生成工单中心筛选链接

**Decision**: 待处理指标链接到 `view=admin-tickets` 并自动带入待处理状态筛选；紧急指标或重点关注区域链接到 `view=admin-tickets` 并自动带入紧急严重程度筛选。

**Rationale**: 这是 clarify 已确认的行为。自动筛选比仅高亮更可验收，管理员点击后可以直接看到该指标对应的工单集合，并在筛选区看到生效条件。

**Alternatives considered**:

- 只高亮相关范围: 实现解释空间大，验收不够明确。
- 进入工单中心但展示全部工单: 不符合“直接查看该指标对应明细”的用户目标。

## 决策 4: 大盘统计在应用层由当前项目工单集合派生

**Decision**: 阶段 5 优先通过当前项目工单查询结果在应用层计算总数、状态数量、严重程度分布和重点关注集合；仅当实现中发现查询性能或重复读取明显影响演示，再补充最小 SQL 聚合查询。

**Rationale**: 当前演示数据量小，管理员工单中心也需要完整工单摘要。复用同一项目工单集合可以减少新 SQL、RPC 或视图，保持统计和表格来源一致，降低数据不一致风险。

**Alternatives considered**:

- 新增数据库视图或 RPC 返回统计: 对生产更稳，但对当前 MVP 偏重。
- 每个指标单独查询 count: 实现简单但请求分散，容易造成统计和表格口径不一致。

## 决策 5: 管理员表格复用现有工单摘要模型并扩展展示

**Decision**: 管理员工单中心继续使用 `TicketSummary` 作为列表行基础数据，补齐筛选、表格列、紧急突出和查看详情入口；不引入表格库。

**Rationale**: `TicketSummary` 已包含规格要求的编号、状态、严重程度、专业类型、问题摘要、创建时间、责任人、发起人和图片数量。阶段 5 只需要更适合管理员扫描的表格布局和筛选控件，不需要排序、分页、列配置或虚拟滚动。

**Alternatives considered**:

- 新增表格组件库: 超出既有技术栈，也增加样式和依赖成本。
- 继续只用阶段 2/3 卡片列表: 可以复用但不满足 Stitch admin 参考中的管理员表格扫描体验。

## 决策 6: 详情和管理操作继续复用阶段 3 通用详情组件

**Decision**: 管理员从工单中心打开详情后继续使用 `TicketDetail`、`TicketOperationPanel` 和现有 Server Actions；阶段 5 不新增管理员专用操作规则。

**Rationale**: 规格明确阶段 5 复用阶段 3 已完成的管理干预操作。复用同一组件和权限判断能保证按钮可见性、提交校验、处理记录和 `revalidatePath("/")` 的行为一致。

**Alternatives considered**:

- 为管理员中心实现专用详情抽屉和专用 mutation: 会重复阶段 3 逻辑并增加不一致风险。
- 只读详情不支持操作: 不满足阶段 5 管理干预验收。

## 决策 7: 非管理员访问继续由角色导航和 `isViewAllowed` 拦截

**Decision**: 阶段 5 继续使用 `lib/identity/navigation.ts` 中的角色视图表和 `isViewAllowed` 做管理员页面访问控制；查询层也继续限定当前项目。

**Rationale**: 阶段 1 已建立“用户 + 项目 + 角色”身份边界，阶段 2/3 查询和操作也围绕当前项目身份工作。沿用该机制可以让非管理员访问大盘和管理员工单中心时直接进入无权限反馈，同时避免跨项目数据泄露。

**Alternatives considered**:

- 在每个组件内部单独判断角色: 容易遗漏并造成 UI 与数据读取不一致。
- 新增完整权限矩阵: 超出 MVP 范围。

## 实施确认: Next.js 16 本地文档注意事项

已查阅 `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`、`01-app/03-api-reference/04-functions/revalidatePath.md` 和 `01-app/03-api-reference/03-file-conventions/page.md`。阶段 5 实现遵循以下约束：

- `app/page.tsx` 的 `searchParams` 在 Next.js 16 中按 Promise 处理，继续在 Server Component 中 await 后解析查询参数。
- 管理员筛选通过查询参数触发 Server Component 重新读取数据，不新增客户端数据缓存。
- 阶段 3 工单操作成功后继续使用 `revalidatePath("/")`，让当前首页壳层内的大盘统计、管理员表格和详情在下一次页面更新中一致。
- Server Actions 是可被 POST 触达的不可信入口，阶段 5 不新增管理操作 action；如后续新增筛选表单 action，也必须重新校验身份和输入。
