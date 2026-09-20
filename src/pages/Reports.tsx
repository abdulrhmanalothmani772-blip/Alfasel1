import React, { useState } from 'react';
import {
  DentalCase,
  Doctor,
  Nurse,
  LabExpense,
  ClinicExpense,
  DoctorSettlement,
  NurseTransaction,
  ClinicSettings,
  User,
  Branch,
} from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  FileText,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Stethoscope,
  Users,
  FlaskConical,
  Receipt,
  AlertCircle,
  Download,
  Filter,
  Building2,
} from 'lucide-react';

interface ReportsProps {
  cases: DentalCase[];
  doctors: Doctor[];
  nurses: Nurse[];
  labExpenses: LabExpense[];
  clinicExpenses: ClinicExpense[];
  doctorSettlements: DoctorSettlement[];
  nurseTransactions: NurseTransaction[];
  settings: ClinicSettings;
  currentUser: User;
  branches?: Branch[];
  activeBranchId?: string;
  onPrintReport: (title: string, data: any) => void;
}

type ReportTab =
  | 'overview'
  | 'doctors'
  | 'nurses'
  | 'labs'
  | 'expenses'
  | 'debts';

export const Reports: React.FC<ReportsProps> = ({
  cases,
  doctors,
  nurses,
  labExpenses,
  clinicExpenses,
  doctorSettlements,
  nurseTransactions,
  settings,
  currentUser,
  branches = [],
  activeBranchId = 'all',
  onPrintReport,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranchId || 'all');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Date & Branch filtering logic
  const isInRange = (d: string) => d >= startDate && d <= endDate;

  const filteredCases = cases.filter((c) => {
    if (!isInRange(c.date)) return false;
    if (selectedBranch === 'all') return true;
    return (
      c.branchId === selectedBranch ||
      (!c.branchId && branches.find((b) => b.id === selectedBranch)?.isMain)
    );
  });

  const filteredLabs = labExpenses.filter((l) => {
    if (!isInRange(l.date)) return false;
    if (selectedBranch === 'all') return true;
    return (
      l.branchId === selectedBranch ||
      (!l.branchId && branches.find((b) => b.id === selectedBranch)?.isMain)
    );
  });

  const filteredClinicExpenses = clinicExpenses.filter((e) => {
    if (!isInRange(e.date)) return false;
    if (selectedBranch === 'all') return true;
    return (
      e.branchId === selectedBranch ||
      (!e.branchId && branches.find((b) => b.id === selectedBranch)?.isMain)
    );
  });

  // Totals
  const totalRevenue = filteredCases.reduce(
    (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
    0
  );
  const totalLabOut = filteredLabs.reduce(
    (sum, l) => sum + convertToYER(l.amount, l.currency, settings),
    0
  );
  const totalDocShare = filteredCases.reduce(
    (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
    0
  );
  const totalClinicShare = filteredCases.reduce(
    (sum, c) => sum + convertToYER(c.clinicShare, c.currency, settings),
    0
  );
  const totalExpenses = filteredClinicExpenses.reduce(
    (sum, e) => sum + convertToYER(e.amount, e.currency, settings),
    0
  );

  // Debts list
  const patientsWithDebt = cases.filter((c) => c.remainingAmount > 0);
  const totalDebtYER = patientsWithDebt.reduce(
    (sum, c) => sum + convertToYER(c.remainingAmount, c.currency, settings),
    0
  );

  const handlePrintCurrentTab = () => {
    switch (activeTab) {
      case 'overview':
        onPrintReport('تقرير الأداء المالي العام للمركز', {
          period: `${startDate} إلى ${endDate}`,
          totalRevenue,
          totalLabOut,
          totalDocShare,
          totalClinicShare,
          totalExpenses,
          casesCount: filteredCases.length,
        });
        break;
      case 'doctors':
        onPrintReport('كشف حساب وأداء الأطباء', {
          period: `${startDate} إلى ${endDate}`,
          doctors,
          cases: filteredCases,
        });
        break;
      case 'labs':
        onPrintReport('تقرير مستحقات ومصروفات معامل الأسنان', {
          period: `${startDate} إلى ${endDate}`,
          labs: filteredLabs,
        });
        break;
      case 'expenses':
        onPrintReport('تقرير مصروفات ونثريات العيادة التفصيلي', {
          period: `${startDate} إلى ${endDate}`,
          expenses: filteredClinicExpenses,
        });
        break;
      case 'debts':
        onPrintReport('كشف الديون والمبالغ المتبقية على المرضى', {
          period: `${startDate} إلى ${endDate}`,
          debts: patientsWithDebt,
          totalDebtYER,
        });
        break;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <span>التقارير المالية والإدارية الشاملة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            كشوفات تفصيلية قابلة للطباعة والتصدير لكافة عمليات المركز
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="all">كافة الفروع (المركز الموحد)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.isMain ? '(الرئيسي)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400">من:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden"
            />
            <span className="text-slate-400">إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={handlePrintCurrentTab}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الحالي</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-200">
        {[
          { id: 'overview', label: 'الأداء المالي العام' },
          { id: 'doctors', label: 'كشف حساب الأطباء' },
          { id: 'nurses', label: 'مسير كادر التمريض' },
          { id: 'labs', label: 'خرج المعامل' },
          { id: 'expenses', label: 'مصاريف العيادة' },
          { id: 'debts', label: 'ديون ومتبقيات المرضى' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-900 text-cyan-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">إجمالي الإيرادات المقبوضة</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                {formatCurrency(totalRevenue, 'YER')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-2">
                من {filteredCases.length} حالة علاجية
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">إجمالي خرج المعامل</span>
              <span className="text-xl font-black text-amber-700 font-mono">
                {formatCurrency(totalLabOut, 'YER')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-2">
                فواتير معامل الزيركون والبورسلين
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">إجمالي مستحقات الأطباء</span>
              <span className="text-xl font-black text-blue-700 font-mono">
                {formatCurrency(totalDocShare, 'YER')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-2">
                الحصص المحتسبة وفق النسب
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">صافي دخل العيادة من الحالات</span>
              <span className="text-xl font-black text-cyan-900 font-mono">
                {formatCurrency(totalClinicShare, 'YER')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-2">
                بعد خصم نسب الأطباء والمعامل
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              ملخص قائمة الدخل للمركز خلال الفترة المحددة ({startDate} إلى {endDate})
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">إجمالي مقبوضات المرضى:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(totalRevenue, 'YER')}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">(-) إجمالي مستحقات الأطباء:</span>
                <span className="font-mono font-bold text-blue-700">
                  - {formatCurrency(totalDocShare, 'YER')}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">(-) إجمالي خرج المعامل:</span>
                <span className="font-mono font-bold text-amber-700">
                  - {formatCurrency(totalLabOut, 'YER')}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">(-) مصاريف العيادة التشغيلية:</span>
                <span className="font-mono font-bold text-rose-700">
                  - {formatCurrency(totalExpenses, 'YER')}
                </span>
              </div>
              <div className="flex justify-between p-4 bg-cyan-950 text-white rounded-2xl font-bold text-sm">
                <span>(=) صافي ربح المركز الإجمالي للفترة:</span>
                <span className="font-mono text-cyan-300 font-black">
                  {formatCurrency(
                    Math.max(0, totalRevenue - totalDocShare - totalLabOut - totalExpenses),
                    'YER'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Doctors */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">اسم الطبيب</th>
                <th className="p-3">النسبة</th>
                <th className="p-3">عدد الحالات</th>
                <th className="p-3">إجمالي أعماله</th>
                <th className="p-3">خرج المعمل</th>
                <th className="p-3 text-blue-700">نسبته المستحقة</th>
                <th className="p-3 text-emerald-700">دخل العيادة منه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((d) => {
                const docCases = filteredCases.filter((c) => c.doctorId === d.id);
                const gross = docCases.reduce(
                  (sum, c) => sum + convertToYER(c.grossAmount, c.currency, settings),
                  0
                );
                const lab = docCases.reduce(
                  (sum, c) => sum + convertToYER(c.labExpenseAmount, c.currency, settings),
                  0
                );
                const share = docCases.reduce(
                  (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
                  0
                );
                const clinic = docCases.reduce(
                  (sum, c) => sum + convertToYER(c.clinicShare, c.currency, settings),
                  0
                );

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{d.name}</td>
                    <td className="p-3 font-mono font-bold text-cyan-800">{d.percentage}%</td>
                    <td className="p-3 font-mono">{docCases.length}</td>
                    <td className="p-3 font-mono">{formatCurrency(gross, 'YER')}</td>
                    <td className="p-3 font-mono text-amber-700">{formatCurrency(lab, 'YER')}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {formatCurrency(share, 'YER')}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700">
                      {formatCurrency(clinic, 'YER')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Nurses */}
      {activeTab === 'nurses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">اسم الممرضة</th>
                <th className="p-3">الراتب الأساسي</th>
                <th className="p-3">العلاوات</th>
                <th className="p-3">السحبيات النقدية</th>
                <th className="p-3">الخصومات</th>
                <th className="p-3 text-cyan-900 font-bold">الصافي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nurses.map((n) => {
                const tx = nurseTransactions.filter(
                  (t) => t.nurseId === n.id && isInRange(t.date)
                );
                const bonuses = tx
                  .filter((t) => t.type === 'bonus' || t.type === 'reward')
                  .reduce((sum, t) => sum + t.amount, 0);
                const withdrawals = tx
                  .filter((t) => t.type === 'withdrawal')
                  .reduce((sum, t) => sum + t.amount, 0);
                const deductions = tx
                  .filter((t) => t.type === 'deduction')
                  .reduce((sum, t) => sum + t.amount, 0);
                const net = n.baseSalary + bonuses - withdrawals - deductions;

                return (
                  <tr key={n.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{n.name}</td>
                    <td className="p-3 font-mono">{formatCurrency(n.baseSalary, n.currency)}</td>
                    <td className="p-3 font-mono text-emerald-700">
                      +{formatCurrency(bonuses, n.currency)}
                    </td>
                    <td className="p-3 font-mono text-amber-700">
                      -{formatCurrency(withdrawals, n.currency)}
                    </td>
                    <td className="p-3 font-mono text-rose-700">
                      -{formatCurrency(deductions, n.currency)}
                    </td>
                    <td className="p-3 font-mono font-black text-cyan-900">
                      {formatCurrency(net, n.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Labs */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">اسم المعمل</th>
                <th className="p-3">البيان</th>
                <th className="p-3">المريض المرتبط</th>
                <th className="p-3 font-bold">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-slate-600">{l.date}</td>
                  <td className="p-3 font-bold text-slate-900">{l.labName}</td>
                  <td className="p-3 text-slate-700">{l.description}</td>
                  <td className="p-3 text-cyan-800">{l.patientName || 'عام'}</td>
                  <td className="p-3 font-mono font-bold text-amber-700">
                    {formatCurrency(l.amount, l.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">البيان</th>
                <th className="p-3 font-bold">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClinicExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-slate-600">{e.date}</td>
                  <td className="p-3 font-bold text-slate-800">{e.category}</td>
                  <td className="p-3 text-slate-700">{e.description}</td>
                  <td className="p-3 font-mono font-bold text-rose-700">
                    {formatCurrency(e.amount, e.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Debts */}
      {activeTab === 'debts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
            <span className="font-bold text-rose-900">
              إجمالي المبالغ الآجلة المتبقية على المرضى:
            </span>
            <span className="font-mono font-black text-rose-700 text-base">
              {formatCurrency(totalDebtYER, 'YER')}
            </span>
          </div>

          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">اسم المريض</th>
                <th className="p-3">الإجراء السني</th>
                <th className="p-3">المبلغ بعد الخصم</th>
                <th className="p-3 text-emerald-700">المسدد</th>
                <th className="p-3 text-rose-700 font-bold">المتبقي المطلوب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientsWithDebt.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-slate-600">{c.date}</td>
                  <td className="p-3 font-bold text-slate-900">{c.patientName}</td>
                  <td className="p-3 text-slate-700">{c.treatment}</td>
                  <td className="p-3 font-mono">
                    {formatCurrency(c.amountAfterDiscount, c.currency)}
                  </td>
                  <td className="p-3 font-mono text-emerald-700">
                    {formatCurrency(c.paidAmount, c.currency)}
                  </td>
                  <td className="p-3 font-mono font-bold text-rose-700">
                    {formatCurrency(c.remainingAmount, c.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
