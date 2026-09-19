import React, { useState } from 'react';
import {
  DentalCase,
  LabExpense,
  ClinicExpense,
  DoctorSettlement,
  NurseTransaction,
  ClinicSettings,
  User,
} from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  FileSpreadsheet,
  Calendar,
  Printer,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface DailySummaryProps {
  cases: DentalCase[];
  labExpenses: LabExpense[];
  clinicExpenses: ClinicExpense[];
  doctorSettlements: DoctorSettlement[];
  nurseTransactions: NurseTransaction[];
  settings: ClinicSettings;
  currentUser: User;
  onPrintDailySummary: (summaryData: any) => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  cases,
  labExpenses,
  clinicExpenses,
  doctorSettlements,
  nurseTransactions,
  settings,
  currentUser,
  onPrintDailySummary,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter everything by selectedDate
  const dayCases = cases.filter((c) => c.date === selectedDate);
  const dayLabExpenses = labExpenses.filter((l) => l.date === selectedDate);
  const dayClinicExpenses = clinicExpenses.filter((e) => e.date === selectedDate);
  const dayDoctorWithdrawals = doctorSettlements.filter((s) => s.date === selectedDate);
  const dayNurseWithdrawals = nurseTransactions.filter(
    (t) => t.date === selectedDate && t.type === 'withdrawal'
  );

  // Totals in YER
  const totalClinicIncome = dayCases.reduce(
    (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
    0
  );

  const totalLabExpenses = dayLabExpenses.reduce(
    (sum, l) => sum + convertToYER(l.amount, l.currency, settings),
    0
  );

  const totalDoctorShares = dayCases.reduce(
    (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
    0
  );

  const totalDoctorWithdrawals = dayDoctorWithdrawals.reduce((sum, s) => sum + s.amount, 0);

  const totalNurseWithdrawals = dayNurseWithdrawals.reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = dayClinicExpenses.reduce(
    (sum, e) => sum + convertToYER(e.amount, e.currency, settings),
    0
  );

  const totalPatientsRemaining = dayCases.reduce(
    (sum, c) => sum + convertToYER(c.remainingAmount, c.currency, settings),
    0
  );

  // صافي نقد العيادة الفعلي بالخزينة = دخل العيادة المقبوض - سحبيات الأطباء المسلمة - سحبيات الممرضات - خرج المعمل المدفوع - المصاريف اليومية
  const netClinicCash = Math.max(
    0,
    totalClinicIncome -
      totalDoctorWithdrawals -
      totalNurseWithdrawals -
      totalLabExpenses -
      totalExpenses
  );

  const summaryData = {
    date: selectedDate,
    totalClinicIncome,
    totalLabExpenses,
    totalDoctorShares,
    totalDoctorWithdrawals,
    totalNurseWithdrawals,
    totalClinicExpenses: totalExpenses,
    netClinicCash,
    totalPatientsRemaining,
    casesCount: dayCases.length,
    currency: 'YER' as const,
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
            <span>الملخص اليومي العام للعيادة (ورقة الصندوق اليومية)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            محاكاة دقيقة لدفتر اليومية المعتمد في عيادات ومراكز الأسنان
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => onPrintDailySummary(summaryData)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملخص اليومي (A4)</span>
          </button>
        </div>
      </div>

      {/* Traditional Ledger Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-cyan-950 p-6 text-white text-center">
          <h3 className="text-lg font-black tracking-wide">
            مركز الفيصل لطب الأسنان — كشف تسوية الصندوق اليومي
          </h3>
          <p className="text-xs text-cyan-300 mt-1 font-mono">
            حركة يوم: {selectedDate} • الحالات المنفذة: {dayCases.length} حالة
          </p>
        </div>

        {/* Ledger Items */}
        <div className="p-6 divide-y divide-slate-100 text-xs sm:text-sm">
          {/* 1. مجموع دخل العيادة */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                1
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (+) مجموع دخل العيادة المقبوض نقداً من الحالات
                </span>
                <span className="text-xs text-slate-500">
                  إجمالي المبالغ المدفوعة بالخزينة من {dayCases.length} حالة علاجية
                </span>
              </div>
            </div>
            <span className="font-mono font-black text-emerald-700 text-base">
              {formatCurrency(totalClinicIncome, 'YER')}
            </span>
          </div>

          {/* 2. خرج المعمل */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs">
                2
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (-) مجموع خرج المعمل ومستحقات التركيبات
                </span>
                <span className="text-xs text-slate-500">
                  فواتير معامل الزيركون والبورسلين المنفذة اليوم
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-700 text-sm">
              - {formatCurrency(totalLabExpenses, 'YER')}
            </span>
          </div>

          {/* 3. نسب الأطباء المستحقة */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs">
                3
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (-) مجموع نسب الأطباء المستحقة عن الحالات
                </span>
                <span className="text-xs text-slate-500">
                  الحصص المحتسبة للأطباء وفق النسب المعتمدة لكل طبيب
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-blue-700 text-sm">
              - {formatCurrency(totalDoctorShares, 'YER')}
            </span>
          </div>

          {/* 4. سحبيات الأطباء المسلمة */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                4
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (-) مجموع سحبيات الأطباء النقدية المنصرفة اليوم
                </span>
                <span className="text-xs text-slate-500">
                  المبالغ المسلمة يداً بيد للأطباء وسجلت في تسوية اليوم
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm">
              - {formatCurrency(totalDoctorWithdrawals, 'YER')}
            </span>
          </div>

          {/* 5. سحبيات الممرضات */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-xs">
                5
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (-) مجموع سحبيات الكادر التمريضي (عربون رواتب)
                </span>
                <span className="text-xs text-slate-500">
                  سلف نقدية مقدمة للممرضات مسجلة بحركات اليوم
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-800 text-sm">
              - {formatCurrency(totalNurseWithdrawals, 'YER')}
            </span>
          </div>

          {/* 6. المصاريف اليومية */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-mono font-bold text-xs">
                6
              </span>
              <div>
                <span className="font-bold text-slate-900 block">
                  (-) مجموع المصاريف اليومية والتشغيلية للعيادة
                </span>
                <span className="text-xs text-slate-500">
                  ديزل، مياه، مستلزمات طبية، صيانة، نثريات
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-rose-700 text-sm">
              - {formatCurrency(totalExpenses, 'YER')}
            </span>
          </div>

          {/* 7. صافي نقد العيادة النهائي */}
          <div className="py-4 my-2 bg-gradient-to-l from-cyan-50 to-blue-50 p-4 rounded-2xl border-2 border-cyan-400 flex items-center justify-between">
            <div>
              <span className="font-black text-cyan-950 text-base block">
                (=) صافي نقد العيادة الفعلي المتبقي في الخزينة بعد كافة الخصومات
              </span>
              <span className="text-xs text-cyan-800">
                النقدية الصافية الجاهزة للتوريد والترحيل
              </span>
            </div>
            <span className="font-mono font-black text-cyan-900 text-xl">
              {formatCurrency(netClinicCash, 'YER')}
            </span>
          </div>

          {/* 8. إجمالي المتبقي على المرضى */}
          <div className="py-3.5 flex items-center justify-between text-rose-800">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-mono font-bold text-xs">
                ℹ
              </span>
              <div>
                <span className="font-bold block">
                  إجمالي المبالغ الآجلة المتبقية في ذمة المرضى اليوم
                </span>
                <span className="text-xs text-rose-600">
                  ديون على المرضى تسدد في الجلسات القادمة
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-rose-700 text-sm">
              {formatCurrency(totalPatientsRemaining, 'YER')}
            </span>
          </div>
        </div>

        {/* Signatures box */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="font-bold text-slate-800 block mb-6">
                توقيع موظف الاستقبال والخزينة
              </span>
              <div className="border-b border-dashed border-slate-300 w-2/3 mx-auto mb-2"></div>
              <span className="text-[11px] text-slate-500">
                المسؤول: {currentUser.role === 'reception' ? currentUser.fullName : 'الاستقبال'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="font-bold text-slate-800 block mb-6">
                اعتماد وتوقيع مدير مركز الفيصل
              </span>
              <div className="border-b border-dashed border-slate-300 w-2/3 mx-auto mb-2"></div>
              <span className="text-[11px] text-slate-500">
                {currentUser.role === 'admin' ? currentUser.fullName : 'د. فيصل العثماني (المدير)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
