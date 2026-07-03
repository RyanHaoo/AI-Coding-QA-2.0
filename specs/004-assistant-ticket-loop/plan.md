# 实施计划: 智能助手建单与查单

**分支**: `[004-assistant-ticket-loop]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `specs/004-assistant-ticket-loop/spec.md` 中的功能规格

**说明**: 本模板由 `/speckit-plan` 填写。所有内容必须使用中文，代码标识符、命令、路径和第三方 API 名称可保留英文。

## 摘要

阶段 4 的核心目标是在现有登录身份、工单数据底座和工单操作闭环之上，接入一个可演示的智能助手：用户以自然语言和现场图片发起建单，Agent 在同一轮多模态输入中整理建单草稿，用户确认后创建待处理工单；用户也可以用自然语言按编号、关键词或“我的待处理工单”查找有权工单。

技术实现严格采用当前 Next.js App Router 技术栈和 `simple-next-langchain-agent` 指定路径：前端用 AI SDK `useChat` 与 `DefaultChatTransport` 管理 `UIMessage[]`；后端 `/api/chat` 使用 `@ai-sdk/langchain` 把 `UIMessage[]` 转为 LangChain messages，并把 LangChain stream 转回 UIMessage stream；Agent 使用 LangChain `createAgent()` 和固定服务端 tools；LLM 固定通过 `@langchain/openai` 连接 OpenRouter OpenAI-compatible API。Supabase 继续负责 Auth、当前身份、会话快照、工单、处理记录和图片 URL。

## 技术上下文

**语言/版本**: TypeScript strict mode；Next.js `16.2.10` App Router；React `19.2.4`；Tailwind CSS v4；Biome `2.2.0`

**主要依赖**: 现有 Next.js、React、Supabase、shadcn/ui、lucide-react；新增 `ai`、`@ai-sdk/react`、`@ai-sdk/langchain`、`langchain`、`@langchain/core`、`@langchain/openai`、`zod`；按需安装 AI Elements 组件

**数据与存储**: Supabase Auth 和现有 `project_memberships` 控制身份；现有 `tickets`、`ticket_activity_logs`、`ticket-images` bucket 承载工单和图片；新增最小助手会话表保存当前身份/项目的 `UIMessage[]` 快照和可选草稿状态

**静态检查**: `npm run check`；如果只更新文档，执行占位符和一致性检查

**测试**: 默认不要求；仅当规格明确要求测试时填写测试方式

**目标平台**: 本地演示环境、现代桌面和移动浏览器；后续 Vercel 部署沿用当前项目部署阶段

**项目类型**: Next.js Web 应用，包含 Server Components、Client Components、Route Handlers、Server Actions 和 Supabase 数据访问

**性能目标**: 助手页面在本地演示环境首屏可交互；消息发送后持续流式展示，不出现空白闪烁；建单和查单工具调用在一次流式回复中给出可观察结果

**约束**: 
- 严格使用 `simple-next-langchain-agent` 路径：AI Elements -> `@ai-sdk/react useChat` -> `DefaultChatTransport` -> `@ai-sdk/langchain` -> LangChain `createAgent().stream()` -> 固定服务端 tools。
- 不引入 `@langchain/react`、`FetchStreamTransport`、`HttpAgentServerAdapter`、LangGraph Agent Server protocol、手写 SSE 或多 endpoint command/state/event bridge。
- LLM 固定接入 OpenRouter API；浏览器不得获得 `OPENROUTER_API_KEY`、`SECRET_KEY` 或服务端 Supabase secret。
- 阶段 4 不接 Coze/扣子知识接口、不做规范条文问答、不做 MCP、不做 HITL、不做生产级会话管理。
- 开发开始前必须完成 `.env.local` 中 `SECRET_KEY`、`OPENROUTER_API_KEY`、`OPENROUTER_MODEL` 配置并由 agent 确认存在值。

**范围**: P1 助手多模态建单闭环；P2 自然语言查单；P3 Stitch 风格聊天体验。核心实体包括助手会话、`UIMessage[]` 快照、现场图片文件部件、建单草稿、查单结果、工单、处理记录和当前身份可见范围。

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是“质检员/管理员进入助手 -> 输入文字并上传图片 -> Agent 生成待确认草稿 -> 用户选择责任人并确认 -> 创建待处理工单 -> 列表/详情可查并展示图片”。
- **需求驱动快速实现**: 计划复用 `components/app-shell/page-content.tsx`、现有工单组件、`lib/identity/*`、`lib/tickets/*`、`lib/supabase/*`、`app/actions.ts` 中的身份和图片上传模式；新增依赖仅为 AI SDK、LangChain、OpenRouter 所需依赖和 AI Elements UI 组件。
- **静态检查门槛**: 交付前运行 `npm run check`；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 不新增通用权限体系、缓存、国际化、无障碍专项、MCP、HITL 或 Agent Server；新增助手会话表和 Agent helper 只为 `UIMessage[]` 持久化与阶段 4 演示闭环服务。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 测试、无障碍、可扩展性和生产级防御性处理不默认纳入；如纳入必须引用具体需求。

## 项目结构

### 文档（当前功能）

```text
specs/004-assistant-ticket-loop/
├── plan.md              # 本文件，由 /speckit-plan 生成
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出，如涉及数据实体
├── quickstart.md        # Phase 1 输出，演示和静态检查步骤
├── contracts/           # Phase 1 输出，如涉及 API 或数据契约
└── tasks.md             # Phase 2 输出，由 /speckit-tasks 生成
```

### 源码（仓库根目录）

```text
app/
├── api/
│   ├── chat/route.ts
│   └── assistant-images/route.ts
└── globals.css

components/
├── assistant/
├── ui/
└── tickets/

lib/
├── assistant/
├── identity/
├── supabase/
└── tickets/

public/
└── [assets]
```

**结构决策**: 
- `app/api/chat/route.ts` 承担 AI SDK UIMessage stream 主链路，不手写 SSE。
- `app/api/assistant-images/route.ts` 只处理对话图片上传，复用 `ticket-images` bucket 和服务端 secret 边界，返回 AI SDK file part 所需 URL。
- `components/assistant/` 放置助手页面、输入区、消息渲染和建单草稿卡片；重复 UI 基础能力继续放 `components/ui/`。
- `lib/assistant/` 放置 Agent 创建、OpenRouter model、固定 tools、会话持久化、草稿整理和 API route 辅助函数。
- `lib/tickets/` 扩展最小建单 mutation 和查单 helper，继续复用既有类型、格式化、权限规则和图片上传 helper。

## 复杂度记录

> **仅当 Constitution Check 存在偏离时填写。没有偏离时写“无”。**

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 新增 AI SDK 与 LangChain 依赖 | 用户明确要求严格遵循 `simple-next-langchain-agent`，且阶段 4 需要真实 Agent 流式对话和固定服务端工具 | 纯 Server Action 或静态规则无法满足多模态 Agent、流式 UI 和固定工具调用路径 |
| 新增助手会话持久化表 | `simple-next-langchain-agent` 要求以 Supabase 保存 `UIMessage[]` 快照并刷新恢复 | 仅浏览器 state 会刷新丢失，且不满足技能的数据边界 |

## Phase 0 研究结论

详见 [research.md](./research.md)。所有规划未知项已关闭：OpenRouter 接入方式、AI SDK/LangChain 数据流、图片上传路径、会话持久化边界、Agent tools 和排除项均已确定。

## Phase 1 设计产物

- [data-model.md](./data-model.md)
- [contracts/assistant-chat-flow.md](./contracts/assistant-chat-flow.md)
- [quickstart.md](./quickstart.md)

## Constitution Check 复核

- **MVP核心路径**: 设计产物围绕 P1 助手建单闭环展开，P2 查单和 P3 UI 作为增强，不扩大阶段范围。
- **需求驱动快速实现**: 设计复用现有 Supabase、工单 mutation/query、图片上传和 app shell；新增依赖均由用户指定 Agent 技术路径直接触发。
- **静态检查门槛**: 保持 `npm run check` 为交付门槛；quickstart 增加环境变量确认、开发服务和人工验收步骤。
- **复杂度控制**: 不引入 MCP、HITL、LangGraph Server、独立图片理解链路、完整会话列表或生产级审计。
- **中文文档**: 本阶段新增文档均为中文。
- **显式排除项**: 继续排除 Coze/扣子知识接口、规范条文问答、语音输入、生产级监控和完整测试体系。
