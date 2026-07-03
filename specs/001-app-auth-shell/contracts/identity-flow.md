# Contract: 身份入口流程

## Login Form

**Input**

- `email`: 演示账号邮箱，必填
- `password`: 演示密码，必填

**Success**

- 登录成功后刷新当前页面。
- 若账号只有一个项目身份，页面直接显示应用框架。
- 若账号有多个项目身份，页面显示身份选择界面。

**Failure**

- 字段缺失：返回“请输入账号和密码”。
- 凭据错误：返回“账号或密码不正确”。

## Identity Selection

**Input**

- `membershipId`: 当前登录用户拥有的一条项目身份 ID

**Success**

- 写入当前身份 cookie。
- 跳转到默认智能助手页面。

**Failure**

- 身份不存在或不属于当前用户：返回身份选择界面，并提示重新选择。

## Role Navigation

| 角色 | 菜单 |
|------|------|
| inspector | 智能助手、工单列表 |
| builder | 智能助手、工单列表 |
| admin | 智能助手、数据大盘、管理员工单中心 |

## Unauthorized View

当 `view` 不在当前角色菜单内时，页面必须展示：

- 无权限标题
- 当前身份摘要
- 返回智能助手入口
