"use client";

import { useActionState } from "react";

import { reassignTicketAction } from "@/app/actions";
import {
  FieldLabel,
  fieldClassName,
  initialTicketOperationState,
  OperationMessage,
  SubmitButton,
  textareaClassName,
} from "@/components/tickets/ticket-form-controls";
import type { TicketAssigneeCandidate } from "@/lib/tickets/types";

export function TicketReassignForm({
  candidates,
  ticketId,
}: {
  candidates: TicketAssigneeCandidate[];
  ticketId: string;
}) {
  const [state, action] = useActionState(
    reassignTicketAction,
    initialTicketOperationState,
  );

  if (candidates.length === 0) {
    return (
      <p className="border border-slate-200 bg-slate-50 p-3 text-slate-500 text-sm leading-6">
        当前项目暂无其他施工方可指派。
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticketId} />
      <FieldLabel>
        新责任人
        <select className={fieldClassName} name="assigneeMembershipId" required>
          <option value="">选择施工方</option>
          {candidates.map((candidate) => (
            <option key={candidate.membershipId} value={candidate.membershipId}>
              {candidate.profile.fullName} / {candidate.profile.department}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel>
        指派原因
        <textarea
          className={textareaClassName}
          name="reason"
          placeholder="说明责任人调整原因"
          required
        />
      </FieldLabel>
      <OperationMessage state={state} />
      <SubmitButton label="提交指派" />
    </form>
  );
}
