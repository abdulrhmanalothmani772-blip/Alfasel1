import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right animate-in zoom-in-95"
        dir="rtl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">مركز الفيصل لطب الأسنان</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
