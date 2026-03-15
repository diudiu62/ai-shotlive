'use client';

import React from 'react';
import { Loader2, Edit2, Upload, ArrowRight, ArrowLeft, Sparkles, Wand2, Trash2 } from 'lucide-react';
import { Keyframe } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface KeyframeEditorProps {
  startKeyframe?: Keyframe;
  endKeyframe?: Keyframe;
  showEndFrame?: boolean;
  canCopyPrevious: boolean;
  canCopyNext: boolean; // 是否可以复制下一镜头的首帧（需要有下一个镜头且已生成首帧）
  isAIOptimizing?: boolean;
  useAIEnhancement: boolean;
  onToggleAIEnhancement: () => void;
  onGenerateKeyframe: (type: 'start' | 'end') => void;
  onUploadKeyframe: (type: 'start' | 'end') => void;
  onEditPrompt: (type: 'start' | 'end', prompt: string) => void;
  onOptimizeWithAI: (type: 'start' | 'end') => void;
  onOptimizeBothWithAI: () => void;
  onCopyPrevious: () => void;
  onCopyNext: () => void; // 复制下一镜头首帧到当前尾帧
  onDeleteKeyframe: (type: 'start' | 'end') => void; // 删除关键帧
  onImageClick: (url: string, title: string) => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  startKeyframe,
  endKeyframe,
  showEndFrame = true,
  canCopyPrevious,
  canCopyNext,
  isAIOptimizing = false,
  useAIEnhancement,
  onToggleAIEnhancement,
  onGenerateKeyframe,
  onUploadKeyframe,
  onEditPrompt,
  onOptimizeWithAI,
  onOptimizeBothWithAI,
  onCopyPrevious,
  onCopyNext,
  onDeleteKeyframe,
  onImageClick
}) => {

  const renderKeyframePanel = (
    type: 'start' | 'end',
    label: string,
    keyframe?: Keyframe
  ) => {
    const isGenerating = keyframe?.status === 'generating';
    const hasFailed = keyframe?.status === 'failed';
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {label}
          </Label>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onOptimizeWithAI(type)}
              disabled={isAIOptimizing}
              variant="ghost"
              size="sm"
              className="px-2 py-1 text-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded-md hover:bg-accent"
              title="AI优化提示词"
            >
              {isAIOptimizing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">AI优化</span>
            </Button>
            {keyframe?.visualPrompt && (
              <Button
                onClick={() => onEditPrompt(type, keyframe.visualPrompt!)}
                variant="ghost"
                size="sm"
                className="px-2 py-1 text-warning hover:text-primary transition-colors flex items-center gap-1 rounded-md hover:bg-warning/10"
                title="编辑提示词"
              >
                <Edit2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">提示词</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="aspect-video bg-background rounded-lg border border-border overflow-hidden relative group">
          {keyframe?.imageUrl ? (
            <>
              <img
                src={keyframe.imageUrl}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={() => onImageClick(keyframe.imageUrl!, `${label} - 关键帧`)}
                alt={label}
              />
              <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-primary text-xs font-mono">点击预览</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
                  <span className="text-[10px] text-muted-foreground">生成中...</span>
                </>
              ) : hasFailed ? (
                <>
                  <span className="text-[10px] text-destructive mb-2">生成失败</span>
                  <Button
                    onClick={() => onGenerateKeyframe(type)}
                    variant="destructive"
                    size="sm"
                    className="px-2 py-1 text-[9px] font-bold"
                  >
                    重试
                  </Button>
                </>
              ) : (
                <span className="text-[10px] text-center">未生成</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isGenerating && (
            <>
              <Button
                onClick={() => onGenerateKeyframe(type)}
                disabled={isGenerating}
                variant="default"
                size="sm"
                className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {keyframe?.imageUrl ? '重新生成' : '生成'}
              </Button>
              <Button
                onClick={() => onUploadKeyframe(type)}
                variant="secondary"
                size="sm"
                className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                上传
              </Button>
              {keyframe?.imageUrl && (
                <Button
                  onClick={() => onDeleteKeyframe(type)}
                  variant="destructive"
                  size="sm"
                  className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                  title="删除关键帧"
                >
                  <Trash2 className="w-3 h-3" />
                  删除
                </Button>
              )}
            </>
          )}
        </div>

        {/* Copy Previous Button for Start Frame */}
        {type === 'start' && canCopyPrevious && !keyframe?.imageUrl && (
          <Button
            onClick={onCopyPrevious}
            variant="outline"
            size="sm"
            className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
          >
            <ArrowRight className="w-3 h-3" />
            复制上一镜头尾帧
          </Button>
        )}

        {/* Copy Next Button for End Frame */}
        {type === 'end' && canCopyNext && !keyframe?.imageUrl && (
          <Button
            onClick={onCopyNext}
            variant="outline"
            size="sm"
            className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            复制下一镜头首帧
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* AI 增强开关 */}
      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            AI增强提示词
          </span>
          <Switch
            checked={useAIEnhancement}
            onCheckedChange={onToggleAIEnhancement}
            title={useAIEnhancement ? '关闭AI增强：使用基础提示词快速生成' : '开启AI增强：自动扩展为专业电影级描述'}
          />
        
        </div>
        
        {/* 一次性优化两帧按钮 */}
        {showEndFrame && (
          <Button
            onClick={onOptimizeBothWithAI}
            disabled={isAIOptimizing}
            variant="default"
            size="sm"
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="AI一次性优化起始帧和结束帧（推荐）"
          >
            {isAIOptimizing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>优化中...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                <span>AI优化两帧</span>
              </>
            )}
          </Button>
        )}
      </div>

      <div className={`grid gap-4 ${showEndFrame ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {renderKeyframePanel('start', '起始帧', startKeyframe)}
        {showEndFrame && renderKeyframePanel('end', '结束帧', endKeyframe)}
      </div>
    </div>
  );
};

export default KeyframeEditor;