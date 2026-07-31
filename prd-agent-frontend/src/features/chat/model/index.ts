import { DropzoneContextFile } from "@/app/providers";

export type TMessageRole = "user" | "assistant";

export type TMessageType = "text" | "voice";

export interface IMessage {
  audio?: string;
  content: string;
  files?: DropzoneContextFile[];
  key: string;
  role: "user" | "assistant";
  timestamp: string;
  type: TMessageType;
}
