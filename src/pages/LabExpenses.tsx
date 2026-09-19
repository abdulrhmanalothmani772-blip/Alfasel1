import React, { useState } from 'react';
import { LabExpense, DentalCase, Currency, User, ClinicSettings } from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  FlaskConical,
  Plus,
  Search,
  Calendar,
  Trash2,
  Printer,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';

interface LabExpensesProps {
  labExpenses: LabExpense[];
  cases: DentalCase[];
  settings: ClinicSettings;
  currentUser: User;
  onAddLabExpense: (expense: LabExpense) => Promise<void>;
  onDeleteLabExpense: (id: string) => Promise<void>;
  onPrintLabReport: () => void;
}

export const LabExpenses: React.FC<LabExpensesProps> = ({
  labExpenses,
  cases,
  settings,
  currentUser,
  onAddLabExpense,
  onDeleteLabExpense,
  onPrintLabReport,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [caseId, setCaseId] = useState('');
  const [labName, setLabName] = useState('مختبر النخبة للأسنان والزيركون');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Unique lab names
  const uniqueLabs = Array.from(new Set(labExpenses.map((l) => l.labName)));

  const filteredExpenses = labExpenses.filter((l) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchName = l.labName.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      const matchPatient = l.patientName && l.patientName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchPatient) return false;
    }
    if (selectedLab !== 'all' && l.labName !== selectedLab) return false;
    return true;
  });

  const totalLabExpensesYER = filteredExpenses.reduce(
    (sum, l) => sum + convertToYER(l.amount, l.currency, settings),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName || !amount) return;

    let linkedPatientName: string | undefined = undefined;
    if (caseId) {
      const c = cases.find((item) => item.id === caseId);
      if (c) linkedPatientName = c.patientName;
    }

    const expense: LabExpense = {
      id: `lab-${Date.now()}`,
      caseId: caseId || undefined,
      patientName: linkedPatientName,
      labName,
      description,
      amount: Number(amount),
      currency,
      date,
      recordedBy: currentUser.username,
    };

    await onAddLabExpense(expense);
    setIsAddModalOpen(false);
    setDescription('');
    setAmount('');
    setCaseId('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-600" />
            <span>سجل ومصاريف معامل الأسنان (التركيبات والزيركون)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة دقيقة لمستحقات معامل التعويضات السنية والربط مع الحالات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrintLabReport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>تقرير خرج المعامل</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل فاتورة معمل جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">
              إجمالي خرج المعامل (المعروض)
            </span>
            <span className="text-xl font-black text-amber-700 font-mono">
              {formatCurrency(totalLabExpensesYER, 'YER')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center">
          <div className="relative w-full text-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالمعمل، البيان، أو المريض..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 pr-9 text-slate-800 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center">
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-slate-800 outline-hidden font-semibold"
          >
            <option value="all">جميع معامل الأسنان</option>
            {uniqueLabs.map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">اسم المعمل</th>
                <th className="p-3">بيان التعويض / الإجراء</th>
                <th className="p-3">المريض المرتبط</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">المسجل</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد فواتير معامل مطابقة
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-600">{l.date}</td>
                    <td className="p-3 font-bold text-slate-900">{l.labName}</td>
                    <td className="p-3 text-slate-700 max-w-[200px]">{l.description}</td>
                    <td className="p-3">
                      {l.patientName ? (
                        <span className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-md font-semibold">
                          {l.patientName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">مصروف معمل عام</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-700">
                      {formatCurrency(l.amount, l.currency)}
                    </td>
                    <td className="p-3 text-slate-500">{l.recordedBy}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteLabExpense(l.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="حذف القيد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lab Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">تسجيل خرج معمل جديد</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المعمل *</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="مثال: مختبر النخبة للأسنان والزيركون"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ربط بحالة مريض (اختياري)
                </label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                >
                  <option value="">بدون ربط (خرج معمل عام للعيادة)</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.patientName} — {c.treatment} ({c.date})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  عند الربط بحالة، سيتم تحديث خرج المعمل في الحالة تلقائياً وإعادة حساب حصص الدكتور والعيادة.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البيان وتفاصيل العمل السني
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: تاج زيركون تجميلي 3 وحدات، صب دعامة، جهاز تقويم..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  حفظ الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
