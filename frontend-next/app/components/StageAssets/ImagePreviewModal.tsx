'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border p-0 overflow-hidden max-w-[90vw] max-h-[90vh]">
        <DialogClose className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </DialogClose>
        <div className="flex items-center justify-center w-full h-full p-4">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-background/60 backdrop-blur rounded-lg border border-border">
          <p className="text-xs text-muted-foreground font-mono">点击任意处关闭</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;
