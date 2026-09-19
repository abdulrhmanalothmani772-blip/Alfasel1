import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { Doctor, DentalCase, DoctorSettlement, ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface DoctorStatementPrintProps {
  doctor: Doctor;
  cases: DentalCase[];
  settlements: DoctorSettlement[];
  periodLabel: string;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const DoctorStatementPrint: React.FC<DoctorStatementPrintProps> = ({
  doctor,
  cases,
  settlements,
  periodLabel,
  settings,
  onClose,
}) => {
  const doctorCases = cases.filter((c) => c.doctorId === doctor.id);
  const doctorSettlements = settlements.filter((s) => s.doctorId === doctor.id);

  const totalGross = doctorCases.reduce((sum, c) => sum + c.amountAfterDiscount, 0);
  const totalLab = doctorCases.reduce((sum, c) => sum + c.labExpenseAmount, 0);
  const totalNet = doctorCases.reduce((sum, c) => sum + c.netAmount, 0);
  const totalEarned = doctorCases.reduce((sum, c) => sum + c.doctorShare, 0);
  const totalPaidOut = doctorSettlements.reduce((sum, s) => sum + s.amount, 0);
  const balanceDue = Math.max(0, totalEarned - totalPaidOut);

  return (
    <PrintWrapper
      title={`كشف حساب مستحقات الطبيب — ${doctor.name}`}
      subtitle={`الفترة المحددة: ${periodLabel}`}
      settings={settings}
      onClose={onClose}
    >
      {/* Doctor card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-500 block">اسم الطبيب:</span>
          <span className="font-bold text-slate-800 text-sm">{doctor.name}</span>
        </div>
        <div>
          <span className="text-slate-500 block">الدرجة / التخصص:</span>
          <span className="font-bold text-slate-800">{doctor.specialty}</span>
        </div>
        <div>
          <span className="text-slate-500 block">نسبة المشاركة:</span>
          <span className="font-bold font-mono text-cyan-800 text-sm">{doctor.percentage}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">رقم الجوال:</span>
          <span className="font-bold font-mono text-slate-800" dir="ltr">
            +967 {doctor.phone}
          </span>
        </div>
      </div>

      {/* Highlights Financial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 text-xs text-center">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-slate-500 block mb-1">عدد الحالات</span>
          <span className="text-lg font-black text-slate-800">{doctorCases.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-slate-500 block mb-1">إجمالي الإيرادات</span>
          <span className="text-sm font-bold text-slate-800 font-mono">
            {formatCurrency(totalGross, 'YER')}
          </span>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-700 block mb-1">خرج المعامل</span>
          <span className="text-sm font-bold text-amber-900 font-mono">
            {formatCurrency(totalLab, 'YER')}
          </span>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-blue-700 block mb-1">إجمالي النسبة المستحقة</span>
          <span className="text-sm font-black text-blue-900 font-mono">
            {formatCurrency(totalEarned, 'YER')}
          </span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-emerald-700 block mb-1">المتبقي الصافي له</span>
          <span className="text-sm font-black text-emerald-900 font-mono">
            {formatCurrency(balanceDue, 'YER')}
          </span>
        </div>
      </div>

      {/* Cases Breakdown Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
        <h5 className="bg-slate-100 p-2.5 font-bold text-slate-700 border-b border-slate-200">
          تفاصيل الحالات المنفذة من قِبل الطبيب
        </h5>
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="p-2.5">التاريخ</th>
              <th className="p-2.5">المريض</th>
              <th className="p-2.5">العلاج</th>
              <th className="p-2.5">الإجمالي</th>
              <th className="p-2.5">المعمل</th>
              <th className="p-2.5">الصافي</th>
              <th className="p-2.5 text-blue-700 font-bold">نسبة الطبيب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctorCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-400">
                  لا توجد سجلات حالات خلال هذه الفترة
                </td>
              </tr>
            ) : (
              doctorCases.map((c) => (
                <tr key={c.id}>
                  <td className="p-2.5 font-mono">{c.date}</td>
                  <td className="p-2.5 font-bold text-slate-800">{c.patientName}</td>
                  <td className="p-2.5 text-slate-600">{c.treatment}</td>
                  <td className="p-2.5 font-mono">{formatCurrency(c.amountAfterDiscount, c.currency)}</td>
                  <td className="p-2.5 font-mono text-amber-700">
                    {formatCurrency(c.labExpenseAmount, c.currency)}
                  </td>
                  <td className="p-2.5 font-mono">{formatCurrency(c.netAmount, c.currency)}</td>
                  <td className="p-2.5 font-mono font-bold text-blue-800">
                    {formatCurrency(c.doctorShare, c.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Settlements Table */}
      {doctorSettlements.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
          <h5 className="bg-slate-100 p-2.5 font-bold text-slate-700 border-b border-slate-200">
            سجل المبالغ المسلمة والمصروفة للطبيب
          </h5>
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-2.5">التاريخ</th>
                <th className="p-2.5">المبلغ المصروف</th>
                <th className="p-2.5">بيان الصرف والملاحظات</th>
                <th className="p-2.5">المسؤول عن الصرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctorSettlements.map((s) => (
                <tr key={s.id}>
                  <td className="p-2.5 font-mono">{s.date}</td>
                  <td className="p-2.5 font-mono font-bold text-emerald-700">
                    {formatCurrency(s.amount, s.currency)}
                  </td>
                  <td className="p-2.5 text-slate-600">{s.notes || 'تسليم مستحقات معتمد'}</td>
                  <td className="p-2.5 text-slate-700">{s.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PrintWrapper>
  );
};
