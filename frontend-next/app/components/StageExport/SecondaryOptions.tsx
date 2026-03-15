'use client';

import React from 'react';
import { Layers, Database, Clock, Loader2 } from 'lucide-react';
import { DownloadState } from './constants';
import { Button } from '@/components/ui/button';

interface Props {
  assetsDownloadState: DownloadState;
  onDownloadAssets: () => void;
  onShowLogs: () => void;
  onExportData: () => void;
  onImportData: () => void;
  isDataExporting: boolean;
  isDataImporting: boolean;
}

const SecondaryOptions: React.FC<Props> = ({
  assetsDownloadState,
  onDownloadAssets,
  onShowLogs,
  onExportData,
  onImportData,
  isDataExporting,
  isDataImporting
}) => {
  const { isDownloading, phase, progress } = assetsDownloadState;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Source Assets Download */}
      <div 
        onClick={onDownloadAssets}
        className={`p-6 border rounded-lg transition-all cursor-pointer group ${isDownloading ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary hover:bg-primary/5'}`}
      >
        {isDownloading && (
          <div className="flex flex-col items-center mb-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs text-primary font-mono">{phase}</p>
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        <Layers className={`w-5 h-5 mb-4 transition-colors ${
          isDownloading ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
        }`} />
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">Source Assets</h4>
          <p className="text-[10px] text-muted-foreground">Download all generated images and raw video clips.</p>
        </div>
      </div>

      {/* Export / Import Data */}
      <div className="p-6 border border-border rounded-lg bg-background">
        <Database className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">Export / Import</h4>
          <p className="text-[10px] text-muted-foreground">Export database & media files as ZIP, or import backup to a new user.</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onExportData();
              }}
              disabled={isDataExporting}
              variant="outline"
              size="sm"
              className="px-3 py-2 text-[10px]"
            >
              {isDataExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onImportData();
              }}
              disabled={isDataImporting}
              variant="outline"
              size="sm"
              className="px-3 py-2 text-[10px]"
            >
              {isDataImporting ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </div>

      {/* Render Logs */}
      <div 
        onClick={onShowLogs}
        className="p-6 border border-border rounded-lg transition-all cursor-pointer group hover:border-primary hover:bg-primary/5"
      >
        <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">Render Logs</h4>
          <p className="text-[10px] text-muted-foreground">View generation history and status.</p>
        </div>
      </div>
    </div>
  );
};

export default SecondaryOptions;
