'use client';

import React from 'react';
import { Plus, RotateCw, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Props {
  script: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onRewrite: () => void;
  isContinuing: boolean;
  isRewriting: boolean;
  lastModified?: string;
}

const ScriptEditor: React.FC<Props> = ({
  script,
  onChange,
  onContinue,
  onRewrite,
  isContinuing,
  isRewriting,
  lastModified
}) => {
  const stats = {
    characters: script.length,
    lines: script.split('\n').length
  };

  const isDisabled = isContinuing || isRewriting || !script.trim();

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-8 bg-background shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
          <span className="text-xs font-bold text-muted-foreground">剧本编辑器</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onContinue}
            disabled={isDisabled}
            size="sm"
            className="text-xs flex items-center gap-1.5 shadow-sm"
          >
            {isContinuing ? (
              <>
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                续写中...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                AI续写
              </>
            )}
          </Button>
          <Button
            onClick={onRewrite}
            disabled={isDisabled}
            size="sm"
            className="text-xs flex items-center gap-1.5 shadow-sm"
          >
            {isRewriting ? (
              <>
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
                改写中...
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                AI改写
              </>
            )}
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">MARKDOWN SUPPORTED</span>
        </div>
      </div>
      <Separator />
      
      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto h-full flex flex-col py-12 px-8">
          <textarea
            value={script}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-foreground font-serif text-lg leading-loose focus:outline-none resize-none placeholder:text-muted-foreground selection:bg-muted"
            placeholder="在此输入故事大纲或直接粘贴剧本..."
            spellCheck={false}
          />
        </div>
      </div>
      <Separator />

      {/* Status Footer */}
      <div className="h-8 bg-background px-4 flex items-center justify-end gap-4 text-[10px] text-muted-foreground font-mono select-none">
        <span>{stats.characters} 字符</span>
        <span>{stats.lines} 行</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
          {lastModified ? '已自动保存' : '准备就绪'}
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;
