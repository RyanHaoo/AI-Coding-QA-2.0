# Data Model: 应用框架与身份入口

## Entity: app_users

用户资料，和 Supabase Auth 用户一一对应。

| 字段 | 类型 | 规则 |
|------|------|------|
| id | uuid | 主键，引用 auth.users.id |
| email | text | 必填，唯一，用于和演示账号对齐 |
| employee_number | text | 必填，唯一，组织内识别字段 |
| full_name | text | 必填，页面展示姓名 |
| department | text | 必填，页面展示部门 |
| avatar_url | text | 选填；为空时使用姓名首字 |
| created_at | timestamptz | 自动生成 |

## Entity: projects

项目是权限和后续工单归属边界。

| 字段 | 类型 | 规则 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 必填 |
| city | text | 必填 |
| client_name | text | 必填 |
| project_type | text | 必填，只允许 commercial、industrial、residential、government |
| created_at | timestamptz | 自动生成 |

## Entity: project_memberships

项目身份表示“用户 + 项目 + 角色”。

| 字段 | 类型 | 规则 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 必填，引用 app_users.id |
| project_id | uuid | 必填，引用 projects.id |
| role | text | 必填，只允许 inspector、builder、admin |
| created_at | timestamptz | 自动生成 |

## Relationships

- 一个用户可以拥有多个项目身份。
- 一个项目可以拥有多个用户身份。
- 用户在同一项目同一角色只能有一条身份记录。
- 当前会话身份引用某一条 project_memberships 记录，不单独建表。

## Validation Rules

- `app_users.email`、`app_users.employee_number` 必须唯一。
- `project_memberships.role` 只能是质检员、施工方、管理员三类业务角色。
- Data API 暴露的 public 表必须启用 RLS，并显式授予 authenticated 只读权限。
- 阶段 1 普通登录用户只能读取自己的用户资料、自己的项目身份，以及这些身份对应的项目。
