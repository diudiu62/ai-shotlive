'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
  open: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, title, onClose, open }) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0 shadow-none">
        <DialogClose className="absolute top-6 right-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-primary transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </Button>
        </DialogClose>
        
        {title && (
          <div className="absolute top-6 left-6 z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
              <h3 className="text-primary font-bold text-sm">{title}</h3>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center p-8 w-full h-full">
          <img 
            src={imageUrl} 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            alt={title || 'Preview'}
          />
        </div>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <p className="text-primary/60 text-xs">点击任意位置关闭</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewModal;
