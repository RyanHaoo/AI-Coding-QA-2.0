import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const bucketName = "ticket-images";
const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadTicketImages(ticketId: string, files: File[]) {
  if (files.length === 0) {
    return { error: null, urls: [] };
  }

  const supabase = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    if (file.size === 0) {
      continue;
    }

    if (!allowedImageTypes.has(file.type)) {
      return { error: "现场图片仅支持 JPG、PNG、WebP 或 GIF。", urls: [] };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: "单张现场图片不能超过 5MB。", urls: [] };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectPath = `${ticketId}/${randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(objectPath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { error: `现场图片上传失败：${error.message}`, urls: [] };
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
    urls.push(data.publicUrl);
  }

  return { error: null, urls };
}
