import type { AppView, NavigationItem, Role } from "@/lib/identity/types";

export const roleLabels: Record<Role, string> = {
  admin: "管理员",
  builder: "施工方",
  inspector: "质检员",
};

export const projectTypeLabels = {
  commercial: "商业地产",
  government: "政府项目",
  industrial: "工业园区",
  residential: "住宅",
} as const;

const allNavigationItems: Record<AppView, NavigationItem> = {
  "admin-tickets": {
    description: "查看和筛选当前项目全部工单",
    href: "/?view=admin-tickets",
    label: "管理员工单中心",
    view: "admin-tickets",
  },
  assistant: {
    description: "询问知识、查单或发起建单",
    href: "/?view=assistant",
    label: "智能助手",
    view: "assistant",
  },
  dashboard: {
    description: "查看当前项目质检态势",
    href: "/?view=dashboard",
    label: "数据大盘",
    view: "dashboard",
  },
  tickets: {
    description: "查看当前身份相关工单",
    href: "/?view=tickets",
    label: "工单列表",
    view: "tickets",
  },
};

const roleViews: Record<Role, AppView[]> = {
  admin: ["assistant", "dashboard", "admin-tickets"],
  builder: ["assistant", "tickets"],
  inspector: ["assistant", "tickets"],
};

export function getNavigationForRole(role: Role) {
  return roleViews[role].map((view) => allNavigationItems[view]);
}

export function isViewAllowed(role: Role, view: AppView) {
  return roleViews[role].includes(view);
}

export function normalizeView(value: string | string[] | undefined): AppView {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (
    rawValue === "assistant" ||
    rawValue === "tickets" ||
    rawValue === "dashboard" ||
    rawValue === "admin-tickets"
  ) {
    return rawValue;
  }

  return "assistant";
}
