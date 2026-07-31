import isBase64 from "is-base64";
import mime from "mime-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  downloadPdf,
  IPdfSection,
  loginUser,
  pdfPreview,
  scheduleCall,
  sendMessage,
} from "@/shared/api";
import { downloadPdfFile, openPdfFile } from "@/shared/utils";
import {
  Files,
  IMessage,
  Input,
  Message,
  QuoteArtifact,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  TypingIndicator,
} from "@/features/chat";
import { gtagConversionId } from "@/shared/config";
import { IAssistantMessage } from "@/shared/api/chat";
import { useDropzone, useGtag, useToast, useUser } from "@/app/providers";
import { UserRound } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface IChatInterface {
  initialMessage: string;
}

const assistantMessage: IMessage = {
  content: "What do you want to build?",
  key: uuidv4(),
  role: "assistant",
  timestamp: new Date().toISOString(),
  type: "text",
};

function ChatInterfaceComponent(props: Readonly<IChatInterface>) {
  const { initialMessage } = props;
  const { user } = useUser();
  const gtag = useGtag();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [messages, setMessages] = useState<IMessage[]>([assistantMessage]);
  const { files, open, onRemoveFile, clearFiles } = useDropzone();
  const [isSending, setIsSending] = useState(false);
  const abortController = useRef<AbortController>(new AbortController());
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [pdfSections, setPdfSections] = useState<IPdfSection[]>([]);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  const scrollToBottom = useCallback(
    () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const onAddMessage = useCallback((message: IMessage) => {
    setMessages((_messages) => {
      const newMessages = [..._messages];
      newMessages.push(message);
      return newMessages;
    });
  }, []);

  const getPdfPreview = useCallback(async () => {
    try {
      abortController.current.abort();
      abortController.current = new AbortController();
      const pdf = await pdfPreview(abortController.current.signal);
      if (pdf.pdf_base64 && isBase64(pdf.pdf_base64) && pdf.markdown) {
        setPdfContent(pdf.markdown);
        setPdfBase64(pdf.pdf_base64);
        if (pdf.sections) {
          setPdfSections(pdf.sections);
        }
      }
    } catch (error) {
      console.error("Error getting PDF preview", error);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (params: { audio?: Blob; content?: string }) => {
      const { audio, content } = params;
      if (content?.trim() === "" && !audio) {
        return;
      }
      try {
        setIsSending(true);
        const newUserMessage: IMessage = {
          audio: audio ? URL.createObjectURL(audio) : undefined,
          content: content ?? "",
          files: content ? files : [],
          key: uuidv4(),
          role: "user",
          timestamp: new Date().toISOString(),
          type: audio ? "voice" : "text",
        };
        onAddMessage(newUserMessage);
        clearFiles();
        let newAssistantMessage: IAssistantMessage;
        if (audio) {
          let extension = mime.extension(audio.type) || "mp4";
          extension = extension === "weba" ? "webm" : extension;
          const buffer = await audio.arrayBuffer();
          const filename = `recording.${extension}`;
          const file = new File([buffer], filename, { type: audio.type });
          newAssistantMessage = await sendMessage({
            files: [
              {
                content: file,
                key: uuidv4(),
              },
            ],
          });
        } else {
          newAssistantMessage = await sendMessage({
            files,
            message: content ?? "",
          });
        }
        onAddMessage({
          content: newAssistantMessage.message,
          key: uuidv4(),
          role: "assistant",
          timestamp: new Date().toISOString(),
          type: "text",
        });
        getPdfPreview();
      } catch (error) {
        console.error("Error sending message", error);
      } finally {
        setIsSending(false);
      }
    },
    [clearFiles, files, getPdfPreview, onAddMessage],
  );

  useEffect(() => {
    if (rendered.current) {
      return;
    }
    rendered.current = true;
    handleSendMessage({ content: initialMessage });
  }, [handleSendMessage, initialMessage]);

  const onDownloadPdf = useCallback(async () => {
    if (!pdfBase64) {
      return;
    }
    try {
      toast({
        description: "Your quote is being generated",
        title: "Preparing PDF...",
      });
      const response = await loginUser();
      if (!response.can_download) {
        toast({
          description:
            "You have already downloaded this PDF or another one. Only one download is allowed.",
          title: "Access Denied",
        });
        return;
      }
      const { presigned_url } = await downloadPdf({
        base_64_pdf: pdfBase64,
        quote: false,
      });
      await downloadPdfFile(presigned_url);
      openPdfFile(presigned_url);
      gtag?.gtag("event", "conversion", { send_to: gtagConversionId });
      toast({
        description: "Your quote has been downloaded successfully",
        title: "Download Complete",
      });
    } catch (error) {
      console.error("Error downloading PDF", error);
    }
  }, [gtag, pdfBase64, toast]);

  const onScheduleCall = useCallback(
    async (name: string, email: string, message: string) => {
      if (!pdfBase64) {
        return;
      }
      try {
        await scheduleCall({
          base_64_pdf: pdfBase64,
          email,
          message,
          name,
        });
        toast({
          description:
            "Your request has been sent. Our team will review and reach out to schedule the call.",
          title: "Request Received",
        });
      } catch (error) {
        console.error("Error scheduling call", error);
        toast({
          description: "Error scheduling call. Please try again.",
          title: "Error",
        });
      }
    },
    [pdfBase64, toast],
  );

  return (
    <div className="h-screen relative z-10">
      <div className="h-full w-full bg-[#001115]">
        <ResizablePanelGroup
          className="h-full w-full border border-white/10 rounded-container shadow-lg"
          direction="horizontal"
        >
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-raleway font-semibold text-white">
                  Leanware Project Assistant
                </h2>
                <div className="flex items-center gap-2 text-white/80">
                  <UserRound className="text-primary" size={18} />
                  <span className="font-nunito text-sm shadow-text">
                    {user?.displayName}
                  </span>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {messages.map((message) => (
                    <div className="mb-4" key={message.key}>
                      <Message message={message} />
                      {message.files && message.files.length > 0 && (
                        <div className="flex mt-2 justify-end">
                          <Files
                            className="max-w-[80%] flex flex-col gap-2 items-end"
                            clickable
                            files={message.files}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {isSending && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-white/10">
                <Input
                  disabled={isSending}
                  files={files}
                  onOpenFileInput={open}
                  onRemoveFile={onRemoveFile}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </ResizablePanel>
          {!!pdfContent && (
            <>
              <ResizableHandle className="bg-white/20" withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <QuoteArtifact
                  handleDownload={onDownloadPdf}
                  onScheduleCall={onScheduleCall}
                  pdfContent={pdfContent}
                  pdfSections={pdfSections}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export const ChatInterface = React.memo(ChatInterfaceComponent);
