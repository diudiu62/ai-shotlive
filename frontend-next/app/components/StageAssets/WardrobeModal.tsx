'use client';

import React, { useState } from 'react';
import { User, X, Shirt, Plus, RefreshCw, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Character } from '@/app/types/types';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WardrobeModalProps {
  character: Character;
  onClose: () => void;
  onAddVariation: (charId: string, name: string, prompt: string) => void;
  onDeleteVariation: (charId: string, varId: string) => void;
  onGenerateVariation: (charId: string, varId: string) => void;
  onUploadVariation: (charId: string, varId: string, file: File) => void;
  onImageClick: (imageUrl: string) => void;
}

const WardrobeModal: React.FC<WardrobeModalProps> = ({
  character,
  onClose,
  onAddVariation,
  onDeleteVariation,
  onGenerateVariation,
  onUploadVariation,
  onImageClick,
}) => {
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrompt, setNewVarPrompt] = useState('');

  const handleAddVariation = () => {
    if (newVarName && newVarPrompt) {
      onAddVariation(character.id, newVarName, newVarPrompt);
      setNewVarName('');
      setNewVarPrompt('');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border w-full max-w-4xl max-h-[90vh] rounded-2xl p-0 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-16 px-8 border-b border-border flex items-center justify-between shrink-0 bg-muted">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
              {character.referenceImage && (
                <img src={character.referenceImage} className="w-full h-full object-cover" alt={character.name} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{character.name}</h3>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Wardrobe & Variations</p>
            </div>
          </div>
          <DialogClose className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </DialogClose>
        </div>
        
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Base Look */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> Base Appearance
              </h4>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <div 
                  className="aspect-video bg-background rounded-lg overflow-hidden mb-4 relative cursor-pointer"
                  onClick={() => character.referenceImage && onImageClick(character.referenceImage)}
                >
                  {character.referenceImage ? (
                    <img src={character.referenceImage} className="w-full h-full object-cover" alt="Base" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-background/60 backdrop-blur rounded text-[10px] text-foreground font-bold uppercase border border-border">
                    Default
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">{character.visualPrompt}</p>
              </div>
            </div>

            {/* Variations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Shirt className="w-4 h-4" /> Variations / Outfits
                </h4>
              </div>

              <div className="space-y-4">
                {/* List */}
                {(character.variations || []).map((variation) => (
                  <div 
                    key={variation.id} 
                    className="flex gap-4 p-4 bg-muted border border-border rounded-xl group hover:border-border/80 transition-colors"
                  >
                    <div className="w-20 h-24 bg-background rounded-lg flex-shrink-0 overflow-hidden relative border border-border">
                      {variation.referenceImage ? (
                        <img 
                          src={variation.referenceImage} 
                          className="w-full h-full object-cover cursor-pointer" 
                          alt={variation.name}
                          onClick={() => onImageClick(variation.referenceImage!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {variation.status === 'failed' ? (
                            <AlertCircle className="w-6 h-6 text-destructive" />
                          ) : (
                            <Shirt className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      {variation.status === 'generating' && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                        </div>
                      )}
                      {variation.status === 'failed' && !variation.referenceImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-destructive/20 text-destructive text-[8px] text-center py-0.5">
                          失败
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-foreground text-sm">{variation.name}</h5>
                        <Button
                          onClick={() => onDeleteVariation(character.id, variation.id)}
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 font-mono">{variation.visualPrompt}</p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => onGenerateVariation(character.id, variation.id)}
                          disabled={variation.status === 'generating'}
                          variant={variation.status === 'failed' ? 'destructive' : 'default'}
                          className="text-xs font-bold uppercase tracking-wider gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${variation.status === 'generating' ? 'animate-spin' : ''}`} />
                          {variation.status === 'failed' ? '重试' : variation.referenceImage ? 'Regenerate' : 'Generate Look'}
                        </Button>
                        <label className="inline-flex items-center justify-center rounded-4xl border border-border bg-input/30 hover:bg-input/50 hover:text-foreground transition-all text-xs font-bold uppercase tracking-wider gap-1">
                            <Upload className="w-3 h-3" />
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onUploadVariation(character.id, variation.id, file);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New */}
                <div className="p-4 border border-dashed border-border rounded-xl bg-muted/50">
                  <div className="space-y-3">
                    <Input 
                      type="text" 
                      placeholder="Variation Name (e.g. Tactical Gear)" 
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="text-xs"
                    />
                    <Textarea 
                      placeholder="Visual description of outfit/state..."
                      value={newVarPrompt}
                      onChange={(e) => setNewVarPrompt(e.target.value)}
                      className="text-xs h-16"
                    />
                    <Button 
                      onClick={handleAddVariation}
                      disabled={!newVarName || !newVarPrompt}
                      className="w-full text-xs font-bold uppercase tracking-wider gap-2"
                    >
                      <Plus className="w-3 h-3" /> Add Variation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WardrobeModal;
