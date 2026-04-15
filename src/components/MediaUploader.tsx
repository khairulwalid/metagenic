import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Film, FileType, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export function MediaUploader({ onFilesSelect, isProcessing }: MediaUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelect(acceptedFiles);
    }
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxFiles: 5,
    multiple: true,
    disabled: isProcessing,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out",
        "flex flex-col items-center justify-center p-12 text-center",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.01]" 
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-white shadow-sm hover:shadow-md",
        isProcessing && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background border shadow-sm">
          <Upload className={cn("h-8 w-8 text-primary transition-transform duration-300", isDragActive && "scale-110")} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">
          {isDragActive ? "Drop your media here" : "Upload your stock media"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Drag and drop up to 5 files at once.
          <br />
          Supports JPG, PNG, WEBP, MP4, MOV.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
          <ImageIcon className="h-3.5 w-3.5" />
          Photos
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
          <Film className="h-3.5 w-3.5" />
          Videos
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
          <FileType className="h-3.5 w-3.5" />
          Vectors
        </div>
      </div>
    </div>
  );
}
