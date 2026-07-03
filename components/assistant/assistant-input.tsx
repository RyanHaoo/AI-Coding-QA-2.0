"use client";

import type { FileUIPart } from "ai";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function AssistantInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (input: { files: FileUIPart[]; text: string }) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed && files.length === 0) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      let uploadedFiles: FileUIPart[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        for (const file of files) {
          formData.append("images", file);
        }

        const response = await fetch("/api/assistant-images", {
          body: formData,
          method: "POST",
        });
        const payload = (await response.json()) as {
          files?: FileUIPart[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.message ?? "现场图片上传失败。");
        }

        uploadedFiles = payload.files ?? [];
      }

      await onSend({ files: uploadedFiles, text: trimmed });
      setFiles([]);
      setText("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (currentError) {
      setError(
        currentError instanceof Error ? currentError.message : "消息发送失败。",
      );
    } finally {
      setIsUploading(false);
    }
  }

  const busy = disabled || isUploading;

  return (
    <form className="grid min-w-0 gap-3" onSubmit={handleSubmit}>
      {files.length > 0 ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 text-xs"
              key={`${file.name}-${index}`}
            >
              <span className="max-w-40 truncate">{file.name}</span>
              <button
                aria-label="移除图片"
                onClick={() =>
                  setFiles((current) =>
                    current.filter((_, fileIndex) => fileIndex !== index),
                  )
                }
                type="button"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex min-w-0 items-end gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <Button
          aria-label="上传现场图片"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ImagePlus className="size-4" />
        </Button>
        <textarea
          className="max-h-36 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-slate-950 text-sm outline-none placeholder:text-slate-400"
          disabled={busy}
          onChange={(event) => setText(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="描述问题、查询工单或确认创建..."
          value={text}
        />
        <Button
          disabled={busy || (!text.trim() && files.length === 0)}
          size="icon"
          type="submit"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      <input
        accept="image/gif,image/jpeg,image/png,image/webp"
        className="sr-only"
        multiple
        onChange={(event) =>
          setFiles(Array.from(event.currentTarget.files ?? []))
        }
        ref={inputRef}
        type="file"
      />
    </form>
  );
}
