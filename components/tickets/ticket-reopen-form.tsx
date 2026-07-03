"use client";

import { useActionState } from "react";

import { reopenTicketAction } from "@/app/actions";
import {
  FieldLabel,
  initialTicketOperationState,
  OperationMessage,
  SubmitButton,
  textareaClassName,
} from "@/components/tickets/ticket-form-controls";

export function TicketReopenForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(
    reopenTicketAction,
    initialTicketOperationState,
  );

  return (
    <form action={action} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticketId} />
      <FieldLabel>
        重新打开原因
        <textarea
          className={textareaClassName}
          name="reason"
          placeholder="说明为何需要重新进入待处理"
          required
        />
      </FieldLabel>
      <OperationMessage state={state} />
      <SubmitButton label="重新打开" />
    </form>
  );
}
