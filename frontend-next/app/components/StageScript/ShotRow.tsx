'use client';

import React from 'react';
import { Aperture, Edit2, Check, X, UserPlus, Trash2, Plus } from 'lucide-react';
import { Shot, ScriptData } from '@/app/types/types';
import InlineEditor from './InlineEditor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
  shot: Shot;
  shotNumber: number;
  scriptData?: ScriptData;
  editingShotId: string | null;
  editingShotPrompt: string;
  editingShotCharactersId: string | null;
  editingShotActionId: string | null;
  editingShotActionText: string;
  editingShotDialogueText: string;
  onEditPrompt: (shotId: string, prompt: string) => void;
  onSavePrompt: () => void;
  onCancelPrompt: () => void;
  onEditCharacters: (shotId: string) => void;
  onAddCharacter: (shotId: string, charId: string) => void;
  onRemoveCharacter: (shotId: string, charId: string) => void;
  onCloseCharactersEdit: () => void;
  onEditAction: (shotId: string, action: string, dialogue: string) => void;
  onSaveAction: () => void;
  onCancelAction: () => void;
  onAddSubShot: (shotId: string) => void;
  onDeleteShot: (shotId: string) => void;
}

const ShotRow: React.FC<Props> = ({
  shot,
  shotNumber,
  scriptData,
  editingShotId,
  editingShotPrompt,
  editingShotCharactersId,
  editingShotActionId,
  editingShotActionText,
  editingShotDialogueText,
  onEditPrompt,
  onSavePrompt,
  onCancelPrompt,
  onEditCharacters,
  onAddCharacter,
  onRemoveCharacter,
  onCloseCharactersEdit,
  onEditAction,
  onSaveAction,
  onCancelAction,
  onAddSubShot,
  onDeleteShot
}) => {
  // 防御：shot.characters 可能来自旧数据或异常 JSON 解析，确保始终为数组
  const shotChars = Array.isArray(shot.characters) ? shot.characters : [];

  // 从shot.id中提取显示编号
  // 例如：shot-1 → "SHOT 001", shot-1-1 → "SHOT 001-1"
  const getShotDisplayNumber = () => {
    const idParts = shot.id.split('-').slice(1); // 移除 "shot" 前缀
    if (idParts.length === 1) {
      // 主镜头：shot-1 → "SHOT 001"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}`;
    } else if (idParts.length === 2) {
      // 子镜头：shot-1-1 → "SHOT 001-1"
      return `SHOT ${String(idParts[0]).padStart(3, '0')}-${idParts[1]}`;
    } else {
      // 降级方案：使用传入的shotNumber
      return `SHOT ${shotNumber.toString().padStart(3, '0')}`;
    }
  };

  return (
    <div className="group bg-background hover:bg-card transition-colors p-8 flex gap-8">
      {/* Shot ID & Tech Data */}
      <div className="w-32 flex-shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{getShotDisplayNumber()}</span>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => onAddSubShot(shot.id)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              title="新增子分镜"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => onDeleteShot(shot.id)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              title="删除分镜"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="px-2 py-1 bg-card border border-border text-[10px] font-mono text-muted-foreground uppercase text-center rounded">
            {shot.shotSize || 'MED'}
          </div>
          <div className="px-2 py-1 bg-card border border-border text-[10px] font-mono text-muted-foreground uppercase text-center rounded">
            {shot.cameraMovement}
          </div>
        </div>
      </div>

      {/* Main Action */}
      <div className="flex-1 space-y-4">
        {editingShotActionId === shot.id ? (
          <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">动作描述</Label>
              <textarea
                value={editingShotActionText}
                onChange={(e) => onEditAction(shot.id, e.target.value, editingShotDialogueText)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:border-primary focus:outline-none resize-none"
                rows={3}
                placeholder="输入动作描述..."
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">台词（可选）</Label>
              <textarea
                value={editingShotDialogueText}
                onChange={(e) => onEditAction(shot.id, editingShotActionText, e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:border-primary focus:outline-none resize-none font-serif italic"
                rows={2}
                placeholder="输入台词（留空表示无台词）..."
              />
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={onSaveAction} size="sm" className="text-xs flex items-center gap-1">
                <Check className="w-3 h-3" />
                保存
              </Button>
              <Button onClick={onCancelAction} variant="secondary" size="sm" className="text-xs flex items-center gap-1">
                <X className="w-3 h-3" />
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative group/action">
            <div className="flex items-start gap-2">
              <p className="text-foreground text-sm leading-7 font-medium max-w-2xl flex-1">
                {shot.actionSummary}
              </p>
              <Button
                onClick={() => onEditAction(shot.id, shot.actionSummary, shot.dialogue || '')}
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover/action:opacity-100"
                title="编辑动作和台词"
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
            
            {shot.dialogue && (
              <div className="pl-6 border-l-2 border-border group-hover:border-primary transition-colors py-1 mt-3">
                <p className="text-muted-foreground font-serif italic text-sm">{shot.dialogue}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Characters */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">角色</span>
            <Button
              onClick={() => onEditCharacters(shot.id)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              title="编辑角色列表"
            >
              <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
          
          {editingShotCharactersId === shot.id ? (
            <div className="space-y-3 p-3 bg-card border border-border rounded-lg">
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">当前角色</div>
                <div className="flex flex-wrap gap-2">
                  {shotChars.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">无角色</span>
                  ) : (
                    shotChars.map(cid => {
                      const char = scriptData?.characters.find(c => c.id === cid);
                      return char ? (
                        <div key={cid} className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-foreground border border-border px-2 py-1 rounded-md bg-card">
                          <span>{char.name}</span>
                          <Button
                            onClick={() => onRemoveCharacter(shot.id, cid)}
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            title="移除角色"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">添加角色</div>
                <div className="flex flex-wrap gap-2">
                  {scriptData?.characters
                    .filter(char => !shotChars.includes(char.id))
                    .map(char => (
                      <Button
                        key={char.id}
                        onClick={() => onAddCharacter(shot.id, char.id)}
                        variant="secondary"
                        size="sm"
                        className="text-[10px] flex items-center gap-1"
                        title="添加角色"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{char.name}</span>
                      </Button>
                    ))}
                  {scriptData?.characters.filter(char => !shotChars.includes(char.id)).length === 0 && (
                    <span className="text-xs text-muted-foreground italic">所有角色已添加</span>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <Button
                  onClick={onCloseCharactersEdit}
                  variant="secondary"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  完成
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              {shotChars.length === 0 ? (
                <span className="text-[10px] text-muted-foreground italic">无角色</span>
              ) : (
                shotChars.map(cid => {
                  const char = scriptData?.characters.find(c => c.id === cid);
                  return char ? (
                    <span key={cid} className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full bg-card">
                      {char.name}
                    </span>
                  ) : null;
                })
              )}
            </div>
          )}
        </div>

        {/* Mobile Prompt Editor */}
        <div className="xl:hidden pt-4 border-t border-border">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2">
              <Aperture className="w-3 h-3" /> 画面提示词
            </span>
            {editingShotId !== shot.id && (
              <Button
                onClick={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
                variant="secondary"
                size="sm"
                className="text-xs p-1.5"
                title="编辑提示词"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <InlineEditor
            isEditing={editingShotId === shot.id}
            value={editingShotId === shot.id ? editingShotPrompt : shot.keyframes[0]?.visualPrompt || ''}
            onEdit={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
            onChange={(val) => onEditPrompt(shot.id, val)}
            onSave={onSavePrompt}
            onCancel={onCancelPrompt}
            placeholder="输入画面提示词..."
            rows={6}
            mono={true}
            showEditButton={false}
          />
        </div>
      </div>

      {/* Prompt Preview (Desktop) */}
      <div className="w-64 hidden xl:block pl-6 border-l border-border">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            <Aperture className="w-3 h-3" /> 画面提示词
          </span>
          {editingShotId !== shot.id && (
            <Button
              onClick={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              title="编辑提示词"
            >
              <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </div>
        <InlineEditor
          isEditing={editingShotId === shot.id}
          value={editingShotId === shot.id ? editingShotPrompt : shot.keyframes[0]?.visualPrompt || ''}
          onEdit={() => onEditPrompt(shot.id, shot.keyframes[0]?.visualPrompt || '')}
          onChange={(val) => onEditPrompt(shot.id, val)}
          onSave={onSavePrompt}
          onCancel={onCancelPrompt}
          placeholder="输入画面提示词..."
          rows={8}
          mono={true}
          showEditButton={false}
        />
      </div>
    </div>
  );
};

export default ShotRow;
