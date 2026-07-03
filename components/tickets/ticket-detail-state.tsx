import Link from "next/link";
import { CircleAlert, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildTicketHref } from "@/lib/tickets/query-params";

export type TicketDetailStateKind = "forbidden" | "not-found";

type TicketDetailStateProps = {
  baseView: "tickets" | "admin-tickets";
  kind: TicketDetailStateKind;
};

const copyByKind = {
  forbidden: {
    description: "当前身份无法查看该工单，请返回当前权限范围内的列表。",
    icon: CircleAlert,
    title: "无权限查看工单",
  },
  "not-found": {
    description: "未找到对应工单，可能已删除或链接无效。",
    icon: SearchX,
    title: "工单不存在",
  },
} as const;

export function TicketDetailState({ baseView, kind }: TicketDetailStateProps) {
  const copy = copyByKind[kind];
  const Icon = copy.icon;

  return (
    <div className="grid min-h-72 place-items-center border border-slate-200 bg-white p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center bg-[#eff6ff] text-[#005ac2]">
          <Icon className="size-5" />
        </div>
        <h3 className="font-medium text-slate-950">{copy.title}</h3>
        <p className="mt-2 text-slate-500 text-sm leading-6">
          {copy.description}
        </p>
        <Button asChild className="mt-5">
          <Link href={buildTicketHref(baseView)}>返回列表</Link>
        </Button>
      </div>
    </div>
  );
}
