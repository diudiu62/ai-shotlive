'use client';

import React, { useState } from 'react';
import { Edit3, Save, AlertCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PromptEditorProps {
  prompt: string;
  onSave: (newPrompt: string) => void;
  label?: string;
  placeholder?: string;
  maxHeight?: string;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onSave,
  label = '提示词',
  placeholder = '输入视觉描述...',
  maxHeight = 'max-h-[260px]',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedPrompt(prompt || '');
  };

  const handleSave = () => {
    onSave(editedPrompt.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPrompt(prompt || '');
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Camera className="w-3 h-3" />
          {label}
        </Label>
        {!isEditing && (
          <Button
            onClick={handleStartEdit}
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            title="编辑提示词"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className={`flex-1 text-xs font-mono min-h-[140px] ${maxHeight}`}
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5"
            >
              <Save className="w-3 h-3" />
              保存
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wider"
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <div className={`flex-1 bg-muted border border-border rounded-lg p-3 overflow-y-auto ${maxHeight}`}>
          {prompt ? (
            <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
              {prompt}
            </p>
          ) : (
            <div className="flex items-start gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                未设置提示词。点击编辑按钮添加视觉描述。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
