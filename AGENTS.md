# 项目说明

`qa-new` 是一个基于 Next.js App Router 的智能质检工单项目基础工程。当前仓库包含前端应用骨架、Supabase 客户端封装、shadcn/ui 基础组件、spec-kit 产物，以及从 Stitch 下载的目标界面参考素材。

## 技术栈

- Next.js `16.2.10`，App Router，React Server Components 开启。
- React `19.2.4`，TypeScript strict mode。
- Tailwind CSS v4，入口样式位于 `app/globals.css`。
- shadcn/ui `radix-nova` 风格，图标库为 `lucide-react`。
- Radix UI 聚合包 `radix-ui`，样式辅助使用 `class-variance-authority`、`clsx`、`tailwind-merge`。
- Supabase：`@supabase/supabase-js` 与 `@supabase/ssr`。
- Biome `2.2.0` 负责格式化、lint、organize imports。

## 目录结构

- `app/`：Next.js App Router 页面、布局和全局样式。
- `components/ui/`：shadcn/ui 组件，当前包含 `button`、`card`、`badge`。
- `lib/utils.ts`：通用工具函数，含 shadcn 常用 `cn`。
- `lib/supabase/`：Supabase 环境读取、浏览器 client、服务端 client、会话刷新逻辑。
- `proxy.ts`：根级 Next.js proxy，接入 Supabase 会话刷新。
- `scripts/prepare.mjs`：`npm prepare` 钩子脚本；本地 Git 仓库中配置 `.githooks`，Vercel 等无 `.git` 构建环境中自动跳过。
- `stitch/16591807519307787618/`：Stitch 项目 `智能质检工单` 的截图、HTML 与 `manifest.json`。
- `.specify/`：spec-kit 脚本、模板和项目宪章。
- `.agents/skills/`：spec-kit 初始化生成的本地技能。
- `.githooks/pre-commit`：提交前质量卡控。

## 常用命令

- `npm run dev`：启动本地开发服务。
- `npm run build`：生产构建。
- `npm run start`：启动生产构建后的服务。
- `npm run format`：使用 Biome 写入格式化结果。
- `npm run lint`：运行 Biome lint。
- `npm run lint:fix`：运行 Biome lint 并写入安全修复。
- `npm run tscheck`：运行 TypeScript 类型检查。
- `npm run check`：依次执行 `format`、`lint:fix`、`tscheck`，是提交前主检查命令。

## 开发注意事项

- 阶段开发进度统一维护在 `progress.md`。
- 每个功能阶段必须作为独立 speckit SDD 单元推进，阶段开始前生成或更新对应 spec、plan、tasks。
- 每个阶段开发完成后，必须更新 `progress.md` 中的阶段状态、完成日期、主要交付、验证结果、遗留问题和下一阶段入口条件，再进行提交或交付汇报。
- `progress.md` 中的估算使用 AI Agent Coding 对话节奏，不代表真实生产排期。
- 当前 Next.js 版本包含破坏性变化。写 Next.js 相关代码前，先阅读 `node_modules/next/dist/docs/` 中对应主题的本地文档，并留意弃用提示。
- TypeScript 使用 strict mode；路径别名 `@/*` 指向仓库根目录。
- Biome 使用 2 空格缩进，开启推荐规则、Next/React domain 规则和自动整理 import。
- Tailwind v4 不使用传统 `tailwind.config.*`；shadcn 配置中的 Tailwind CSS 入口是 `app/globals.css`。
- 优先复用现有目录和 shadcn/ui 模式；新增 UI 组件默认放在 `components/ui/`，业务组件再按功能另建目录。
- 无需处理 `npm audit` 输出，除非用户明确要求。
- Windows 环境下按 UTF-8 处理源码、Markdown、JSON、YAML、TOML、CSV 和配置文件；编辑优先使用 `apply_patch`。
- 需要使用真实浏览器测试时调用codex内置的浏览器，不要连接或启动外部浏览器

## Supabase

- Supabase 项目：`qa-new`。
- Project ref：`alfsrxwabllyldcbofok`。
- 本地真实环境变量放在 `.env.local`；可提交模板放在 `.env.example`。
- `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 可用于浏览器。
- `SECRET_KEY` 只能手动填入，并且仅能在服务端使用。
- 环境读取：`lib/supabase/env.ts`。
- 浏览器 client：`lib/supabase/client.ts`。
- 服务端 client：`lib/supabase/server.ts`。
- 会话刷新：`lib/supabase/proxy.ts` 与根 `proxy.ts`。
- 当前环境没有 supabase CLI，请使用 supabase MCP 内的等效工具

## Vercel

- Vercel 项目：`qa-new`。
- Team：`Ryan Hao's projects`（slug：`ryan-haos-projects`，ID：`team_wAxFdMSYyiA8yM7g5LUofKQl`）。
- Project ID：`prj_Y5OpZGDscyRdyYG14NtZ0zNJhz8m`。
- Production URL：`https://qa-new-olive.vercel.app`。
- 当前生产部署：`dpl_5gWHHdbzHg3VbnfJ4fcrUzvUqW7y`，部署 URL：`https://qa-izchq71q8-ryan-haos-projects.vercel.app`。
- 首次本地关联命令：`npx vercel@latest link --yes --project qa-new --scope ryan-haos-projects`。
- Production 部署命令：`npx vercel@latest deploy --prod --yes --scope ryan-haos-projects`。
- Production 环境变量需在 Vercel 项目中配置：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`SECRET_KEY`。不要把真实 `SECRET_KEY` 写入仓库、日志或文档。
- 部署后校验命令：`npx vercel@latest inspect <deployment-url> --scope ryan-haos-projects`，并用浏览器或 HTTP 请求检查 `https://qa-new-olive.vercel.app` 返回 200 且首屏可渲染。

## spec-kit

- 已使用以下命令初始化：

```powershell
uvx --from git+https://github.com/github/spec-kit.git specify init --here --force --integration codex --ignore-agent-tools --script ps
```

- spec-kit 脚本位于 `.specify/scripts/powershell`。
- 本地技能位于 `.agents/skills`。
- 项目宪章位于 `.specify/memory/constitution.md`。
- 后续 spec、plan、tasks 必须与项目宪章保持一致。

## 外部文档查询规则

- 需要查询外部文档时，优先使用本地 skill。
- 若缺少对应 skill，再使用 context7 检索。
- 如果常用库通过 context7 检索，必须把使用过的 library id 记录到本文档的「context7 记录」小节。
- 若本地 skill 和 context7 都没有结果，再使用网络搜索。

## context7 记录

- 本次初始化使用了本地 Next.js、shadcn/ui 与内置浏览器 skill，未使用 context7 library id。
- 本次 Supabase 初始化查询了 Supabase changelog、Supabase MCP `searchDocs` 的 Next.js SSR client 文档，以及本地 Next.js 16 `proxy` 文档；未使用 context7 library id。

## 已安装项目 skill

- `simple-next-langchain-agent`：来自 `https://github.com/RyanHaoo/simple-next-langchain-agent-skill`。
- `langchain-ai/langchain-skills`：已通过 `npx skills add langchain-ai/langchain-skills --skill '*'` 安装到 `.agents/skills`。

## 提交卡控

- `npm install` 后会通过 `prepare` 配置 `core.hooksPath=.githooks`。
- 每次提交前 `.githooks/pre-commit` 会自动执行 `npm run check`。
- 检查成功后 hook 会用 `git add -u` 更新已跟踪文件的格式化和安全修复结果。

## Stitch 参考资产

- Stitch 项目名：`智能质检工单`。
- 项目 ID：`16591807519307787618`。
- 资产目录：`stitch/16591807519307787618/`。
- 屏幕清单：`stitch/16591807519307787618/manifest.json`。
- 已下载页面包括登录页、助手页、管理员工单中心、工单详情查看态和编辑态的截图与 HTML。

## Stitch MCP

- Google Stitch MCP 已配置为远程 HTTP MCP。
- MCP URL：`https://stitch.googleapis.com/mcp`。
- HTTP header 使用 `X-Goog-Api-Key`。不要把 key 复制到日志、截图或对外文档。
