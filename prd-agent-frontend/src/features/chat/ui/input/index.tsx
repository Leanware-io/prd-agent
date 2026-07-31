import React, { useCallback, useState } from "react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/utils";
import { Files, IMessage, Recorder } from "@/features/chat";
import { Mic, PaperclipIcon, SendIcon } from "lucide-react";

interface ChatInputProps {
  disabled?: boolean;
  files: Required<IMessage>["files"];
  onOpenFileInput: () => void;
  onRemoveFile: (key: string) => void;
  onSendMessage: (params: { audio?: Blob; content?: string }) => void;
}

function ChatInput(props: Readonly<ChatInputProps>) {
  const {
    disabled = false,
    files,
    onOpenFileInput,
    onRemoveFile,
    onSendMessage,
  } = props;
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage({ content: message });
        setMessage("");
      }
    },
    [message, onSendMessage],
  );

  const handleStartRecording = useCallback(() => setIsRecording(true), []);

  const handleStopRecording = useCallback(() => setIsRecording(false), []);

  const onRecordingComplete = useCallback(
    (params: { audio: Blob }) => {
      handleStopRecording();
      onSendMessage(params);
    },
    [onSendMessage, handleStopRecording],
  );

  return (
    <div className={cn("flex flex-col p-4")}>
      {files.length > 0 && !isRecording && (
        <div className="mb-3 flex flex-col gap-2">
          <Files
            className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar"
            files={files}
            onRemoveFile={onRemoveFile}
          />
        </div>
      )}
      {isRecording ? (
        <Recorder
          onCancel={handleStopRecording}
          onRecordingComplete={onRecordingComplete}
        />
      ) : (
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Button
            className={cn(
              "text-white/60 hover:bg-white/10 hover:text-white",
              disabled && "opacity-50",
            )}
            disabled={disabled}
            onClick={onOpenFileInput}
            size="icon"
            type="button"
            variant="ghost"
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>

          <Button
            className={cn(
              "text-white/60 hover:bg-white/10 hover:text-white",
              disabled && "opacity-50",
            )}
            disabled={disabled}
            onClick={handleStartRecording}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Mic className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <input
              className={cn(
                "w-full bg-white/10 backdrop-blur-sm text-white border rounded-full py-2 px-4 focus:outline-none placeholder:text-white/50 transition-all duration-300",
                isFocused
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-white/20",
              )}
              disabled={disabled}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={
                files.length > 0
                  ? "Add a message or send file"
                  : "Type your message here..."
              }
              required
              type="text"
              value={message}
            />
          </div>

          <Button
            className={cn(
              "rounded-full aspect-square p-0 w-10 h-10 flex items-center justify-center",
              (message.trim() || files.length > 0) && !disabled
                ? "bg-primary hover:bg-primary-700"
                : "bg-white/20 cursor-not-allowed",
            )}
            disabled={(!message.trim() && files.length === 0) || disabled}
            type="submit"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      )}
    </div>
  );
}

export const Input = React.memo(ChatInput);
