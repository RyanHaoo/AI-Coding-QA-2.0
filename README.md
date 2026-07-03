# QA New

空白 Next.js 启动项目，已启用 App Router、TypeScript、Tailwind CSS v4、Biome、shadcn/ui 与 lucide-react。

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

## 提交

项目使用 `.githooks/pre-commit` 做提交前卡控。执行 `npm install` 后会自动配置 `core.hooksPath=.githooks`。
