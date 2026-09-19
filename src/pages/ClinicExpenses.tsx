import React, { useState } from 'react';
import {
  ClinicExpense,
  ExpenseCategory,
  Currency,
  User,
  ClinicSettings,
} from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Trash2,
  DollarSign,
  X,
  Zap,
  Droplets,
  Building,
  Box,
  Wrench,
  Users2,
  FileText,
} from 'lucide-react';

interface ClinicExpensesProps {
  expenses: ClinicExpense[];
  settings: ClinicSettings;
  currentUser: User;
  onAddExpense: (expense: ClinicExpense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

const CATEGORY_MAP: Record<
  ExpenseCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  electricity: { label: 'كهرباء وديزل مولد', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  water: { label: 'مياه وخزانات تعقيم', icon: Droplets, color: 'text-cyan-600 bg-cyan-50' },
  rent: { label: 'إيجار مقر المركز', icon: Building, color: 'text-indigo-600 bg-indigo-50' },
  supplies: { label: 'مستلزمات ومواد طبية', icon: Box, color: 'text-emerald-600 bg-emerald-50' },
  maintenance: { label: 'صيانة كراسي وأجهزة', icon: Wrench, color: 'text-rose-600 bg-rose-50' },
  salaries: { label: 'رواتب وأجور عمالة', icon: Users2, color: 'text-blue-600 bg-blue-50' },
  other: { label: 'نثريات ومصاريف أخرى', icon: FileText, color: 'text-slate-600 bg-slate-50' },
};

export const ClinicExpenses: React.FC<ClinicExpensesProps> = ({
  expenses,
  settings,
  currentUser,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('supplies');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>('YER');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.trim().toLowerCase();
    if (q && !e.description.toLowerCase().includes(q)) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  const totalExpensesYER = filteredExpenses.reduce(
    (sum, e) => sum + convertToYER(e.amount, e.currency, settings),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const expense: ClinicExpense = {
      id: `exp-${Date.now()}`,
      category,
      description: description.trim(),
      amount: Number(amount),
      currency,
      date,
      recordedBy: currentUser.username,
    };

    await onAddExpense(expense);
    setIsAddModalOpen(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>مصاريف ونثريات العيادة اليومية والتشغيلية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تسجيل كافة المصروفات التشغيلية لتسويتها مع صندوق النقد اليومي
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل مصروف جديد</span>
        </button>
      </div>

      {/* KPI Cards & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">
              إجمالي المصروفات (المعروضة)
            </span>
            <span className="text-xl font-black text-rose-700 font-mono">
              {formatCurrency(totalExpensesYER, 'YER')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center">
          <div className="relative w-full text-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في بيان المصروف..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 pr-9 text-slate-800 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-slate-800 outline-hidden font-semibold"
          >
            <option value="all">كافة التصنيفات</option>
            {Object.entries(CATEGORY_MAP).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
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
                <th className="p-3">التصنيف</th>
                <th className="p-3">البيان والشرح</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">المسجل</th>
                <th className="p-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    لا توجد مصاريف مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const cat = CATEGORY_MAP[exp.category] || CATEGORY_MAP.other;
                  const Icon = cat.icon;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${cat.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-[280px]">
                        {exp.description}
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-700">
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td className="p-3 text-slate-500">{exp.recordedBy}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">تسجيل مصروف جديد</h3>
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
                <label className="block font-bold text-slate-700 mb-1">تصنيف المصروف *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                >
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
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
                  البيان وشرح المصروف *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: شراء ديزل لتشغيل المولد، شراء كراتين قفازات وكمامات..."
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/30 cursor-pointer"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
