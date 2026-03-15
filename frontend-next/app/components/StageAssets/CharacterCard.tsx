'use client';

import React, { useState } from 'react';
import { User, Check, Shirt, Trash2, Edit2, AlertCircle, FolderPlus, Grid3x3 } from 'lucide-react';
import { Character } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PromptEditor from './PromptEditor';
import ImageUploadButton from './ImageUploadButton';

interface CharacterCardProps {
  character: Character;
  isGenerating: boolean;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onPromptSave: (newPrompt: string) => void;
  onOpenWardrobe: () => void;
  onOpenTurnaround: () => void;
  onImageClick: (imageUrl: string) => void;
  onDelete: () => void;
  onUpdateInfo: (updates: { name?: string; gender?: string; age?: string; personality?: string }) => void;
  onAddToLibrary: () => void;
  onReplaceFromLibrary: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isGenerating,
  onGenerate,
  onUpload,
  onPromptSave,
  onOpenWardrobe,
  onOpenTurnaround,
  onImageClick,
  onDelete,
  onUpdateInfo,
  onAddToLibrary,
  onReplaceFromLibrary,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [editName, setEditName] = useState(character.name);
  const [editGender, setEditGender] = useState(character.gender);
  const [editAge, setEditAge] = useState(character.age);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateInfo({ name: editName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSaveGender = () => {
    if (editGender.trim()) {
      onUpdateInfo({ gender: editGender.trim() });
      setIsEditingGender(false);
    }
  };

  const handleSaveAge = () => {
    if (editAge.trim()) {
      onUpdateInfo({ age: editAge.trim() });
      setIsEditingAge(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group hover:border-border/80 transition-all hover:shadow-lg">
      <div className="flex gap-4 p-4 pb-0">
        {/* Character Image */}
        <div className="w-48 flex-shrink-0">
          <div 
            className="aspect-video bg-muted relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => character.referenceImage && onImageClick(character.referenceImage)}
          >
            {character.referenceImage ? (
              <>
                <img src={character.referenceImage} alt={character.name} className="w-full h-full object-cover" />
                <div className="absolute top-1.5 right-1.5 p-1 bg-primary text-primary-foreground rounded shadow-lg">
                  <Check className="w-3 h-3" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                {character.status === 'failed' ? (
                  <>
                    <AlertCircle className="w-8 h-8 mb-2 text-destructive" />
                    <span className="text-[10px] text-destructive mb-2">生成失败</span>
                    <ImageUploadButton
                      variant="inline"
                      size="small"
                      onUpload={onUpload}
                      onGenerate={onGenerate}
                      isGenerating={isGenerating}
                      uploadLabel="上传"
                      generateLabel="重试"
                    />
                  </>
                ) : (
                  <>
                    <User className="w-8 h-8 mb-2 opacity-10" />
                    <ImageUploadButton
                      variant="inline"
                      size="small"
                      onUpload={onUpload}
                      onGenerate={onGenerate}
                      isGenerating={isGenerating}
                      uploadLabel="上传"
                      generateLabel="生成"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Character Info & Actions */}
        <div className="flex-1 flex flex-col min-w-0 justify-between">
          {/* Header */}
          <div>
            {isEditingName ? (
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="font-bold text-lg mb-1"
              />
            ) : (
              <div className="flex items-center gap-2 mb-1 group/name">
                <h3 className="font-bold text-lg text-foreground">{character.name}</h3>
                <Button
                  onClick={() => {
                    setEditName(character.name);
                    setIsEditingName(true);
                  }}
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover/name:opacity-100 h-6 w-6"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              {isEditingGender ? (
                <Input
                  type="text"
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  onBlur={handleSaveGender}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveGender()}
                  autoFocus
                  className="text-[10px] font-mono uppercase w-20"
                />
              ) : (
                <span
                  onClick={() => {
                    setEditGender(character.gender);
                    setIsEditingGender(true);
                  }}
                  className="text-[10px] text-muted-foreground font-mono uppercase bg-muted px-2 py-0.5 rounded cursor-pointer hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  {character.gender}
                </span>
              )}
              {isEditingAge ? (
                <Input
                  type="text"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  onBlur={handleSaveAge}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveAge()}
                  autoFocus
                  className="text-[10px] w-20"
                />
              ) : (
                <span
                  onClick={() => {
                    setEditAge(character.age);
                    setIsEditingAge(true);
                  }}
                  className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {character.age}
                </span>
              )}
              {character.variations && character.variations.length > 0 && (
                <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <Shirt className="w-2.5 h-2.5" /> +{character.variations.length}
                </span>
              )}
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col gap-2 mt-2">
            {/* Manage Wardrobe Button */}
            <Button 
              onClick={onOpenWardrobe}
              className="w-full py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5"
            >
              <Shirt className="w-3 h-3" />
              服装变体
            </Button>

            {/* Turnaround Sheet Button */}
            <Button 
              onClick={onOpenTurnaround}
              className={`w-full py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5 ${
                character.turnaround?.status === 'completed'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
            >
              <Grid3x3 className="w-3 h-3" />
              造型九宫格
              {character.turnaround?.status === 'completed' && (
                <Check className="w-2.5 h-2.5" />
              )}
            </Button>

            {/* Upload Button */}
            {character.referenceImage && (
              <div className="w-full">
                <ImageUploadButton
                  variant="separate"
                  hasImage={true}
                  onUpload={onUpload}
                  onGenerate={onGenerate}
                  isGenerating={isGenerating}
                  uploadLabel="上传"
                />
              </div>
            )}

            <Button
              onClick={onReplaceFromLibrary}
              disabled={isGenerating}
              className="w-full py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5"
            >
              <FolderPlus className="w-3 h-3" />
              从资产库替换
            </Button>
          </div>
        </div>
      </div>

      {/* Prompt Section & Generate Button */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Prompt Section */}
        <div className="flex-1 mb-3">
          <PromptEditor
            prompt={character.visualPrompt || ''}
            onSave={onPromptSave}
            label="角色提示词"
            placeholder="输入角色的视觉描述..."
          />
        </div>

        <Button
          onClick={onAddToLibrary}
          disabled={isGenerating}
          className="w-full py-2 mt-2 text-xs font-bold uppercase tracking-wider gap-2"
        >
          <FolderPlus className="w-3 h-3" />
          加入资产库
        </Button>

        {/* Delete Button */}
        <Button
          onClick={onDelete}
          disabled={isGenerating}
          variant="destructive"
          className="w-full py-2 mt-2 text-xs font-bold uppercase tracking-wider gap-2"
        >
          <Trash2 className="w-3 h-3" />
          删除角色
        </Button>
      </div>
    </div>
  );
};

export default CharacterCard;
