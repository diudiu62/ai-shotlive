'use client';

import React from 'react';
import { Wand2, BrainCircuit, AlertCircle } from 'lucide-react';
import OptionSelector from './OptionSelector';
import { DURATION_OPTIONS } from './constants';
import ModelSelector from '../ModelSelector';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Props {
  duration: string;
  model: string;
  customDurationInput: string;
  customModelInput: string;
  isProcessing: boolean;
  error: string | null;
  enableQualityCheck: boolean;
  onShowModelConfig?: () => void;
  onDurationChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onCustomDurationChange: (value: string) => void;
  onCustomModelChange: (value: string) => void;
  onToggleQualityCheck: (enabled: boolean) => void;
  onAnalyze: () => void;
}

const ConfigPanel: React.FC<Props> = ({
  duration,
  model,
  customDurationInput,

  isProcessing,
  error,
  enableQualityCheck,
  onShowModelConfig,
  onDurationChange,
  onModelChange,
  onCustomDurationChange,

  onToggleQualityCheck,
  onAnalyze
}) => {
  return (
    <div className="w-80 flex flex-col bg-card">
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-muted-foreground" />
          分镜配置
        </h2>
      </div>
      <Separator />

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Duration */}
        <OptionSelector
          label="目标时长"
          options={DURATION_OPTIONS}
          value={duration}
          onChange={onDurationChange}
          customInput={customDurationInput}
          onCustomInputChange={onCustomDurationChange}
          customPlaceholder="输入时长 (如: 90s, 3m)"
          gridCols={2}
        />

        {/* Model */}
        <div className="space-y-2">
          <ModelSelector
            type="chat"
            value={model}
            onChange={onModelChange}
            disabled={isProcessing}
            label="分镜生成模型"
          />
          <p className="text-[9px] text-muted-foreground">
            在{' '}
            <Button
              type="button"
              onClick={onShowModelConfig}
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto"
            >
              模型配置
            </Button>{' '}
            中可添加更多模型
          </p>
        </div>

        {/* Quality Check */}
        <div className="pt-6">
          <Separator className="mb-6" />
          <div className="flex items-center gap-3">
            <Switch
              checked={enableQualityCheck}
              onCheckedChange={onToggleQualityCheck}
              disabled={isProcessing}
            />
            <Label className="text-xs text-foreground cursor-pointer">
              启用分镜质量校验与自动修复（推荐）
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            开启后会在分镜生成完成时自动打分并修复坏点（字段缺失、关键帧结构问题、资产ID非法等）。
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 bg-card">
        <Separator className="mb-6" />
        <Button
          onClick={onAnalyze}
          disabled={isProcessing}
          className="w-full py-3.5 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
        >
          {isProcessing ? (
            <>
              <BrainCircuit className="w-4 h-4 animate-spin" />
              智能分析中...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              生成分镜脚本
            </>
          )}
        </Button>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive text-destructive text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPanel;
