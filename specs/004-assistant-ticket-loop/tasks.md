# 任务清单: 智能助手建单与查单

**输入**: `/specs/004-assistant-ticket-loop/` 下的设计文档

**前置文档**: plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/

**测试**: 规格未要求 TDD 或自动化测试；本阶段不创建测试任务，验收以 quickstart 人工路径和 `npm run check` 为准。

**组织方式**: 任务按用户故事分组，先完成 P1 助手多模态建单闭环，再处理 P2 自然语言查单和 P3 聊天体验打磨。

## 格式: `[ID] [P?] [Story] 任务描述`

- **[P]**: 可并行执行，前提是修改不同文件且没有顺序依赖
- **[Story]**: 对应用户故事，例如 US1、US2、US3
- 描述必须包含准确文件路径

## 路径约定

- **Next.js App Router**: `app/`、`components/`、`lib/`、`public/`
- **助手组件**: `components/assistant/`
- **服务与 Agent**: `lib/assistant/`
- **工单业务**: `lib/tickets/`
- **Supabase 迁移**: `supabase/migrations/`
- **文档**: `specs/004-assistant-ticket-loop/`

## Phase 1: 准备与依赖

**目的**: 安装阶段 4 Agent 所需依赖，确认环境变量和当前技术路径可进入实现。

- [X] T001 安装 AI SDK 与 LangChain 依赖并更新 `package.json` 和 `package-lock.json`
- [X] T002 [P] 在实现前核对已安装 `ai`、`@ai-sdk/react`、`@ai-sdk/langchain`、`langchain`、`@langchain/core`、`@langchain/openai`、`zod` 的本地类型入口并记录到 `specs/004-assistant-ticket-loop/quickstart.md`
- [X] T003 [P] 在 `components/assistant/` 准备 AI Elements 风格组件落点，确认不引入 `@langchain/react` 或手写 SSE
- [X] T004 [P] 在 `lib/assistant/env.ts` 创建 OpenRouter 服务端环境变量读取与缺失提示，读取 `OPENROUTER_API_KEY`、`OPENROUTER_MODEL`、`OPENROUTER_BASE_URL`
- [X] T005 [P] 在 `specs/004-assistant-ticket-loop/quickstart.md` 补充已确认环境变量非空的开发前置结果，不写入任何密钥值

---

## Phase 2: 基础实现（阻塞 P1）

**目的**: 完成所有用户故事共享且无法绕开的数据、会话、上传和 Agent 基础能力。

**关键规则**: 只放阻塞 P1 的共享能力；不提前实现 Coze/扣子、MCP、HITL、完整会话列表或生产级审计。

- [X] T006 创建 `supabase/migrations/202607030004_stage4_assistant_sessions.sql`，新增 `assistant_sessions` 表、默认会话唯一约束、必要索引和 authenticated/RLS 策略说明
- [X] T007 [P] 在 `lib/assistant/types.ts` 定义助手会话、建单确认信息、查单结果、上传文件返回和 Agent runtime context 类型
- [X] T008 [P] 在 `lib/assistant/session.ts` 实现当前用户当前项目身份默认助手会话的读取、创建和 `UIMessage[]` 快照保存
- [X] T009 [P] 在 `lib/assistant/runtime.ts` 实现服务端当前身份解析，复用 `lib/identity/queries.ts` 和当前身份 cookie
- [X] T010 [P] 在 `lib/assistant/model.ts` 使用 `@langchain/openai` 创建指向 OpenRouter `OPENROUTER_BASE_URL` 的 ChatOpenAI 模型
- [X] T011 [P] 在 `lib/tickets/creation.ts` 实现创建待处理工单 mutation，写入 `tickets`、`ticket_activity_logs` 和 `image_urls`
- [X] T012 [P] 在 `lib/tickets/assistant-queries.ts` 实现当前身份可见工单查询、关键词/编号/状态筛选和详情链接构建 helper
- [X] T013 [P] 在 `lib/assistant/uploads.ts` 封装助手图片上传结果校验，复用 `lib/tickets/image-storage.ts` 的 MIME 和 5MB 限制
- [X] T014 在 `app/api/assistant-images/route.ts` 实现服务端图片上传 route，验证登录和当前身份后返回 AI SDK file part 所需 URL
- [X] T015 在 `lib/assistant/tools.ts` 实现固定 server-side tools：`search_visible_tickets`、`list_project_builders`、`create_ticket_from_confirmed_draft`
- [X] T016 在 `lib/assistant/agent.ts` 使用 `createAgent()` 组合 OpenRouter 模型、固定 tools 和阶段 4 系统提示词
- [X] T017 在 `app/api/chat/route.ts` 实现 AI SDK -> LangChain -> AI SDK stream 主链路，使用 `toBaseMessages`、`toUIMessageStream` 和 `createUIMessageStreamResponse`
- [X] T018 在 `app/api/chat/route.ts` 接入 onEnd 会话快照保存，确保刷新后由 Supabase 恢复 `UIMessage[]`

**检查点**: 助手页面可以开始接入，P1 用户故事可以实现。

---

## Phase 3: 用户故事 1 - 通过助手创建工单（优先级: P1）

**目标**: 质检员或管理员可通过文字和现场图片让 Agent 直接进入建单确认卡片，确认后创建待处理工单并在详情中看到图片。

**独立验收**: 使用质检员或管理员身份进入智能助手，输入建单话术并上传图片，选择责任人后确认提交；对话返回工单编号，列表/详情可查到新工单和现场图片。

### 实现任务

- [X] T019 [P] [US1] 在 `components/assistant/assistant-page.tsx` 创建助手页面容器，接收服务端初始 `UIMessage[]`、会话 ID、当前身份和责任人候选
- [X] T020 [P] [US1] 在 `components/assistant/assistant-chat.tsx` 使用 `useChat` 和 `DefaultChatTransport({ api: "/api/chat" })` 提交完整 `UIMessage[]`
- [X] T021 [P] [US1] 在 `components/assistant/assistant-input.tsx` 实现文本输入、图片选择、图片预览、删除图片和发送消息
- [X] T022 [US1] 在 `components/assistant/assistant-input.tsx` 接入 `POST /api/assistant-images`，上传成功后把图片作为 AI SDK file part 随同一轮消息发送
- [X] T023 [P] [US1] 在 `components/assistant/ticket-draft-card.tsx` 创建建单确认卡片，展示问题描述、位置、严重程度、专业类型、责任人、详情、图片和确认按钮
- [X] T024 [US1] 在 `components/assistant/ticket-draft-card.tsx` 实现建单确认字段编辑、责任人选择和保留图片列表调整
- [X] T025 [US1] 在 `lib/assistant/tools.ts` 确保 `create_ticket_from_confirmed_draft` 缺少问题描述、位置或责任人时通过 HITL 卡片保留缺失字段
- [X] T026 [US1] 在 `lib/assistant/tools.ts` 确保 `create_ticket_from_confirmed_draft` 只允许质检员和管理员创建工单，施工方返回拒绝原因
- [X] T027 [US1] 在 `lib/tickets/creation.ts` 确保新工单状态为待处理、发起人为当前身份、责任人为所选施工方，并生成 `created` 处理记录
- [X] T028 [US1] 在 `components/app-shell/page-content.tsx` 将 `view=assistant` 的占位内容替换为 `AssistantPage`
- [X] T029 [US1] 在 `app/page.tsx` 或其数据装配路径中读取当前身份默认助手会话和当前项目施工方候选，传入 `PageContent`
- [ ] T030 [US1] 人工走通 `specs/004-assistant-ticket-loop/quickstart.md` 验收路径 1 和路径 2，并把结果记录到 `specs/004-assistant-ticket-loop/quickstart.md`

**检查点**: P1 可独立演示，达到阶段 4 MVP 最小闭环。

---

## Phase 4: 用户故事 2 - 通过助手查询有权工单（优先级: P2）

**目标**: 用户可用工单编号、关键词、位置、状态或“我的工单”等自然语言查询当前身份有权工单。

**独立验收**: 分别使用质检员、施工方和管理员身份输入编号、关键词和“我的待处理工单”，助手只返回当前项目和当前身份范围内的结果。

### 实现任务

- [X] T031 [P] [US2] 在 `lib/tickets/assistant-queries.ts` 完成编号、关键词、位置、问题摘要和状态表达的查询解析与排序
- [X] T032 [US2] 在 `lib/assistant/tools.ts` 完成 `search_visible_tickets` 的结果格式化，返回编号、状态、严重程度、位置、责任人、摘要和详情入口
- [X] T033 [P] [US2] 在 `components/assistant/ticket-result-list.tsx` 创建查单结果列表组件，渲染工单摘要和详情入口
- [X] T034 [US2] 在 `components/assistant/assistant-chat.tsx` 接入工具结果渲染，使查单结果、无结果和无权限反馈在消息流中可见
- [X] T035 [US2] 在 `lib/assistant/tools.ts` 确保查询其他项目或无权工单时不返回工单详情，仅返回无可访问结果
- [ ] T036 [US2] 人工走通 `specs/004-assistant-ticket-loop/quickstart.md` 验收路径 4，并确认不破坏 P1 建单路径

**检查点**: P1 和 P2 均可独立演示。

---

## Phase 5: 用户故事 3 - 呈现可演示的聊天体验（优先级: P3）

**目标**: 参考 Stitch 聊天界面完成消息流、用户气泡、助手回复、建单确认卡片、图片预览、成功反馈和底部输入区的演示体验。

**独立验收**: 打开助手页面后，在桌面和移动宽度下完成至少一次建单或查单，确认消息流、输入区、卡片和成功反馈清晰可读。

### 实现任务

- [X] T037 [P] [US3] 在 `components/assistant/message-list.tsx` 创建 Stitch 风格消息流布局，区分用户消息、助手消息、工具结果和错误提示
- [X] T038 [P] [US3] 在 `components/assistant/assistant-empty-state.tsx` 创建无历史会话的轻量空状态，不使用营销式落地页
- [X] T039 [US3] 在 `components/assistant/assistant-chat.tsx` 完成 streaming、submitted、error 状态展示，确保错误不清空已有消息
- [X] T040 [US3] 在 `components/assistant/ticket-draft-card.tsx` 打磨桌面和移动宽度下的卡片布局、必填提示、图片缩略图和按钮状态
- [X] T041 [US3] 在 `components/assistant/assistant-input.tsx` 打磨底部输入区、图片缩略图、上传失败反馈和发送按钮禁用状态
- [X] T042 [US3] 在 `components/assistant/ticket-result-list.tsx` 打磨查单结果和无结果反馈的桌面/移动可读性
- [ ] T043 [US3] 使用真实浏览器按桌面和移动宽度验收助手页面，确认文本不溢出、控件不重叠、消息流和图片预览可用，并记录到 `specs/004-assistant-ticket-loop/quickstart.md`

**检查点**: 目标用户故事均可独立演示。

---

## Phase 6: 收尾与静态检查

**目的**: 完成演示交付前的必要整理、验证和进度记录。

- [X] T044 [P] 更新 `specs/004-assistant-ticket-loop/quickstart.md` 中的实际依赖安装、迁移、运行和人工验收结果
- [X] T045 [P] 检查 `specs/004-assistant-ticket-loop/plan.md`、`data-model.md`、`contracts/assistant-chat-flow.md` 与实际实现是否一致
- [X] T046 [P] 更新 `progress.md` 阶段 4 的完成日期、主要交付、验证结果、遗留问题和下一阶段入口条件
- [X] T047 移除 `components/app-shell/page-content.tsx` 中阶段 4 相关占位文案，确认未留下未使用组件和导入
- [ ] T048 运行 `npm run check`，确保格式化、Biome lint 安全修复和 TypeScript 类型检查通过
- [ ] T049 如有必要运行 `npm run build`，确认阶段 4 App Router、API routes 和服务端依赖可生产构建
- [X] T050 汇总无法自动验收的浏览器图片上传、多模态模型行为和 OpenRouter 模型限制到 `specs/004-assistant-ticket-loop/quickstart.md`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备与依赖**: 无依赖，可立即开始；T001 完成后才能使用 AI SDK 和 LangChain 本地类型。
- **Phase 2 基础实现**: 依赖 Phase 1；T006-T018 是 P1 的阻塞基础。
- **Phase 3 US1**: 依赖 Phase 2；完成后得到 MVP 多模态建单闭环。
- **Phase 4 US2**: 可在 US1 之后实施，复用 Phase 2 Agent 和查询基础。
- **Phase 5 US3**: 可在 US1/US2 后实施，也可与部分 UI 打磨并行，但不得阻塞 P1。
- **Phase 6 收尾**: 依赖计划内用户故事完成。

### 用户故事依赖

- **US1 (P1)**: MVP 演示闭环，必须最先完成。
- **US2 (P2)**: 依赖 Phase 2 的 Agent 和工单查询基础；不得破坏 US1。
- **US3 (P3)**: 依赖助手页面已有业务流程；主要提升演示体验。

### 单个用户故事内部顺序

- 数据结构和服务端工具先于页面接入。
- 图片上传、会话持久化和 Agent stream 先于建单卡片确认提交。
- 组件和数据 helper 可并行，最终由页面容器集成。
- 核心建单成功路径先于边界反馈和视觉打磨。

### 并行机会

- T007-T013 可在 T006 migration 设计确认后并行推进。
- T019-T023 可并行创建助手容器、chat hook、输入区和建单确认卡片。
- T031 与 T033 可并行开发查询 helper 和结果组件。
- T037-T038 可与 T040-T042 并行做不同 UI 文件的展示打磨。
- T044-T046 可在实现完成后并行更新文档与进度。

---

## 实施策略

### MVP First（只完成 P1）

1. 完成 Phase 1。
2. 完成 Phase 2 的会话、上传、Agent、工具和 API route 基础能力。
3. 完成 Phase 3 US1。
4. 使用质检员或管理员账号走通多模态建单。
5. 运行 `npm run check` 并记录结果。

### 增量交付

1. P1 可演示后再进入 P2 查单。
2. P2 完成后回归 P1 建单路径。
3. P3 只做聊天体验打磨，不新增业务范围。
4. 最后更新 quickstart 和 `progress.md`，再运行静态检查。

## 注意事项

- 不使用 `@langchain/react`、`FetchStreamTransport`、`HttpAgentServerAdapter`、LangGraph Agent Server protocol 或手写 SSE。
- `/api/chat` 只能消费前端提交的完整 `UIMessage[]`，不得从数据库拼接历史。
- OpenRouter API key、Supabase secret 和服务端 runtime context 不得进入浏览器 bundle。
- 图片和文本作为同一轮 Agent 多模态输入，不建立独立图片理解链路或独立业务字段。
- 阶段 4 不接 Coze/扣子知识接口、规范条文问答、MCP、HITL 或 LangSmith 监控。
