'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, Grid3x3, AlertCircle, Edit2, Save, ArrowRight, Wand2, ImagePlus } from 'lucide-react';
import { Character, CharacterTurnaroundPanel } from '@/app/types/types';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CHARACTER_TURNAROUND_LAYOUT } from '../../services/aiService';

interface TurnaroundModalProps {
  character: Character;
  onClose: () => void;
  onGeneratePanels: (charId: string) => void;
  onConfirmPanels: (charId: string, panels: CharacterTurnaroundPanel[]) => void;
  onUpdatePanel: (charId: string, index: number, panel: Partial<CharacterTurnaroundPanel>) => void;
  onRegenerate: (charId: string) => void;
  onRegenerateImage: (charId: string) => void; // 仅重新生成图片（保留已有的视角描述）
  onImageClick: (imageUrl: string) => void;
}

const TurnaroundModal: React.FC<TurnaroundModalProps> = ({
  character,
  onClose,
  onGeneratePanels,
  onConfirmPanels,
  onUpdatePanel,
  onRegenerate,
  onRegenerateImage,
  onImageClick,
}) => {
  const turnaround = character.turnaround;
  const [editingPanel, setEditingPanel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ viewAngle: string; shotSize: string; description: string }>({
    viewAngle: '', shotSize: '', description: ''
  });

  // 当编辑面板时，初始化编辑表单
  useEffect(() => {
    if (editingPanel !== null && turnaround?.panels?.[editingPanel]) {
      const panel = turnaround.panels[editingPanel];
      setEditForm({
        viewAngle: panel.viewAngle,
        shotSize: panel.shotSize,
        description: panel.description
      });
    }
  }, [editingPanel, turnaround?.panels]);

  const isGeneratingPanels = turnaround?.status === 'generating_panels';
  const isPanelsReady = turnaround?.status === 'panels_ready';
  const isGeneratingImage = turnaround?.status === 'generating_image';
  const hasFailed = turnaround?.status === 'failed';
  const isCompleted = turnaround?.status === 'completed' && turnaround?.imageUrl;
  const hasNoPanels = !turnaround || turnaround.status === 'pending';

  const handlePanelClick = (index: number) => {
    if (isPanelsReady) {
      setEditingPanel(editingPanel === index ? null : index);
    }
  };

  const handleSaveEdit = () => {
    if (editingPanel !== null) {
      onUpdatePanel(character.id, editingPanel, editForm);
      setEditingPanel(null);
    }
  };

  const handleConfirmAndGenerate = () => {
    if (turnaround?.panels && turnaround.panels.length === 9) {
      onConfirmPanels(character.id, turnaround.panels);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-5xl w-full max-h-[90vh] rounded-xl p-0 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-border flex items-center justify-between bg-muted shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border">
              {character.referenceImage && (
                <img src={character.referenceImage} className="w-full h-full object-cover" alt={character.name} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {character.name} - 造型九宫格
              </h3>
            </div>
            {isPanelsReady && (
              <span className="text-[10px] text-warning font-bold uppercase tracking-wider bg-warning/20 px-2 py-0.5 rounded border border-warning/30">
                待确认
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] text-success font-bold uppercase tracking-wider bg-success/20 px-2 py-0.5 rounded border border-success/30">
                已完成
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Button
                onClick={() => onRegenerateImage(character.id)}
                variant="secondary"
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                title="保留视角描述，仅重新生成九宫格图片"
              >
                <ImagePlus className="w-3 h-3" />
                重新生成图片
              </Button>
            )}
            {(isCompleted || isPanelsReady) && (
              <Button
                onClick={() => onRegenerate(character.id)}
                variant="ghost"
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                title="重新生成视角描述和图片"
              >
                <RefreshCw className="w-3 h-3" />
                重新生成描述
              </Button>
            )}
            <DialogClose className="p-2 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </DialogClose>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* 初始状态 - 尚未开始 */}
          {hasNoPanels && (
            <div className="flex flex-col items-center justify-center py-20">
              <Grid3x3 className="w-16 h-16 text-muted-foreground mb-6 opacity-30" />
              <h4 className="text-lg font-bold text-foreground mb-2">
                角色造型九宫格
              </h4>
              <p className="text-sm text-muted-foreground mb-2 text-center max-w-md">
                生成角色的多视角参考图（正面、侧面、背面、俯视、仰视等），
                在后续生成镜头图时将整张九宫格作为参考，提升角色一致性。
              </p>
              <p className="text-xs text-muted-foreground mb-8 text-center max-w-sm">
                提示：角色需要先有基础参考图，九宫格将基于该图生成多视角版本。
              </p>
              <Button
                onClick={() => onGeneratePanels(character.id)}
                disabled={!character.referenceImage && !character.visualPrompt}
                className="px-6 py-3 text-sm font-bold uppercase tracking-wider gap-2 shadow-lg"
              >
                <Wand2 className="w-4 h-4" />
                生成造型九宫格
              </Button>
            </div>
          )}

          {/* Loading Panels State */}
          {isGeneratingPanels && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <h4 className="text-lg font-bold text-foreground mb-2">
                正在生成视角描述...
              </h4>
              <p className="text-sm text-muted-foreground">
                AI正在为角色「{character.name}」设计9个不同视角的描述，请耐心等待
              </p>
            </div>
          )}

          {/* Loading Image State */}
          {isGeneratingImage && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
              <h4 className="text-lg font-bold text-foreground mb-2">
                正在生成九宫格造型图片...
              </h4>
              <p className="text-sm text-muted-foreground">
                根据视角描述为角色「{character.name}」生成多视角参考图，请耐心等待
              </p>
              {/* 显示已确认的视角列表 */}
              {turnaround?.panels && turnaround.panels.length > 0 && (
                <div className="mt-6 w-full max-w-lg space-y-1.5 px-6">
                  {turnaround.panels.map((panel, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-border">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-foreground">
                        {panel.viewAngle} / {panel.shotSize}
                      </span>
                      <span className="text-[9px] text-muted-foreground truncate flex-1">
                        {panel.description.substring(0, 50)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Failed State */}
          {hasFailed && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-destructive mb-6 opacity-60" />
              <h4 className="text-lg font-bold text-foreground mb-2">
                生成失败
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {turnaround?.panels && turnaround.panels.length > 0
                  ? '九宫格图片生成失败，您可以重新确认生成或修改描述后重试'
                  : '视角描述生成失败，请重试'
                }
              </p>
              {turnaround?.error && (
                <p className="text-xs text-destructive mb-4 max-w-md text-center">
                  错误信息: {turnaround.error}
                </p>
              )}
              {turnaround?.prompt && (
                <div className="w-full max-w-2xl mb-6">
                  <p className="text-xs text-muted-foreground mb-2 text-center">
                    执行的提示词:
                  </p>
                  <div className="text-xs text-foreground bg-muted border border-border rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {turnaround.prompt}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onRegenerate(character.id)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新生成描述
                </Button>
                {turnaround?.panels && turnaround.panels.length === 9 && (
                  <Button
                    onClick={handleConfirmAndGenerate}
                    variant="secondary"
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider gap-2"
                  >
                    <ArrowRight className="w-3 h-3" />
                    重试生成图片
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Panels Ready State - 用户审核和编辑视角描述 */}
          {isPanelsReady && turnaround?.panels && (
            <div className="p-6 space-y-4">
              {/* 提示信息 */}
              <div className="flex items-start gap-3 p-4 bg-warning/20 border border-warning/30 rounded-lg">
                <Wand2 className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-warning mb-1">
                    AI已生成9个视角描述，请检查后确认
                  </p>
                  <p className="text-xs text-muted-foreground">
                    点击任意视角可编辑其角度、景别和描述内容。确认无误后点击下方「确认并生成图片」按钮。
                  </p>
                </div>
              </div>

              {/* 面板列表 - 可编辑 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {turnaround.panels.map((panel, idx) => (
                  <div
                    key={idx}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                      editingPanel === idx
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border bg-muted hover:border-border/80 hover:bg-muted/80 cursor-pointer'
                    }`}
                    onClick={() => editingPanel !== idx && handlePanelClick(idx)}
                  >
                    {/* 面板头部 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          editingPanel === idx
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        {editingPanel !== idx && (
                          <span className="text-[11px] font-bold text-foreground">
                            {panel.viewAngle} / {panel.shotSize}
                          </span>
                        )}
                      </div>
                      {editingPanel !== idx && (
                        <Button
                          onClick={(e) => { e.stopPropagation(); handlePanelClick(idx); }}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          title="编辑"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {/* 编辑模式 */}
                    {editingPanel === idx ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5 block">视角</label>
                            <Select
                              value={editForm.viewAngle}
                              onValueChange={(value) => value && setEditForm(prev => ({ ...prev, viewAngle: value }))}
                            >
                              <SelectTrigger className="w-full h-7 text-[11px]">
                                <SelectValue placeholder="选择视角" />
                              </SelectTrigger>
                              <SelectContent>
                                {CHARACTER_TURNAROUND_LAYOUT.viewAngles.map(angle => (
                                  <SelectItem key={angle} value={angle}>{angle}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5 block">景别</label>
                            <Select
                              value={editForm.shotSize}
                              onValueChange={(value) => value && setEditForm(prev => ({ ...prev, shotSize: value }))}
                            >
                              <SelectTrigger className="w-full h-7 text-[11px]">
                                <SelectValue placeholder="选择景别" />
                              </SelectTrigger>
                              <SelectContent>
                                {CHARACTER_TURNAROUND_LAYOUT.shotSizes.map(size => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5 block">描述</label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full text-[10px]"
                          />
                        </div>
                        <Button
                          onClick={handleSaveEdit}
                          className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider gap-1"
                        >
                          <Save className="w-3 h-3" />
                          保存修改
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[9px] text-muted-foreground leading-relaxed line-clamp-3">
                        {panel.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 确认按钮 */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleConfirmAndGenerate}
                  className="px-8 py-3 text-sm font-bold uppercase tracking-wider gap-2 shadow-lg"
                >
                  <ArrowRight className="w-4 h-4" />
                  确认并生成图片
                </Button>
              </div>
            </div>
          )}

          {/* Completed State - 显示九宫格图片 */}
          {isCompleted && turnaround?.imageUrl && (
            <div className="p-6 space-y-4">
              {/* 九宫格图片 */}
              <div>
                <img
                  src={turnaround.imageUrl}
                  alt={`${character.name} Turnaround Sheet`}
                  className="w-full rounded-lg border border-border cursor-pointer"
                  onClick={() => onImageClick(turnaround.imageUrl!)}
                />
              </div>

              {/* 视角描述列表 */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  视角描述明细
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {turnaround.panels.map((panel, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-muted rounded-lg border border-border"
                    >
                      <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-foreground block">
                          {panel.viewAngle} / {panel.shotSize}
                        </span>
                        <span className="text-[9px] text-muted-foreground line-clamp-2">
                          {panel.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="flex justify-center gap-3 pt-2">
                <Button
                  onClick={() => onRegenerateImage(character.id)}
                  variant="secondary"
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                  title="保留视角描述，仅重新生成图片"
                >
                  <ImagePlus className="w-3 h-3" />
                  重新生成图片
                </Button>
                <Button
                  onClick={() => onRegenerate(character.id)}
                  variant="ghost"
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                  title="重新生成视角描述和图片"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新生成描述
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TurnaroundModal;
