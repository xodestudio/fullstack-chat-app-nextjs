"use client";

import React from "react";
import Image from "next/image";
import { FileText, Download, Play, Volume2, FileImage, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  className?: string;
  showDownload?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileUrl,
  fileName,
  fileSize,
  fileMimeType,
  className = "",
  showDownload = true,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <FileImage className="h-6 w-6" />;
    if (mimeType.startsWith("video/")) return <Video className="h-6 w-6" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "bg-green-100 text-green-800";
    if (mimeType.startsWith("video/")) return "bg-blue-100 text-blue-800";
    if (mimeType.startsWith("audio/")) return "bg-purple-100 text-purple-800";
    if (mimeType === "application/pdf") return "bg-red-100 text-red-800";
    if (mimeType.includes("word") || mimeType.includes("document")) return "bg-blue-100 text-blue-800";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Image preview
  if (fileMimeType.startsWith("image/")) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src={fileUrl}
            alt={fileName}
            width={300}
            height={200}
            className="object-cover w-full h-auto max-w-sm max-h-64"
            unoptimized
          />
          {showDownload && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {fileName} • {formatFileSize(fileSize)}
        </div>
      </div>
    );
  }

  // Video preview
  if (fileMimeType.startsWith("video/")) {
    return (
      <div className={`${className}`}>
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            src={fileUrl}
            controls
            className="w-full h-auto max-w-sm max-h-64"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {fileName} • {formatFileSize(fileSize)}
        </div>
      </div>
    );
  }

  // Audio preview
  if (fileMimeType.startsWith("audio/")) {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Volume2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
            </div>
          </div>
          <audio src={fileUrl} controls className="w-full">
            Your browser does not support the audio tag.
          </audio>
          {showDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="w-full mt-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Document/File preview
  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getFileIcon(fileMimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" title={fileName}>
              {fileName}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className={getFileTypeColor(fileMimeType)}>
                {fileMimeType.split("/")[1]?.toUpperCase() || "FILE"}
              </Badge>
              <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>
        {showDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full mt-3"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

