'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Option {
  label: string;
  value: string;
  desc?: string;
}

interface Props {
  label: string;
  icon?: React.ReactNode;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  customInput?: string;
  onCustomInputChange?: (value: string) => void;
  customPlaceholder?: string;
  gridCols?: 1 | 2;
  helpText?: string;
  helpLink?: { text: string; url: string };
}

const OptionSelector: React.FC<Props> = ({
  label,
  icon,
  options,
  value,
  onChange,
  customInput,
  onCustomInputChange,
  customPlaceholder,
  gridCols = 2,
  helpText,
  helpLink
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className={`grid grid-cols-${gridCols} gap-2`}>
        {options.map((opt) => (
          <Button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.desc}
            variant={value === opt.value ? "default" : "secondary"}
            size="sm"
            className={`text-[11px] text-${gridCols === 1 ? 'left' : 'center'}`}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      {value === 'custom' && onCustomInputChange && (
        <div className="pt-1">
          <Input 
            type="text"
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            className="font-mono"
            placeholder={customPlaceholder}
          />
        </div>
      )}
      {helpText && (
        <div className="pt-1 px-3 py-2 bg-muted border border-border rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 提示：{helpText}
            {helpLink && (
              <>
                {' '}
                <a 
                  href={helpLink.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors font-medium"
                >
                  {helpLink.text}
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default OptionSelector;
