import { Clock3 } from "lucide-react";

import {
  formatTicketActivityType,
  formatTicketDateTime,
} from "@/lib/tickets/formatters";
import type { TicketActivity } from "@/lib/tickets/types";

type TicketActivityListProps = {
  activities: TicketActivity[];
};

export function TicketActivityList({ activities }: TicketActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="border border-slate-200 bg-white p-5 text-slate-500 text-sm">
        暂无处理记录。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {activities.map((activity) => (
        <article
          className="border border-slate-200 bg-white p-4"
          key={activity.id}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-950 text-sm">
              {formatTicketActivityType(activity.activityType)}
            </span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-600 text-sm">
              {activity.actor.profile.fullName}
            </span>
          </div>
          <p className="mt-2 text-slate-700 text-sm leading-6">
            {activity.content}
          </p>
          {activity.reason ? (
            <p className="mt-2 text-slate-500 text-sm leading-6">
              原因：{activity.reason}
            </p>
          ) : null}
          <p className="mt-3 inline-flex items-center gap-1 text-slate-400 text-xs">
            <Clock3 className="size-3.5" />
            {formatTicketDateTime(activity.createdAt)}
          </p>
        </article>
      ))}
    </div>
  );
}
