# 实施计划: Coze知识接口集成

**分支**: `[005-coze-knowledge-integration]` | **日期**: 2026-07-03 | **规格**: [spec.md](./spec.md)

**输入**: `specs/005-coze-knowledge-integration/spec.md` 中的功能规格

**说明**: 本模板由 `/speckit-plan` 填写。所有内容必须使用中文，代码标识符、命令、路径和第三方 API 名称可保留英文。

## 摘要

阶段 6 的核心目标是在阶段 4 智能助手链路中补齐施工质检知识问答能力：用户询问施工规范、工艺标准、质量要求、施工做法或现场质量判断时，主 Agent 通过固定服务端 tool 调用 Coze/扣子既有知识子 Agent，返回中文回答和来源说明；当 Coze 失败、为空或超时时，助手明确兜底且不编造答案。

技术实现继续沿用现有 AI SDK + LangChain 主链路：前端仍使用 `useChat` 和 `DefaultChatTransport` 提交完整 `UIMessage[]` 到 `/api/chat`；后端仍使用 `@ai-sdk/langchain` 与 LangChain `createAgent().stream()`。阶段 6 只新增 `@coze/api` 依赖、Coze SDK helper、`query_construction_knowledge` 固定工具、环境变量模板和系统提示词规则，不新增前端 endpoint、Supabase 表或独立图片链路。

## 技术上下文

**语言/版本**: TypeScript strict mode；Next.js `16.2.10` App Router；React `19.2.4`；Tailwind CSS v4；Biome `2.2.0`

**主要依赖**: 现有 Next.js、React、Supabase、AI SDK、`@ai-sdk/langchain`、LangChain、OpenRouter；新增 `@coze/api@1.3.9`

**数据与存储**: 继续使用现有 `assistant_sessions.messages` 保存 `UIMessage[]` 快照；Coze 调用不写入 Supabase，不复用 Coze conversation，不新增 migration

**静态检查**: `npm run tscheck`；最终交付运行 `npm run check`

**测试**: 默认不要求；仅当规格明确要求测试时填写测试方式

**目标平台**: 本地演示环境、现代桌面和移动浏览器；后续 Vercel 部署沿用阶段 7

**项目类型**: Next.js Web 应用，包含 Server Components、Client Components、Route Handlers 和 Supabase 数据访问

**性能目标**: 知识问答在一次助手回复中返回可观察结果；Coze 超时或失败时在同一回复内给出兜底反馈

**约束**:
- Coze 作为独立无记忆单轮 tool：不传 `conversation_id`，随机生成非业务 `user_id`，`auto_save_history=false`。
- 浏览器不得获得 `COZE_API_TOKEN`、`OPENROUTER_API_KEY`、`SECRET_KEY` 或服务端 Supabase secret。
- 不新增前端 API endpoint、手写 SSE、MCP、HITL、独立 Coze 会话列表或生产级知识审计。
- 不新增图片上传、图片预览、多模态建单理解、图片随工单保存或独立图片理解链路。
- LangSmith 只通过环境变量启用，不新增代码级 tracing wrapper。

**范围**: P1 Coze 知识问答与信息不足追问；P2 超范围和接口失败兜底；P3 知识判断后的既有建单流程衔接。核心实体包括知识问题、Coze 知识查询、知识回答、来源说明和混合意图上下文。

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是“用户进入智能助手 -> 输入施工质检知识问题 -> Agent 调用 Coze tool -> 返回中文回答和来源说明 -> 信息不足时追问关键条件”。
- **需求驱动快速实现**: 计划复用 `app/api/chat/route.ts`、`lib/assistant/agent.ts`、`lib/assistant/tools.ts`、现有 `UIMessage[]` 会话持久化和阶段 4 助手 UI；新增依赖为用户确认的 Coze 官方 SDK `@coze/api`。
- **静态检查门槛**: 交付前运行 `npm run tscheck` 和 `npm run check`；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 不新增通用权限体系、缓存、国际化、无障碍专项、MCP、HITL、独立 Coze 会话存储或知识审计表。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 测试、无障碍、可扩展性和生产级防御性处理不默认纳入；如纳入必须引用具体需求。

## 项目结构

### 文档（当前功能）

```text
specs/005-coze-knowledge-integration/
├── plan.md              # 本文件，由 /speckit-plan 生成
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出，演示和静态检查步骤
├── contracts/
│   └── coze-knowledge-tool.md
└── tasks.md             # Phase 2 输出，由 /speckit-tasks 生成
```

### 源码（仓库根目录）

```text
app/
├── api/
│   └── chat/route.ts
└── globals.css

components/
├── assistant/
├── ui/
└── tickets/

lib/
├── assistant/
├── supabase/
└── tickets/
```

**结构决策**:
- `app/api/chat/route.ts` 继续承载 AI SDK UIMessage stream 主链路，不新增 Coze endpoint。
- `lib/assistant/coze.ts` 集中封装 Coze SDK 初始化、单轮 stream 调用、文本聚合、超时和失败兜底。
- `lib/assistant/tools.ts` 新增 `query_construction_knowledge` 固定工具，并继续保留阶段 4 查单、建单草稿和创建工单 tools。
- `lib/assistant/agent.ts` 更新系统提示词，要求知识问答必须调用 Coze tool，失败时不得自答。

## 复杂度记录

> **仅当 Constitution Check 存在偏离时填写。没有偏离时写“无”。**

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| 新增 `@coze/api` 依赖 | 用户明确要求使用 Coze 官方 SDK 接入既有知识 Agent | 直接 `fetch` 依赖更少，但用户已选择官方 SDK，且 SDK 提供事件枚举和类型约束 |
| 启用 LangSmith 环境变量 | 用户明确选择启用 Agent 会话监控 | 代码级 wrapper 更复杂；环境变量自动 tracing 已满足阶段 6 调试目标 |

## Phase 0 研究结论

详见 [research.md](./research.md)。规划未知项已关闭：Coze 官方 SDK、单轮无记忆调用、现有 AI SDK/LangChain 链路、LangSmith 环境变量和不新增数据库表均已确定。

## Phase 1 设计产物

- [data-model.md](./data-model.md)
- [contracts/coze-knowledge-tool.md](./contracts/coze-knowledge-tool.md)
- [quickstart.md](./quickstart.md)

## Constitution Check 复核

- **MVP核心路径**: 设计产物围绕 P1 Coze 知识问答和来源展示展开，P2/P3 只作为兜底和既有建单衔接。
- **需求驱动快速实现**: 设计复用现有助手主链路与会话持久化；新增依赖由用户确认的 Coze SDK 直接触发。
- **静态检查门槛**: 保持 `npm run tscheck` 和 `npm run check` 为交付门槛；quickstart 增加人工验收路径。
- **复杂度控制**: 不新增 Coze 会话存储、前端 endpoint、数据库迁移、缓存、图片链路或生产级审计。
- **中文文档**: 本阶段新增文档均为中文。
- **显式排除项**: 继续排除新增图片闭环、MCP、HITL、生产级监控面板和完整测试体系。
