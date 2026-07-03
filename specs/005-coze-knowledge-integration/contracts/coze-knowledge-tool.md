# 契约: Coze 知识 Tool

## LangChain Tool

**名称**: `query_construction_knowledge`

**用途**: 对施工规范、工艺标准、质量要求、施工做法和现场质量判断问题调用 Coze/扣子知识子 Agent。

## 输入

```ts
{
  question: string;
  contextSummary?: string;
}
```

- `question`: 必填，Agent 精练后的施工质检知识问题。
- `contextSummary`: 可选，只能放当前身份有权查看的工单摘要或现场描述。

## Coze SDK 调用约束

- `baseURL`: `COZE_CN_BASE_URL`
- `bot_id`: `COZE_BOT_ID`
- `user_id`: 每次调用随机生成，不使用业务用户 ID
- `conversation_id`: 不传
- `stream`: 使用 `client.chat.stream`
- `auto_save_history`: `false`
- `enable_card`: 不启用，使用 SDK/接口默认普通文本
- `additional_messages`: 单条 `role=user`、`content_type=text`

## 输出

```ts
{
  kind: "coze_knowledge_answer";
  status: "success" | "empty" | "failed" | "timeout";
  content: string;
  sourceNote: string;
  error?: string;
}
```

## 失败策略

- `empty`: Coze 正常结束但没有返回 answer 文本，助手必须说明未检索到可靠知识结果。
- `failed`: Coze 返回失败事件、错误事件或 SDK 抛错，助手必须说明接口暂不可用。
- `timeout`: 请求超过阶段 6 设定等待时间，助手必须提示稍后重试或补充更具体问题。
- 所有失败状态都不得让主 Agent 编造规范条文、数值、结论或来源。
