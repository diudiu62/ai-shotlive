'use client';

import React from 'react';
import { X, Edit2, Check, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textareaClassName?: string;
  // AI生成功能相关
  showAIGenerate?: boolean;
  onAIGenerate?: () => Promise<void>;
  isAIGenerating?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  icon,
  value,
  onChange,
  placeholder = '输入内容...',
  textareaClassName = 'font-normal',
  showAIGenerate = false,
  onAIGenerate,
  isAIGenerating = false
}) => {
  if (!isOpen) return null;

  const handleAIGenerate = async () => {
    if (onAIGenerate && !isAIGenerating) {
      await onAIGenerate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-bold flex items-center gap-2">
            {icon || <Edit2 className="w-4 h-4 text-primary" />}
            {title}
          </h3>
          <DialogClose className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </div>
        
        {/* AI生成按钮 */}
        {showAIGenerate && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAIGenerate}
              disabled={isAIGenerating}
              className="flex-1 py-2.5 text-sm font-bold gap-2"
            >
              {isAIGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI正在生成动作建议...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI生成动作建议
                </>
              )}
            </Button>
          </div>
        )}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-64 text-sm resize-none ${textareaClassName}`}
          placeholder={placeholder}
          autoFocus
          disabled={isAIGenerating}
        />
        
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={isAIGenerating}
            variant="secondary"
            className="px-4 py-2 text-sm font-bold"
          >
            取消
          </Button>
          <Button
            onClick={onSave}
            disabled={isAIGenerating}
            className="px-4 py-2 text-sm font-bold gap-2"
          >
            <Check className="w-4 h-4" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
