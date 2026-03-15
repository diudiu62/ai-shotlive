'use client';

import React from 'react';
import { Film } from 'lucide-react';
import { Shot, ScriptData, Status } from '@/app/types/types';
import { EditingPrompt } from './constants';
import { getDefaultVideoPrompt } from './utils';
import CollapsibleSection from './CollapsibleSection';
import PromptEditor from './PromptEditor';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';

interface Props {
  shots: Shot[];
  scriptData?: ScriptData;
  isExpanded: boolean;
  onToggle: () => void;
  editingPrompt: EditingPrompt;
  onStartEdit: (type: 'keyframe' | 'video', id: string, value: string, variationId: undefined, shotId: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPromptChange: (value: string) => void;
}

const KeyframeSection: React.FC<Props> = ({
  shots,
  scriptData,
  isExpanded,
  onToggle,
  editingPrompt,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPromptChange
}) => {
  if (shots.length === 0) return null;

  return (
    <CollapsibleSection
      title="分镜关键帧"
      icon={<Film className="w-5 h-5" />}
      count={shots.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {shots.map((shot, shotIndex) => {
        const scene = scriptData?.scenes.find(s => s.id === shot.sceneId);
        return (
          <div key={shot.id} className="p-4 border border-border rounded-lg bg-background mb-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                  镜头 {shotIndex + 1}
                </span>
                {scene && (
                  <span className="text-xs text-muted-foreground">
                    {scene.location}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{shot.actionSummary}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {shot.cameraMovement} · {shot.shotSize || '标准镜头'}
              </p>
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              {shot.keyframes.map((keyframe) => (
                <div key={keyframe.id} className="p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={
                        keyframe.type === 'start' 
                          ? 'px-2 py-1 bg-success/10 text-success text-xs font-bold rounded' 
                          : 'px-2 py-1 bg-warning/10 text-warning text-xs font-bold rounded'
                      }>
                        {keyframe.type === 'start' ? '起始帧' : '结束帧'}
                      </span>
                      <StatusBadge status={(keyframe.status || 'idle') as Status} />
                    </div>
                    <Button
                      onClick={() => onStartEdit('keyframe', keyframe.id, keyframe.visualPrompt, undefined, shot.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      编辑
                    </Button>
                  </div>

                  {editingPrompt?.type === 'keyframe' && 
                   editingPrompt.id === keyframe.id && 
                   editingPrompt.shotId === shot.id ? (
                    <PromptEditor
                      value={editingPrompt.value}
                      onChange={onPromptChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                      size="small"
                    />
                  ) : (
                    <p className="text-xs text-secondary">
                      {keyframe.visualPrompt}
                    </p>
                  )}

                  {keyframe.imageUrl && (
                    <div className="mt-2 rounded overflow-hidden border border-border">
                      <img 
                        src={keyframe.imageUrl} 
                        alt={`关键帧 ${keyframe.type}`}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Video Prompt Section */}
              {shot.interval && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="bg-primary/10 border border-primary/20 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                          视频生成提示词
                        </span>
                        <StatusBadge status={(shot.interval.status || 'idle') as Status} />
                      </div>
                      <Button
                        onClick={() => {
                          const defaultPrompt = shot.interval!.videoPrompt || getDefaultVideoPrompt(shot);
                          onStartEdit('video', shot.interval!.id, defaultPrompt, undefined, shot.id);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        编辑
                      </Button>
                    </div>

                    {editingPrompt?.type === 'video' && editingPrompt.shotId === shot.id ? (
                      <PromptEditor
                        value={editingPrompt.value}
                        onChange={onPromptChange}
                        onSave={onSaveEdit}
                        onCancel={onCancelEdit}
                        size="video"
                        isVideo={true}
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-secondary">
                          {shot.interval.videoPrompt || (
                            <span className="text-muted-foreground">
                              {getDefaultVideoPrompt(shot)}
                              <span className="block mt-1 text-warning">
                                ⚠ 此视频生成时未保存提示词，以上为推测内容
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </CollapsibleSection>
  );
};

export default KeyframeSection;
