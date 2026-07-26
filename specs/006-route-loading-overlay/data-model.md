# 数据模型: 路由切换 Loading 遮罩

本功能不新增持久化数据、Supabase 表、API payload 或公共 TypeScript 类型。

## 路由加载状态

- **含义**: Next.js 在目标页面内容尚未完成时维护的瞬态 fallback 状态。
- **进入条件**: 初次访问触发根级 fallback，或用户点击同源且不同于当前 URL 的普通站内链接。
- **视觉状态**:
  - `0-150ms`: 遮罩已占满视口并拦截指针操作，但保持透明。
  - `>=150ms`: 遮罩淡入，展示旋转图标和“页面加载中…”。
  - `complete`: 路由提交导致当前 URL key 变化，Provider 停止渲染遮罩。
- **关系**: `app/loading.tsx` 与根布局 `RouteTransitionProvider` 共用 `RouteLoadingOverlay`，只在 Provider 内暂存发起导航时的 URL key。
- **约束**: reduced-motion 偏好只停止旋转，不改变状态进入、拦截或退出规则。
