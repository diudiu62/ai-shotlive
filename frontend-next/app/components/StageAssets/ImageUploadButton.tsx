'use client';

import React from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadButtonProps {
  onUpload: (file: File) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  hasImage?: boolean;
  uploadLabel?: string;
  generateLabel?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'inline' | 'separate';
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onUpload,
  onGenerate,
  isGenerating = false,
  hasImage = false,
  uploadLabel = '上传',
  generateLabel = '生成',
  size = 'medium',
  variant = 'separate',
}) => {
  const sizeClasses = {
    small: 'h-8 px-3 text-[10px]',
    medium: 'h-9 px-4 text-xs',
    large: 'h-10 px-6 text-sm',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  if (variant === 'inline') {
    return (
      <div className="flex gap-1">
        {onGenerate && (
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className={sizeClasses[size]}
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {generateLabel}
          </Button>
        )}
        <label className={`inline-flex items-center justify-center rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 transition-all ${sizeClasses[size]}`}>
          <Upload className="w-3 h-3" />
          {uploadLabel}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  // Separate variant for regenerate + upload
  return (
    <div className="flex gap-2">
      {onGenerate && hasImage && (
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wider"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" />
              重新生成
            </>
          )}
        </Button>
      )}
      <label className="flex-1 inline-flex items-center justify-center rounded-4xl border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 transition-all py-1.5 text-xs font-bold uppercase tracking-wider">
        <Upload className="w-3 h-3" />
        {uploadLabel}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ImageUploadButton;
