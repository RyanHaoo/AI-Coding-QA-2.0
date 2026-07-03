"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, ImageIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function TicketImageEditor({
  imageUrls,
  ticketNumber,
}: {
  imageUrls: string[];
  ticketNumber: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [selectedFileCount, setSelectedFileCount] = useState(0);
  const visibleImageUrls = imageUrls.filter(
    (url) => !removedUrls.includes(url),
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
        <ImageIcon className="size-4 text-[#005ac2]" />
        现场取证照片 ({visibleImageUrls.length + selectedFileCount})
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleImageUrls.map((url) => (
          <div
            className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100"
            key={url}
          >
            <Image
              alt={`${ticketNumber} 现场图片`}
              className="size-full object-cover"
              fill
              sizes="(max-width: 640px) 45vw, 180px"
              src={url}
              unoptimized={url.startsWith("http")}
            />
            <input name="existingImageUrls" type="hidden" value={url} />
            <button
              aria-label="移除此图片"
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-red-700/90 text-white shadow-sm transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              onClick={() => setRemovedUrls((current) => [...current, url])}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        <button
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-3 rounded-md border-2 border-slate-300 border-dashed bg-white text-slate-600 transition-colors hover:border-[#005ac2] hover:bg-blue-50/40 hover:text-[#005ac2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100",
            visibleImageUrls.length === 0 && "col-span-2 sm:col-span-1",
          )}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
            <Camera className="size-6" />
          </span>
          <span className="font-medium text-sm">点击上传照片</span>
          {selectedFileCount > 0 ? (
            <span className="text-slate-500 text-xs">
              已选择 {selectedFileCount} 张
            </span>
          ) : null}
        </button>
      </div>

      <input
        accept="image/gif,image/jpeg,image/png,image/webp"
        className="sr-only"
        multiple
        name="newImages"
        onChange={(event) =>
          setSelectedFileCount(event.currentTarget.files?.length ?? 0)
        }
        ref={fileInputRef}
        type="file"
      />

      <p className="text-slate-500 text-xs">
        支持 JPG、PNG、WebP 或 GIF，单张不超过 5MB。
      </p>
    </div>
  );
}
