import { ALLOWED_EXTENSIONS, MAX_FILE_MB } from "@/data/career/constants";
import { UploadStage } from "@/types/career";

export function getFileExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(file: { name: string; size: number }): string | null {
  const ext = `.${getFileExt(file.name)}`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type "${ext}". Please upload a PDF, DOCX, TXT, or MD file.`;
  }
  if (file.size === 0) {
    return "The selected file is empty (0 bytes).";
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `File is too large (${formatBytes(file.size)}). Maximum allowed size is ${MAX_FILE_MB} MB.`;
  }
  return null;
}

export function computeStageNum(uploadStage: UploadStage): number {
  if (uploadStage === "idle" || uploadStage === "upload_error") return 2;
  if (
    uploadStage === "uploading" ||
    uploadStage === "extracting" ||
    uploadStage === "extracted"
  ) {
    return 3;
  }
  if (
    uploadStage === "reviewing" ||
    uploadStage === "done" ||
    uploadStage === "review_error"
  ) {
    return 4;
  }
  return 1;
}
