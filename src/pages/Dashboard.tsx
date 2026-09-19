import React, { useState } from 'react';
import {
  Patient,
  Doctor,
  DentalCase,
  LabExpense,
  ClinicExpense,
  ClinicSettings,
  User,
} from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  Users,
  Stethoscope,
  TrendingUp,
  FlaskConical,
  AlertCircle,
  PlusCircle,
  Download,
  Calendar,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardProps {
  currentUser: User;
  patients: Patient[];
  doctors: Doctor[];
  cases: DentalCase[];
  labExpenses: LabExpense[];
  clinicExpenses: ClinicExpense[];
  settings: ClinicSettings;
  onNavigate: (tab: any) => void;
  onSelectCaseToPrint: (dentalCase: DentalCase) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  patients,
  doctors,
  cases,
  labExpenses,
  clinicExpenses,
  settings,
  onNavigate,
  onSelectCaseToPrint,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayCases = cases.filter((c) => c.date === todayStr);

  const todayIncomeYER = todayCases.reduce(
    (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
    0
  );

  const totalIncomeYER = cases.reduce(
    (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
    0
  );

  const totalLabExpensesYER = labExpenses.reduce(
    (sum, l) => sum + convertToYER(l.amount, l.currency, settings),
    0
  );

  const totalClinicExpensesYER = clinicExpenses.reduce(
    (sum, e) => sum + convertToYER(e.amount, e.currency, settings),
    0
  );

  const totalRemainingDebtsYER = cases.reduce(
    (sum, c) => sum + convertToYER(c.remainingAmount, c.currency, settings),
    0
  );

  const totalClinicNetProfitYER = cases.reduce(
    (sum, c) => sum + convertToYER(c.clinicShare, c.currency, settings),
    0
  );

  // Doctors income distribution for PieChart
  const doctorStats = doctors.map((doc, idx) => {
    const docCases = cases.filter((c) => c.doctorId === doc.id);
    const docTotalEarned = docCases.reduce(
      (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
      0
    );
    const colors = ['#00D2FF', '#0284C7', '#38BDF8', '#818CF8', '#34D399'];
    return {
      name: doc.name,
      value: docTotalEarned,
      color: colors[idx % colors.length],
      casesCount: docCases.length,
    };
  });

  // Recent 7 days breakdown for BarChart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayCases = cases.filter((c) => c.date === dStr);
    const income = dayCases.reduce(
      (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
      0
    );
    const clinicShare = dayCases.reduce(
      (sum, c) => sum + convertToYER(c.clinicShare, c.currency, settings),
      0
    );
    return {
      date: dStr.substring(5), // MM-DD
      'إجمالي الدخل': income,
      'دخل العيادة': clinicShare,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-cyan-950 to-slate-900 rounded-3xl p-6 border border-cyan-900/50 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 font-bold text-sm">مركز الفيصل لطب الأسنان</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              لوحة التحكم الشاملة
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            مرحباً بك، {currentUser.fullName}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            حركة العيادة ليوم{' '}
            {new Date().toLocaleDateString('ar-YE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل حالة علاج جديدة</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('patients')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>إضافة مريض</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('daily-summary')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>الملخص اليومي</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Income */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              دخل العيادة المقبوض اليوم
            </span>
            <div className="text-xl font-black text-slate-900 font-mono">
              {formatCurrency(todayIncomeYER, 'YER')}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{todayCases.length} حالات مسجلة اليوم</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Clinic Net Profit */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              صافي أرباح العيادة (الحصص)
            </span>
            <div className="text-xl font-black text-cyan-700 font-mono">
              {formatCurrency(totalClinicNetProfitYER, 'YER')}
            </div>
            <span className="text-[11px] text-cyan-600 font-semibold mt-1 block">
              بعد استقطاع المعمل ونسب الأطباء
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Lab Expenses */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              إجمالي خرج المعامل
            </span>
            <div className="text-xl font-black text-amber-700 font-mono">
              {formatCurrency(totalLabExpensesYER, 'YER')}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {labExpenses.length} فواتير معامل مسجلة
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Outstanding Patient Debts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">
              ديون ومتبقيات المرضى
            </span>
            <div className="text-xl font-black text-rose-700 font-mono">
              {formatCurrency(totalRemainingDebtsYER, 'YER')}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
              مبالغ مؤجلة بحاجة لتحصيل
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Income Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                حركة الإيرادات خلال الأيام الأخيرة (ريال يمني)
              </h3>
              <p className="text-xs text-slate-500">مقارنة بين إجمالي الدخل وحصة العيادة</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>آخر 7 أيام</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), 'YER')}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    direction: 'rtl',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="إجمالي الدخل" fill="#00D2FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="دخل العيادة" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Doctor Income Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              مستحقات الأطباء المعتمدة
            </h3>
            <p className="text-xs text-slate-500 mb-4">توزيع الحصص المكتسبة بحسب كل طبيب</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doctorStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {doctorStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), 'YER')}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {doctorStats.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: doc.color }}
                  />
                  <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                    {doc.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(doc.value, 'YER')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Dental Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">آخر الحالات الطبية المسجلة</h3>
            <p className="text-xs text-slate-500">متابعة سريعة للحالات والمدفوعات والمتبقيات</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            عرض كافة الحالات ({cases.length}) ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المريض</th>
                <th className="p-3">الطبيب المعالج</th>
                <th className="p-3">العلاج</th>
                <th className="p-3">المبلغ الصافي</th>
                <th className="p-3">المدفوع</th>
                <th className="p-3">المتبقي</th>
                <th className="p-3 text-center">إجراءات الطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-slate-600">{c.date}</td>
                  <td className="p-3 font-bold text-slate-900">{c.patientName}</td>
                  <td className="p-3 text-slate-700">{c.doctorName}</td>
                  <td className="p-3 text-slate-600">{c.treatment}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {formatCurrency(c.amountAfterDiscount, c.currency)}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {formatCurrency(c.paidAmount, c.currency)}
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {c.remainingAmount > 0 ? (
                      <span className="text-rose-600">
                        {formatCurrency(c.remainingAmount, c.currency)}
                      </span>
                    ) : (
                      <span className="text-emerald-600">مسدد بالكامل</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCaseToPrint(c)}
                      className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all inline-flex items-center gap-1 font-bold text-[11px]"
                      title="طباعة مستندات الحالة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
