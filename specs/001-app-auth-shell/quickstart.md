# Quickstart: 应用框架与身份入口

## 前置条件

1. `.env.local` 已配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 和服务端可用的 `SECRET_KEY`。
2. 已在 Supabase SQL editor 或 CLI 中执行 `supabase/migrations/202607030001_stage1_identity.sql`。
3. 如需准备演示账号，执行本地 seed 脚本：

```powershell
npm run seed:stage1
```

该脚本会使用 `SECRET_KEY` 创建或复用阶段 1 演示账号，并写入用户资料、项目和身份关系。

## 本地运行

```powershell
npm run dev
```

打开本地地址后使用以下账号验证：

| 邮箱 | 覆盖路径 |
|------|----------|
| `li.qc@example.com` | 单项目质检员 |
| `wang.builder@example.com` | 单项目施工方 |
| `chen.admin@example.com` | 单项目管理员 |
| `ryan.multi@example.com` | 多项目多角色身份选择 |

统一演示密码：`QaDemo#2026`

## 验收路径

1. 未登录打开系统，应看到登录页。
2. 使用 `li.qc@example.com` 登录，应直接进入应用，菜单为智能助手和工单列表。
3. 退出登录后使用 `ryan.multi@example.com` 登录，应看到身份选择界面。
4. 选择管理员身份后，应看到智能助手、数据大盘和管理员工单中心菜单。
5. 在质检员身份访问 `/?view=dashboard`，应看到无权限页面。
6. 在窄屏宽度下打开应用，应显示顶部菜单按钮和抽屉导航。

## 静态检查

```powershell
npm run check
```
