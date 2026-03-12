import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Film, Edit2, MessageSquare, Sparkles, Loader2, Scissors, Grid3x3, CircleHelp, CheckCircle2, Circle, ChevronUp, ChevronDown, MapPin, Video } from 'lucide-react';
import { Shot, Character, Scene, Prop, ProjectState, AspectRatio, VideoDuration, NineGridData, NineGridPanel } from '../../types';
import SceneContext from './SceneContext';
import KeyframeEditor from './KeyframeEditor';
import VideoGenerator from './VideoGenerator';

interface ShotWorkbenchProps {
  shot: Shot;
  shotIndex: number;
  totalShots: number;
  scriptData?: ProjectState['scriptData'];
  currentVideoModelId: string;
  nextShotHasStartFrame?: boolean; // 下一个镜头是否有首帧
  isAIOptimizing?: boolean;
  isSplittingShot?: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onEditActionSummary: () => void;
  onGenerateAIAction: () => void;
  onSplitShot: () => void;
  onAddCharacter: (charId: string) => void;
  onRemoveCharacter: (charId: string) => void;
  onVariationChange: (charId: string, varId: string) => void;
  onSceneChange: (sceneId: string) => void;
  onAddProp?: (propId: string) => void;
  onRemoveProp?: (propId: string) => void;
  onGenerateKeyframe: (type: 'start' | 'end') => void;
  onUploadKeyframe: (type: 'start' | 'end') => void;
  onEditKeyframePrompt: (type: 'start' | 'end', prompt: string) => void;
  onOptimizeKeyframeWithAI: (type: 'start' | 'end') => void;
  onOptimizeBothKeyframes: () => void;
  onCopyPreviousEndFrame: () => void;
  onCopyNextStartFrame: () => void;
  onDeleteKeyframe: (type: 'start' | 'end') => void; // 删除关键帧
  useAIEnhancement: boolean;
  onToggleAIEnhancement: () => void;
  onGenerateVideo: (aspectRatio: AspectRatio, duration: VideoDuration, modelId: string) => void;
  onEditVideoPrompt: () => void;
  onVideoModelChange: (modelId: string) => void;
  onImageClick: (url: string, title: string) => void;
  // 九宫格分镜预览（高级功能）
  onGenerateNineGrid: () => void;
  nineGrid?: NineGridData;
  onSelectNineGridPanel: (panel: NineGridPanel) => void;
  onShowNineGrid: () => void;
  onReassessQuality: () => void;
}

const ShotWorkbench: React.FC<ShotWorkbenchProps> = ({
  shot,
  shotIndex,
  totalShots,
  scriptData,
  currentVideoModelId,
  nextShotHasStartFrame = false,
  isAIOptimizing = false,
  isSplittingShot = false,
  onClose,
  onPrevious,
  onNext,
  onEditActionSummary,
  onGenerateAIAction,
  onSplitShot,
  onAddCharacter,
  onRemoveCharacter,
  onVariationChange,
  onSceneChange,
  onAddProp,
  onRemoveProp,
  onGenerateKeyframe,
  onUploadKeyframe,
  onEditKeyframePrompt,
  onOptimizeKeyframeWithAI,
  onOptimizeBothKeyframes,
  onCopyPreviousEndFrame,
  onCopyNextStartFrame,
  onDeleteKeyframe,
  useAIEnhancement,
  onToggleAIEnhancement,
  onGenerateVideo,
  onEditVideoPrompt,
  onVideoModelChange,
  onImageClick,
  onGenerateNineGrid,
  nineGrid,
  onSelectNineGridPanel,
  onShowNineGrid,
  onReassessQuality
}) => {
  const scene = scriptData?.scenes.find(s => String(s.id) === String(shot.sceneId));
  const shotChars = Array.isArray(shot.characters) ? shot.characters : [];
  const activeCharacters = scriptData?.characters.filter(c => shotChars.includes(c.id)) || [];
  const availableCharacters = scriptData?.characters.filter(c => !shotChars.includes(c.id)) || [];
  const activeProps = (scriptData?.props || []).filter(p => (shot.props || []).includes(p.id));
  const availablePropsForShot = (scriptData?.props || []).filter(p => !(shot.props || []).includes(p.id));
  
  const startKf = shot.keyframes?.find(k => k.type === 'start');
  const endKf = shot.keyframes?.find(k => k.type === 'end');
  const quality = shot.qualityAssessment;
  const [localVideoModelId, setLocalVideoModelId] = useState(currentVideoModelId);
  const [expandedCheckKey, setExpandedCheckKey] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['context']);

  useEffect(() => {
    setLocalVideoModelId(currentVideoModelId);
  }, [currentVideoModelId]);

  const normalizedModelId = localVideoModelId.trim().toLowerCase();
  const showEndFrame = normalizedModelId.startsWith('veo') || normalizedModelId.includes('kf2v');
  
  const qualityGradeLabel = quality?.grade === 'pass' ? '通过' : quality?.grade === 'warning' ? '需优化' : '高风险';
  const qualityBadgeClass =
    quality?.grade === 'pass'
      ? 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]'
      : quality?.grade === 'warning'
        ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]'
        : 'bg-[var(--error-hover-bg)] text-[var(--error-text)] border-[var(--error-border)]';
  const qualitySourceLabel = quality ? (quality.version >= 2 ? 'AI评估 V2' : '规则评分 V1') : '';

  const checkLabelMap: Record<string, string> = {
    'prompt-readiness': '提示词完整度',
    'asset-coverage': '资产覆盖度',
    'keyframe-execution': '关键帧就绪度',
    'video-execution': '视频执行状态',
    'continuity-risk': '连贯性风险',
  };

  const adviceMap: Record<string, string> = {
    'prompt-readiness': '建议先补全首帧/尾帧/视频提示词，避免执行歧义。',
    'asset-coverage': '建议补角色/场景/道具参考图，提高风格一致性。',
    'keyframe-execution': '建议先完成关键帧出图，再进入视频生成。',
    'video-execution': '建议优先完成视频生成并确认可播放结果。',
    'continuity-risk': '建议补齐首尾锚点，确保跨镜头连贯。',
  };

  const getCheckLabel = (checkKey: string, fallback: string) => checkLabelMap[checkKey] || fallback;

  const qualitySummary = (() => {
    if (!quality) return '';
    const failedLabels = quality.checks.filter((check) => !check.passed).map((check) => getCheckLabel(check.key, check.label));
    if (failedLabels.length === 0) return '可进入生产，核心检查项已通过。';
    if (quality.grade === 'fail') return `风险较高：${failedLabels.join('、')}`;
    if (quality.grade === 'warning') return `需要优化：${failedLabels.join('、')}`;
    return `轻微问题：${failedLabels.join('、')}`;
  })();

  const weakestCheck = quality?.checks?.length
    ? [...quality.checks].sort((a, b) => a.score - b.score)[0]
    : undefined;
  const qualityActionHint = weakestCheck ? adviceMap[weakestCheck.key] || '' : '';
  
  const isSectionOpen = (sectionKey: string) => expandedSections.includes(sectionKey);
  const openSection = (sectionKey: string) => {
    setExpandedSections((prev) => (prev.includes(sectionKey) ? prev : [...prev, sectionKey]));
  };
  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionKey) ? prev.filter((item) => item !== sectionKey) : [...prev, sectionKey]
    );
  };
  
  // 从shot.id中提取显示编号
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "01"
      return String(idParts[0]).padStart(2, '0');
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "01-1"
      return `${String(idParts[0]).padStart(2, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用shotIndex
      return String(shotIndex + 1).padStart(2, '0');
    }
  };
  
  const getSectionIcon = (sectionKey: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'quality': <CheckCircle2 className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />,
      'context': <MapPin className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />,
      'narrative': <Film className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />,
      'visual': <Sparkles className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />,
      'video': <Video className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
    };
    return iconMap[sectionKey] || null;
  };

  const getSectionColor = (sectionKey: string) => {
    const colorMap: Record<string, string> = {
      'quality': 'bg-gradient-to-r from-[var(--accent-bg)] to-[var(--accent-bg)/80]',
      'context': 'bg-gradient-to-r from-[var(--success-bg)] to-[var(--success-bg)/80]',
      'narrative': 'bg-gradient-to-r from-[var(--warning-bg)] to-[var(--warning-bg)/80]',
      'visual': 'bg-gradient-to-r from-[var(--info-bg,var(--accent-bg))] to-[var(--info-bg,var(--accent-bg))/80]',
      'video': 'bg-gradient-to-r from-[var(--error-bg)] to-[var(--error-bg)/80]'
    };
    return colorMap[sectionKey] || 'bg-[var(--bg-surface)]';
  };

  const renderSectionHeader = (
    sectionKey: string,
    title: string,
    subtitle: string,
    done?: boolean
  ) => {
    const isOpen = isSectionOpen(sectionKey);
    const sectionColor = getSectionColor(sectionKey);
    const sectionIcon = getSectionIcon(sectionKey);
    return (
      <button
        type="button"
        className={`w-full px-4 py-3 flex items-center justify-between text-left ${sectionColor}`}
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {sectionIcon}
          {done === undefined ? null : done ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--success-text)] shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">{title}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{subtitle}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
    );
  };
  
  // 日志：检查当前镜头的质量评估数据
  useEffect(() => {
    console.log('🔍 检查镜头质量评估数据:', {
      shotId: shot.id,
      hasQualityAssessment: !!shot.qualityAssessment,
      qualityAssessment: shot.qualityAssessment
    });
  }, [shot]);
  
  return (
    <div className="w-[480px] bg-[var(--bg-deep)] flex flex-col h-full shadow-2xl animate-in slide-in-from-right-10 duration-300 relative z-20">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <span className="min-w-[3rem] h-8 px-2 bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-lg flex items-center justify-center font-bold font-mono text-[11px] whitespace-nowrap border border-[var(--accent-border)] shrink-0">
            {getShotDisplayNumber()}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[var(--text-primary)] font-bold text-sm">镜头详情</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest truncate" title={shot.cameraMovement}>
              {shot.cameraMovement}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevious}
            disabled={shotIndex === 0}
            className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={shotIndex === totalShots - 1}
            className="p-2 hover:bg-[var(--bg-hover)] rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[var(--border-secondary)] mx-2"></div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--error-hover-bg)] rounded text-[var(--text-tertiary)] hover:text-[var(--error-text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 质量评估概览 */}
        <section className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden">
          {renderSectionHeader('quality', '质量评估 (Quality Assessment)', '查看当前镜头可交付性')}
          {isSectionOpen('quality') && quality && (
            <div className="px-4 pb-4 border-t border-[var(--border-primary)] space-y-2">
              <div className="pt-3 flex items-center justify-between gap-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-mono border ${qualityBadgeClass}`}>
                  评分 {quality.score} · {qualityGradeLabel}
                </span>
                <button
                  type="button"
                  onClick={onReassessQuality}
                  className="px-2 py-1 rounded-md text-[10px] font-semibold border border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-bg)] flex items-center gap-1"
                  title="使用大模型重新评估当前镜头质量"
                >
                  <Sparkles className="w-3 h-3" />
                  重新评估
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{qualitySummary}</p>
              {qualityActionHint && (
                <p className="text-[10px] text-[var(--accent-text)] bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded px-2 py-1.5">
                  下一步建议：{qualityActionHint}
                </p>
              )}
              <p className="text-[10px] text-[var(--text-muted)]">
                来源：{qualitySourceLabel} · 评分时间：{new Date(quality.generatedAt).toLocaleString()}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">注：这里显示的是总分和等级，不是“warning条数”。点击每项右侧 ? 可查看评分依据。</p>
              <div className="space-y-1.5">
                {quality.checks.map((check) => (
                  <div key={check.key} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-16 text-[10px] font-mono ${check.passed ? 'text-[var(--success-text)]' : 'text-[var(--warning-text)]'}`}>
                        {check.score}/100
                      </span>
                      <span className="flex-1 text-[11px] text-[var(--text-tertiary)] truncate" title={check.details || check.label}>
                        {getCheckLabel(check.key, check.label)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedCheckKey((prev) => (prev === check.key ? null : check.key))}
                        className="p-1 rounded border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)]"
                        title="查看评分依据"
                      >
                        <CircleHelp className="w-3 h-3" />
                      </button>
                    </div>
                    {expandedCheckKey === check.key && (
                      <div className="ml-16 rounded border border-[var(--border-primary)] bg-[var(--bg-base)]/60 px-2 py-1.5 text-[10px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                        {check.details || '暂无评分依据。'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {isSectionOpen('quality') && !quality && (
            <div className="px-4 pb-4 border-t border-[var(--border-primary)]">
              <p className="pt-3 text-xs text-[var(--text-muted)]">当前镜头还没有质量评估结果。</p>
            </div>
          )}
        </section>

        {/* 场景环境 - 资产覆盖度 */}
        {scriptData && (
          <section className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden">
            {renderSectionHeader('context', '场景环境(Scene Context)', '资产覆盖度：场景、角色、道具')}
            {isSectionOpen('context') && (
              <div className="p-5 border-t border-[var(--border-primary)]">
                <SceneContext
                  shot={shot}
                  scene={scene}
                  scenes={scriptData.scenes}
                  characters={activeCharacters}
                  availableCharacters={availableCharacters}
                  props={activeProps}
                  availableProps={availablePropsForShot}
                  onAddCharacter={onAddCharacter}
                  onRemoveCharacter={onRemoveCharacter}
                  onVariationChange={onVariationChange}
                  onSceneChange={onSceneChange}
                  onAddProp={onAddProp}
                  onRemoveProp={onRemoveProp}
                />
              </div>
            )}
          </section>
        )}

        {/* 叙事动作 - 提示词完整度 */}
        <section className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden">
          {renderSectionHeader('narrative', '叙事动作 (Narrative Action)', '提示词完整度：动作描述与对话')}
          {isSectionOpen('narrative') && (
            <div className="p-5 border-t border-[var(--border-primary)] space-y-4">
              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onSplitShot}
                    disabled={isSplittingShot}
                    className="px-2 py-1 text-[var(--success-text)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded-md hover:bg-[var(--success-bg)]"
                    title="AI拆分镜头"
                  >
                    {isSplittingShot ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Scissors className="w-3 h-3" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">拆分镜头</span>
                  </button>
                  <button 
                    onClick={onGenerateAIAction}
                    disabled={isAIOptimizing}
                    className="px-2 py-1 text-[var(--accent-text)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded-md hover:bg-[var(--accent-bg)]"
                    title="AI生成动作建议"
                  >
                    {isAIOptimizing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI建议</span>
                  </button>
                  <button 
                    onClick={onEditActionSummary}
                    className="px-2 py-1 text-[var(--warning-text)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 rounded-md hover:bg-[var(--warning-bg)]"
                    title="编辑叙事动作"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">编辑动作</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border-primary)]">
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{shot.actionSummary}</p>
                </div>
                
                {shot.dialogue && (
                  <div className="bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border-primary)] flex gap-3">
                    <MessageSquare className="w-4 h-4 text-[var(--text-muted)] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[var(--text-tertiary)] text-xs italic leading-relaxed">
                        "{shot.dialogue}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 视觉制作 - 关键帧就绪度 */}
        <section className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden">
          {renderSectionHeader('visual', '视觉制作 (Visual Production)', '关键帧就绪度：起始帧与结束帧')}
          {isSectionOpen('visual') && (
            <div className="p-5 border-t border-[var(--border-primary)] space-y-6">
              <KeyframeEditor
                startKeyframe={startKf}
                endKeyframe={endKf}
                showEndFrame={showEndFrame}
                canCopyPrevious={shotIndex > 0}
                canCopyNext={shotIndex < totalShots - 1 && nextShotHasStartFrame}
                isAIOptimizing={isAIOptimizing}
                useAIEnhancement={useAIEnhancement}
                onToggleAIEnhancement={onToggleAIEnhancement}
                onGenerateKeyframe={onGenerateKeyframe}
                onUploadKeyframe={onUploadKeyframe}
                onEditPrompt={onEditKeyframePrompt}
                onOptimizeWithAI={onOptimizeKeyframeWithAI}
                onOptimizeBothWithAI={onOptimizeBothKeyframes}
                onCopyPrevious={onCopyPreviousEndFrame}
                onCopyNext={onCopyNextStartFrame}
                onDeleteKeyframe={onDeleteKeyframe}
                onImageClick={onImageClick}
              />
              
              {/* 九宫格分镜预览 - 高级功能 */}
              {localVideoModelId !== 'veo' && (
                <div className="space-y-3 pt-4 border-t border-[var(--border-secondary)]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={
                        nineGrid?.status === 'completed' || nineGrid?.status === 'panels_ready' || nineGrid?.status === 'generating_image'
                          ? onShowNineGrid 
                          : onGenerateNineGrid
                      }
                      disabled={nineGrid?.status === 'generating_panels' || nineGrid?.status === 'generating_image'}
                      className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        nineGrid?.status === 'generating_panels' || nineGrid?.status === 'generating_image'
                          ? 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-primary)] cursor-wait'
                          : nineGrid?.status === 'completed'
                            ? 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)] hover:bg-[var(--success-hover-bg)]'
                            : nineGrid?.status === 'panels_ready'
                              ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)] hover:bg-[var(--warning-hover-bg)]'
                              : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border-[var(--border-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                      title="九宫格分镜预览 - 使用AI将镜头拆分为9个不同视角的预览图"
                    >
                      {nineGrid?.status === 'generating_panels' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>镜头描述生成中...</span>
                        </>
                      ) : nineGrid?.status === 'generating_image' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>九宫格图片生成中...</span>
                        </>
                      ) : nineGrid?.status === 'panels_ready' ? (
                        <>
                          <Grid3x3 className="w-3.5 h-3.5" />
                          <span>查看/确认镜头描述</span>
                          <span className="ml-1 px-1.5 py-0.5 bg-[var(--warning-text)]/10 rounded text-[8px]">待确认</span>
                        </>
                      ) : nineGrid?.status === 'completed' ? (
                        <>
                          <Grid3x3 className="w-3.5 h-3.5" />
                          <span>查看九宫格分镜</span>
                          <span className="ml-1 px-1.5 py-0.5 bg-[var(--success-text)]/10 rounded text-[8px]">Advanced</span>
                        </>
                      ) : (
                        <>
                          <Grid3x3 className="w-3.5 h-3.5" />
                          <span>九宫格分镜预览</span>
                          <span className="ml-1 px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent-text)] rounded text-[8px]">Advanced</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Nine Grid thumbnail preview (if generated) */}
                  {nineGrid?.status === 'completed' && nineGrid.imageUrl && (
                    <div 
                      className="relative bg-[var(--bg-base)] rounded-lg border border-[var(--border-primary)] overflow-hidden cursor-pointer group"
                      onClick={onShowNineGrid}
                    >
                      <img
                        src={nineGrid.imageUrl}
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                        alt="九宫格分镜预览"
                      />
                      <div className="absolute inset-0 bg-[var(--bg-base)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[var(--text-primary)] text-xs font-mono">点击选择视角作为首帧</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 视频生成 - 视频执行状态 */}
        <section className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden">
          {renderSectionHeader('video', '视频生成 (Video Generation)', '视频执行状态：模型选择与设置')}
          {isSectionOpen('video') && (
            <div className="p-5 border-t border-[var(--border-primary)]">
              <VideoGenerator
                shot={shot}
                hasStartFrame={!!startKf?.imageUrl}
                hasEndFrame={!!endKf?.imageUrl}
                onGenerate={onGenerateVideo}
                onEditPrompt={onEditVideoPrompt}
                onModelChange={(modelId) => {
                  setLocalVideoModelId(modelId);
                  onVideoModelChange(modelId);
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShotWorkbench;