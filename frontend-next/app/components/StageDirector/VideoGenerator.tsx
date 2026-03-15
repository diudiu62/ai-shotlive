'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Edit2 } from 'lucide-react';
import { Shot, AspectRatio, VideoDuration } from '@/app/types/types';
import { VideoSettingsPanel } from '../AspectRatioSelector';
import { 
  getDefaultAspectRatio, 
  getDefaultVideoDuration,
  getAvailableVideoModels,
  getActiveVideoModel,
} from '../../services/modelRegistry';
import { VideoModelDefinition } from '../../types/model';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VideoGeneratorProps {
  shot: Shot;
  hasStartFrame: boolean;
  hasEndFrame: boolean;
  currentVideoModelId: string;
  onGenerate: (aspectRatio: AspectRatio, duration: VideoDuration, modelId: string) => void;
  onEditPrompt: () => void;
  onModelChange?: (modelId: string) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  shot,
  hasStartFrame,
  hasEndFrame,
  currentVideoModelId,
  onGenerate,
  onEditPrompt,
  onModelChange
}) => {
  const normalizeModelId = (modelId?: string) => {
    if (!modelId) return modelId;
    return modelId.toLowerCase() === 'veo_3_1-fast-4k' ? 'veo_3_1-fast' : modelId;
  };

  const resolveVeoFastQuality = (modelId?: string): 'standard' | '4k' => {
    if (!modelId) return 'standard';
    return modelId.toLowerCase() === 'veo_3_1-fast-4k' ? '4k' : 'standard';
  };

  const videoModels = getAvailableVideoModels();
  const defaultModel = getActiveVideoModel();
  
  // 状态（废弃模型已在数据加载层迁移，此处无需额外处理）
  const [selectedModelId, setSelectedModelId] = useState<string>(
    normalizeModelId(currentVideoModelId) || defaultModel?.id || videoModels[0]?.id || 'sora-2'
  );
  const [veoFastQuality, setVeoFastQuality] = useState<'standard' | '4k'>(
    resolveVeoFastQuality(currentVideoModelId)
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => getDefaultAspectRatio());
  const [duration, setDuration] = useState<VideoDuration>(() => getDefaultVideoDuration());
  
  // 当前选中的模型
  const selectedModel = videoModels.find(m => m.id === selectedModelId) as VideoModelDefinition | undefined;
  const modelType: 'sora' | 'veo' = selectedModel?.params?.mode === 'async' ? 'sora' : 'veo';
  const effectiveModelId = selectedModelId === 'veo_3_1-fast'
    ? (veoFastQuality === '4k' ? 'veo_3_1-fast-4K' : 'veo_3_1-fast')
    : selectedModelId;
  
  const isGenerating = shot.interval?.status === 'generating';
  const hasVideo = !!shot.interval?.videoUrl;

  // 当模型变化时，更新横竖屏和时长的默认值
  useEffect(() => {
    if (selectedModel) {
      // 如果当前选择的横竖屏不被新模型支持，切换到默认值
      if (!selectedModel.params?.supportedAspectRatios?.includes(aspectRatio)) {
        setAspectRatio(selectedModel.params?.defaultAspectRatio || '16:9');
      }
      // 如果当前选择的时长不被新模型支持，切换到默认值
      if (!selectedModel.params?.supportedDurations?.includes(duration)) {
        setDuration(selectedModel.params?.defaultDuration || '15s');
      }
    }
  }, [selectedModelId]);

  useEffect(() => {
    if (!currentVideoModelId) return;
    setSelectedModelId(normalizeModelId(currentVideoModelId) || 'veo_3_1-fast');
    setVeoFastQuality(resolveVeoFastQuality(currentVideoModelId));
  }, [currentVideoModelId]);

  const handleGenerate = () => {
    onGenerate(aspectRatio, duration, effectiveModelId);
  };

  const handleVeoFastQualityChange = (quality: 'standard' | '4k') => {
    setVeoFastQuality(quality);
    if (selectedModelId === 'veo_3_1-fast') {
      const modelId = quality === '4k' ? 'veo_3_1-fast-4K' : 'veo_3_1-fast';
      onModelChange?.(modelId);
    }
  };

  const canGenerate = hasStartFrame;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-end">
        {shot.interval?.status === 'completed' && (
          <span className="text-[10px] text-[var(--success)] font-mono flex items-center gap-1">
            ● READY
          </span>
        )}
        <Button 
          onClick={onEditPrompt}
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-warning hover:text-primary flex items-center gap-1 rounded-md hover:bg-warning/10"
          title="预览/编辑视频提示词"
        >
          <Edit2 className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">编辑提示词</span>
        </Button>
      </div>
      
      {/* Model Selector */}
      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          选择视频模型
        </Label>
        <Select value={selectedModelId} onValueChange={(newModelId) => {
          if (newModelId) {
            setSelectedModelId(newModelId);
            const resolvedModelId = newModelId === 'veo_3_1-fast'
              ? (veoFastQuality === '4k' ? 'veo_3_1-fast-4K' : 'veo_3_1-fast')
              : newModelId;
            onModelChange?.(resolvedModelId);
          }
        }} disabled={isGenerating}>
          <SelectTrigger className="w-full text-xs h-9">
            <SelectValue placeholder="选择视频模型" />
          </SelectTrigger>
          <SelectContent>
            {videoModels.map((model) => {
              const vm = model as VideoModelDefinition;
              const modeLabel = vm.params?.mode === 'async' ? '异步' : '首尾帧';
              return (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({modeLabel})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedModel && (
          <p className="text-[9px] text-[var(--text-muted)] font-mono">
            ✦ {selectedModel.name}: 
            {selectedModel.params?.mode === 'async' 
              ? ` 支持 ${selectedModel.params?.supportedAspectRatios?.join('/') || '16:9'}，可选 ${selectedModel.params?.supportedDurations?.join('/') || '15s'}秒`
              : ` 首尾帧模式，支持 ${selectedModel.params?.supportedAspectRatios?.join('/') || '16:9'}`}
          </p>
        )}
        {selectedModelId === 'veo_3_1-fast' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase">清晰度</span>
            <div className="flex gap-1">
              <Button
                onClick={() => handleVeoFastQualityChange('standard')}
                disabled={isGenerating}
                variant={veoFastQuality === 'standard' ? 'default' : 'outline'}
                size="sm"
                className="px-3 py-1.5 text-xs"
              >
                标准
              </Button>
              <Button
                onClick={() => handleVeoFastQualityChange('4k')}
                disabled={isGenerating}
                variant={veoFastQuality === '4k' ? 'default' : 'outline'}
                size="sm"
                className="px-3 py-1.5 text-xs"
              >
                4K
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 视频设置：横竖屏 & 时长 */}
      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          视频设置
        </Label>
        <VideoSettingsPanel
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          duration={duration}
          onDurationChange={setDuration}
          modelType={modelType}
          disabled={isGenerating}
          supportedAspectRatios={selectedModel?.params?.supportedAspectRatios}
          supportedDurations={selectedModel?.params?.supportedDurations}
        />
      </div>
      
      {/* Video Preview */}
      {hasVideo ? (
        <div className="w-full aspect-video bg-[var(--bg-base)] rounded-lg overflow-hidden border border-[var(--border-secondary)] relative shadow-lg">
          <video src={shot.interval?.videoUrl} controls className="w-full h-full" />
        </div>
      ) : (
        <div className="w-full aspect-video bg-[var(--nav-hover-bg)] rounded-lg border border-dashed border-[var(--border-primary)] flex items-center justify-center">
          <span className="text-xs text-[var(--text-muted)] font-mono">PREVIEW AREA</span>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        variant={hasVideo ? 'outline' : 'default'}
        className={`w-full py-3 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
          hasVideo 
            ? 'bg-background text-secondary hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
        } ${(!canGenerate) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {`生成视频中 (${aspectRatio}, ${modelType === 'sora' ? `${duration}秒` : selectedModel?.name})...`}
          </>
        ) : (
          <>{hasVideo ? '重新生成视频' : '开始生成视频'}</>
        )}
      </Button>
      
      {/* Status Messages */}
      {!hasEndFrame && (
        <div className="text-[9px] text-[var(--text-tertiary)] text-center font-mono">
          * 未检测到结束帧，将使用单图生成模式 (Image-to-Video)
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
