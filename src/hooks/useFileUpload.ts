import { useState } from "react";
import { toast } from "sonner";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileUploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  resourceType: string;
  format: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const uploadFile = async (file: File): Promise<FileUploadResult | null> => {
    if (!file) {
      toast.error("No file selected");
      return null;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 10MB");
      return null;
    }

    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            toast.success("File uploaded successfully");
            resolve(result);
          } else {
            const error = JSON.parse(xhr.responseText);
            toast.error(error.message || "Upload failed");
            reject(new Error(error.message || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          toast.error("Upload failed");
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const deleteFile = async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload?publicId=${publicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("File deleted successfully");
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || "Delete failed");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
      return false;
    }
  };

  const getFileType = (mimeType: string): "image" | "video" | "audio" | "document" => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImageFile = (mimeType: string): boolean => {
    return mimeType.startsWith("image/");
  };

  const isVideoFile = (mimeType: string): boolean => {
    return mimeType.startsWith("video/");
  };

  const isAudioFile = (mimeType: string): boolean => {
    return mimeType.startsWith("audio/");
  };

  const isDocumentFile = (mimeType: string): boolean => {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/csv",
      "text/plain",
    ];
    return documentTypes.includes(mimeType);
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress,
    getFileType,
    formatFileSize,
    isImageFile,
    isVideoFile,
    isAudioFile,
    isDocumentFile,
  };
};

