import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export type ToastType = 'success' | 'error' | 'info';

export interface SingleToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<SingleToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-900/95 border-emerald-600 text-white',
    error: 'bg-rose-900/95 border-rose-600 text-white',
    info: 'bg-slate-900/95 border-cyan-500 text-white',
  }[type];

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  }[type];

  return (
    <div className="fixed top-5 left-5 z-50 pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3 max-w-md ${bgColors} no-print" dir="rtl">
      {icons}
      <p className="text-xs font-bold text-white flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
