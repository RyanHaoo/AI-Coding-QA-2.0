# 任务清单: 应用框架与身份入口

**输入**: `/specs/001-app-auth-shell/` 下的设计文档

**前置文档**: plan.md、spec.md、research.md、data-model.md、contracts/

**测试**: 默认不创建测试任务；通过 quickstart 人工验收和 `npm run check` 验证。

## Phase 1: 准备与结构确认

**目的**: 确认功能落点、目录和现有依赖

- [x] T001 对照 plan.md 确认本功能涉及的 `app/`、`components/`、`lib/`、`supabase/`、`scripts/` 文件路径
- [x] T002 [P] 确认 Supabase Auth、public 身份表和当前身份 cookie 的数据来源
- [x] T003 [P] 确认静态检查命令为 `npm run check` 并使用 quickstart 做人工验收

---

## Phase 2: 基础实现（阻塞 P1）

**目的**: 完成登录和身份读取共享基础

- [x] T004 在 `supabase/migrations/202607030001_stage1_identity.sql` 建立用户、项目、项目身份表、RLS 和 grant
- [x] T005 [P] 在 `scripts/seed-stage1.mjs` 创建阶段 1 演示账号和身份数据脚本
- [x] T006 [P] 在 `lib/identity/types.ts` 定义身份、角色、菜单和页面类型
- [x] T007 在 `lib/identity/queries.ts` 实现当前用户身份读取和当前身份解析
- [x] T008 在 `app/actions.ts` 实现登录、选择身份和退出登录 Server Actions

**检查点**: P1 用户故事可以开始实现

---

## Phase 3: 用户故事 1 - 登录并进入当前身份（优先级: P1）

**目标**: 用户可登录，单身份直接进入，多身份必须选择身份

**独立验收**: 使用单身份和多身份测试账号分别完成登录路径

### 实现任务

- [x] T009 [P] [US1] 在 `components/auth/login-form.tsx` 实现登录表单和错误提示
- [x] T010 [P] [US1] 在 `components/auth/identity-selection.tsx` 实现身份选择界面
- [x] T011 [US1] 在 `app/page.tsx` 接入未登录、无身份、单身份、多身份分支
- [x] T012 [US1] 在 `app/layout.tsx` 更新中文 metadata 和页面语言

**检查点**: P1 可独立演示，达到 MVP 最小闭环

---

## Phase 4: 用户故事 2 - 按角色查看导航（优先级: P2）

**目标**: 当前角色看到正确菜单和身份信息

**独立验收**: 使用质检员、施工方、管理员账号对比菜单

### 实现任务

- [x] T013 [P] [US2] 在 `components/app-shell/app-shell.tsx` 实现桌面侧边导航、当前身份和退出入口
- [x] T014 [P] [US2] 在 `components/app-shell/page-content.tsx` 实现阶段 1 页面占位内容
- [x] T015 [US2] 在 `lib/identity/navigation.ts` 实现角色到菜单的映射
- [x] T016 [US2] 在 `app/page.tsx` 将当前角色菜单接入页面渲染

**检查点**: P1 和 P2 均可独立演示

---

## Phase 5: 用户故事 3 - 响应式框架与无权限反馈（优先级: P3）

**目标**: 窄屏可用，越权访问有明确反馈

**独立验收**: 调整浏览器宽度并访问无权限 view

### 实现任务

- [x] T017 [P] [US3] 在 `components/app-shell/app-shell.tsx` 增加移动端抽屉导航
- [x] T018 [P] [US3] 在 `components/app-shell/no-permission.tsx` 实现无权限页面
- [x] T019 [US3] 在 `app/page.tsx` 接入 view 参数和无权限分支
- [x] T020 [US3] 在 `app/globals.css` 调整主题色以贴近原型白底浅蓝风格

**检查点**: 目标用户故事均可独立演示

---

## Phase N: 收尾与静态检查

**目的**: 完成演示交付前的必要整理

- [x] T021 [P] 更新 `specs/001-app-auth-shell/quickstart.md` 中的演示步骤
- [x] T022 更新 `progress.md` 中阶段 1 状态、交付、验证结果和遗留问题
- [x] T023 运行 `npm run check`
- [x] T024 标记 `specs/001-app-auth-shell/tasks.md` 已完成任务

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1 准备与结构确认**: 无依赖，可立即开始
- **Phase 2 基础实现**: 依赖 Phase 1，阻塞 P1
- **用户故事阶段**: 按 P1 -> P2 -> P3 顺序推进
- **收尾与静态检查**: 依赖计划内目标用户故事完成

### 用户故事依赖

- **US1 (P1)**: MVP 演示闭环，必须最先完成
- **US2 (P2)**: 依赖 US1 的当前身份
- **US3 (P3)**: 依赖 US2 的应用框架

### 并行机会

- `scripts/seed-stage1.mjs`、`lib/identity/types.ts`、登录 UI 可以并行。
- 页面占位和无权限页可以在导航映射确定后并行。

## 实施策略

### MVP First（只完成 P1）

1. 完成 Supabase 身份表和 seed 脚本。
2. 完成登录 Server Action 和身份查询。
3. 完成登录页、身份选择页和根页面分支。
4. 走通单身份与多身份登录。

### 增量交付

1. P1 可演示后接入角色导航。
2. 导航完成后接入移动抽屉和无权限页面。
3. 运行静态检查并更新进度。
