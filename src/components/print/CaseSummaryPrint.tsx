import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { DentalCase, Patient, ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface CaseSummaryPrintProps {
  dentalCase: DentalCase;
  patient?: Patient;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const CaseSummaryPrint: React.FC<CaseSummaryPrintProps> = ({
  dentalCase,
  patient,
  settings,
  onClose,
}) => {
  return (
    <PrintWrapper
      title="كشف محاسبي تفصيلي للحالة الطبية"
      subtitle={`كشف تدقيق مالي وإداري #${dentalCase.id}`}
      settings={settings}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-6">
        <div>
          <span className="text-slate-500 block">المريض:</span>
          <span className="font-bold text-slate-800 text-sm">{dentalCase.patientName}</span>
        </div>
        <div>
          <span className="text-slate-500 block">الطبيب المعالج:</span>
          <span className="font-bold text-slate-800 text-sm">{dentalCase.doctorName}</span>
        </div>
        <div>
          <span className="text-slate-500 block">تاريخ الحالة:</span>
          <span className="font-bold text-slate-800">{dentalCase.date}</span>
        </div>
        <div>
          <span className="text-slate-500 block">الحالة الإدارية:</span>
          <span className="font-bold text-cyan-700">
            {dentalCase.status === 'completed'
              ? 'مكتملة'
              : dentalCase.status === 'in_progress'
              ? 'قيد العلاج'
              : dentalCase.status === 'followup'
              ? 'متابعة'
              : 'جديدة'}
          </span>
        </div>
      </div>

      {/* Clinical info */}
      <div className="border border-slate-200 rounded-xl p-4 mb-6 text-xs space-y-2">
        <div>
          <span className="text-slate-500 font-bold ml-2">العلاج المقدّم:</span>
          <span className="font-semibold text-slate-800">{dentalCase.treatment}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold ml-2">التشخيص السريري:</span>
          <span className="text-slate-700">{dentalCase.diagnosis}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold ml-2">الأسنان المعالجة:</span>
          <span className="font-mono font-bold text-cyan-700">
            {dentalCase.teethNumbers?.length
              ? dentalCase.teethNumbers.map((t) => `#${t}`).join(' ، ')
              : 'عام'}
          </span>
        </div>
      </div>

      {/* Complete Accounting Breakdown Box matching the core prompt formula! */}
      <div className="border-2 border-cyan-500 rounded-xl p-5 bg-cyan-50/20 mb-6 text-xs">
        <h4 className="font-bold text-cyan-900 text-sm mb-3 border-b border-cyan-200 pb-2">
          التوزيع المالي والمحاسبي المعتمد للحالة
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-slate-700">
              <span>المبلغ الإجمالي (Gross):</span>
              <span className="font-mono font-bold">
                {formatCurrency(dentalCase.grossAmount, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-600">
              <span>قيمة الخصم المعتمد:</span>
              <span className="font-mono font-bold">
                - {formatCurrency(dentalCase.discountAmount, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>المبلغ بعد الخصم:</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.amountAfterDiscount, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-700">
              <span>خرج المعمل (Lab Expense):</span>
              <span className="font-mono font-bold">
                - {formatCurrency(dentalCase.labExpenseAmount, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center font-black text-cyan-900 pt-1 border-t border-cyan-300">
              <span>الصافي المشترك (Net):</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.netAmount, dentalCase.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-slate-600">
              <span>نسبة الطبيب المعتمدة:</span>
              <span className="font-bold">
                {dentalCase.isNoDoctorShare ? 'حالة 100% للعيادة' : `${dentalCase.doctorPercentage}%`}
              </span>
            </div>
            <div className="flex justify-between items-center text-blue-700 font-bold">
              <span>مستحق الطبيب ({dentalCase.doctorName}):</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.doctorShare, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-bold">
              <span>دخل العيادة من الصافي:</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.clinicShare, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-800 font-bold pt-2 border-t border-slate-200">
              <span>المدفوع من المريض:</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.paidAmount, dentalCase.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-700 font-bold">
              <span>المتبقي في ذمة المريض:</span>
              <span className="font-mono text-sm">
                {formatCurrency(dentalCase.remainingAmount, dentalCase.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PrintWrapper>
  );
};
