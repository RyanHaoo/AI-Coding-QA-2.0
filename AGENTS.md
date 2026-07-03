# 项目说明

这是一个空白 Next.js 应用，使用 App Router、TypeScript、Tailwind CSS v4、Biome、shadcn/ui 与 lucide-react。

## 常用命令

- `npm run dev`：启动本地开发服务。
- `npm run format`：使用 Biome 写入格式化结果。
- `npm run lint`：运行 Biome lint。
- `npm run lint:fix`：运行 Biome lint 并写入安全修复。
- `npm run tscheck`：运行 TypeScript 类型检查。
- `npm run check`：依次执行 format、lint:fix、tscheck。

## 提交卡控

- Git hook 位于 `.githooks/pre-commit`。
- `npm install` 后会通过 `prepare` 配置 `core.hooksPath=.githooks`。
- 每次提交前自动执行 `npm run check`，成功后用 `git add -u` 更新已跟踪文件的格式化和安全修复结果。

## spec-kit

- 已使用 `uvx --from git+https://github.com/github/spec-kit.git specify init --here --force --integration codex --ignore-agent-tools --script ps` 初始化。
- spec-kit 脚本位于 `.specify/scripts/powershell`，技能位于 `.agents/skills`。
- 项目宪章位于 [.specify/memory/constitution.md](.specify/memory/constitution.md)，后续 spec、plan、tasks 必须与其保持一致。

## 注意事项

- 无需处理 `npm audit` 输出。
- 需要查询外部文档时，优先使用本地 skill；若缺少对应 skill，再使用 context7 检索。
- 如果常用库通过 context7 检索，必须把使用过的 library id 记录到本文档。
- 若本地 skill 和 context7 都没有结果，再使用网络搜索。
- 本次初始化使用了本地 Next.js、shadcn/ui 与内置浏览器 skill，未使用 context7 library id。
- Supabase 项目：`qa-new`，ref `alfsrxwabllyldcbofok`，region `ap-southeast-1`，org `RyanHaoo's Org` (`dxpxhdtdmouyctgepjcq`)。
- Supabase env：实际本地值放在 `.env.local`；可提交模板放在 `.env.example`。`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 可用于浏览器，`SECRET_KEY` 只能手动填入并仅在服务端使用。
- Supabase client：环境读取位于 `lib/supabase/env.ts`，浏览器 client 位于 `lib/supabase/client.ts`，服务端 client 位于 `lib/supabase/server.ts`，会话刷新 proxy 位于 `lib/supabase/proxy.ts` 和根 `proxy.ts`。
- 本次 Supabase 初始化查询了 Supabase changelog、Supabase MCP `searchDocs` 的 Next.js SSR client 文档，以及本地 Next.js 16 `proxy` 文档；未使用 context7 library id。
- 已安装项目 skill：`simple-next-langchain-agent` 来自 `https://github.com/RyanHaoo/simple-next-langchain-agent-skill`；`langchain-ai/langchain-skills` 已通过 `npx skills add langchain-ai/langchain-skills --skill '*'` 安装到 `.agents/skills`。
- Google Stitch MCP 配置如下：

```toml
[mcp_servers.stitch]
url = "https://stitch.googleapis.com/mcp"

[mcp_servers.stitch.http_headers]
"X-Goog-Api-Key" = ""
```

- Stitch 项目 `智能质检工单`（ID: `16591807519307787618`）的指定屏幕截图和 HTML 已下载到 `stitch/16591807519307787618/`，屏幕清单见 `manifest.json`。

<!-- BEGIN:nextjs-agent-rules -->
# 注意当前 Next.js 版本

当前 Next.js 版本包含破坏性变化，API、约定和文件结构可能不同于旧经验。写代码前先阅读 `node_modules/next/dist/docs/` 中的相关指南，并注意弃用提示。
<!-- END:nextjs-agent-rules -->
