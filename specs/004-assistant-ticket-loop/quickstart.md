# Quickstart: 智能助手建单与查单

## 前置条件

1. 已完成阶段 1-3 的 Supabase migration 和 seed。
2. 已有测试账号可登录，并能选择质检员、施工方或管理员身份。
3. `.env.local` 已存在，并包含以下变量：

```text
NEXT_PUBLIC_SUPABASE_URL=https://alfsrxwabllyldcbofok.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_-n6jipbvXreg6MF7aum3MA_qFo9tUEa
SECRET_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## 开发前必须配置的环境变量

在开始实现前，用户需要手动填入：

- `SECRET_KEY`: Supabase 服务端 secret/service role key，用于服务端写入和 Storage 上传。
- `OPENROUTER_API_KEY`: OpenRouter API key。
- `OPENROUTER_MODEL`: OpenRouter 上支持图文输入和 tool calling 的模型 ID。
- `OPENROUTER_BASE_URL`: 保持 `https://openrouter.ai/api/v1`，除非明确切换兼容端点。

保存后，agent 只检查这些变量是否为非空值，不回显密钥内容。

## 安装依赖

阶段 4 实施时需要安装：

```powershell
npm install ai @ai-sdk/react @ai-sdk/langchain langchain @langchain/core @langchain/openai zod
```

AI Elements 组件按实施需要通过 shadcn/registry 安装或复制到项目组件目录；业务容器代码仍需通过 Biome 和 TypeScript 检查。

实际安装结果（2026-07-03）：

- `ai@7.0.14`
- `@ai-sdk/react@4.0.15`
- `@ai-sdk/langchain@3.0.14`
- `langchain@1.5.2`
- `@langchain/core@1.2.1`
- `@langchain/openai@1.5.3`
- `zod@4.4.3`

本地类型入口已核对：

- `node_modules/ai/dist/index.d.ts`
- `node_modules/@ai-sdk/react/dist/index.d.ts`
- `node_modules/@ai-sdk/langchain/dist/index.d.ts`
- `node_modules/langchain/dist/index.d.ts`
- `node_modules/@langchain/core/dist/index.d.ts`
- `node_modules/@langchain/openai/dist/index.d.ts`
- `node_modules/zod/index.d.ts`

实施中确认未引入 `@langchain/react`，未使用 `FetchStreamTransport`、`HttpAgentServerAdapter`、LangGraph Agent Server protocol 或手写 SSE。前端使用 `useChat` + `DefaultChatTransport`，后端使用 `toBaseMessages`、LangChain `createAgent().stream()`、`toUIMessageStream` 和 `createUIMessageStreamResponse`。

## 开发前环境变量确认

2026-07-03 已确认 `.env.local` 中以下变量存在非空值，未回显任何密钥内容：

- `SECRET_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_BASE_URL`

## 本地运行

```powershell
npm run dev
```

打开本地开发地址，使用阶段 1 测试账号登录。

## 验收路径 1: 质检员多模态建单

1. 使用 `li.qc@example.com` 登录，选择上海瑞虹商业综合体 / 质检员身份。
2. 进入智能助手。
3. 输入：“C栋B户型采光系数低于标准，帮我创建工单。”
4. 上传一张 JPG、PNG、WebP 或 GIF 现场图片。
5. 预期：助手在同一轮多模态输入中整理建单草稿，不出现独立图片理解流程。
6. 在草稿卡片中选择当前项目施工方责任人，必要时调整严重程度、专业类型、位置和描述。
7. 点击确认提交。
8. 预期：对话中展示创建成功、工单编号和详情入口。
9. 打开工单详情。
10. 预期：新工单状态为待处理，发起人为当前质检员，责任人为所选施工方，现场图片在详情中可见。

## 验收路径 2: 管理员建单

1. 使用 `chen.admin@example.com` 登录，选择上海瑞虹商业综合体 / 管理员身份。
2. 进入智能助手并输入一条建单请求，可附带现场图片。
3. 选择责任施工方后确认提交。
4. 预期：管理员可创建当前项目待处理工单；管理员工单中心可查到该工单。

## 验收路径 3: 施工方拒绝建单

1. 使用 `wang.builder@example.com` 登录，选择上海瑞虹商业综合体 / 施工方身份。
2. 在智能助手中输入：“帮我创建一个工单。”
3. 预期：助手在一次回复内拒绝，并说明只有质检员或管理员可以发起工单。

## 验收路径 4: 自然语言查单

1. 分别使用质检员、施工方和管理员身份进入智能助手。
2. 输入以下表达：
   - “查询工单23”
   - “我的待处理工单”
   - “查一下采光问题”
3. 预期：助手只返回当前身份有权访问的工单摘要，包含编号、状态、严重程度、位置、责任人、摘要和详情入口。
4. 查询其他项目或无权工单时，预期只显示无可访问结果，不泄露详情。

## 验收路径 5: 图片失败和边界

1. 上传不支持的文件类型。
2. 预期：助手或上传入口提示仅支持 JPG、PNG、WebP 或 GIF。
3. 上传超过 5MB 的图片。
4. 预期：提示单张现场图片不能超过 5MB。
5. 上传多张有效图片。
6. 预期：阶段 4 不额外限制数量；如现有上传能力或环境限制失败，逐项给出可理解反馈。

## 静态检查

交付前运行：

```powershell
npm run check
```

预期：格式化、lint 自动安全修复和 TypeScript 类型检查均通过。

## 实际验收记录

- 2026-07-03：`npm run tscheck` 已通过，确认后端 Agent/API route 和前端助手组件类型正确。
- 2026-07-03：已创建 `supabase/migrations/202607030004_stage4_assistant_sessions.sql`；远程数据库应用状态需在交付前确认。
- 浏览器图片上传、多模态模型行为和 OpenRouter tool calling 依赖真实登录会话、远程 migration 和所选 OpenRouter 模型能力，需以人工路径 1-5 最终验收。

## 环境变量确认命令

仅检查是否填写，不输出具体值：

```powershell
$required = "SECRET_KEY","OPENROUTER_API_KEY","OPENROUTER_MODEL","OPENROUTER_BASE_URL"
$envFile = Get-Content -LiteralPath ".env.local" -Encoding UTF8
foreach ($key in $required) {
  $line = $envFile | Where-Object { $_ -match "^$key=.+" } | Select-Object -First 1
  if (-not $line) { Write-Error "$key is missing or empty" }
}
```

## 已知限制

- 阶段 4 不接 Coze/扣子知识接口。
- 阶段 4 不实现规范条文问答。
- 阶段 4 不启用 MCP、HITL 或 LangSmith 监控。
- 阶段 4 不承诺完整长期聊天历史管理，只做当前身份/项目的演示会话快照。
