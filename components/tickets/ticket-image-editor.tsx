"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { fieldClassName } from "@/components/tickets/ticket-form-controls";

export function TicketImageEditor({
  imageUrls,
  ticketNumber,
}: {
  imageUrls: string[];
  ticketNumber: string;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <ImageIcon className="size-4" />
        当前现场图片 {imageUrls.length} 张
      </div>
      {imageUrls.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {imageUrls.map((url) => (
            <label
              className="grid gap-2 border border-slate-200 bg-slate-50 p-2 text-sm"
              key={url}
            >
              <Image
                alt={`${ticketNumber} 现场图片`}
                className="aspect-video w-full object-cover"
                height={180}
                src={url}
                unoptimized={url.startsWith("http")}
                width={320}
              />
              <span className="inline-flex items-center gap-2 text-slate-600">
                <input
                  defaultChecked
                  name="existingImageUrls"
                  type="checkbox"
                  value={url}
                />
                保留此图片
              </span>
            </label>
          ))}
        </div>
      ) : null}
      <label className="grid gap-1.5 text-slate-700 text-sm">
        新增现场图片
        <input
          accept="image/gif,image/jpeg,image/png,image/webp"
          className={fieldClassName}
          multiple
          name="newImages"
          type="file"
        />
      </label>
      <p className="text-slate-500 text-xs">
        支持 JPG、PNG、WebP 或 GIF，单张不超过 5MB。
      </p>
    </div>
  );
}
