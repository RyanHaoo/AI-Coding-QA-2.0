import {
  filesFromFormData,
  uploadAssistantImages,
} from "@/lib/assistant/uploads";
import { resolveAssistantIdentity } from "@/lib/assistant/runtime";

export async function POST(request: Request) {
  const identity = await resolveAssistantIdentity();

  if (!identity.currentIdentity) {
    return Response.json(
      { message: identity.error },
      { status: identity.status },
    );
  }

  const formData = await request.formData();
  const files = filesFromFormData(formData);

  if (files.length === 0) {
    return Response.json({ message: "请选择现场图片。" }, { status: 400 });
  }

  const result = await uploadAssistantImages(files);

  if (result.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }

  return Response.json({ files: result.files });
}
