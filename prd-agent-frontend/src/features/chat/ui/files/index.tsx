import React from "react";
import { Button } from "@/shared/ui";
import { cn, openFileInBrowser } from "@/shared/utils";
import { DropzoneContextFile } from "@/app/providers";
import { FileIcon, FileImageIcon, FileTextIcon } from "lucide-react";

interface IFiles {
  className?: string;
  clickable?: boolean;
  files: DropzoneContextFile[];
  onRemoveFile?: (key: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + " KB";
  }
  return (bytes / 1048576).toFixed(1) + " MB";
};

const getFileIcon = (file: File) => {
  const fileType = file.type;
  if (fileType?.includes("image")) {
    return <FileImageIcon className="h-5 w-5" />;
  } else if (
    fileType?.includes("text") ||
    fileType?.includes("pdf") ||
    fileType?.includes("doc")
  ) {
    return <FileTextIcon className="h-5 w-5" />;
  }
  return <FileIcon className="h-5 w-5" />;
};

function FilesComponent(props: Readonly<IFiles>) {
  const { className, clickable, files, onRemoveFile } = props;

  if (!files.length) {
    return null;
  }

  return (
    <div
      className={
        className ??
        "mt-4 flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar"
      }
    >
      {files.map((file) => (
        <button
          className={cn(
            "flex items-center gap-3 p-2 rounded-md bg-white/10 border border-primary/30",
            clickable ? "cursor-pointer" : "cursor-default",
          )}
          key={file.key}
          onClick={() => {
            if (clickable) {
              openFileInBrowser(file.content);
            }
          }}
          type="button"
        >
          <div className="p-2 bg-white/5 rounded-md">
            {getFileIcon(file.content)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p
              className="text-sm font-medium text-white truncate"
              title={file.content.name}
            >
              {file.content.name}
            </p>
            {!!file.content.size && (
              <p className="text-xs text-white/60">
                {formatFileSize(file.content.size)}
              </p>
            )}
          </div>
          {onRemoveFile && (
            <Button
              className="text-white/60 hover:text-white hover:bg-white/5"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFile(file.key);
              }}
              type="button"
              variant="ghost"
            >
              Remove
            </Button>
          )}
        </button>
      ))}
    </div>
  );
}

export const Files = React.memo(FilesComponent);
