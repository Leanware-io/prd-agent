import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { dropzoneConfig } from "@/shared/config";
import { FileRejection, useDropzone as useDropzoneHook } from "react-dropzone";
import { v4 as uuidV4 } from "uuid";

export interface DropzoneContextFile {
  content: File;
  key: string;
}

interface DropzoneContextValue {
  clearFiles: () => void;
  files: DropzoneContextFile[];
  filesErrors: FileRejection[];
  isDragActive: boolean;
  onRemoveFile: (key: string) => void;
  open: () => void;
}

const DropzoneContext = createContext<DropzoneContextValue>({
  clearFiles: () => {},
  files: [],
  filesErrors: [],
  isDragActive: false,
  onRemoveFile: () => {},
  open: () => {},
});

export const useDropzone = () => useContext(DropzoneContext);

export const DropzoneProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [files, setFiles] = useState<DropzoneContextFile[]>([]);
  const [filesErrors, setFilesErrors] = useState<FileRejection[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const _files = acceptedFiles.map((acceptedFile) => ({
        content: acceptedFile,
        key: uuidV4(),
      }));
      setFiles((prev) => [...prev, ..._files]);
      setFilesErrors(fileRejections);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzoneHook({
    ...dropzoneConfig,
    onDrop,
  });

  const clearFiles = useCallback(() => {
    setFiles([]);
    setFilesErrors([]);
  }, []);

  const onRemoveFile = useCallback(
    (key: string) => {
      const _files = files.filter((file) => file.key !== key);
      setFiles(_files);
    },
    [files],
  );

  const value = useMemo(
    () => ({
      clearFiles,
      files,
      filesErrors,
      isDragActive,
      onRemoveFile,
      open,
    }),
    [clearFiles, files, filesErrors, isDragActive, onRemoveFile, open],
  );

  return (
    <DropzoneContext.Provider value={value}>
      <div className="overflow-auto" {...getRootProps()}>
        {children}
      </div>
      <input {...getInputProps()} className="hidden" data-testid="file-input" />
    </DropzoneContext.Provider>
  );
};
