"use client";

import { useActionState } from "react";

import { rejectTicketAction } from "@/app/actions";
import {
  FieldLabel,
  initialTicketOperationState,
  OperationMessage,
  SubmitButton,
  textareaClassName,
} from "@/components/tickets/ticket-form-controls";

export function TicketRejectForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(
    rejectTicketAction,
    initialTicketOperationState,
  );

  return (
    <form action={action} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticketId} />
      <FieldLabel>
        拒绝原因
        <textarea
          className={textareaClassName}
          name="reason"
          placeholder="填写拒绝处理该工单的业务原因"
          required
        />
      </FieldLabel>
      <OperationMessage state={state} />
      <SubmitButton label="提交拒绝" />
    </form>
  );
}
