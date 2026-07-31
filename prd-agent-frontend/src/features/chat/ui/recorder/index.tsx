import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { cn, formatTime } from "@/shared/utils";
import { Pause, Play, Send, X } from "lucide-react";

interface IVoiceRecorder {
  onCancel: () => void;
  onRecordingComplete: (params: { audio: Blob }) => void;
}

interface IAudioWaveform {
  isPaused: boolean;
}

function AudioWaveform(props: Readonly<IAudioWaveform>) {
  const { isPaused } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<number[]>([]);
  const minHeight = 3;
  const maxHeight = 15;
  const barWidth = 2;
  const barSpacing = 2;

  useEffect(() => {
    const calculateBars = () => {
      if (!containerRef.current) {
        return;
      }

      const containerWidth = containerRef.current.clientWidth;

      const numBars = Math.floor(containerWidth / (barWidth + barSpacing));

      const newBars = Array.from({ length: numBars }).map(
        () =>
          Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight,
      );

      setBars(newBars);
    };

    calculateBars();

    const handleResize = () => calculateBars();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex items-center h-8 w-full justify-center"
      ref={containerRef}
    >
      {bars.map((height, index) => (
        <div
          className={cn(
            "rounded-full bg-primary transition-all duration-75 ease-in-out",
            isPaused ? "animate-none" : "animate-sound-wave",
          )}
          key={`bar-${index}-${height}`}
          style={{
            animationDelay: `${index * 20}ms`,
            height: `${height}px`,
            marginLeft: `${barSpacing}px`,
            width: `${barWidth}px`,
          }}
        />
      ))}
    </div>
  );
}

function VoiceRecorder(props: Readonly<IVoiceRecorder>) {
  const { onRecordingComplete, onCancel } = props;

  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const isCancelledRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (!isCancelledRef.current) {
          onRecordingComplete({ audio: audioBlob });
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }, [onRecordingComplete]);

  useEffect(() => {
    startRecording();
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };
  }, [isRecording, startRecording]);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes sound-wave {
        0% {
          height: 3px;
        }
        50% {
          height: 15px;
        }
        100% {
          height: 3px;
        }
      }
      .animate-sound-wave {
        animation: sound-wave 0.8s ease-in-out infinite;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (isPaused) {
      mediaRecorderRef.current.resume();

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    setIsPaused(!isPaused);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelledRef.current = true;
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    setRecordingTime(0);
    onCancel();
  };

  return (
    <div className="w-full mb-0">
      {isRecording ? (
        <div className="flex flex-col space-y-0">
          <div className="flex items-center justify-between bg-white/10 rounded-container h-[42px] px-3">
            <div className="flex items-center gap-3 w-full">
              <Button
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 shrink-0"
                onClick={togglePause}
                size="icon"
                type="button"
                variant="ghost"
              >
                {isPaused ? (
                  <Play className="h-4 w-4 text-white" />
                ) : (
                  <Pause className="h-4 w-4 text-white" />
                )}
              </Button>

              <div className="h-8 flex-1 bg-white/5 rounded-lg overflow-hidden relative mx-2">
                <div className="h-full w-full absolute inset-0">
                  <AudioWaveform isPaused={isPaused} />
                </div>
              </div>

              <span className="text-xs text-white/70 mr-2 shrink-0">
                {formatTime(recordingTime)}
              </span>

              <Button
                className="text-white/60 hover:text-white hover:bg-white/5"
                onClick={cancelRecording}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>

              <Button
                className="h-8 aspect-square p-0 rounded-full bg-primary hover:bg-primary-700 text-white ml-1 shrink-0"
                onClick={stopRecording}
                title="Send voice message"
                type="button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const Recorder = React.memo(VoiceRecorder);
