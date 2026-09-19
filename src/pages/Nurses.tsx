import React, { useState } from 'react';
import {
  Nurse,
  NurseTransaction,
  NurseTransactionType,
  User,
  Currency,
  ClinicSettings,
} from '../types';
import { formatCurrency } from '../lib/calc';
import {
  HeartPulse,
  Plus,
  Printer,
  Calendar,
  Phone,
  DollarSign,
  Trash2,
  X,
  CreditCard,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface NursesProps {
  nurses: Nurse[];
  transactions: NurseTransaction[];
  settings: ClinicSettings;
  currentUser: User;
  onAddNurse: (nurse: Nurse) => Promise<void>;
  onAddTransaction: (tx: NurseTransaction) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onPrintPayslip: (nurse: Nurse, monthLabel: string) => void;
}

export const Nurses: React.FC<NursesProps> = ({
  nurses,
  transactions,
  settings,
  currentUser,
  onAddNurse,
  onAddTransaction,
  onDeleteTransaction,
  onPrintPayslip,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeNurseForTx, setActiveNurseForTx] = useState<Nurse | null>(null);

  // Add nurse modal
  const [isAddNurseModalOpen, setIsAddNurseModalOpen] = useState(false);
  const [nurseName, setNurseName] = useState('');
  const [nursePhone, setNursePhone] = useState('');
  const [nurseSalary, setNurseSalary] = useState<number | ''>(120000);
  const [nurseCurrency, setNurseCurrency] = useState<Currency>('YER');

  // Transaction form states
  const [txType, setTxType] = useState<NurseTransactionType>('withdrawal');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txNotes, setTxNotes] = useState('سلفة نقدية على الراتب');

  const handleAddNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseName.trim() || !nurseSalary) return;

    const newNurse: Nurse = {
      id: `nur-${Date.now()}`,
      name: nurseName.trim(),
      phone: nursePhone.trim(),
      baseSalary: Number(nurseSalary),
      currency: nurseCurrency,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    await onAddNurse(newNurse);
    setIsAddNurseModalOpen(false);
    setNurseName('');
    setNursePhone('');
  };

  const handleAddTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNurseForTx || !txAmount) return;

    const tx: NurseTransaction = {
      id: `nur-tx-${Date.now()}`,
      nurseId: activeNurseForTx.id,
      nurseName: activeNurseForTx.name,
      type: txType,
      amount: Number(txAmount),
      currency: activeNurseForTx.currency,
      date: new Date().toISOString().split('T')[0],
      notes: txNotes,
      createdBy: currentUser.username,
    };

    await onAddTransaction(tx);
    setActiveNurseForTx(null);
    setTxAmount('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-cyan-600" />
            <span>إدارة الكادر التمريضي ومسير الرواتب</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة دقيقة للرواتب الأساسية، السحبيات النقدية، العلاوات والخصومات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddNurseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ممرضة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Nurses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nurses.map((nurse) => {
          const nurseTx = transactions.filter(
            (t) => t.nurseId === nurse.id && t.date.startsWith(selectedMonth)
          );

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
            <div
              key={nurse.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{nurse.name}</h3>
                    <span className="text-xs text-slate-500 block">
                      تاريخ التعيين: {nurse.hireDate}
                    </span>
                  </div>
                  <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-1 rounded-xl text-xs font-mono font-bold">
                    نشطة
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mb-4">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">+967 {nurse.phone}</span>
                </div>

                {/* Salary Financial Sheet Breakdown */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>الراتب الأساسي:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(nurse.baseSalary, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-700">
                    <span>(+) العلاوات والمكافآت:</span>
                    <span className="font-mono font-bold">
                      + {formatCurrency(bonuses, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700">
                    <span>(-) السحبيات النقدية:</span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(withdrawals, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-rose-700">
                    <span>(-) الخصومات والجزاءات:</span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(deductions, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-cyan-900 bg-cyan-100/50 p-2 rounded-lg">
                    <span>الصافي المستحق:</span>
                    <span className="font-mono text-sm font-black">
                      {formatCurrency(netDue, nurse.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 bg-slate-50 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveNurseForTx(nurse);
                    setTxAmount('');
                    setTxType('withdrawal');
                  }}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل حركة مالية</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintPayslip(nurse, selectedMonth)}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all"
                  title="طباعة قسيمة الراتب"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Nurse Modal */}
      {isAddNurseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">تسجيل ممرضة جديدة</h3>
              <button
                type="button"
                onClick={() => setIsAddNurseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNurseSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الممرضة *</label>
                <input
                  type="text"
                  required
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  placeholder="مثال: فاطمة علي الريمي"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={nursePhone}
                  onChange={(e) => setNursePhone(e.target.value)}
                  placeholder="770112233"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الراتب الأساسي الشهري *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={nurseSalary}
                    onChange={(e) =>
                      setNurseSalary(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="120000"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة</label>
                  <select
                    value={nurseCurrency}
                    onChange={(e) => setNurseCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNurseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  حفظ وتسجيل الممرضة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Transaction Modal (Withdrawal / Bonus / Deduction) */}
      {activeNurseForTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                حركة مالية للممرضة: {activeNurseForTx.name}
              </h3>
              <button
                type="button"
                onClick={() => setActiveNurseForTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الحركة *</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as NurseTransactionType)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                >
                  <option value="withdrawal">سحب نقدي (عربون مقدم على الراتب)</option>
                  <option value="bonus">علاوة شهرية إضافية</option>
                  <option value="reward">مكافأة تميز وإتقان</option>
                  <option value="deduction">خصم / جزاء</option>
                  <option value="salary">تسليم راتب كامل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ ({activeNurseForTx.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان وملاحظات الحركة</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="مثال: سلفة نقدية، مكافأة مناوبة إضافية..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNurseForTx(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  اعتماد وتسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
