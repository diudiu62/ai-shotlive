'use client';

import React from 'react';
import { Play, Download, FileVideo, Loader2, Scissors } from 'lucide-react';
import { DownloadState } from './constants';
import { useAlert } from '../GlobalAlert';
import { Button } from '@/components/ui/button';

interface Props {
  completedShotsCount: number;
  totalShots: number;
  progress: number;
  downloadState: DownloadState;
  onPreview: () => void;
  onDownloadMaster: () => void;
  onOpenCutOS?: () => void;
}

const ActionButtons: React.FC<Props> = ({
  completedShotsCount,
  totalShots,
  progress,
  downloadState,
  onPreview,
  onDownloadMaster,
  onOpenCutOS,
}) => {
  const { showAlert } = useAlert();
  const { isDownloading, phase, progress: downloadProgress } = downloadState;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button 
        onClick={onPreview}
        disabled={completedShotsCount === 0}
        variant={completedShotsCount > 0 ? 'default' : 'outline'}
        className={completedShotsCount > 0 ? 'bg-primary text-primary-foreground' : 'opacity-50 cursor-not-allowed'}
      >
        <Play className="w-4 h-4" />
        Preview Video ({completedShotsCount}/{totalShots})
      </Button>

      <Button 
        onClick={onDownloadMaster}
        disabled={progress < 100 || isDownloading} 
        variant={progress === 100 ? 'secondary' : 'outline'}
        className={
          isDownloading
            ? 'opacity-75 cursor-not-allowed'
            : progress === 100 
            ? 'bg-secondary text-secondary-foreground'
            : 'opacity-50 cursor-not-allowed'
        }
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isDownloading ? `${phase} ${downloadProgress}%` : 'Download Master (.mp4)'}
      </Button>
      <Button 
        variant={completedShotsCount > 0 ? 'outline' : 'outline'}
        onClick={onOpenCutOS}
        disabled={completedShotsCount === 0}
        className={completedShotsCount > 0 ? '' : 'opacity-50 cursor-not-allowed'}
      >
        <Scissors className="w-4 h-4" />
        AI 剪辑
      </Button>
      <Button 
        variant="outline"
        onClick={() => showAlert('暂未开发', { type: 'info', title: '提示' })}
      >
        <FileVideo className="w-4 h-4" />
        Export EDL / XML
      </Button>
    </div>
  );
};

export default ActionButtons;
