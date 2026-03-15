'use client';

import React from 'react';
import { Clock, List, ArrowLeft, TextQuote, Plus } from 'lucide-react';
import { ProjectState } from '@/app/types/types';
import { deduplicateScenes } from './utils';
import CharacterList from './CharacterList';
import SceneList from './SceneList';
import ShotRow from './ShotRow';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Props {
  project: ProjectState;
  editingCharacterId: string | null;
  editingCharacterPrompt: string;
  editingShotId: string | null;
  editingShotPrompt: string;
  editingShotCharactersId: string | null;
  editingShotActionId: string | null;
  editingShotActionText: string;
  editingShotDialogueText: string;
  onEditCharacter: (charId: string, prompt: string) => void;
  onSaveCharacter: (charId: string, prompt: string) => void;
  onCancelCharacterEdit: () => void;
  onEditShotPrompt: (shotId: string, prompt: string) => void;
  onSaveShotPrompt: () => void;
  onCancelShotPrompt: () => void;
  onEditShotCharacters: (shotId: string) => void;
  onAddCharacterToShot: (shotId: string, charId: string) => void;
  onRemoveCharacterFromShot: (shotId: string, charId: string) => void;
  onCloseShotCharactersEdit: () => void;
  onEditShotAction: (shotId: string, action: string, dialogue: string) => void;
  onSaveShotAction: () => void;
  onCancelShotAction: () => void;
  onAddShot: (sceneId: string) => void;
  onAddSubShot: (shotId: string) => void;
  onDeleteShot: (shotId: string) => void;
  onBackToStory: () => void;
}

const SceneBreakdown: React.FC<Props> = ({
  project,
  editingCharacterId,
  editingCharacterPrompt,
  editingShotId,
  editingShotPrompt,
  editingShotCharactersId,
  editingShotActionId,
  editingShotActionText,
  editingShotDialogueText,
  onEditCharacter,
  onSaveCharacter,
  onCancelCharacterEdit,
  onEditShotPrompt,
  onSaveShotPrompt,
  onCancelShotPrompt,
  onEditShotCharacters,
  onAddCharacterToShot,
  onRemoveCharacterFromShot,
  onCloseShotCharactersEdit,
  onEditShotAction,
  onSaveShotAction,
  onCancelShotAction,
  onAddShot,
  onAddSubShot,
  onDeleteShot,
  onBackToStory
}) => {
  const uniqueScenes = deduplicateScenes(project.scriptData?.scenes);

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Header */}
      <div className="h-16 px-6 bg-card flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-light text-foreground tracking-tight flex items-center gap-3">
            <List className="w-5 h-5 text-muted-foreground" />
            拍摄清单
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider ml-1">Script Manifest</span>
          </h2>
          <div className="h-6 w-px bg-border"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">项目</span>
              <span className="text-sm text-foreground font-medium">{project.scriptData?.title}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">时长</span>
              <span className="text-sm font-mono text-muted-foreground">{project.targetDuration}</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onBackToStory}
          variant="secondary"
          size="sm"
          className="text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" />
          返回编辑
        </Button>
      </div>
      <Separator />

      {/* Content Split View */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-72 bg-card flex flex-col hidden lg:flex">
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <TextQuote className="w-3 h-3" /> 故事梗概
            </h3>
            <p className="text-xs text-muted-foreground italic leading-relaxed font-serif">{project.scriptData?.logline}</p>
          </div>
          <Separator />

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <CharacterList
              characters={project.scriptData?.characters || []}
              editingCharacterId={editingCharacterId}
              editingPrompt={editingCharacterPrompt}
              onEdit={onEditCharacter}
              onSave={onSaveCharacter}
              onCancel={onCancelCharacterEdit}
            />

            <SceneList scenes={uniqueScenes} />
          </div>
        </div>

        {/* Main: Script & Shots */}
        <div className="flex-1 overflow-y-auto bg-background p-0">
          <div className="max-w-5xl mx-auto pb-20">
            {project.scriptData?.scenes.map((scene, index) => {
              const sceneShots = project.shots.filter(s => s.sceneId === scene.id);

              return (
                <div key={scene.id}>
                  {/* Scene Header */}
                  <div className="sticky top-0 z-10 bg-card/95 backdrop-blur px-8 py-5 flex items-center justify-between shadow-lg shadow-black/20">
                    <div className="flex items-baseline gap-4">
                      <span className="text-3xl font-bold text-foreground/10 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                      <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">
                        {scene.location}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {scene.time}</span>
                      <span className="text-muted-foreground">|</span>
                      <span>{scene.atmosphere}</span>
                      <Button
                        onClick={() => onAddShot(scene.id)}
                        variant="secondary"
                        size="sm"
                        className="ml-2 text-xs flex items-center gap-1.5"
                        title="追加分镜：有镜头时会自动生成子分镜"
                      >
                        <Plus className="w-3 h-3" />
                        新增分镜
                      </Button>
                    </div>
                  </div>
                  <Separator />

                  {/* Shot Rows */}
                  {sceneShots.length === 0 ? (
                    <div className="px-8 py-10 text-sm text-muted-foreground">
                      当前场景还没有分镜，点击“新增分镜”开始补充。
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {sceneShots.map((shot) => (
                        <ShotRow
                          key={shot.id}
                          shot={shot}
                          shotNumber={project.shots.indexOf(shot) + 1}
                          scriptData={project.scriptData || undefined}
                          editingShotId={editingShotId}
                          editingShotPrompt={editingShotPrompt}
                          editingShotCharactersId={editingShotCharactersId}
                          editingShotActionId={editingShotActionId}
                          editingShotActionText={editingShotActionText}
                          editingShotDialogueText={editingShotDialogueText}
                          onEditPrompt={onEditShotPrompt}
                          onSavePrompt={onSaveShotPrompt}
                          onCancelPrompt={onCancelShotPrompt}
                          onEditCharacters={onEditShotCharacters}
                          onAddCharacter={onAddCharacterToShot}
                          onRemoveCharacter={onRemoveCharacterFromShot}
                          onCloseCharactersEdit={onCloseShotCharactersEdit}
                          onEditAction={onEditShotAction}
                          onSaveAction={onSaveShotAction}
                          onCancelAction={onCancelShotAction}
                          onAddSubShot={onAddSubShot}
                          onDeleteShot={onDeleteShot}
                        />
                      ))}
                    </div>
                  )}
                  <Separator />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneBreakdown;
