"use client";

import Image from "next/image";
import { CheckCircle2, ImageIcon, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { TicketDraft } from "@/lib/assistant/types";
import {
  formatTicketSeverity,
  formatTicketSpecialty,
} from "@/lib/tickets/formatters";

type BuilderCandidate = {
  department: string;
  fullName: string;
  membershipId: string;
};

export function TicketDraftCard({
  builders,
  draft,
  onConfirm,
}: {
  builders: BuilderCandidate[];
  draft: TicketDraft;
  onConfirm: (draft: TicketDraft) => void;
}) {
  const [summary, setSummary] = useState(draft.summary);
  const [locationDetail, setLocationDetail] = useState(draft.locationDetail);
  const [description, setDescription] = useState(draft.description);
  const [severity, setSeverity] = useState(draft.severity);
  const [specialty, setSpecialty] = useState(draft.specialty);
  const [assigneeMembershipId, setAssigneeMembershipId] = useState(
    draft.assigneeMembershipId ?? builders[0]?.membershipId ?? "",
  );
  const [imageUrls, setImageUrls] = useState(draft.imageUrls);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!summary.trim()) {
      missing.push("问题描述");
    }
    if (!locationDetail.trim()) {
      missing.push("详细位置");
    }
    if (!assigneeMembershipId) {
      missing.push("责任人");
    }
    return missing;
  }, [assigneeMembershipId, locationDetail, summary]);

  const nextDraft: TicketDraft = {
    assigneeMembershipId,
    description,
    imageUrls,
    locationDetail,
    missingFields,
    severity,
    specialty,
    summary,
  };

  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">待确认工单草稿</h3>
          <p className="mt-1 text-slate-500 text-xs">
            确认前可调整字段和保留图片。
          </p>
        </div>
        <CheckCircle2 className="size-5 text-[#005ac2]" />
      </div>

      {missingFields.length > 0 ? (
        <div className="rounded-md bg-amber-50 px-3 py-2 text-amber-800 text-sm">
          还缺少：{missingFields.join("、")}
        </div>
      ) : null}

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">问题描述</span>
        <input
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
          onChange={(event) => setSummary(event.currentTarget.value)}
          value={summary}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">详细位置</span>
        <input
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
          onChange={(event) => setLocationDetail(event.currentTarget.value)}
          value={locationDetail}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">严重程度</span>
          <select
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
            onChange={(event) =>
              setSeverity(event.currentTarget.value as TicketDraft["severity"])
            }
            value={severity}
          >
            {(["minor", "normal", "serious", "urgent"] as const).map(
              (value) => (
                <option key={value} value={value}>
                  {formatTicketSeverity(value)}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">专业类型</span>
          <select
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
            onChange={(event) =>
              setSpecialty(
                event.currentTarget.value as TicketDraft["specialty"],
              )
            }
            value={specialty}
          >
            {(["architecture", "structure", "plumbing"] as const).map(
              (value) => (
                <option key={value} value={value}>
                  {formatTicketSpecialty(value)}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">责任人</span>
          <select
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
            onChange={(event) =>
              setAssigneeMembershipId(event.currentTarget.value)
            }
            value={assigneeMembershipId}
          >
            <option value="">请选择</option>
            {builders.map((builder) => (
              <option key={builder.membershipId} value={builder.membershipId}>
                {builder.fullName}
                {builder.department ? ` / ${builder.department}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700">问题详情</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[#005ac2]"
          onChange={(event) => setDescription(event.currentTarget.value)}
          value={description}
        />
      </label>

      <div className="grid gap-2">
        <div className="flex items-center gap-2 font-medium text-slate-700 text-sm">
          <ImageIcon className="size-4 text-[#005ac2]" />
          现场图片 ({imageUrls.length})
        </div>
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imageUrls.map((url) => (
              <div
                className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                key={url}
              >
                <Image
                  alt="建单现场图片"
                  className="object-cover"
                  fill
                  sizes="120px"
                  src={url}
                  unoptimized={url.startsWith("http")}
                />
                <button
                  aria-label="移除图片"
                  className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-slate-950/70 text-white"
                  onClick={() =>
                    setImageUrls((current) =>
                      current.filter((item) => item !== url),
                    )
                  }
                  type="button"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-500 text-sm">
            未附加现场图片。
          </div>
        )}
      </div>

      <Button
        className="w-full"
        disabled={missingFields.length > 0}
        onClick={() => onConfirm(nextDraft)}
        type="button"
      >
        确认创建工单
      </Button>
    </div>
  );
}
