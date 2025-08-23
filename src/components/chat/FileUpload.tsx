"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, X, File, Image, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (fileData: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
  onCancel?: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onCancel,
  acceptedTypes = ["*/*"],
  maxSize = 10,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadFile, isUploading, uploadProgress, formatFileSize } = useFileUpload();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);

    try {
      const result = await uploadFile(file);
      if (result) {
        onFileUploaded({
          url: result.url,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
        });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setSelectedFile(null);
    }
  }, [uploadFile, onFileUploaded, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (onCancel) {
      onCancel();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-8 w-8 text-green-600" />;
    if (file.type.startsWith("video/")) return <Video className="h-8 w-8 text-blue-600" />;
    if (file.type.startsWith("audio/")) return <Music className="h-8 w-8 text-purple-600" />;
    return <File className="h-8 w-8 text-gray-600" />;
  };

  if (isUploading && selectedFile) {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {getFileIcon(selectedFile)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress?.percentage || 0}%</span>
            </div>
            <Progress value={uploadProgress?.percentage || 0} className="h-2" />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="w-full mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload a file
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button onClick={handleBrowseClick} variant="outline">
            Browse Files
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={acceptedTypes.join(",")}
            className="hidden"
          />
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Maximum file size: {maxSize}MB</p>
            <p>Supported formats: Images, Videos, Audio, Documents</p>
          </div>
        </div>
        
        {onCancel && (
          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

