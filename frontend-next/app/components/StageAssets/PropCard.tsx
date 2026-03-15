'use client';

import React, { useState } from 'react';
import { Package, Check, Loader2, Trash2, Edit2, AlertCircle, FolderPlus } from 'lucide-react';
import { Prop } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROP_CATEGORIES } from './constants';
import PromptEditor from './PromptEditor';
import ImageUploadButton from './ImageUploadButton';

interface PropCardProps {
  prop: Prop;
  isGenerating: boolean;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onPromptSave: (newPrompt: string) => void;
  onImageClick: (imageUrl: string) => void;
  onDelete: () => void;
  onUpdateInfo: (updates: { name?: string; category?: string; description?: string }) => void;
  onAddToLibrary: () => void;
}

const PropCard: React.FC<PropCardProps> = ({
  prop,
  isGenerating,
  onGenerate,
  onUpload,
  onPromptSave,
  onImageClick,
  onDelete,
  onUpdateInfo,
  onAddToLibrary,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editName, setEditName] = useState(prop.name);
  const [editDescription, setEditDescription] = useState(prop.description);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateInfo({ name: editName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSaveDescription = () => {
    onUpdateInfo({ description: editDescription.trim() });
    setIsEditingDescription(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group hover:border-border/80 transition-all hover:shadow-lg">
      <div 
        className="aspect-video bg-muted relative cursor-pointer"
        onClick={() => prop.referenceImage && onImageClick(prop.referenceImage)}
      >
        {prop.referenceImage ? (
          <>
            <img src={prop.referenceImage} alt={prop.name} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 p-1 bg-primary text-primary-foreground rounded shadow-lg backdrop-blur">
              <Check className="w-3 h-3" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            {isGenerating ? (
              <>
                <Loader2 className="w-10 h-10 mb-3 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">生成中...</span>
              </>
            ) : prop.status === 'failed' ? (
              <>
                <AlertCircle className="w-10 h-10 mb-3 text-destructive" />
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
                <Package className="w-10 h-10 mb-3 opacity-10" />
                <ImageUploadButton
                  variant="inline"
                  size="medium"
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
      
      <div className="p-3 border-t border-border bg-background">
        <div className="flex justify-between items-center mb-1 gap-2">
          {isEditingName ? (
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className="font-bold text-sm flex-1 min-w-0"
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0 group/name">
              <h3 className="font-bold text-sm text-foreground truncate" title={prop.name}>{prop.name}</h3>
              <Button
                onClick={() => {
                  setEditName(prop.name);
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
          <Select value={prop.category || ''} onValueChange={(value) => value && onUpdateInfo({ category: value })}>
            <SelectTrigger className="w-[120px] h-6 text-[9px] font-mono">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              {PROP_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        {isEditingDescription ? (
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onBlur={handleSaveDescription}
            autoFocus
            rows={2}
            className="text-[10px] w-full mb-3 resize-none"
            placeholder="描述这个道具的外观特征..."
          />
        ) : (
          <p
            onClick={() => {
              setEditDescription(prop.description);
              setIsEditingDescription(true);
            }}
            className="text-[10px] text-muted-foreground line-clamp-2 mb-3 cursor-pointer hover:text-foreground transition-colors min-h-[28px]"
          >
            {prop.description || '点击添加道具描述...'}
          </p>
        )}

        {/* Prop Prompt Section */}
        <div className="mt-3 pt-3 border-t border-border">
          <PromptEditor
            prompt={prop.visualPrompt || ''}
            onSave={onPromptSave}
            label="道具提示词"
            placeholder="输入道具的视觉描述..."
            maxHeight="max-h-[160px]"
          />
        </div>

        {/* Regenerate and Upload Buttons */}
        {prop.referenceImage && (
          <div className="mt-3 pt-3 border-t border-border">
            <ImageUploadButton
              variant="separate"
              hasImage={true}
              onUpload={onUpload}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              uploadLabel="上传图片"
            />
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          <Button
            onClick={onAddToLibrary}
            disabled={isGenerating}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider gap-2"
          >
            <FolderPlus className="w-3 h-3" />
            加入资产库
          </Button>
        </div>

        {/* Delete Button */}
        <div className="mt-3 pt-3 border-t border-border">
          <Button
            onClick={onDelete}
            disabled={isGenerating}
            variant="destructive"
            className="w-full py-2 text-xs font-bold uppercase tracking-wider gap-2"
          >
            <Trash2 className="w-3 h-3" />
            删除道具
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropCard;
