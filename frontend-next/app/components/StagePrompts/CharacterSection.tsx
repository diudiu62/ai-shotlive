'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Character } from '@/app/types/types';
import { EditingPrompt } from './constants';
import CollapsibleSection from './CollapsibleSection';
import PromptEditor from './PromptEditor';
import { Button } from '@/components/ui/button';

interface Props {
  characters: Character[];
  isExpanded: boolean;
  onToggle: () => void;
  editingPrompt: EditingPrompt;
  onStartEdit: (type: 'character' | 'character-variation', id: string, value: string, variationId?: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onPromptChange: (value: string) => void;
}

const CharacterSection: React.FC<Props> = ({
  characters,
  isExpanded,
  onToggle,
  editingPrompt,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPromptChange
}) => {
  if (characters.length === 0) return null;

  return (
    <CollapsibleSection
      title="角色"
      icon={<User className="w-5 h-5" />}
      count={characters.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {characters.map(char => (
        <div key={char.id} className="p-4 border border-border rounded-lg bg-background mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-primary mb-1">{char.name}</h3>
              <p className="text-sm text-muted-foreground">
                {char.gender} · {char.age} · {char.personality}
              </p>
            </div>
            <Button
              onClick={() => onStartEdit('character', char.id, char.visualPrompt || '')}
              variant="outline"
              size="sm"
            >
              编辑
            </Button>
          </div>

          {editingPrompt?.type === 'character' && editingPrompt.id === char.id ? (
            <PromptEditor
              value={editingPrompt.value}
              onChange={onPromptChange}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
              size="large"
            />
          ) : (
            <p className="text-sm text-secondary">
              {char.visualPrompt || '未设置提示词'}
            </p>
          )}

          {/* Character Variations */}
          {char.variations && char.variations.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-bold">角色变体</h4>
              {char.variations.map(variation => (
                <div key={variation.id} className="p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-secondary">{variation.name}</span>
                    <Button
                      onClick={() => onStartEdit('character-variation', char.id, variation.visualPrompt, variation.id)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      编辑
                    </Button>
                  </div>

                  {editingPrompt?.type === 'character-variation' && 
                   editingPrompt.id === char.id && 
                   editingPrompt.variationId === variation.id ? (
                    <PromptEditor
                      value={editingPrompt.value}
                      onChange={onPromptChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                      size="small"
                    />
                  ) : (
                    <p className="text-xs text-secondary">
                      {variation.visualPrompt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </CollapsibleSection>
  );
};

export default CharacterSection;
