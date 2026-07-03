# Quickstart: Coze知识接口集成

## 前置条件

1. 安装依赖后确认 `@coze/api` 已存在。
2. `.env.local` 中配置以下变量：

```dotenv
COZE_API_TOKEN=
COZE_BOT_ID=7626782065836933172
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=qa-new-stage6
```

3. 保留阶段 4 所需 OpenRouter、Supabase 和 `SECRET_KEY` 配置。

## 本地运行

```powershell
npm run tscheck
npm run check
npm run dev
```

## 验收路径

### 1. 基础知识问答

- 登录任一测试账号，进入智能助手。
- 输入：`住宅采光系数低于多少算不合格`
- 预期：助手调用 Coze，返回中文知识回答，并展示来源说明；若 Coze 未返回来源，则明确显示未返回明确来源。

### 2. 信息不足追问

- 输入：`这个管道坡度是否合理`
- 预期：助手不直接下确定结论，追问管道类型、坡度数值或使用场景等关键条件。

### 3. 工单上下文知识问答

- 输入：`为我查询工单 23 相关的标准条文`
- 预期：助手先查当前身份有权工单，再把可见工单摘要作为上下文调用 Coze，不泄露无权工单。

### 4. 超范围问题

- 输入一个与建筑施工质检无关的问题。
- 预期：助手简洁说明超出服务范围，引导用户询问施工质检问题。

### 5. 混合意图

- 输入：`这个节点做法是不是不合规？如果有问题帮我建个单。`
- 预期：助手先完成知识判断，再询问是否创建工单；用户确认后复用阶段 4 建单草稿卡片。

### 6. 失败兜底

- 临时缺失或填错 `COZE_API_TOKEN` 后重启开发服务。
- 输入施工质检知识问题。
- 预期：助手说明无法提供可靠知识回答，不编造规范条文、数值或来源。

## LangSmith 验收

- 在 LangSmith 项目 `qa-new-stage6` 中确认可以看到主 Agent trace、`query_construction_knowledge` tool 调用和失败路径。
