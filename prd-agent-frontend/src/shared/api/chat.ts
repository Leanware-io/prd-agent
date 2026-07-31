import { API, getSessionKey } from "@/shared/lib";
import { DropzoneContextFile } from "@/app/providers";

export interface IAssistantMessage {
  document_completed: boolean;
  message: string;
}

export async function sendMessage(data: {
  files?: DropzoneContextFile[];
  message?: string;
}): Promise<IAssistantMessage> {
  const formData = new FormData();
  if (data.message) {
    formData.append("message", data.message);
  }
  if (data.files) {
    data.files
      .map((file) => file.content)
      .forEach((file: File) => formData.append("files", file));
  }
  const sessionKey = await getSessionKey();
  const response = await API.post<IAssistantMessage>(
    `/chat/${sessionKey}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}
