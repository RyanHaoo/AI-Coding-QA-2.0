import {
  BotMessageSquare,
  ClipboardList,
  LayoutDashboard,
  SearchCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AppView, ProjectMembership } from "@/lib/identity/types";

type PageContentProps = {
  currentIdentity: ProjectMembership;
  view: AppView;
};

const contentByView = {
  "admin-tickets": {
    description: "当前项目全部工单将在阶段 5 接入。",
    icon: SearchCheck,
    label: "管理员工单中心",
    title: "工单中心",
  },
  assistant: {
    description: "对话、查单和建单入口将在阶段 4 接入。",
    icon: BotMessageSquare,
    label: "默认入口",
    title: "智能助手",
  },
  dashboard: {
    description: "项目态势指标和紧急工单概览将在阶段 5 接入。",
    icon: LayoutDashboard,
    label: "管理员视图",
    title: "数据大盘",
  },
  tickets: {
    description: "当前身份相关工单列表将在阶段 2 接入。",
    icon: ClipboardList,
    label: "工单视图",
    title: "工单列表",
  },
} as const;

export function PageContent({ currentIdentity, view }: PageContentProps) {
  const content = contentByView[view];
  const Icon = content.icon;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-3 border-slate-200 border-b pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {content.label}
          </Badge>
          <span className="text-slate-400 text-xs">
            {currentIdentity.project.name}
          </span>
        </div>
        <h1 className="font-semibold text-2xl text-slate-950">
          {content.title}
        </h1>
      </header>

      <section className="grid min-h-[360px] place-items-center border border-slate-100 bg-white p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center bg-[#eff6ff] text-[#005ac2]">
            <Icon className="size-6" />
          </div>
          <h2 className="font-medium text-lg text-slate-900">
            {content.title}
          </h2>
          <p className="mt-2 text-slate-500 text-sm leading-6">
            {content.description}
          </p>
        </div>
      </section>
    </div>
  );
}
