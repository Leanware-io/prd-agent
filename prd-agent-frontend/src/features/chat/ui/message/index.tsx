import Markdown from "react-markdown";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import remarkGfm from "remark-gfm";
import { cn, formatTime } from "@/shared/utils";
import { IMessage } from "@/features/chat";
import { Pause, Play } from "lucide-react";
interface IMessageComponent {
  message: IMessage;
}

function MessageComponent(props: Readonly<IMessageComponent>) {
  const { message } = props;
  const isUser = useMemo(() => message.role === "user", [message.role]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchAudioDuration = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new window.AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setDuration(Math.round(audioBuffer.duration));
      audioContext.close();
    } catch (error) {
      console.error("Error fetching audio duration:", error);
    }
  }, []);

  useEffect(() => {
    if (message.audio) {
      fetchAudioDuration(message.audio);
    }
  }, [fetchAudioDuration, message.audio]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  const calculateProgress = useCallback(() => {
    if (!audioRef.current) {
      return 0;
    }
    const audioDuration = audioRef.current.duration;
    if (
      !Number.isFinite(audioDuration) ||
      Number.isNaN(audioDuration) ||
      audioDuration <= 0
    ) {
      return duration > 0 ? (currentTime / duration) * 100 : 0;
    }
    return (currentTime / audioDuration) * 100;
  }, [currentTime, duration]);

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-container p-4 text-white",
          isUser
            ? "bg-primary-700 rounded-tr-none"
            : "bg-white/10 rounded-tl-none",
        )}
      >
        {message.type === "text" ? (
          <p className="text-sm md:text-base whitespace-pre-wrap break-words">
            <Markdown
              className="markdown !text-white"
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </Markdown>
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                isUser ? "bg-primary-900" : "bg-white/20",
              )}
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
            <div className="flex-1">
              <div
                className="h-2 bg-white/20 rounded-full overflow-hidden"
                style={{ minWidth: "100px" }}
              >
                <div
                  className="h-full bg-white/50"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white/70">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-white/70">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            <audio
              className="hidden"
              onEnded={handleAudioEnded}
              onTimeUpdate={handleAudioTimeUpdate}
              ref={audioRef}
              src={message.audio}
            >
              <track kind="captions" label="English" src="" />
            </audio>
          </div>
        )}
        <p className="text-xs mt-1 text-right text-white/70">
          {moment(message.timestamp).format("HH:mm A")}
        </p>
      </div>
    </div>
  );
}

export const Message = React.memo(MessageComponent);
