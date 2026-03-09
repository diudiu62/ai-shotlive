/**
 * 模型卡片组件
 * 显示单个模型的配置，支持切换提供商
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, ToggleLeft, ToggleRight, CheckCircle, Circle, Edit } from 'lucide-react';
import { 
  ModelDefinition, 
  ModelProvider,
  ChatModelParams,
  ImageModelParams,
  VideoModelParams,
  AspectRatio,
  VideoDuration
} from '../../types/model';

interface ModelCardProps {
  model: ModelDefinition;
  isExpanded: boolean;
  isActive: boolean;
  providers: ModelProvider[];
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ModelDefinition>) => void;
  onDelete: () => void;
  onSetActive: () => void;
  onEdit: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isExpanded,
  isActive,
  providers,
  onToggleExpand,
  onUpdate,
  onDelete,
  onSetActive,
  onEdit,
}) => {
  const currentProvider = providers.find(p => p.id === model.providerId);

  const handleToggleEnabled = () => {
    onUpdate({ isEnabled: !model.isEnabled });
  };

  const handleProviderChange = (providerId: string) => {
    onUpdate({ providerId });
  };

  const renderChatParams = (params: ChatModelParams) => (
    <div className="space-y-2 text-[10px] text-[var(--text-tertiary)]">
      <div>温度: {params.temperature}</div>
      <div>最大 Token: {params.maxTokens || '不限制'}</div>
    </div>
  );

  const renderImageParams = (params: ImageModelParams) => (
    <div className="space-y-2 text-[10px] text-[var(--text-tertiary)]">
      <div>支持比例: {params.supportedAspectRatios.map(ratio => 
        ratio === '16:9' ? '横屏' : ratio === '9:16' ? '竖屏' : '方形'
      ).join('、')}</div>
      <div>默认比例: {params.defaultAspectRatio === '16:9' ? '横屏' : params.defaultAspectRatio === '9:16' ? '竖屏' : '方形'}</div>
    </div>
  );

  const renderVideoParams = (params: VideoModelParams) => (
    <div className="space-y-2 text-[10px] text-[var(--text-tertiary)]">
      <div>模式：{params.mode === 'sync' ? '同步（Veo）' : '异步（Sora）'}</div>
      <div>支持比例：{params.supportedAspectRatios.map(ratio => 
        ratio === '16:9' ? '横屏' : ratio === '9:16' ? '竖屏' : '方形'
      ).join('、')}</div>
      <div>默认比例：{params.defaultAspectRatio === '16:9' ? '横屏' : params.defaultAspectRatio === '9:16' ? '竖屏' : '方形'}</div>
      {params.mode === 'async' && (
        <>
          <div>支持时长：{params.supportedDurations.join('、')}秒</div>
          <div>默认时长：{params.defaultDuration}秒</div>
        </>
      )}
    </div>
  );

  const apiModel = model.apiModel || model.id;

  return (
    <div 
      className={`bg-[var(--bg-elevated)]/50 border rounded-lg overflow-hidden transition-all ${
        isActive ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]' : 'border-[var(--border-primary)]'
      } ${!model.isEnabled ? 'opacity-60' : ''}`}
    >
      {/* 头部 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">{model.name}</span>
              {model.isBuiltIn && (
                <span className="px-1.5 py-0.5 bg-[var(--border-secondary)] text-[var(--text-tertiary)] text-[9px] rounded">内置</span>
              )}
              {currentProvider && (
                <span className={`px-1.5 py-0.5 text-[9px] rounded ${
                  currentProvider.apiKey 
                    ? 'bg-[var(--success-bg)] text-[var(--success-text)]' 
                    : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
                }`}>
                  {currentProvider.name}{!currentProvider.apiKey && ' (未配置Key)'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
              API 模型名: {apiModel}
              {model.id !== apiModel && ` · 内部ID: ${model.id}`}
              {model.endpoint && ` · ${model.endpoint}`}
              {model.description && ` · ${model.description}`}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {model.isEnabled && !isActive && (
            <button
              onClick={onSetActive}
              disabled={!currentProvider?.apiKey}
              className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors flex items-center gap-1 ${
                currentProvider?.apiKey
                  ? 'bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-hover)]'
                  : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed opacity-60'
              }`}
              title={currentProvider?.apiKey ? '使用此模型' : '请先为提供商配置 API Key'}
            >
              <Circle className="w-3 h-3" />
              {currentProvider?.apiKey ? '使用' : '未配置Key'}
            </button>
          )}
          
          {isActive && (
            <span className="px-2.5 py-1 bg-[var(--accent-bg)] text-[var(--accent-text-hover)] text-[10px] font-bold rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              当前使用
            </span>
          )}

          <button
            onClick={handleToggleEnabled}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            title={model.isEnabled ? '禁用' : '启用'}
          >
            {model.isEnabled ? (
              <ToggleRight className="w-5 h-5 text-[var(--accent-text)]" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>

          {!model.isBuiltIn && (
            <button
              onClick={onDelete}
              className="text-[var(--text-tertiary)] hover:text-[var(--error-text)] transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}


          
          <button
            onClick={() => {
              // 点击下拉按钮时直接进入编辑模式
              onEdit();
            }}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            title="编辑模型"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 展开的内容 - 已移除，点击下拉直接进入编辑模式 */}
    </div>
  );
};

export default ModelCard;