# 数据模型: Coze知识接口集成

## 知识问题

- **含义**: 用户在智能助手中提出的施工质检专业问题。
- **字段**:
  - `question`: 用户原始问题或 Agent 精练后的问题。
  - `contextSummary`: 可选，当前用户有权上下文摘要，例如工单问题、位置、状态或现场描述。
- **校验**: `question` 必须为非空文本；`contextSummary` 不得包含 secret、用户 ID、membership ID 或无关历史。

## Coze知识查询

- **含义**: 一次独立、无记忆的 Coze 子 Agent 调用。
- **字段**:
  - `botId`: 来自 `COZE_BOT_ID`。
  - `userId`: 每次调用随机生成的非业务 ID。
  - `message`: 单条用户问题文本，包含精练问题和必要授权上下文。
  - `autoSaveHistory`: 固定为 `false`。
- **关系**: 由 LangChain tool 发起，不写入 Supabase，不复用 Coze conversation。

## 知识回答

- **含义**: Coze 返回后给主 Agent 使用的结构化结果。
- **字段**:
  - `kind`: 固定为 `coze_knowledge_answer`。
  - `status`: `success`、`empty`、`failed` 或 `timeout`。
  - `content`: Coze 聚合后的 Markdown/文本；失败时为可展示兜底文案。
  - `sourceNote`: 来源说明；若 Coze 未返回明确来源则为“未返回明确来源”。
  - `error`: 可选，服务端调试用错误摘要。
- **校验**: `success` 必须有非空 `content`；非 success 状态不得生成规范条文、数值或伪造来源。

## 混合意图上下文

- **含义**: 用户同时提出专业判断和建单诉求时，主 Agent 需要保留的最小上下文。
- **字段**:
  - `knowledgeQuestion`: 已调用 Coze 的问题。
  - `knowledgeAnswer`: Coze 返回或兜底后的回答。
  - `createTicketIntent`: 用户是否确认进入建单。
- **关系**: 用户确认建单后复用阶段 4 既有建单草稿和工单创建路径。
