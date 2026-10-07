# 实施计划

使用已有 Next.js 16.2.10、React 19.2.4、TypeScript、Tailwind v4、shadcn/ui 和 lucide-react，不新增依赖。服务端用已有格式化函数生成摘要，仅向客户端传入摘要字符串和 ticketId。点击后使用 Clipboard API，失败时展示只读 textarea。

1. 新增摘要格式化函数及客户端按钮。
2. 接入 TicketDetail 头部，复用现有布局。
3. 无 view 的 ticketId 链接按角色选择容器，保留显式 view 行为和权限检查。
4. 用不提交的开发态示例页面渲染真实 TicketDetail，验证复制、失败及窄屏。
5. 运行 npm run check 和 git diff --check，更新 progress.md，提交 PR。

## Constitution Check

支持“查看问题 → 文字交接”，复用架构，不变更数据库或权限，中文规格齐全。按用户要求，验收限制在本功能和静态检查。

## 文档依据

已阅读本地 next/dist/docs 的 use-client 文档。Context7 library id：/vercel/next.js。
Clipboard API：https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText 。
