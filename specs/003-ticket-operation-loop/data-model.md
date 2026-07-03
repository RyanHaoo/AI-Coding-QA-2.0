# 数据模型: 工单状态流转与操作记录

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

## 实体: Ticket

工单沿用阶段 2 的 `tickets` 表，是阶段 3 所有操作的目标对象。

| 字段 | 类型 | 必填 | 阶段 3 行为 |
|------|------|------|-------------|
| `id` | uuid | 是 | 操作目标标识 |
| `ticket_number` | text | 是 | 只读展示，不允许编辑 |
| `project_id` | uuid | 是 | 操作必须限定在当前身份所在项目 |
| `creator_membership_id` | uuid | 是 | 判断编辑和重新打开权限 |
| `assignee_membership_id` | uuid | 是 | 判断解决、拒绝、指派权限；指派成功时更新 |
| `status` | TicketStatus | 是 | 解决、拒绝和重新打开会更新状态 |
| `severity` | TicketSeverity | 是 | 编辑模式可更新 |
| `specialty` | TicketSpecialty | 是 | 编辑模式可更新 |
| `summary` | text | 是 | 编辑模式可更新 |
| `location_detail` | text | 是 | 编辑模式可更新 |
| `description` | text | 否 | 编辑模式可更新 |
| `image_urls` | text[] | 是 | 编辑模式可新增或删除当前工单现场图片 |
| `root_cause` | text | 否 | 解决工单时必填并写入 |
| `preventive_action` | text | 否 | 解决工单时可选写入 |
| `created_at` | timestamptz | 是 | 只读展示 |
| `updated_at` | timestamptz | 是 | 每次成功操作后更新 |

### 状态流转

| 操作 | 前置状态 | 后置状态 | 责任人变化 | 处理信息变化 |
|------|----------|----------|------------|--------------|
| 编辑 | `pending` | `pending` | 不变 | 不允许修改 `root_cause` 或 `preventive_action` |
| 解决 | `pending` | `completed` | 不变 | 写入 `root_cause`，可写入 `preventive_action` |
| 拒绝 | `pending` | `rejected` | 不变 | 不强制修改处理信息 |
| 指派他人 | `pending` | `pending` | 更新为当前项目另一名施工方 | 不强制修改处理信息 |
| 重新打开 | `completed` 或 `rejected` | `pending` | 不变 | 保留历史处理信息 |

### 校验规则

- 只有待处理工单可以编辑、解决、拒绝或指派。
- 只有已完成或已拒绝工单可以重新打开。
- 发起人、当前责任人和管理员可以编辑待处理工单。
- 当前责任人和管理员可以解决、拒绝或指派待处理工单。
- 发起人和管理员可以重新打开已完成或已拒绝工单。
- 管理员只能操作当前项目内的工单，不能跨项目操作。
- 指派对象必须是当前项目内另一名施工方项目身份。
- 操作提交时必须重新读取目标工单，避免使用过期页面状态直接写入。

## 实体: TicketActivityLog

处理记录沿用阶段 2 的 `ticket_activity_logs` 表。阶段 3 每次成功操作必须新增一条记录。

| 字段 | 类型 | 必填 | 阶段 3 行为 |
|------|------|------|-------------|
| `id` | uuid | 是 | 处理记录主键 |
| `ticket_id` | uuid | 是 | 关联目标工单 |
| `actor_membership_id` | uuid | 是 | 当前执行操作的项目身份 |
| `activity_type` | TicketActivityType | 是 | 对应本次操作类型 |
| `reason` | text | 否 | 用户填写的业务原因或结论 |
| `content` | text | 是 | 系统生成的中文变化摘要 |
| `created_at` | timestamptz | 是 | 操作完成时间 |

### 处理记录生成规则

- 编辑: `activity_type=edited`，`reason` 可为空，`content` 描述严重程度、专业类型、问题描述、详细位置、现场图片或问题详情的主要变化。
- 解决: `activity_type=resolved`，`reason` 保存问题归因，`content` 描述状态从待处理变为已完成。
- 拒绝: `activity_type=rejected`，`reason` 保存拒绝原因，`content` 描述状态从待处理变为已拒绝。
- 指派他人: `activity_type=reassigned`，`reason` 保存指派原因，`content` 描述责任人从原责任人变为新责任人。
- 重新打开: `activity_type=reopened`，`reason` 保存重新打开原因，`content` 描述状态恢复为待处理且责任人保持不变。

## 实体: TicketOperationInput

`TicketOperationInput` 不是数据库表，而是服务端 action 接收和校验的表单数据集合。

### EditTicketInput

| 字段 | 必填 | 说明 |
|------|------|------|
| `ticketId` | 是 | 目标工单 |
| `severity` | 是 | 轻微、一般、严重、紧急之一 |
| `specialty` | 是 | 建筑设计专业、结构专业、给排水专业之一 |
| `summary` | 是 | 问题描述 |
| `locationDetail` | 是 | 详细位置 |
| `description` | 否 | 问题详情 |
| `existingImageUrls` | 否 | 保留的原现场图片 URL |
| `newImages` | 否 | 新增现场图片文件或等效上传结果 |

### ResolveTicketInput

| 字段 | 必填 | 说明 |
|------|------|------|
| `ticketId` | 是 | 目标工单 |
| `rootCause` | 是 | 问题归因 |
| `preventiveAction` | 否 | 预防建议 |

### RejectTicketInput

| 字段 | 必填 | 说明 |
|------|------|------|
| `ticketId` | 是 | 目标工单 |
| `reason` | 是 | 拒绝原因 |

### ReassignTicketInput

| 字段 | 必填 | 说明 |
|------|------|------|
| `ticketId` | 是 | 目标工单 |
| `assigneeMembershipId` | 是 | 当前项目内另一名施工方身份 |
| `reason` | 是 | 指派原因 |

### ReopenTicketInput

| 字段 | 必填 | 说明 |
|------|------|------|
| `ticketId` | 是 | 目标工单 |
| `reason` | 是 | 重新打开原因 |

## 实体: OperationPermission

`OperationPermission` 是运行时计算结果，不单独存储。

| 字段 | 类型 | 说明 |
|------|------|------|
| `canEdit` | boolean | 当前身份是否可编辑 |
| `canResolve` | boolean | 当前身份是否可解决 |
| `canReject` | boolean | 当前身份是否可拒绝 |
| `canReassign` | boolean | 当前身份是否可指派 |
| `canReopen` | boolean | 当前身份是否可重新打开 |
| `reason` | text | 不可操作时用于服务端拒绝反馈的原因 |

### 计算输入

- 当前项目身份 id、角色和项目 id。
- 工单项目 id、发起人身份、当前责任人身份和状态。
- 指派候选人的项目、角色和身份 id。

## 图片持久化规则

- 阶段 3 保留 `tickets.image_urls` 作为图片列表来源。
- 新增图片必须在保存编辑前得到可访问 URL，再与保留的原 URL 合并写回工单。
- 删除图片表示从当前工单 `image_urls` 移除该 URL；是否物理删除存储对象可作为实现任务中的低优先级清理，不影响演示验收。
- 阶段 3 不处理助手对话图片、图片理解或建单草稿图片。
