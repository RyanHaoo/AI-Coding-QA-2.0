# 数据模型: 智能助手建单与查单

## 助手会话 `assistant_sessions`

表示当前登录用户在某个项目身份下的助手对话快照。阶段 4 只需要支持当前身份/项目的默认会话，不做完整会话列表。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | uuid | 是 | 助手会话 ID |
| `user_id` | uuid | 是 | Supabase Auth 用户 ID，用于所有权校验 |
| `project_id` | uuid | 是 | 当前项目 ID |
| `membership_id` | uuid | 是 | 当前项目身份 ID |
| `messages` | jsonb | 是 | AI SDK `UIMessage[]` 快照，默认空数组 |
| `draft_state` | jsonb | 否 | 历史兼容字段；当前流程不再主动保存独立草稿状态 |
| `created_at` | timestamptz | 是 | 创建时间 |
| `updated_at` | timestamptz | 是 | 最近保存时间 |

### 关系

- `user_id` 对应当前 Supabase Auth 用户。
- `project_id` 对应 `projects.id`。
- `membership_id` 对应 `project_memberships.id`。
- 当前建单确认信息通过 HITL 工具调用承载；如历史 `draft_state` 存在，责任人候选仍必须属于同一 `project_id` 且角色为施工方。

### 约束

- 服务端只能读取或写入当前登录用户自己的会话。
- 阶段 4 可采用“每个用户项目身份一个默认会话”的唯一约束：`(user_id, membership_id)`。
- `messages` 只保存可序列化的 `UIMessage[]`，图片只保存公开 URL，不保存二进制。

## UIMessage 快照

表示 AI SDK 聊天历史边界。

| 字段/结构 | 说明 |
|-----------|------|
| `role` | `user`、`assistant` 或 tool 相关角色，由 AI SDK 管理 |
| `parts` | 文本、文件、工具调用、工具结果或 data part |
| `id` | AI SDK 消息 ID |

### 规则

- 前端每次提交完整 `UIMessage[]`。
- `/api/chat` 不从数据库拼接历史；数据库只用于初始 hydrate 和 onEnd 快照保存。
- 消息中的图片 file part 只保存 URL、文件名和 media type。

## 现场图片文件部件

表示用户在助手输入区上传并随消息发送的图片。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | AI SDK file part 类型 |
| `mediaType` | string | 是 | `image/gif`、`image/jpeg`、`image/png` 或 `image/webp` |
| `filename` | string | 是 | 原始或服务端生成文件名 |
| `url` | string | 是 | `ticket-images` bucket 公开 URL |

### 规则

- 上传 API 复用阶段 3 图片限制：单张不超过 5MB。
- 阶段 4 不设置额外数量上限。
- 图片与文本共同组成同一轮 Agent 多模态输入；不建立独立图片理解实体。
- 用户确认建单后，保留的图片 URL 写入新工单 `tickets.image_urls`。

## 建单确认信息

表示 Agent 从当前对话整理出的待创建工单信息，通过 HITL 确认卡片由用户确认或编辑。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `summary` | string | 是 | 问题描述摘要 |
| `locationDetail` | string | 是 | 详细位置 |
| `severity` | enum | 是 | `minor`、`normal`、`serious`、`urgent` |
| `specialty` | enum | 是 | `architecture`、`structure`、`plumbing` |
| `assigneeMembershipId` | uuid | 是 | 当前项目施工方身份 ID |
| `description` | string | 否 | 问题详情 |
| `imageUrls` | string[] | 是 | 用户确认保留的现场图片 URL |
| `missingFields` | string[] | 否 | 仍需用户补充的字段 |

### 验证规则

- 质检员和管理员可以进入 HITL 建单确认并提交；施工方不能创建工单。
- `summary`、`locationDetail`、`assigneeMembershipId` 为提交前必填。
- `assigneeMembershipId` 必须属于当前项目施工方。
- `severity` 和 `specialty` 若 Agent 无法判断，可使用默认可见值并允许用户调整。
- 确认卡片字段不是最终工单，只有确认提交后才写入 `tickets`。

## 查单结果

表示助手返回给用户的当前身份可见工单摘要。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ticketId` | uuid | 是 | 工单 ID，用于详情跳转 |
| `ticketNumber` | string | 是 | 工单编号 |
| `status` | enum | 是 | 待处理、已完成、已拒绝 |
| `severity` | enum | 是 | 轻微、一般、严重、紧急 |
| `locationDetail` | string | 是 | 详细位置 |
| `assigneeName` | string | 是 | 当前责任人姓名 |
| `summary` | string | 是 | 问题摘要 |
| `detailHref` | string | 是 | 当前应用内详情入口 |

### 可见范围

- 质检员只查自己发起的当前项目工单。
- 施工方只查当前责任人为自己的当前项目工单。
- 管理员查当前项目全部工单。
- 无权工单以无可访问结果处理，不返回摘要。

## 工单创建结果

表示助手确认建单后返回给用户的可观察结果。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ticketId` | uuid | 是 | 新工单 ID |
| `ticketNumber` | string | 是 | 新工单编号 |
| `detailHref` | string | 是 | 详情入口 |
| `imageUrls` | string[] | 是 | 已保存现场图片 URL |

### 写入规则

- 新工单状态固定为待处理。
- 发起人为当前身份，责任人为确认卡片中选择的施工方。
- 创建成功必须写入一条 `created` 处理记录。
- 创建失败时不得保存半成品信息为工单，助手回复必须保留用户输入和确认信息。
