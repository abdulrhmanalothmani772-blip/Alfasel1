import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface DailySummaryData {
  date: string;
  totalClinicIncome: number;
  totalLabExpenses: number;
  totalDoctorShares: number;
  totalDoctorWithdrawals: number;
  totalNurseWithdrawals: number;
  totalClinicExpenses: number;
  netClinicCash: number;
  totalPatientsRemaining: number;
  casesCount: number;
  currency: 'YER';
}

interface DailySummarySheetPrintProps {
  data: DailySummaryData;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const DailySummarySheetPrint: React.FC<DailySummarySheetPrintProps> = ({
  data,
  settings,
  onClose,
}) => {
  return (
    <PrintWrapper
      title="ورقة كشف الحساب اليومي للعيادة (الملخص اليومي العام)"
      subtitle={`عن حركة يوم: ${data.date}`}
      settings={settings}
      onClose={onClose}
    >
      {/* Traditional Ledger Style Table recreating the manual daily dental clinic sheet! */}
      <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-6 text-xs bg-white">
        <div className="bg-slate-900 text-white p-3 text-center font-bold text-sm">
          جدول تسوية الصندوق والمدخولات والمصروفات اليومية
        </div>

        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-800">
              <th className="p-3 w-16 text-center border-l border-slate-300">م</th>
              <th className="p-3 border-l border-slate-300">البند المحاسبي / البيان</th>
              <th className="p-3 w-40 text-left">المبلغ بالريال اليمني</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* 1. دخل العيادة */}
            <tr className="bg-emerald-50/50">
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">1</td>
              <td className="p-3 font-bold text-emerald-900 border-l border-slate-200">
                (+) مجموع دخل العيادة الفعلي (المقبوض من الحالات)
                <span className="block text-[11px] text-emerald-700 font-normal">
                  إجمالي المبالغ المحصلة في الخزينة عن عدد ({data.casesCount}) حالة
                </span>
              </td>
              <td className="p-3 text-left font-mono font-bold text-sm text-emerald-800">
                {formatCurrency(data.totalClinicIncome, 'YER')}
              </td>
            </tr>

            {/* 2. خرج المعمل */}
            <tr>
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">2</td>
              <td className="p-3 text-slate-800 border-l border-slate-200">
                (-) مجموع خرج ومستحقات معامل الأسنان (التركيبات والزيركون)
              </td>
              <td className="p-3 text-left font-mono font-bold text-amber-700">
                - {formatCurrency(data.totalLabExpenses, 'YER')}
              </td>
            </tr>

            {/* 3. نسب الأطباء المستحقة */}
            <tr>
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">3</td>
              <td className="p-3 text-slate-800 border-l border-slate-200">
                (-) مجموع نسب الأطباء المستحقة عن حالات اليوم
              </td>
              <td className="p-3 text-left font-mono font-bold text-blue-700">
                - {formatCurrency(data.totalDoctorShares, 'YER')}
              </td>
            </tr>

            {/* 4. سحبيات الأطباء */}
            <tr>
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">4</td>
              <td className="p-3 text-slate-800 border-l border-slate-200">
                (-) مجموع سحبيات الأطباء النقدية المنصرفة اليوم
              </td>
              <td className="p-3 text-left font-mono font-bold text-slate-700">
                - {formatCurrency(data.totalDoctorWithdrawals, 'YER')}
              </td>
            </tr>

            {/* 5. سحبيات الممرضات */}
            <tr>
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">5</td>
              <td className="p-3 text-slate-800 border-l border-slate-200">
                (-) مجموع سحبيات الكادر التمريضي (عربون رواتب مقدمة)
              </td>
              <td className="p-3 text-left font-mono font-bold text-slate-700">
                - {formatCurrency(data.totalNurseWithdrawals, 'YER')}
              </td>
            </tr>

            {/* 6. المصاريف اليومية */}
            <tr>
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">6</td>
              <td className="p-3 text-slate-800 border-l border-slate-200">
                (-) مجموع المصاريف النثرية والتشغيلية للعيادة (ديزل، ماء، صيانة، مستلزمات)
              </td>
              <td className="p-3 text-left font-mono font-bold text-rose-700">
                - {formatCurrency(data.totalClinicExpenses, 'YER')}
              </td>
            </tr>

            {/* 7. صافي نقد العيادة النهائي */}
            <tr className="bg-cyan-50 border-t-2 border-cyan-500 font-black">
              <td className="p-3 text-center font-mono text-cyan-900 text-sm border-l border-cyan-200">
                ★
              </td>
              <td className="p-3 text-cyan-950 text-sm border-l border-cyan-200">
                (=) صافي نقد العيادة الفعلي المتبقي في الخزينة بعد جميع الخصومات
              </td>
              <td className="p-3 text-left font-mono text-base text-cyan-900">
                {formatCurrency(data.netClinicCash, 'YER')}
              </td>
            </tr>

            {/* 8. إجمالي المتبقي على المرضى */}
            <tr className="bg-rose-50/50">
              <td className="p-3 text-center font-mono font-bold border-l border-slate-200">8</td>
              <td className="p-3 text-rose-800 font-bold border-l border-slate-200">
                (ℹ) إجمالي المبالغ الآجلة المتبقية في ذمة المرضى عن حالات اليوم
              </td>
              <td className="p-3 text-left font-mono font-bold text-rose-700">
                {formatCurrency(data.totalPatientsRemaining, 'YER')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Manual Signature Section as requested */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t-2 border-dashed border-slate-400 text-xs">
        <div className="p-4 border border-slate-300 rounded-xl bg-slate-50 text-center">
          <span className="font-bold text-slate-800 block mb-6">
            مسؤول الاستقبال والخزينة (مطابقة النقدية)
          </span>
          <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
          <span className="text-slate-500 text-[11px]">الاسم والتوقيع</span>
        </div>

        <div className="p-4 border border-slate-300 rounded-xl bg-slate-50 text-center">
          <span className="font-bold text-slate-800 block mb-6">
            اعتماد مدير مركز الفيصل لطب الأسنان
          </span>
          <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
          <span className="text-slate-500 text-[11px]">التوقيع والختم الرسمي</span>
        </div>
      </div>
    </PrintWrapper>
  );
};
