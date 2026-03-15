'use client';

import React from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isEditing: boolean;
  value: string;
  displayValue?: string;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  italic?: boolean;
  showEditButton?: boolean;
  emptyText?: string;
}

const InlineEditor: React.FC<Props> = ({
  isEditing,
  value,
  displayValue,
  onEdit,
  onChange,
  onSave,
  onCancel,
  placeholder = '输入内容...',
  rows = 6,
  mono = false,
  italic = false,
  showEditButton = true,
  emptyText = '暂无内容'
}) => {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:border-primary focus:outline-none resize-none ${mono ? 'font-mono' : ''} ${italic ? 'font-serif italic' : ''}`}
          rows={rows}
          placeholder={placeholder}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            size="sm"
            className="text-xs flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            保存
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            size="sm"
            className="text-xs flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            取消
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <p className={`flex-1 text-xs text-muted-foreground leading-relaxed ${mono ? 'font-mono' : ''} ${italic ? 'font-serif italic' : ''} ${!displayValue && !value ? 'text-muted' : ''}`}>
        {displayValue || value || emptyText}
      </p>
      {showEditButton && (
        <Button
          onClick={onEdit}
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7"
          title="编辑"
        >
          <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
    </div>
  );
};

export default InlineEditor;
