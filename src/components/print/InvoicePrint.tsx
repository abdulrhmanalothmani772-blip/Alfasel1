import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { DentalCase, Patient, ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface InvoicePrintProps {
  dentalCase: DentalCase;
  patient?: Patient;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({
  dentalCase,
  patient,
  settings,
  onClose,
}) => {
  return (
    <PrintWrapper
      title={settings?.invoiceHeader || 'فاتورة معالجة وسند قبض'}
      subtitle={`رقم الفاتورة: INV-${dentalCase.id}`}
      settings={settings}
      onClose={onClose}
    >
      {/* Patient info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-6">
        <div>
          <span className="text-slate-500 block">المريض المكرم:</span>
          <span className="font-bold text-slate-800 text-sm">{dentalCase.patientName}</span>
        </div>
        <div>
          <span className="text-slate-500 block">الطبيب المشرف:</span>
          <span className="font-bold text-slate-800">{dentalCase.doctorName}</span>
        </div>
        <div>
          <span className="text-slate-500 block">رقم الجوال:</span>
          <span className="font-bold font-mono text-slate-800" dir="ltr">
            {patient?.phone ? `+967 ${patient.phone}` : '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">تاريخ الفاتورة:</span>
          <span className="font-bold text-slate-800">{dentalCase.date}</span>
        </div>
      </div>

      {/* Treatments breakdown table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">بيان العلاج والخدمة المقدمة</th>
              <th className="p-3">الأسنان المعالجة</th>
              <th className="p-3 text-left">المبلغ الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-3 font-mono">1</td>
              <td className="p-3 font-semibold text-slate-800">
                {dentalCase.treatment || 'علاج سني'}
                {dentalCase.diagnosis && (
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    التشخيص: {dentalCase.diagnosis}
                  </span>
                )}
              </td>
              <td className="p-3 font-mono text-cyan-700 font-bold">
                {dentalCase.teethNumbers?.length
                  ? dentalCase.teethNumbers.map((t) => `#${t}`).join(' ، ')
                  : '—'}
              </td>
              <td className="p-3 text-left font-mono font-bold text-sm">
                {formatCurrency(dentalCase.grossAmount, dentalCase.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary Calculation Card */}
      <div className="flex justify-end mb-6">
        <div className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex justify-between items-center text-slate-600">
            <span>المبلغ الإجمالي:</span>
            <span className="font-mono font-bold">
              {formatCurrency(dentalCase.grossAmount, dentalCase.currency)}
            </span>
          </div>

          {dentalCase.discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-semibold">
              <span>
                الخصم الممنوح {dentalCase.discountName ? `(${dentalCase.discountName})` : ''}:
              </span>
              <span className="font-mono font-bold">
                - {formatCurrency(dentalCase.discountAmount, dentalCase.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-800 font-bold pt-2 border-t border-slate-200">
            <span>المبلغ الصافي المطلوب:</span>
            <span className="font-mono text-sm text-cyan-800">
              {formatCurrency(dentalCase.amountAfterDiscount, dentalCase.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center text-emerald-700 font-bold">
            <span>المبلغ المدفوع (المسدد):</span>
            <span className="font-mono text-sm">
              {formatCurrency(dentalCase.paidAmount, dentalCase.currency)}
            </span>
          </div>

          <div
            className={`flex justify-between items-center p-2 rounded-lg font-bold ${
              dentalCase.remainingAmount > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span>المبلغ المتبقي:</span>
            <span className="font-mono text-sm">
              {formatCurrency(dentalCase.remainingAmount, dentalCase.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Payments History Table if partial payments exist */}
      {dentalCase.payments && dentalCase.payments.length > 0 && (
        <div className="mb-6">
          <h5 className="text-xs font-bold text-slate-700 mb-2">سجل سندات القبض والدفعات المسددة:</h5>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">تاريخ الدفعة</th>
                  <th className="p-2.5">المبلغ المقبوض</th>
                  <th className="p-2.5">المستلم</th>
                  <th className="p-2.5">ملاحظات السند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dentalCase.payments.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td className="p-2.5 font-mono">{p.date}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-700">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="p-2.5 text-slate-700">{p.receivedBy}</td>
                    <td className="p-2.5 text-slate-500">{p.notes || 'سداد نقدي معتمد'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dentalCase.nextAppointmentDate && (
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-900 flex justify-between items-center">
          <span className="font-bold">موعد جلستك القادمة:</span>
          <span className="font-mono font-bold text-sm">{dentalCase.nextAppointmentDate}</span>
        </div>
      )}
    </PrintWrapper>
  );
};
