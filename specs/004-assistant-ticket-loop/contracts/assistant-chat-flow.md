# 契约: 智能助手聊天、建单和查单

## 前端到后端聊天契约

### `POST /api/chat`

**目的**: 处理助手消息流、Agent 固定工具调用、查单和 HITL 确认建单。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `messages` | `UIMessage[]` | 是 | 前端 `useChat` 当前完整消息数组 |
| `sessionId` | string | 否 | 当前助手会话 ID；缺失时服务端创建或解析默认会话 |

**服务端流程**:

```text
authenticate Supabase user
-> resolve current project membership from cookie
-> ensure owned assistant session
-> build runtime context from server-side identity
-> toBaseMessages(messages)
-> createAgent().stream() with fixed tools and OpenRouter model
-> toUIMessageStream()
-> createUIMessageStreamResponse()
-> onEnd save final UIMessage[] snapshot
```

**响应**:

- 成功：AI SDK UIMessage stream。
- 未登录：HTTP 401。
- 当前身份缺失或无权：HTTP 403。
- Agent 执行错误：通过 AI SDK stream error 机制展示，不清空已有消息。

**禁止事项**:

- 不手写 SSE `event:` / `data:`。
- 不从客户端字段读取 owner、project、role 或权限。
- 不把 OpenRouter key、Supabase secret 或 MCP 配置暴露给浏览器。
- 不使用 `toTextStreamResponse()` 服务聊天 UI。

## 图片上传契约

### `POST /api/assistant-images`

**目的**: 在用户发送多模态消息前，把图片保存到项目 Storage 并返回可用于 `UIMessage` file part 的 URL。

**请求**: `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `images` | File[] | 是 | 用户选择的现场图片 |

**服务端规则**:

- 必须验证用户已登录且已选择当前项目身份。
- 复用 `ticket-images` bucket。
- 支持 MIME：`image/gif`、`image/jpeg`、`image/png`、`image/webp`。
- 单张不超过 5MB。
- 阶段 4 不设置额外数量上限。

**成功响应**:

```json
{
  "files": [
    {
      "type": "file",
      "mediaType": "image/jpeg",
      "filename": "site-photo.jpg",
      "url": "https://..."
    }
  ]
}
```

**失败响应**:

```json
{
  "message": "现场图片仅支持 JPG、PNG、WebP 或 GIF。"
}
```

## Agent 固定工具契约

### `search_visible_tickets`

**用途**: 按编号、关键词、位置、状态或“我的工单”查询当前身份有权工单。

**输入**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | 是 | 用户查询表达 |
| `status` | string | 否 | `pending`、`closed`、`all` |

**输出**: 当前身份可见的工单摘要数组；无权或跨项目结果不返回。

### `list_project_builders`

**用途**: 获取当前项目可作为责任人的施工方候选。

**输入**: 无客户端可控身份参数。

**输出**: `membershipId`、姓名、部门。

### `create_ticket_from_confirmed_draft`

**用途**: 基于同一轮多模态输入整理待创建工单信息，并通过 human-in-the-loop 确认卡片创建待处理工单。

**输入**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `summary` | string | 是 | 用户确认的问题摘要 |
| `locationDetail` | string | 是 | 用户确认的位置 |
| `severity` | string | 是 | 用户确认的严重程度 |
| `specialty` | string | 是 | 用户确认的专业类型 |
| `assigneeMembershipId` | string | 是 | 用户选择的当前项目施工方 |
| `description` | string | 否 | 用户确认的问题详情 |
| `imageUrls` | string[] | 是 | 用户确认保留的图片 URL |

**服务端校验**:

- 当前身份必须是质检员或管理员。
- 责任人必须是当前项目施工方。
- 必填字段完整。
- 图片 URL 必须来自当前会话上传结果或现有可信 Storage URL。

**输出**: 新工单编号、详情入口和已保存图片 URL。

## UI 交互契约

### 页面初始状态

- 服务端读取当前身份默认助手会话。
- 前端 `useChat` 使用服务端提供的 `UIMessage[]` 初始消息。
- 若没有历史，展示 Stitch 风格空对话和底部输入区。

### 建单确认卡片

卡片必须展示：

- 问题描述。
- 详细位置。
- 严重程度。
- 专业类型。
- 责任人选择。
- 问题详情。
- 图片预览和删除入口。
- 确认提交动作。

### 成功反馈

创建成功后必须在对话中展示：

- “工单创建成功”。
- 工单编号。
- 详情入口。

### 查单反馈

查单结果必须展示：

- 工单编号、状态、严重程度、位置、责任人、摘要。
- 详情入口。
- 无结果或无权限时不泄露目标工单信息。
