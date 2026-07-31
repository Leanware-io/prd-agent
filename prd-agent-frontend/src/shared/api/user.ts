import { API, getSessionKey } from "@/shared/lib";

export interface LoginResponse {
  can_download: boolean;
}

export interface DownloadPdfParams {
  base_64_pdf: string;
  quote: boolean;
}

export interface ScheduleCallParams {
  base_64_pdf: string;
  email: string;
  message: string;
  name: string;
}

export interface ScheduleCallResponse {
  sent: boolean;
}

export interface DownloadPdfResponse {
  presigned_url: string;
}

export async function loginUser(): Promise<LoginResponse> {
  const response = await API.post<LoginResponse>("/login");
  return response.data;
}

export async function downloadPdf(
  data: DownloadPdfParams,
): Promise<DownloadPdfResponse> {
  const sessionKey = await getSessionKey();
  const response = await API.post<DownloadPdfResponse>(
    `/download/quote/${sessionKey}`,
    data,
  );
  return response.data;
}

export async function scheduleCall(
  data: ScheduleCallParams,
): Promise<ScheduleCallResponse> {
  const sessionKey = await getSessionKey();
  const response = await API.post<ScheduleCallResponse>(
    `/schedule-call/${sessionKey}`,
    data,
  );
  return response.data;
}
