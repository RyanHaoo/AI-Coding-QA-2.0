# Phase 0 研究结论: Coze知识接口集成

## Decision: 使用 Coze 官方 Node SDK

**Rationale**: 用户明确选择官方 SDK；`@coze/api@1.3.9` 提供 `CozeAPI`、`COZE_CN_BASE_URL`、`client.chat.stream`、`ChatEventType` 和 `RoleType`，可以直接调用国内 `v3/chat` 流式接口并保持类型约束。

**Alternatives considered**:

- 直接 `fetch` 调用 `https://api.coze.cn/v3/chat`: 依赖更少，但用户已选择官方 SDK。
- 非流式调用: 与无记忆 `auto_save_history=false` 冲突；非流式需要保存历史后轮询获取最终回复。

## Decision: Coze 作为独立无记忆单轮 tool

**Rationale**: 阶段 6 只需要施工质检知识检索，不需要让 Coze 保存业务对话。每次 tool 调用不传 `conversation_id`，使用随机非业务 `user_id`，传入单条 `additional_messages`，并设置 `auto_save_history=false`。

**Alternatives considered**:

- 复用 Coze conversation: 会引入外部记忆和并发约束，不符合阶段 6 单轮 tool 边界。
- 把完整 `UIMessage[]` 传给 Coze: 可能泄露无关上下文，也会让知识回答受工单建单历史干扰。

## Decision: 保持现有 AI SDK + LangChain 主链路

**Rationale**: 当前阶段 4 已使用 `useChat`、`DefaultChatTransport`、`/api/chat`、`toBaseMessages`、`createAgent().stream()` 和固定服务端 tools。阶段 6 只在现有 tools 中增加 `query_construction_knowledge`，不新增前端 endpoint 或手写 SSE。

**Alternatives considered**:

- 新增 `/api/coze` endpoint: 会绕开现有 Agent 路由和会话持久化，增加前端分支。
- 在前端直接调 Coze: 会暴露 Coze token，违反服务端 secret 边界。

## Decision: LangSmith 通过环境变量启用

**Rationale**: 用户选择启用 LangSmith。LangChain JS 支持通过 `LANGSMITH_TRACING=true`、`LANGSMITH_API_KEY` 和 `LANGSMITH_PROJECT` 自动采集 trace，无需在代码中新增 tracing wrapper。

**Alternatives considered**:

- 不启用 LangSmith: 更简单，但用户已选择开启。
- 代码级 tracing wrapper: 超出阶段 6 MVP，需要额外抽象和维护。

## Decision: 不新增数据库表或迁移

**Rationale**: 知识问答结果作为普通助手消息保存在现有 `assistant_sessions.messages` 快照中即可；Coze 不保存历史，Supabase 不需要新增知识记录表。

**Alternatives considered**:

- 新增知识问答日志表: 有助于审计，但阶段 6 不要求生产级监控或审计。
- 新增 Coze response cache: 会引入缓存一致性和失效策略，超出 MVP。
