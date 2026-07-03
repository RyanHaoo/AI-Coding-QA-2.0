# Research: 应用框架与身份入口

## 决策 1: 使用 Supabase Auth 邮箱密码登录，工号作为组织展示字段

**Decision**: 阶段 1 登录凭据采用 Supabase Auth 的邮箱和密码；`employee_number` 保存为用户资料字段，用于展示和后续扩展。

**Rationale**: `progress.md` 已列出演示邮箱账号，当前项目已完成 Supabase SSR client 封装。用邮箱登录能最快闭合 MVP 入口，同时不丢失需求文档中的工号字段。

**Alternatives considered**:

- 自建工号密码登录：会引入自定义密码存储和会话管理，超出阶段 1。
- 使用手机号或 OAuth：不符合当前测试账号基线。

## 决策 2: 当前身份使用会话 cookie 保存

**Decision**: 多身份用户选择后，将 `project_membership.id` 写入 httpOnly 会话 cookie；退出登录时清除。

**Rationale**: 当前身份是会话态，不是长期用户偏好；cookie 可由 Server Components 读取，减少客户端状态依赖。

**Alternatives considered**:

- 写入数据库偏好字段：会把一次登录选择变成持久状态，不符合“退出登录后重新选择”的规则。
- 仅用浏览器 localStorage：服务端页面无法可靠读取，且不适合作为权限边界。

## 决策 3: 数据访问采用 RLS + Server Component 读取

**Decision**: 用户资料、项目、项目身份表启用 RLS，并显式 grant 给 authenticated；页面在服务端读取当前用户身份。

**Rationale**: Supabase 2026 年变更要求 public 新表显式 grant 才能通过 Data API 访问；RLS 是公开 schema 的必要防线。Next.js 文档建议授权判断靠近数据源，不只依赖导航隐藏。

**Alternatives considered**:

- 前端硬编码测试身份：无法验证 Supabase Auth 登录，也无法支撑后续阶段。
- 只用 proxy 做权限判断：Next.js 文档明确 proxy 不应作为完整授权方案。

## 决策 4: 阶段 1 只做页面入口占位

**Decision**: 智能助手、工单列表、数据大盘和管理员工单中心在阶段 1 只作为可访问页面占位展示，不接入业务数据。

**Rationale**: `progress.md` 将工单数据、操作闭环、助手建单和管理员大盘分别拆到后续阶段。阶段 1 的交付重点是可登录、可确定身份、可展示角色菜单。

**Alternatives considered**:

- 同步实现工单列表样例：会吞并阶段 2 范围，破坏 SDD 阶段边界。
