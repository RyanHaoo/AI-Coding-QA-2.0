# 数据模型: 管理员态势大盘与工单中心

## 复用枚举

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

## 实体: AdminDashboardMetrics

管理员态势指标是当前项目工单集合的派生结果，不单独存储。

| 字段 | 类型 | 说明 |
|------|------|------|
| `project` | Project | 当前登录身份所在项目 |
| `totalTickets` | number | 当前项目工单总数 |
| `pendingTickets` | number | 当前项目待处理工单数 |
| `completedTickets` | number | 当前项目已完成工单数 |
| `rejectedTickets` | number | 当前项目已拒绝工单数 |
| `urgentTickets` | number | 当前项目严重程度为紧急的工单数 |
| `statusCounts` | Record<TicketStatus, number> | 三种状态数量分布 |
| `severityCounts` | Record<TicketSeverity, number> | 四种严重程度数量分布 |
| `focusTickets` | TicketSummary[] | 重点关注工单，阶段 5 以紧急和待处理工单为核心 |

### 派生规则

- 所有统计仅来自当前登录身份所在项目。
- 没有对应工单时，计数必须为 0。
- `urgentTickets` 统计所有紧急工单，不受状态筛选影响。
- `focusTickets` 优先包含紧急工单；如果没有紧急工单，可展示待处理工单摘要或明确“当前无紧急工单”。
- 统计来源应与管理员工单中心同一项目工单口径保持一致。

## 实体: AdminTicketFilters

管理员筛选条件由 URL 查询参数表达，用于筛选当前项目工单。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | TicketStatus 或 `all` | `all` | 工单状态筛选；管理员中心默认不预设状态 |
| `severity` | TicketSeverity 或 `all` | `all` | 严重程度筛选 |
| `specialty` | TicketSpecialty 或 `all` | `all` | 专业类型筛选 |
| `keyword` | string | 空字符串 | 普通关键词，匹配问题描述、详细位置和问题详情 |
| `ticketNumber` | string | 空字符串 | 工单编号搜索，优先于普通关键词解释 |

### URL 参数建议

| 查询参数 | 对应字段 | 示例 |
|----------|----------|------|
| `adminStatus` | `status` | `pending` |
| `adminSeverity` | `severity` | `urgent` |
| `adminSpecialty` | `specialty` | `structure` |
| `adminKeyword` | `keyword` | `裂缝` |
| `adminTicketNumber` | `ticketNumber` | `WO-2026-0004` |

### 校验规则

- 非法状态、严重程度或专业类型值必须回退为 `all`。
- 文本筛选输入必须 trim；空字符串表示未生效。
- 工单编号筛选生效时，必须优先按编号匹配；关键词仍可保留在界面中，但结果以编号匹配为主。
- 清空筛选必须恢复 `status=all`、`severity=all`、`specialty=all`、`keyword=""`、`ticketNumber=""`。
- 从大盘指标进入工单中心时，必须生成对应筛选条件并让筛选区可见。

## 实体: AdminTicketCollection

管理员工单集合表示当前项目内应用筛选后的工单列表和读取状态。

| 字段 | 类型 | 说明 |
|------|------|------|
| `error` | string \| null | 查询失败时的用户可理解错误 |
| `tickets` | TicketSummary[] | 当前筛选结果 |
| `filters` | AdminTicketFilters | 已生效筛选条件 |
| `totalBeforeFilter` | number | 当前项目工单总数，用于空结果说明 |

### 筛选规则

- 查询范围必须先限定为当前项目。
- `status !== all` 时，结果只保留对应状态。
- `severity !== all` 时，结果只保留对应严重程度。
- `specialty !== all` 时，结果只保留对应专业类型。
- `ticketNumber` 非空时，优先匹配工单编号，可支持完整编号或包含匹配。
- `keyword` 非空且 `ticketNumber` 不主导结果时，匹配问题描述、详细位置和问题详情。
- 紧急工单在表格中必须突出展示；默认排序可继续沿用紧急优先、最新优先。

## 实体: AdminTicketTableRow

管理员表格行复用 `TicketSummary`，用于更适合管理员扫描的展示。

| 字段 | 来源 | 展示要求 |
|------|------|----------|
| `ticketNumber` | TicketSummary | 工单编号，必须可识别 |
| `status` | TicketSummary | 当前状态 |
| `severity` | TicketSummary | 严重程度；紧急需要突出 |
| `specialty` | TicketSummary | 专业类型 |
| `summary` | TicketSummary | 问题描述摘要，过长可截断 |
| `createdAt` | TicketSummary | 创建时间 |
| `assignee` | TicketSummary | 当前责任人 |
| `creator` | TicketSummary | 发起人 |
| `detailHref` | 查询参数生成 | 查看详情入口，保留当前管理员筛选上下文 |

## 实体: AdminDetailContext

管理员详情联动描述从工单中心打开详情后的上下文。

| 字段 | 类型 | 说明 |
|------|------|------|
| `ticketId` | string | 当前打开的工单 |
| `baseView` | `admin-tickets` | 返回详情时回到管理员工单中心 |
| `filters` | AdminTicketFilters | 打开详情前的筛选条件 |
| `canOperate` | boolean | 由阶段 3 操作权限计算得到 |

### 联动规则

- 查看详情入口必须保留 `view=admin-tickets`。
- 从筛选结果打开详情后，返回工单中心应尽量保留原筛选条件。
- 管理员操作成功后，详情、表格和大盘统计必须在一次刷新、返回或页面更新后保持一致。
- 详情操作规则完全复用阶段 3，不新增管理员专用状态流转。

## 实体: AccessBoundary

访问边界由当前项目身份决定。

| 字段 | 类型 | 说明 |
|------|------|------|
| `currentMembershipId` | string | 当前登录身份 |
| `role` | Role | 必须为 `admin` 才能访问大盘和管理员工单中心 |
| `projectId` | string | 所有统计、筛选和操作的项目边界 |

### 访问规则

- 只有 `role=admin` 的当前身份可以访问 `dashboard` 和 `admin-tickets`。
- 质检员或施工方直接访问管理员视图时必须展示无权限反馈。
- 管理员只能统计、筛选、查看和操作当前项目工单。
- 多项目用户切换身份后，统计和工单中心必须随当前身份项目变化。
