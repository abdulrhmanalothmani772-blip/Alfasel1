import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { Nurse, NurseTransaction, ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface NursePayslipPrintProps {
  nurse: Nurse;
  transactions: NurseTransaction[];
  monthLabel: string;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const NursePayslipPrint: React.FC<NursePayslipPrintProps> = ({
  nurse,
  transactions,
  monthLabel,
  settings,
  onClose,
}) => {
  const nurseTx = transactions.filter((t) => t.nurseId === nurse.id);

  const bonuses = nurseTx
    .filter((t) => t.type === 'bonus' || t.type === 'reward')
    .reduce((sum, t) => sum + t.amount, 0);

  const withdrawals = nurseTx
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const deductions = nurseTx
    .filter((t) => t.type === 'deduction')
    .reduce((sum, t) => sum + t.amount, 0);

  // مستحق الممرضة = الراتب الأساسي + العلاوات − السحبيات − الخصومات
  const netDue = nurse.baseSalary + bonuses - withdrawals - deductions;

  return (
    <PrintWrapper
      title="مسير رواتب وقسيمة مستحقات الكادر التمريضي"
      subtitle={`عن شهر: ${monthLabel}`}
      settings={settings}
      onClose={onClose}
    >
      {/* Nurse details */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-500 block">اسم الممرضة:</span>
          <span className="font-bold text-slate-800 text-sm">{nurse.name}</span>
        </div>
        <div>
          <span className="text-slate-500 block">تاريخ التعيين:</span>
          <span className="font-bold text-slate-800">{nurse.hireDate}</span>
        </div>
        <div>
          <span className="text-slate-500 block">رقم الجوال:</span>
          <span className="font-bold font-mono text-slate-800" dir="ltr">
            +967 {nurse.phone}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">الراتب الأساسي:</span>
          <span className="font-bold font-mono text-cyan-800 text-sm">
            {formatCurrency(nurse.baseSalary, nurse.currency)}
          </span>
        </div>
      </div>

      {/* Salary Breakdown Formula Sheet */}
      <div className="border border-slate-200 rounded-xl p-5 mb-6 bg-white text-xs">
        <h5 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">
          تفصيل مستحقات واستقطاعات الراتب الشهري
        </h5>

        <div className="space-y-3 max-w-lg mx-auto">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-slate-700 font-semibold">الراتب الأساسي المعتمد:</span>
            <span className="font-mono font-bold text-sm">
              {formatCurrency(nurse.baseSalary, nurse.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-emerald-700">
            <span className="font-semibold">(+) إجمالي العلاوات والمكافآت:</span>
            <span className="font-mono font-bold">
              + {formatCurrency(bonuses, nurse.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-amber-700">
            <span className="font-semibold">(-) إجمالي السحبيات النقدية المقدمة:</span>
            <span className="font-mono font-bold">
              - {formatCurrency(withdrawals, nurse.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-rose-700">
            <span className="font-semibold">(-) إجمالي الخصومات والجزاءات:</span>
            <span className="font-mono font-bold">
              - {formatCurrency(deductions, nurse.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-cyan-50 border border-cyan-300 rounded-xl font-black text-cyan-900 text-sm mt-4">
            <span>الصافي المستحق للصرف:</span>
            <span className="font-mono text-base">{formatCurrency(netDue, nurse.currency)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Details Table */}
      {nurseTx.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
          <h5 className="bg-slate-100 p-2.5 font-bold text-slate-700 border-b border-slate-200">
            سجل الحركات المالية المسجلة خلال الشهر
          </h5>
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-2.5">التاريخ</th>
                <th className="p-2.5">نوع الحركة</th>
                <th className="p-2.5">المبلغ</th>
                <th className="p-2.5">البيان والملاحظات</th>
                <th className="p-2.5">المسجل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nurseTx.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-2.5 font-mono">{tx.date}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        tx.type === 'bonus' || tx.type === 'reward'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.type === 'withdrawal'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.type === 'deduction'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tx.type === 'bonus'
                        ? 'علاوة'
                        : tx.type === 'reward'
                        ? 'مكافأة'
                        : tx.type === 'withdrawal'
                        ? 'سحب'
                        : tx.type === 'deduction'
                        ? 'خصم'
                        : 'راتب'}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono font-bold">
                    {formatCurrency(tx.amount, tx.currency)}
                  </td>
                  <td className="p-2.5 text-slate-600">{tx.notes}</td>
                  <td className="p-2.5 text-slate-700">{tx.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PrintWrapper>
  );
};
