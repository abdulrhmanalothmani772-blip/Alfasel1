import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface GenericReportPrintProps {
  title: string;
  data: any;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const GenericReportPrint: React.FC<GenericReportPrintProps> = ({
  title,
  data,
  settings,
  onClose,
}) => {
  return (
    <PrintWrapper
      title={title}
      subtitle={data.period ? `الفترة: ${data.period}` : undefined}
      settings={settings}
      onClose={onClose}
    >
      <div className="space-y-5 text-xs">
        {/* Lab Expenses list */}
        {data.labs && (
          <table className="w-full text-right border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-l border-slate-300">التاريخ</th>
                <th className="p-2.5 border-l border-slate-300">اسم المعمل</th>
                <th className="p-2.5 border-l border-slate-300">البيان</th>
                <th className="p-2.5 border-l border-slate-300">المريض المرتبط</th>
                <th className="p-2.5 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.labs.map((l: any) => (
                <tr key={l.id}>
                  <td className="p-2 font-mono border-l border-slate-200">{l.date}</td>
                  <td className="p-2 font-bold border-l border-slate-200">{l.labName}</td>
                  <td className="p-2 border-l border-slate-200">{l.description}</td>
                  <td className="p-2 border-l border-slate-200">{l.patientName || 'عام'}</td>
                  <td className="p-2 text-left font-mono font-bold text-amber-700">
                    {formatCurrency(l.amount, l.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Clinic Expenses list */}
        {data.expenses && (
          <table className="w-full text-right border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-l border-slate-300">التاريخ</th>
                <th className="p-2.5 border-l border-slate-300">التصنيف</th>
                <th className="p-2.5 border-l border-slate-300">البيان</th>
                <th className="p-2.5 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.expenses.map((e: any) => (
                <tr key={e.id}>
                  <td className="p-2 font-mono border-l border-slate-200">{e.date}</td>
                  <td className="p-2 font-bold border-l border-slate-200">{e.category}</td>
                  <td className="p-2 border-l border-slate-200">{e.description}</td>
                  <td className="p-2 text-left font-mono font-bold text-rose-700">
                    {formatCurrency(e.amount, e.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Debts list */}
        {data.debts && (
          <table className="w-full text-right border-collapse border border-slate-300">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-l border-slate-300">التاريخ</th>
                <th className="p-2.5 border-l border-slate-300">اسم المريض</th>
                <th className="p-2.5 border-l border-slate-300">الإجراء السني</th>
                <th className="p-2.5 border-l border-slate-300">المبلغ بعد الخصم</th>
                <th className="p-2.5 border-l border-slate-300 text-emerald-800">المسدد</th>
                <th className="p-2.5 text-left text-rose-700">المتبقي المطلوب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.debts.map((c: any) => (
                <tr key={c.id}>
                  <td className="p-2 font-mono border-l border-slate-200">{c.date}</td>
                  <td className="p-2 font-bold border-l border-slate-200">{c.patientName}</td>
                  <td className="p-2 border-l border-slate-200">{c.treatment}</td>
                  <td className="p-2 font-mono border-l border-slate-200">
                    {formatCurrency(c.amountAfterDiscount, c.currency)}
                  </td>
                  <td className="p-2 font-mono text-emerald-700 border-l border-slate-200">
                    {formatCurrency(c.paidAmount, c.currency)}
                  </td>
                  <td className="p-2 text-left font-mono font-bold text-rose-700">
                    {formatCurrency(c.remainingAmount, c.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Financial overview summary card if present */}
        {data.totalRevenue !== undefined && (
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-2 font-bold">
            <div className="flex justify-between">
              <span>إجمالي الإيرادات المقبوضة:</span>
              <span className="font-mono text-emerald-700">{formatCurrency(data.totalRevenue, 'YER')}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي خرج المعامل:</span>
              <span className="font-mono text-amber-700">- {formatCurrency(data.totalLabOut, 'YER')}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي مستحقات الأطباء:</span>
              <span className="font-mono text-blue-700">- {formatCurrency(data.totalDocShare, 'YER')}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي مصاريف العيادة:</span>
              <span className="font-mono text-rose-700">- {formatCurrency(data.totalExpenses, 'YER')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-300 text-sm">
              <span>صافي دخل العيادة:</span>
              <span className="font-mono text-cyan-900 font-black">{formatCurrency(data.totalClinicShare, 'YER')}</span>
            </div>
          </div>
        )}
      </div>
    </PrintWrapper>
  );
};
