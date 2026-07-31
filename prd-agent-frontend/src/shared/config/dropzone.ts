import { DropzoneOptions } from "react-dropzone";

export const dropzoneConfig: DropzoneOptions = {
  accept: {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "text/plain": [".txt"],
  },
  maxSize: 2e7,
  noClick: true,
};
