# Phase 0 研究: 智能助手建单与查单

## 决策 1: 固定使用 AI SDK UIMessage 作为前后端聊天边界

**Decision**: 前端助手使用 `@ai-sdk/react useChat`，通过 `DefaultChatTransport({ api: "/api/chat" })` 提交完整 `UIMessage[]`。后端 `/api/chat` 直接消费本次请求的 `messages`，不从数据库回捞历史做拼接；流式结束后保存最终 `UIMessage[]` 快照。

**Rationale**: `simple-next-langchain-agent` 明确要求前端、API route、持久化之间统一使用 `UIMessage[]`。AI SDK 当前文档也展示了 `useChat` + `DefaultChatTransport` 对接 Next.js API route 的模式。

**Alternatives considered**:
- 自定义 REST payload: 会破坏 UIMessage 作为唯一边界，后续 tool part 和 file part 处理复杂。
- 手写 SSE: 技能明确禁止，且容易和 AI SDK stream protocol 不一致。
- 仅浏览器 state: 刷新丢失，不满足技能要求的 Supabase 历史快照。

## 决策 2: LangChain Agent 与 AI SDK 之间使用 `@ai-sdk/langchain`

**Decision**: `/api/chat` 使用 `toBaseMessages(uiMessages)` 转换为 LangChain messages，调用 LangChain `createAgent().stream()`，再用 `toUIMessageStream()` 转回 AI SDK UIMessage stream，并通过 `createUIMessageStreamResponse()` 返回。

**Rationale**: 这是 `simple-next-langchain-agent` 指定路径。AI SDK 文档对 LangChain adapter 的示例也采用 `toBaseMessages` 和 `toUIMessageStream`。

**Alternatives considered**:
- 直接调用模型 `streamText`: 不满足用户要求使用 LangChain Agent 和固定 server tools。
- `@langchain/react`: 技能明确禁止。
- LangGraph Agent Server protocol: 超出阶段 4，也被技能明确排除。

## 决策 3: LLM 固定通过 OpenRouter OpenAI-compatible API

**Decision**: 使用 `@langchain/openai` 的 `ChatOpenAI`，从 `OPENROUTER_API_KEY`、`OPENROUTER_MODEL` 和 `OPENROUTER_BASE_URL` 读取配置。`OPENROUTER_BASE_URL` 默认写入 `https://openrouter.ai/api/v1`，模型必须由用户选择支持图文输入的 OpenRouter model。

**Rationale**: 用户明确要求 LLM 接入固定使用 OpenRouter API。OpenRouter 官方文档说明其 API 使用 Bearer token 鉴权，并可作为 OpenAI-compatible endpoint 使用 `https://openrouter.ai/api/v1`。LangChain JS 文档说明 `ChatOpenAI` 可通过 `configuration.baseURL` 连接 OpenAI-compatible provider。

**Alternatives considered**:
- 直接 OpenAI API: 违反用户要求。
- OpenRouter SDK: 会增加新 SDK，同时 `@langchain/openai` 已能通过 OpenAI-compatible base URL 满足 Agent 模型调用。
- 把模型 id 写死在代码里: 不利于演示切换图文模型，也违反环境变量管理要求。

## 决策 4: 环境变量必须先配置再开发

**Decision**: 本阶段新增 `.env.local` 和 `.env.example` 占位：

```text
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

开发前必须由用户手动填写 `SECRET_KEY`、`OPENROUTER_API_KEY`、`OPENROUTER_MODEL`，agent 只检查变量是否存在非空值，不回显密钥。

**Rationale**: `simple-next-langchain-agent` 要求新增环境变量先输出到文件，再指导用户手动输入并保存，确认存在值后才能进入开发。OpenRouter API key 和 Supabase service role key 都必须仅服务端读取。

**Alternatives considered**:
- 在代码中硬编码 model 或 key: 明确禁止。
- 只更新 `.env.example`: 不足以进入本地开发。
- agent 代填密钥: 不安全，且当前上下文没有密钥。

## 决策 5: 图片上传复用阶段 3 Storage helper，不新增上传库

**Decision**: 助手图片上传走项目自己的服务端 upload route，复用 `ticket-images` bucket、`SECRET_KEY` 服务端 Supabase client 和 `uploadTicketImages()` 的校验：GIF/JPEG/PNG/WebP，单张不超过 5MB，不额外设置数量上限。上传成功后返回 AI SDK file part 所需的公开 URL。

**Rationale**: 阶段 3 已完成可用的工单图片上传能力；阶段 4 spec 已确认不设置额外数量上限。`simple-next-langchain-agent` 对图片上传的可选路径也要求先上传到项目 API，再返回 `FileUIPart[]`，消息历史只保存 URL。

**Alternatives considered**:
- 浏览器直传 Supabase Storage: 需要额外 storage RLS policy，主路径更复杂。
- 新 bucket: 不必要，阶段 3 的 `ticket-images` 已服务同一业务对象。
- 把图片二进制保存在消息历史: 不符合 UIMessage 快照和存储边界。

## 决策 6: 多模态建单理解不建立独立图片链路

**Decision**: 文本和图片共同组成同一轮 Agent 多模态输入。系统不生成独立“图片理解结果”实体，不保存独立图片理解内容，不建立图片专属处理链路。最终工单内容以用户确认的草稿为准。

**Rationale**: 阶段 4 clarify 已明确图片和文本一同由 Agent 多模态理解，不建立独立图片理解链路。这能减少状态、字段和验收复杂度。

**Alternatives considered**:
- 先图片理解再转文字输入: 容易形成独立链路，与 clarify 冲突。
- 保存图片理解结果字段: 超出 MVP，不是工单业务对象必需字段。
- 图片只用于展示不参与 Agent: 不能满足阶段 4 多模态建单要求。

## 决策 7: Agent 固定工具范围

**Decision**: 阶段 4 Agent 只提供服务端固定 tools：

- 查询当前身份可见工单。
- 列出当前项目施工方责任人候选。
- 生成或更新待确认建单草稿。
- 在用户明确确认后创建待处理工单。

所有工具从服务端当前身份和会话上下文派生权限，不从客户端消息文本读取 owner、project 或 role。

**Rationale**: 这覆盖 P1 建单和 P2 查单，同时符合 `simple-next-langchain-agent` 的工具边界要求。创建工单是副作用，必须在用户确认后执行。

**Alternatives considered**:
- 客户端直接调用 Supabase 建单: 会绕过 Agent tool 和服务端权限边界。
- 让 Agent 拥有阶段 3 解决/拒绝/指派工具: 超出阶段 4 规格。
- MCP tools: 阶段 4 无 MCP 需求，技能允许但不要求。

## 决策 8: 最小会话持久化

**Decision**: 新增一张助手会话表保存当前用户项目身份下的 `UIMessage[]` 快照，可选保存待确认草稿状态。阶段 4 只需要当前身份/项目默认会话，不做完整会话列表、归档、搜索或跨设备长期历史承诺。

**Rationale**: 技能要求 Supabase 保存业务会话历史快照；spec 又限定聊天记录只支撑当前页面会话演示，不承诺完整长期历史。最小会话表可同时满足技术边界和 MVP 范围。

**Alternatives considered**:
- 不持久化: 不符合技能。
- 完整 ChatGPT 式会话管理: 超出阶段 4。
- 使用 LangGraph checkpoint 保存 UI 历史: 技能明确 UI 历史仍以 `UIMessage[]` 为边界。

## 决策 9: Next.js 文档来源

**Decision**: 当前 worktree 未包含 `node_modules/next/dist/docs/`，因此计划阶段使用 Vercel 官方文档检索确认 App Router route handler 可以用 `export async function POST(request: Request)` 返回 `Response` 或 JSON/stream response；实施阶段仍优先沿用仓库现有 App Router 写法。

**Rationale**: 项目规则要求优先读本地 Next.js 文档，但本地路径不存在。使用官方 Vercel/Next 文档补足规划依据，同时不引入与现有代码风格冲突的新模式。

**Alternatives considered**:
- 忽略 Next.js 文档要求: 不符合项目规则。
- 安装或生成本地 docs: 与阶段 4 计划无关，增加无必要变更。

## 决策 10: 阶段 4 不启用 LangSmith 监控

**Decision**: 阶段 4 默认不启用 LangSmith 自动 Agent 会话监控，也不新增 `LANGSMITH_*` 环境变量。

**Rationale**: `simple-next-langchain-agent` 把会话监控标为可选，并要求显式询问用户是否开启。当前用户只指定 OpenRouter 和开发前环境变量配置，未要求监控。为保持 MVP 范围，不纳入本阶段。

**Alternatives considered**:
- 默认启用 LangSmith: 增加账号注册和环境变量配置成本。
- 写入空 `LANGSMITH_*`: 会误导后续开发和验收范围。
