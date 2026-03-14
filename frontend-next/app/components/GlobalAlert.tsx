'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type AlertType = 'info' | 'success' | 'error' | 'warning';

interface AlertOptions {
  title?: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoDismiss?: boolean;
  autoDismissMs?: number;
}

interface AlertContextType {
  showAlert: (message: string, options?: AlertOptions) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertState {
  isOpen: boolean;
  message: string;
  title?: string;
  type: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoDismiss?: boolean;
  autoDismissMs?: number;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const callbacksRef = useRef<{ onConfirm?: () => void; onCancel?: () => void }>({});
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const clearAutoDismissTimer = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  }, []);

  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    clearAutoDismissTimer();
    const onConfirm = options?.onConfirm;
    const onCancel = options?.onCancel;
    callbacksRef.current = { onConfirm, onCancel };

    const isSuccess = (options?.type || 'info') === 'success';
    const autoDismiss = options?.autoDismiss ?? isSuccess;
    const autoDismissMs = options?.autoDismissMs ?? 2000;

    setAlertState({
      isOpen: true,
      message,
      title: options?.title,
      type: options?.type || 'info',
      onConfirm,
      onCancel,
      confirmText: options?.confirmText || '确定',
      cancelText: options?.cancelText || '取消',
      showCancel: options?.showCancel || false,
      autoDismiss,
      autoDismissMs,
    });
  }, [clearAutoDismissTimer]);

  const handleConfirm = useCallback(() => {
    clearAutoDismissTimer();
    const cb = callbacksRef.current.onConfirm;
    callbacksRef.current = {};
    setAlertState(prev => ({ ...prev, isOpen: false, onConfirm: undefined, onCancel: undefined }));
    if (cb) {
      cb();
    }
  }, [clearAutoDismissTimer]);

  const handleCancel = useCallback(() => {
    clearAutoDismissTimer();
    const cb = callbacksRef.current.onCancel;
    callbacksRef.current = {};
    setAlertState(prev => ({ ...prev, isOpen: false, onConfirm: undefined, onCancel: undefined }));
    if (cb) {
      cb();
    }
  }, [clearAutoDismissTimer]);

  const handleDismiss = useCallback(() => {
    clearAutoDismissTimer();
    callbacksRef.current = {};
    setAlertState(prev => ({ ...prev, isOpen: false, onConfirm: undefined, onCancel: undefined }));
  }, [clearAutoDismissTimer]);

  // Auto-dismiss timer for success alerts
  useEffect(() => {
    if (alertState.isOpen && alertState.autoDismiss) {
      clearAutoDismissTimer();
      autoDismissTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, alertState.autoDismissMs || 2000);
    }
    return () => clearAutoDismissTimer();
  }, [alertState.isOpen, alertState.autoDismiss, alertState.autoDismissMs, handleDismiss, clearAutoDismissTimer]);

  const getIcon = () => {
    switch (alertState.type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getTitle = () => {
    if (alertState.title) return alertState.title;
    switch (alertState.type) {
      case 'success': return '成功';
      case 'error': return '错误';
      case 'warning': return '警告';
      default: return '提示';
    }
  };

  const isToastStyle = alertState.autoDismiss && !alertState.showCancel;

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert: handleDismiss }}>
      {children}
      {alertState.isOpen && (
        isToastStyle ? (
          /* Toast-style notification for auto-dismiss alerts */
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-2xl min-w-[280px]">
              {getIcon()}
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{getTitle()}</div>
                <div className="text-xs text-gray-600 mt-0.5">{alertState.message}</div>
              </div>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-900 ml-2 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Full modal dialog for confirmations/errors */
          <Dialog open={alertState.isOpen} onOpenChange={handleDismiss}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    {getIcon()}
                    <DialogTitle className="text-lg font-semibold text-gray-900">{getTitle()}</DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={alertState.showCancel ? handleCancel : handleDismiss}
                    className="text-gray-500 hover:text-gray-900 p-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="text-gray-600 text-sm leading-relaxed">
                {alertState.message}
              </div>

              <DialogFooter>
                {alertState.showCancel && (
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="px-4 py-2"
                  >
                    {alertState.cancelText}
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={handleConfirm}
                  className="px-4 py-2"
                >
                  {alertState.confirmText}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      )}
    </AlertContext.Provider>
  );
};
