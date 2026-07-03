"use client";

import { useActionState } from "react";

import { resolveTicketAction } from "@/app/actions";
import {
  FieldLabel,
  fieldClassName,
  initialTicketOperationState,
  OperationMessage,
  SubmitButton,
  textareaClassName,
} from "@/components/tickets/ticket-form-controls";

export function TicketResolveForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(
    resolveTicketAction,
    initialTicketOperationState,
  );

  return (
    <form action={action} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticketId} />
      <FieldLabel>
        问题归因
        <textarea
          className={textareaClassName}
          name="rootCause"
          placeholder="填写导致问题发生的主要原因"
          required
        />
      </FieldLabel>
      <FieldLabel>
        预防建议
        <textarea
          className={fieldClassName}
          name="preventiveAction"
          placeholder="可选，填写后续预防或整改建议"
        />
      </FieldLabel>
      <OperationMessage state={state} />
      <SubmitButton label="提交解决" />
    </form>
  );
}
