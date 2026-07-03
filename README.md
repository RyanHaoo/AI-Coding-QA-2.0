# QA New

建筑施工质检情报员 MVP 工程，已启用 App Router、TypeScript、Tailwind CSS v4、Biome、shadcn/ui、lucide-react 与 Supabase。

## 开发

```bash
npm run dev
```

默认访问 `http://localhost:3000`。如果端口被占用，Next.js 会自动使用下一个可用端口。

## 校验

```bash
npm run check
```

该命令会依次执行格式化、Biome 安全修复和 TypeScript 类型检查。

## 阶段 1 测试数据

Supabase 项目：`qa-new`，Project ref：`alfsrxwabllyldcbofok`。

阶段 1 身份入口测试数据已灌注到远程 Supabase：

- 项目：3 个
- 用户资料：6 个
- 项目身份：9 条
- 验收状态：已通过

统一测试密码：

```text
QaDemo#2026
```

测试账号：

| 邮箱 | 姓名 | 覆盖身份 | 用途 |
|---|---|---|---|
| `li.qc@example.com` | 李明 | 上海瑞虹商业综合体 / 质检员 | 单项目单角色，验证质检员路径 |
| `wang.builder@example.com` | 王强 | 上海瑞虹商业综合体 / 施工方 | 单项目单角色，验证施工方路径 |
| `chen.admin@example.com` | 陈静 | 上海瑞虹商业综合体 / 管理员 | 单项目管理员，验证管理员导航 |
| `ryan.multi@example.com` | Ryan Hao | 上海瑞虹商业综合体 / 管理员；苏州智造园一期 / 质检员；杭州云栖住宅北区 / 施工方 | 多项目多权限，验证身份选择 |
| `zhao.builder@example.com` | 赵磊 | 苏州智造园一期 / 施工方；杭州云栖住宅北区 / 施工方 | 多项目同角色，验证身份选择 |
| `sun.qc@example.com` | 孙敏 | 杭州云栖住宅北区 / 质检员 | 第三项目质检员，验证项目隔离 |

相关文件：

- `supabase/migrations/202607030001_stage1_identity.sql`：阶段 1 身份表、RLS、Data API grant。
- `scripts/seed-stage1.mjs`：创建或复用 Supabase Auth 测试账号，并写入项目、用户资料、项目身份。
- `specs/001-app-auth-shell/quickstart.md`：阶段 1 验收步骤。

如需重新灌注阶段 1 数据，确保 `.env.local` 包含 `SECRET_KEY` 后运行：

```bash
npm run seed:stage1
```

`SECRET_KEY` 只用于本地 seed 和服务端管理操作，不要写入 README、日志、浏览器代码或任何 `NEXT_PUBLIC_` 环境变量。

## 提交

项目使用 `.githooks/pre-commit` 做提交前卡控。执行 `npm install` 后会自动配置 `core.hooksPath=.githooks`。
