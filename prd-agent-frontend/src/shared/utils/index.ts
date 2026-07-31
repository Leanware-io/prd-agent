import axios from "axios";
import classNames, { ArgumentArray } from "classnames";
import { twMerge } from "tailwind-merge";

function extractFilenameFromUrl(url: string): string {
  const match = RegExp(/\/([^/?#]+)(?:\?|#|$)/).exec(url);
  return match ? match[1] : "prd.pdf";
}

export async function downloadPdfFile(url: string) {
  const response = await axios.get(url, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = extractFilenameFromUrl(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export function openPdfFile(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = extractFilenameFromUrl(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) {
    seconds = 0;
  }
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function cn(...inputs: ArgumentArray) {
  return twMerge(classNames(inputs));
}

export function openFileInBrowser(file: File) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank");
  URL.revokeObjectURL(url);
}
