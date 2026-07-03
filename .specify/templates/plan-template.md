# 实施计划: [FEATURE]

**分支**: `[###-feature-name]` | **日期**: [DATE] | **规格**: [link]

**输入**: `/specs/[###-feature-name]/spec.md` 中的功能规格

**说明**: 本模板由 `/speckit-plan` 填写。所有内容必须使用中文，代码标识符、命令、路径和第三方 API 名称可保留英文。

## 摘要

[从功能规格提取：核心用户目标、P1 演示闭环、技术实现方向]

## 技术上下文

**语言/版本**: [例如 TypeScript、Next.js 16，或 NEEDS CLARIFICATION]

**主要依赖**: [例如 Next.js App Router、Supabase、shadcn/ui，或 NEEDS CLARIFICATION]

**数据与存储**: [例如 Supabase、静态样例数据、浏览器状态，或 N/A]

**静态检查**: [例如 npm run check、npm run tscheck，或 NEEDS CLARIFICATION]

**测试**: 默认不要求；仅当规格明确要求测试时填写测试方式

**目标平台**: [例如本地演示环境、现代浏览器、Vercel，或 NEEDS CLARIFICATION]

**项目类型**: [例如 Next.js Web 应用、服务端 API、前端演示工具，或 NEEDS CLARIFICATION]

**性能目标**: [演示相关目标，例如首屏可交互、核心操作响应，或 N/A]

**约束**: [演示范围、数据边界、浏览器支持、Supabase 环境等]

**范围**: [P1/P2/P3 用户故事、页面数量、核心数据实体等]

## Constitution Check

*门禁：Phase 0 研究前必须通过；Phase 1 设计后必须复核。*

- **MVP核心路径**: 本功能支撑的 P1 演示闭环是 [填写端到端用户旅程]。
- **需求驱动快速实现**: 计划复用的现有结构和依赖是 [填写路径/组件/库]；新增依赖为 [无或说明原因]。
- **静态检查门槛**: 交付前运行 [填写命令]；若仅文档变更，运行占位符和一致性检查。
- **复杂度控制**: 新增抽象、通用化能力、权限体系、缓存、国际化、可访问性专项为 [无或说明需求依据]。
- **中文文档**: spec、plan、tasks、quickstart 和其他交付文档必须使用中文。
- **显式排除项**: 测试、无障碍、可扩展性和生产级防御性处理不默认纳入；如纳入必须引用具体需求。

## 项目结构

### 文档（当前功能）

```text
specs/[###-feature]/
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
├── (routes)/
├── api/
└── globals.css

components/
├── ui/
└── [feature]/

lib/
├── supabase/
└── [feature]/

public/
└── [assets]
```

**结构决策**: [说明实际采用的目录和原因；删除未使用目录，不保留样例占位]

## 复杂度记录

> **仅当 Constitution Check 存在偏离时填写。没有偏离时写“无”。**

| 偏离项 | 需求依据 | 为什么不能用更简单方案 |
|--------|----------|------------------------|
| [例如新增状态管理库] | [具体需求] | [更简单方案不足的原因] |
