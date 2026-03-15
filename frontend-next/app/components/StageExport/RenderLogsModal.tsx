'use client';

import React from 'react';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { RenderLog } from '@/app/types/types';
import { 
  formatTimestamp, 
  formatDuration, 
  getLogStats, 
  getLogTypeIcon, 
  getStatusColorClass,
  hasLogDetails 
} from './utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  logs: RenderLog[];
  expandedLogId: string | null;
  onClose: () => void;
  onToggleExpand: (logId: string) => void;
}

const RenderLogsModal: React.FC<Props> = ({
  logs,
  expandedLogId,
  onClose,
  onToggleExpand
}) => {
  const stats = getLogStats(logs);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <DialogTitle className="text-xl font-bold text-primary">Render Logs</DialogTitle>
            <span className="px-2 py-0.5 bg-muted border border-border text-muted-foreground text-[10px] rounded uppercase font-mono tracking-wider">
              {logs.length} Events
            </span>
          </div>
          <DialogClose>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Stats Panel */}
        <div className="py-4 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Events</div>
              <div className="text-2xl font-mono font-bold text-primary">{stats.total}</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Completed</div>
              <div className="text-2xl font-mono font-bold text-success">{stats.success}</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Failed</div>
              <div className="text-2xl font-mono font-bold text-destructive">{stats.failed}</div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="max-h-[50vh] overflow-y-auto py-4">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-mono uppercase tracking-widest">No generation history available</p>
            </div>
          ) : (
            logs.map((log) => {
              const statusColor = getStatusColorClass(log.status).replace(/text-\[var\(--.*?\)\]/g, (match) => {
                if (match.includes('success')) return 'text-success';
                if (match.includes('error')) return 'text-destructive';
                return 'text-warning';
              }).replace(/bg-\[var\(--.*?\)\]/g, (match) => {
                if (match.includes('success')) return 'bg-success/10';
                if (match.includes('error')) return 'bg-destructive/10';
                return 'bg-warning/10';
              }).replace(/border-\[var\(--.*?\)\]/g, (match) => {
                if (match.includes('success')) return 'border-success/20';
                if (match.includes('error')) return 'border-destructive/20';
                return 'border-warning/20';
              });
              const typeIcon = getLogTypeIcon(log.type);
              const isExpanded = expandedLogId === log.id;
              const hasDetails = hasLogDetails(log);
              
              return (
                <div key={log.id} className="mb-4 border border-border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onToggleExpand(log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{typeIcon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-primary">{log.resourceName}</h4>
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border ${statusColor}`}>
                            {log.status}
                          </span>
                          {log.duration && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground bg-muted rounded border border-border">
                              {formatDuration(log.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span className="font-mono">{formatTimestamp(log.timestamp)}</span>
                          <span className="text-muted-foreground">|</span>
                          <span className="uppercase tracking-wider">{log.model}</span>
                          <span className="text-muted-foreground">|</span>
                          <span className="uppercase tracking-wider text-muted-foreground">{log.type}</span>
                        </div>
                        {log.error && (
                          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-[10px] text-destructive">
                            {log.error}
                          </div>
                        )}
                      </div>
                      {hasDetails && (
                        <Button variant="ghost" size="icon" className="mt-1 text-muted-foreground hover:text-primary">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && hasDetails && (
                    <div className="p-4 border-t border-border bg-muted/30">
                      {log.resourceId && (
                        <div className="mb-3">
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Resource ID</div>
                          <div className="text-[10px] text-muted-foreground font-mono bg-background px-2 py-1 rounded">
                            {log.resourceId}
                          </div>
                        </div>
                      )}
                      
                      {log.prompt && (
                        <div className="mb-3">
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Prompt</div>
                          <div className="text-[10px] text-secondary bg-background px-3 py-2 rounded max-h-32 overflow-y-auto">
                            {log.prompt}
                          </div>
                        </div>
                      )}
                      
                      {(log.inputTokens || log.outputTokens || log.totalTokens) && (
                        <div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Token Usage</div>
                          <div className="flex flex-wrap gap-4 text-[10px]">
                            {log.inputTokens && (
                              <div className="bg-background px-2 py-1 rounded">
                                <span className="text-muted-foreground">Input:</span>
                                <span className="text-primary font-mono ml-1">{log.inputTokens}</span>
                              </div>
                            )}
                            {log.outputTokens && (
                              <div className="bg-background px-2 py-1 rounded">
                                <span className="text-muted-foreground">Output:</span>
                                <span className="text-primary font-mono ml-1">{log.outputTokens}</span>
                              </div>
                            )}
                            {log.totalTokens && (
                              <div className="bg-background px-2 py-1 rounded">
                                <span className="text-muted-foreground">Total:</span>
                                <span className="text-primary font-mono ml-1">{log.totalTokens}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button onClick={onClose} variant="default" className="px-4 py-2 text-xs font-bold uppercase tracking-widest">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenderLogsModal;
