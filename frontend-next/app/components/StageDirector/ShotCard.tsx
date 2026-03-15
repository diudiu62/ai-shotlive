'use client';

import React from 'react';
import { Image as ImageIcon, Video, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shot } from '@/app/types/types';

interface ShotCardProps {
  shot: Shot;
  index: number;
  isActive: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onSelect?: (e: React.MouseEvent) => void;
  onDelete?: (shotId: string) => void;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, index, isActive, isSelected = false, onClick, onSelect, onDelete }) => {
  const sKf = shot.keyframes?.find(k => k.type === 'start');
  const hasImage = !!sKf?.imageUrl;
  const hasVideo = !!shot.interval?.videoUrl;
  const quality = shot.qualityAssessment;
  const qualityGradeLabel = quality?.grade === 'pass'
    ? '通过'
    : quality?.grade === 'warning'
      ? '需优化'
      : '高风险';
  const qualityBadgeClass = quality?.grade === 'pass'
    ? 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
    : quality?.grade === 'warning'
      ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
      : 'bg-[var(--error-hover-bg)] text-[var(--error-text)] border-[var(--error-border)]';

  // 从shot.id中提取显示编号
  // 例如：shot-1 → "SHOT 001", shot-1-1 → "SHOT 001-1", shot-1-2 → "SHOT 001-2"
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "SHOT 001"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}`;
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "SHOT 001-1"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用index
      return `SHOT ${String(index + 1).padStart(3, '0')}`;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex flex-col bg-muted border rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-xl scale-[0.98]' : 'border-border hover:border-border/80 hover:shadow-lg'}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-card border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onSelect && (
            <Button
              onClick={onSelect}
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              title={isSelected ? '取消选择' : '选择'}
            >
              {isSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            {getShotDisplayNumber()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase">
            {shot.cameraMovement}
          </span>
          {onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(shot.id);
              }}
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              title="删除分镜"
            >
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {hasImage ? (
          <img 
            src={sKf!.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt={`Shot ${index + 1}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {hasVideo && (
            <div className="px-2 py-1 bg-success text-success-foreground rounded-full text-[9px] font-bold uppercase flex items-center gap-1 shadow-lg">
              <Video className="w-2.5 h-2.5" />
              VIDEO
            </div>
          )}
          {quality && (
            <div className={`px-2 py-1 rounded-full text-[9px] font-bold border ${qualityBadgeClass}`}>
              评分 {quality.score} · {qualityGradeLabel}
            </div>
          )}
        </div>

        {!isActive && !hasImage && (
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-foreground text-xs font-mono">点击编辑</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {shot.actionSummary}
        </p>
      </div>
    </div>
  );
};

export default ShotCard;
