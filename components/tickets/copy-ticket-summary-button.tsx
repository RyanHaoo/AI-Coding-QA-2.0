"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyStatus = "idle" | "copying" | "copied" | "error";

export function CopyTicketSummaryButton({
  summary,
  ticketId,
}: {
  summary: string;
  ticketId: string;
}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [copyText, setCopyText] = useState("");

  async function copySummary() {
    const params = new URLSearchParams({ ticketId });
    const detailUrl = new URL(`/?${params.toString()}`, window.location.origin);
    const text = `${summary}\n详情：${detailUrl.href}`;
    setCopyText(text);
    setStatus("copying");

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid w-full gap-2 sm:max-w-xs">
      <Button
        aria-label="复制工单摘要"
        className="justify-self-start"
        disabled={status === "copying"}
        onClick={copySummary}
        type="button"
        variant="outline"
      >
        {status === "copied" ? <Check /> : <Copy />}
        {status === "copying"
          ? "复制中…"
          : status === "copied"
            ? "已复制"
            : "复制摘要"}
      </Button>
      <output
        aria-live="polite"
        className={
          status === "error" ? "text-red-700 text-xs" : "text-slate-500 text-xs"
        }
      >
        {status === "copied"
          ? "摘要已复制，可粘贴到项目群。"
          : status === "error"
            ? "自动复制失败，请选中下方摘要手动复制。"
            : ""}
      </output>
      {status === "error" ? (
        <textarea
          aria-label="工单摘要（手动复制）"
          className="w-full rounded border border-slate-200 bg-slate-50 p-3 text-slate-700 text-sm"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          rows={9}
          value={copyText}
        />
      ) : null}
    </div>
  );
}
