import { API, getSessionKey } from "@/shared/lib";

export interface IPdfSection {
  content: string;
  sub_title?: string;
  title: string;
}

export interface IAssistantPdf {
  markdown: string;
  pdf_base64: string;
  sections?: IPdfSection[];
}

export async function pdfPreview(signal: AbortSignal): Promise<IAssistantPdf> {
  const sessionKey = await getSessionKey();
  const response = await API.post<IAssistantPdf>(
    `/pdf-preview/${sessionKey}`,
    null,
    { signal },
  );
  return response.data;
}
