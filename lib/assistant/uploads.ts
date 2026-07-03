import { randomUUID } from "node:crypto";

import type { AssistantUploadedFile } from "@/lib/assistant/types";
import { uploadTicketImages } from "@/lib/tickets/image-storage";

const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function filesFromFormData(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function collectUploadedImageUrls(messages: unknown) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.flatMap((message) => {
    if (
      !message ||
      typeof message !== "object" ||
      !("parts" in message) ||
      !Array.isArray(message.parts)
    ) {
      return [];
    }

    return message.parts.flatMap((part: unknown) => {
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        part.type === "file" &&
        "url" in part &&
        typeof part.url === "string" &&
        "mediaType" in part &&
        typeof part.mediaType === "string" &&
        allowedImageTypes.has(part.mediaType)
      ) {
        return [part.url];
      }

      return [];
    });
  });
}

export async function uploadAssistantImages(files: File[]) {
  const uploadId = `assistant-${randomUUID()}`;
  const result = await uploadTicketImages(uploadId, files);

  if (result.error) {
    return { error: result.error, files: [] };
  }

  return {
    error: null,
    files: result.urls.map(
      (url, index): AssistantUploadedFile => ({
        filename: files[index]?.name ?? `site-photo-${index + 1}`,
        mediaType: files[index]?.type ?? "image/jpeg",
        type: "file",
        url,
      }),
    ),
  };
}
