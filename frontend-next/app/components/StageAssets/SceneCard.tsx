'use client';

import React, { useState } from 'react';
import { MapPin, Check, Loader2, Trash2, Edit2, AlertCircle, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PromptEditor from './PromptEditor';
import ImageUploadButton from './ImageUploadButton';

interface SceneCardProps {
  scene: {
    id: string;
    location: string;
    time: string;
    atmosphere: string;
    visualPrompt?: string;
    referenceImage?: string;
    status?: 'pending' | 'generating' | 'completed' | 'failed';
  };
  isGenerating: boolean;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onPromptSave: (newPrompt: string) => void;
  onImageClick: (imageUrl: string) => void;
  onDelete: () => void;
  onUpdateInfo: (updates: { location?: string; time?: string; atmosphere?: string }) => void;
  onAddToLibrary: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isGenerating,
  onGenerate,
  onUpload,
  onPromptSave,
  onImageClick,
  onDelete,
  onUpdateInfo,
  onAddToLibrary,
}) => {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [isEditingAtmosphere, setIsEditingAtmosphere] = useState(false);
  const [editLocation, setEditLocation] = useState(scene.location);
  const [editTime, setEditTime] = useState(scene.time);
  const [editAtmosphere, setEditAtmosphere] = useState(scene.atmosphere);

  const handleSaveLocation = () => {
    if (editLocation.trim()) {
      onUpdateInfo({ location: editLocation.trim() });
      setIsEditingLocation(false);
    }
  };

  const handleSaveTime = () => {
    if (editTime.trim()) {
      onUpdateInfo({ time: editTime.trim() });
      setIsEditingTime(false);
    }
  };

  const handleSaveAtmosphere = () => {
    if (editAtmosphere.trim()) {
      onUpdateInfo({ atmosphere: editAtmosphere.trim() });
      setIsEditingAtmosphere(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group hover:border-border/80 transition-all hover:shadow-lg">
      <div 
        className="aspect-video bg-muted relative cursor-pointer"
        onClick={() => scene.referenceImage && onImageClick(scene.referenceImage)}
      >
        {scene.referenceImage ? (
          <>
            <img src={scene.referenceImage} alt={scene.location} className="w-full h-full object-cover" />
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
            ) : scene.status === 'failed' ? (
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
                <MapPin className="w-10 h-10 mb-3 opacity-10" />
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
          {isEditingLocation ? (
            <Input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              onBlur={handleSaveLocation}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveLocation()}
              autoFocus
              className="font-bold text-sm flex-1 min-w-0"
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0 group/location">
              <h3 className="font-bold text-sm text-foreground truncate" title={scene.location}>{scene.location}</h3>
              <Button
                onClick={() => {
                  setEditLocation(scene.location);
                  setIsEditingLocation(true);
                }}
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover/location:opacity-100 h-6 w-6"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          {isEditingTime ? (
            <Input
              type="text"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              onBlur={handleSaveTime}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveTime()}
              autoFocus
              className="text-[9px] uppercase font-mono w-24 shrink-0"
            />
          ) : (
            <span
              onClick={() => {
                setEditTime(scene.time);
                setIsEditingTime(true);
              }}
              className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[9px] rounded border border-border uppercase font-mono cursor-pointer hover:bg-muted/80 hover:text-foreground transition-colors shrink-0 whitespace-nowrap overflow-hidden max-w-[80px] text-center"
              title={scene.time}
            >
              {scene.time}
            </span>
          )}
        </div>
        {isEditingAtmosphere ? (
          <Input
            type="text"
            value={editAtmosphere}
            onChange={(e) => setEditAtmosphere(e.target.value)}
            onBlur={handleSaveAtmosphere}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveAtmosphere()}
            autoFocus
            className="text-[10px] w-full mb-3"
          />
        ) : (
          <p
            onClick={() => {
              setEditAtmosphere(scene.atmosphere);
              setIsEditingAtmosphere(true);
            }}
            className="text-[10px] text-muted-foreground line-clamp-1 mb-3 cursor-pointer hover:text-foreground transition-colors"
          >
            {scene.atmosphere}
          </p>
        )}

        {/* Scene Prompt Section */}
        <div className="mt-3 pt-3 border-t border-border">
          <PromptEditor
            prompt={scene.visualPrompt || ''}
            onSave={onPromptSave}
            label="场景提示词"
            placeholder="输入场景视觉描述..."
            maxHeight="max-h-[160px]"
          />
        </div>

        {/* Regenerate and Upload Buttons */}
        {scene.referenceImage && (
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
            删除场景
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
