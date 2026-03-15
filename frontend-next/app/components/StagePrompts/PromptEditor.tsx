'use client';

import React from 'react';
import { Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  size?: 'large' | 'small' | 'video';
  isVideo?: boolean;
}

const PromptEditor: React.FC<Props> = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = '输入提示词...',
  size = 'large',
  isVideo = false
}) => {
  const getTextareaRows = () => {
    switch (size) {
      case 'large': return 6;
      case 'video': return 8;
      case 'small': return 4;
      default: return 6;
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={getTextareaRows()}
        autoFocus
      />
      <div className="flex gap-2">
        <Button onClick={onSave} variant="default" size={size === 'small' ? 'sm' : 'default'} className="flex items-center gap-1">
          <Save className="w-3 h-3" />
          保存
        </Button>
        <Button onClick={onCancel} variant="outline" size={size === 'small' ? 'sm' : 'default'} className="flex items-center gap-1">
          <X className="w-3 h-3" />
          取消
        </Button>
      </div>
    </div>
  );
};

export default PromptEditor;
