"use client";

import { useActionState } from "react";

import { editTicketAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  FieldLabel,
  fieldClassName,
  initialTicketOperationState,
  OperationMessage,
  SubmitButton,
  textareaClassName,
} from "@/components/tickets/ticket-form-controls";
import { TicketImageEditor } from "@/components/tickets/ticket-image-editor";
import {
  ticketSeverityLabels,
  ticketSpecialtyLabels,
  type TicketDetailData,
  type TicketSeverity,
  type TicketSpecialty,
} from "@/lib/tickets/types";

const severities: TicketSeverity[] = ["minor", "normal", "serious", "urgent"];
const specialties: TicketSpecialty[] = [
  "architecture",
  "structure",
  "plumbing",
];

export function TicketEditForm({
  onCancel,
  ticket,
}: {
  onCancel: () => void;
  ticket: TicketDetailData;
}) {
  const [state, action] = useActionState(
    editTicketAction,
    initialTicketOperationState,
  );

  return (
    <form action={action} className="grid gap-4">
      <input name="ticketId" type="hidden" value={ticket.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel>
          严重程度
          <select
            className={fieldClassName}
            defaultValue={ticket.severity}
            name="severity"
            required
          >
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {ticketSeverityLabels[severity]}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel>
          专业类型
          <select
            className={fieldClassName}
            defaultValue={ticket.specialty}
            name="specialty"
            required
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {ticketSpecialtyLabels[specialty]}
              </option>
            ))}
          </select>
        </FieldLabel>
      </div>
      <FieldLabel>
        问题描述
        <input
          className={fieldClassName}
          defaultValue={ticket.summary}
          name="summary"
          required
        />
      </FieldLabel>
      <FieldLabel>
        详细位置
        <input
          className={fieldClassName}
          defaultValue={ticket.locationDetail}
          name="locationDetail"
          required
        />
      </FieldLabel>
      <FieldLabel>
        问题详情
        <textarea
          className={textareaClassName}
          defaultValue={ticket.description ?? ""}
          name="description"
        />
      </FieldLabel>
      <TicketImageEditor
        imageUrls={ticket.imageUrls}
        ticketNumber={ticket.ticketNumber}
      />
      <OperationMessage state={state} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton label="保存编辑" />
        <Button onClick={onCancel} type="button" variant="outline">
          取消
        </Button>
      </div>
    </form>
  );
}
