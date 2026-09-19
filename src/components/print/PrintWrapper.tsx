import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { ToothLogo } from '../ToothLogo';
import { ClinicSettings } from '../../types';

interface PrintWrapperProps {
  title: string;
  subtitle?: string;
  settings?: ClinicSettings;
  onClose: () => void;
  children: React.ReactNode;
}

export const PrintWrapper: React.FC<PrintWrapperProps> = ({
  title,
  subtitle,
  settings,
  onClose,
  children,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex justify-center p-2 sm:p-6">
      {/* Container that acts as the printable sheet */}
      <div className="relative bg-white text-slate-900 w-full max-w-4xl min-h-[90vh] rounded-2xl shadow-2xl flex flex-col p-6 sm:p-10 my-auto animate-in zoom-in-95">
        {/* On-screen control buttons (hidden during print) */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>طباعة المستند الآن (Ctrl + P)</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">
              تصميم مخصص للطباعة الرسمية بالأبعاد القياسية (A4)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="إغلاق المعاينة"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Official Header */}
        <div className="border-b-2 border-cyan-600 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <ToothLogo size="md" theme="light" showPhone={true} />

            <div className="text-left font-mono text-xs text-slate-600">
              <div className="font-bold text-cyan-900 text-sm">{title}</div>
              {subtitle && <div className="text-slate-500">{subtitle}</div>}
              <div className="mt-1">
                تاريخ الإصدار:{' '}
                {new Date().toLocaleDateString('ar-YE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-[11px] text-slate-400">
                اليمن - {settings?.address || 'صنعاء'}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Printable Body */}
        <div className="flex-1 printable-content">{children}</div>

        {/* Printable Official Footer with Signatures */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <div className="grid grid-cols-3 gap-6 text-center mb-6">
            <div className="border-t border-dashed border-slate-300 pt-2 font-bold text-slate-700">
              توقيع الموظف المختص / الاستقبال
            </div>
            <div className="border-t border-dashed border-slate-300 pt-2 font-bold text-slate-700">
              توقيع / ختم الطبيب المعالج
            </div>
            <div className="border-t border-dashed border-slate-300 pt-2 font-bold text-slate-700">
              اعتماد المدير العام / الختم
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>مركز الفيصل لطب الأسنان — نظام الإدارة المحاسبي والعيادي المتكامل</span>
            <span>هاتف: 778043029 - 789843741</span>
            <span>صفحة 1 من 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
