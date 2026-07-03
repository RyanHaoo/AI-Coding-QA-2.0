"use client";

import type * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TicketOperationState } from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

export const initialTicketOperationState: TicketOperationState = {
  message: "",
  ok: false,
};

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? "提交中" : label}
    </Button>
  );
}

export function OperationMessage({ state }: { state: TicketOperationState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "border px-3 py-2 text-sm leading-6",
        state.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {state.message}
    </p>
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="grid gap-1.5 text-slate-700 text-sm" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export const fieldClassName =
  "min-h-9 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#005ac2] focus:ring-2 focus:ring-blue-100";

export const textareaClassName = `${fieldClassName} min-h-24 resize-y leading-6`;
