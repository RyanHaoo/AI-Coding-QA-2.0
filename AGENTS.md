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

## 注意事项

- 无需处理 `npm audit` 输出。
- 需要查询外部文档时，优先使用本地 skill；若缺少对应 skill，再使用 context7 检索。
- 如果常用库通过 context7 检索，必须把使用过的 library id 记录到本文档。
- 若本地 skill 和 context7 都没有结果，再使用网络搜索。
- 本次初始化使用了本地 Next.js、shadcn/ui 与内置浏览器 skill，未使用 context7 library id。

<!-- BEGIN:nextjs-agent-rules -->
# 注意当前 Next.js 版本

当前 Next.js 版本包含破坏性变化，API、约定和文件结构可能不同于旧经验。写代码前先阅读 `node_modules/next/dist/docs/` 中的相关指南，并注意弃用提示。
<!-- END:nextjs-agent-rules -->
