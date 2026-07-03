# 数据模型: 工单数据底座与只读详情

## 枚举

### TicketStatus

- `pending`: 待处理
- `completed`: 已完成
- `rejected`: 已拒绝

### TicketSeverity

- `minor`: 轻微
- `normal`: 一般
- `serious`: 严重
- `urgent`: 紧急

### TicketSpecialty

- `architecture`: 建筑设计专业
- `structure`: 结构专业
- `plumbing`: 给排水专业

### TicketActivityType

- `created`: 创建
- `edited`: 编辑
- `resolved`: 解决
- `rejected`: 拒绝
- `reassigned`: 指派他人
- `reopened`: 重新打开

阶段 2 只展示这些操作类型。除 `created`、`resolved`、`rejected` 外，其他类型主要为后续阶段兼容，不在阶段 2 生成新的写入操作。

## 实体: Ticket

工单表示一次现场质量问题的协作处理对象。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | uuid | 是 | 工单主键 |
| `ticket_number` | text | 是 | 演示环境内唯一工单编号，例如 `WO-2026-0001` |
| `project_id` | uuid | 是 | 关联 `projects.id` |
| `creator_membership_id` | uuid | 是 | 发起人项目身份，关联 `project_memberships.id` |
| `assignee_membership_id` | uuid | 是 | 当前责任人项目身份，关联 `project_memberships.id` |
| `status` | TicketStatus | 是 | 当前状态 |
| `severity` | TicketSeverity | 是 | 严重程度 |
| `specialty` | TicketSpecialty | 是 | 专业类型 |
| `summary` | text | 是 | 问题描述摘要 |
| `location_detail` | text | 是 | 详细位置 |
| `description` | text | 否 | 问题详情 |
| `image_urls` | text[] | 是 | 现场图片 URL 列表，默认空数组 |
| `root_cause` | text | 否 | 问题归因，已完成工单通常填写 |
| `preventive_action` | text | 否 | 预防建议，可为空 |
| `created_at` | timestamptz | 是 | 创建时间 |
| `updated_at` | timestamptz | 是 | 更新时间 |

### 关系

- `Ticket.project_id` -> `Project.id`
- `Ticket.creator_membership_id` -> `ProjectMembership.id`
- `Ticket.assignee_membership_id` -> `ProjectMembership.id`
- `Ticket` 1:n `TicketActivityLog`

### 校验规则

- `ticket_number` 必须唯一。
- `status` 必须是待处理、已完成或已拒绝之一。
- `severity` 必须是轻微、一般、严重或紧急之一。
- `specialty` 必须至少覆盖建筑设计专业、结构专业和给排水专业。
- `creator_membership_id` 和 `assignee_membership_id` 必须归属同一个 `project_id`。
- `creator_membership_id` 的角色必须是质检员或管理员。
- `assignee_membership_id` 的角色必须是施工方。
- 已完成工单应具备 `root_cause` 或能在处理记录中说明完成原因。
- 已拒绝工单必须能在处理记录中说明拒绝原因。

### 状态说明

阶段 2 不提供状态流转操作，只读取已有状态。状态流转校验会在阶段 3 实现。

## 实体: TicketActivityLog

处理记录表示工单生命周期中的一次可追溯事件。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | uuid | 是 | 处理记录主键 |
| `ticket_id` | uuid | 是 | 关联 `tickets.id` |
| `actor_membership_id` | uuid | 是 | 操作人项目身份，关联 `project_memberships.id` |
| `activity_type` | TicketActivityType | 是 | 操作类型 |
| `reason` | text | 否 | 操作原因，例如拒绝原因、指派原因、重新打开原因 |
| `content` | text | 是 | 操作内容，说明状态、责任人或关键字段变化 |
| `created_at` | timestamptz | 是 | 操作时间 |

### 关系

- `TicketActivityLog.ticket_id` -> `Ticket.id`
- `TicketActivityLog.actor_membership_id` -> `ProjectMembership.id`

### 校验规则

- 每张演示工单至少有一条处理记录。
- 处理记录按 `created_at` 倒序展示。
- 处理记录必须可读地说明本次操作造成的状态、责任人或关键字段变化。
- 处理记录可见性继承所属工单可见性。

## 实体: CurrentIdentityTicketScope

当前身份可见范围不是单独存储表，而是查询和 RLS 共同执行的规则集合。

| 当前角色 | 可见范围 |
|----------|----------|
| 质检员 | 当前项目内 `creator_membership_id` 等于当前身份的工单 |
| 施工方 | 当前项目内 `assignee_membership_id` 等于当前身份的工单 |
| 管理员 | 当前项目内全部工单 |

### 列表筛选规则

- `pending`: 只展示待处理工单。
- `closed`: 展示已完成和已拒绝工单。
- `all`: 展示当前角色固定范围内全部状态工单。

### 排序规则

- 紧急工单始终排在非紧急工单之前。
- 同为紧急或同为非紧急时，按用户选择的最新优先或最旧优先排序。

## 演示数据要求

- 至少 12 张工单。
- 覆盖 3 个项目。
- 覆盖待处理、已完成、已拒绝 3 种状态。
- 覆盖轻微、一般、严重、紧急 4 类严重程度。
- 覆盖建筑设计专业、结构专业、给排水专业 3 类专业。
- 至少 1 张紧急待处理工单。
- 阶段 1 的 6 个测试账号中，至少 4 个账号可看到符合其项目和角色的工单样例。
