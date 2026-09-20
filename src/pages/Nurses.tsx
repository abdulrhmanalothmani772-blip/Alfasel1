import React, { useState } from 'react';
import {
  Nurse,
  NurseTransaction,
  NurseTransactionType,
  User,
  Currency,
  ClinicSettings,
  Branch,
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
  Building2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
  FileSpreadsheet,
  Edit2,
  History,
  CheckCircle2,
} from 'lucide-react';

interface NursesProps {
  nurses: Nurse[];
  transactions: NurseTransaction[];
  settings: ClinicSettings;
  currentUser: User;
  branches?: Branch[];
  activeBranchId?: string;
  onAddNurse: (nurse: Nurse) => Promise<void>;
  onUpdateNurse?: (nurse: Nurse) => Promise<void>;
  onAddTransaction: (tx: NurseTransaction) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onPrintPayslip: (nurse: Nurse, monthLabel: string) => void;
  onPrintPayrollSheet?: (nurses: Nurse[], monthLabel: string, branchName: string) => void;
}

export const Nurses: React.FC<NursesProps> = ({
  nurses,
  transactions,
  settings,
  currentUser,
  branches = [],
  activeBranchId = 'all',
  onAddNurse,
  onUpdateNurse,
  onAddTransaction,
  onDeleteTransaction,
  onPrintPayslip,
  onPrintPayrollSheet,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranchId);

  // Modals
  const [isAddNurseModalOpen, setIsAddNurseModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [activeNurseForTx, setActiveNurseForTx] = useState<Nurse | null>(null);
  const [viewHistoryNurse, setViewHistoryNurse] = useState<Nurse | null>(null);

  // Add / Edit Nurse form states
  const [nurseName, setNurseName] = useState('');
  const [nursePhone, setNursePhone] = useState('');
  const [nurseJobTitle, setNurseJobTitle] = useState('مسؤولة تعقيم وتمريض العيادة');
  const [nurseBranchId, setNurseBranchId] = useState('');
  const [nurseSalary, setNurseSalary] = useState<number | ''>(120000);
  const [nurseCurrency, setNurseCurrency] = useState<Currency>('YER');
  const [nurseNotes, setNurseNotes] = useState('');

  // Transaction form states
  const [txType, setTxType] = useState<NurseTransactionType>('deduction');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txReason, setTxReason] = useState('غياب بدون إذن');
  const [txNotes, setTxNotes] = useState('');

  const DEDUCTION_REASONS = [
    'غياب بدون إذن مسبق',
    'تأخير صباحي متكرر عن موعد الدوام',
    'إهمال في بروتوكول التعقيم والتطهير',
    'كسر أو تلف أدوات أو أجهزة طبية',
    'سوء تعامل أو شكوى مريض',
    'مخالفة إدارية للائحة المركز',
    'أخرى (حسب البيان المرفق)',
  ];

  const BONUS_REASONS = [
    'مناوبة وساعات عمل إضافية',
    'تميز استثنائي في التعقيم والنظافة',
    'مساعدة جراحة وزراعة أسنان معقدة',
    'مكافأة عيد ومناسبة رسمية',
    'مكافأة حسن انضباط والتزام',
  ];

  const openAddNurseModal = () => {
    setEditingNurse(null);
    setNurseName('');
    setNursePhone('');
    setNurseJobTitle('مسؤولة تعقيم وتمريض العيادة');
    setNurseBranchId(selectedBranchFilter !== 'all' ? selectedBranchFilter : branches[0]?.id || '');
    setNurseSalary(120000);
    setNurseCurrency('YER');
    setNurseNotes('');
    setIsAddNurseModalOpen(true);
  };

  const openEditNurseModal = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setNurseName(nurse.name);
    setNursePhone(nurse.phone);
    setNurseJobTitle(nurse.jobTitle || 'مسؤولة تعقيم العيادة');
    setNurseBranchId(nurse.branchId || '');
    setNurseSalary(nurse.baseSalary);
    setNurseCurrency(nurse.currency);
    setNurseNotes(nurse.notes || '');
    setIsAddNurseModalOpen(true);
  };

  const handleNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseName.trim() || !nurseSalary) return;

    const selectedBranch = branches.find((b) => b.id === nurseBranchId);

    if (editingNurse) {
      const updated: Nurse = {
        ...editingNurse,
        name: nurseName.trim(),
        phone: nursePhone.trim(),
        jobTitle: nurseJobTitle.trim(),
        branchId: nurseBranchId || undefined,
        branchName: selectedBranch ? selectedBranch.name : undefined,
        baseSalary: Number(nurseSalary),
        currency: nurseCurrency,
        notes: nurseNotes.trim(),
      };
      if (onUpdateNurse) {
        await onUpdateNurse(updated);
      } else {
        await onAddNurse(updated);
      }
    } else {
      const newNurse: Nurse = {
        id: `nur-${Date.now()}`,
        name: nurseName.trim(),
        phone: nursePhone.trim(),
        jobTitle: nurseJobTitle.trim(),
        branchId: nurseBranchId || undefined,
        branchName: selectedBranch ? selectedBranch.name : undefined,
        baseSalary: Number(nurseSalary),
        currency: nurseCurrency,
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: nurseNotes.trim(),
      };
      await onAddNurse(newNurse);
    }

    setIsAddNurseModalOpen(false);
  };

  const openTransactionModal = (nurse: Nurse, defaultType: NurseTransactionType) => {
    setActiveNurseForTx(nurse);
    setTxType(defaultType);
    setTxAmount('');
    if (defaultType === 'deduction') {
      setTxReason(DEDUCTION_REASONS[0]);
      setTxNotes('خصم إداري من الراتب');
    } else if (defaultType === 'bonus' || defaultType === 'reward') {
      setTxReason(BONUS_REASONS[0]);
      setTxNotes('مكافأة تميز وعمل إضافي');
    } else if (defaultType === 'withdrawal' || defaultType === 'advance') {
      setTxReason('سلفة نقدية على الحساب');
      setTxNotes('سلفة نقدية مستردة من راتب الشهر');
    } else {
      // Full salary payout
      const nurseTx = transactions.filter(
        (t) => t.nurseId === nurse.id && t.date.startsWith(selectedMonth)
      );
      const bonuses = nurseTx
        .filter((t) => t.type === 'bonus' || t.type === 'reward')
        .reduce((sum, t) => sum + t.amount, 0);
      const withdrawals = nurseTx
        .filter((t) => t.type === 'withdrawal' || t.type === 'advance')
        .reduce((sum, t) => sum + t.amount, 0);
      const deductions = nurseTx
        .filter((t) => t.type === 'deduction')
        .reduce((sum, t) => sum + t.amount, 0);
      const net = nurse.baseSalary + bonuses - withdrawals - deductions;

      setTxAmount(net > 0 ? net : '');
      setTxReason('تسليم الراتب الشهري الصافي');
      setTxNotes(`صرف صافي راتب شهر ${selectedMonth}`);
    }
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
      reason: txReason,
      notes: txNotes || txReason,
      branchId: activeNurseForTx.branchId,
      branchName: activeNurseForTx.branchName,
      createdBy: currentUser.fullName || currentUser.username,
    };

    await onAddTransaction(tx);
    setActiveNurseForTx(null);
    setTxAmount('');
    setTxNotes('');
  };

  // Filter nurses by active status and selected branch
  const filteredNurses = nurses
    .filter((n) => n.status === 'active')
    .filter((n) => {
      if (selectedBranchFilter === 'all') return true;
      return n.branchId === selectedBranchFilter;
    });

  // Totals for the branch/clinic this month
  let totalSalaries = 0;
  let totalBonuses = 0;
  let totalWithdrawals = 0;
  let totalDeductions = 0;
  let totalNetDue = 0;

  filteredNurses.forEach((nurse) => {
    const nurseTx = transactions.filter(
      (t) => t.nurseId === nurse.id && t.date.startsWith(selectedMonth)
    );
    const bonuses = nurseTx
      .filter((t) => t.type === 'bonus' || t.type === 'reward')
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = nurseTx
      .filter((t) => t.type === 'withdrawal' || t.type === 'advance')
      .reduce((sum, t) => sum + t.amount, 0);
    const deductions = nurseTx
      .filter((t) => t.type === 'deduction')
      .reduce((sum, t) => sum + t.amount, 0);
    const net = nurse.baseSalary + bonuses - withdrawals - deductions;

    totalSalaries += nurse.baseSalary;
    totalBonuses += bonuses;
    totalWithdrawals += withdrawals;
    totalDeductions += deductions;
    totalNetDue += net;
  });

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>إدارة شؤون التمريض والرواتب والخصومات</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono font-bold">
                  {filteredNurses.length} ممرضة
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                نظام دقيق للرواتب الأساسية، السلف النقدية، الجزاءات والخصومات، ومسير الرواتب لكل فرع
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden cursor-pointer"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAddNurseModal}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ممرضة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Branch Tabs Filter */}
      {branches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedBranchFilter('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedBranchFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>كافة الفروع ({nurses.filter((n) => n.status === 'active').length})</span>
          </button>

          {branches.map((b) => {
            const count = nurses.filter((n) => n.status === 'active' && n.branchId === b.id).length;
            const isSelected = selectedBranchFilter === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranchFilter(b.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm shadow-cyan-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{b.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Monthly Payroll Summary Bar */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-cyan-950 p-5 rounded-3xl text-white shadow-lg border border-cyan-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60 mb-4">
          <div>
            <span className="text-xs text-cyan-400 font-bold block mb-1">
              مسير الرواتب المعتمد لشهر {selectedMonth}
            </span>
            <h3 className="text-base font-black flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <span>
                {selectedBranchFilter === 'all'
                  ? 'إجمالي مسير رواتب كافة الفروع'
                  : `مسير رواتب ${branches.find((b) => b.id === selectedBranchFilter)?.name || 'الفرع'}`}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              عدد الكادر النشط: <b className="text-white font-mono">{filteredNurses.length}</b>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block mb-1">إجمالي الرواتب الأساسية</span>
            <span className="font-mono font-bold text-sm text-cyan-300">
              {formatCurrency(totalSalaries, 'YER')}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-emerald-400 block mb-1">(+) المكافآت والعلاوات</span>
            <span className="font-mono font-bold text-sm text-emerald-300">
              +{formatCurrency(totalBonuses, 'YER')}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-amber-400 block mb-1">(-) السلف والسحبيات</span>
            <span className="font-mono font-bold text-sm text-amber-300">
              -{formatCurrency(totalWithdrawals, 'YER')}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-rose-400 block mb-1">(-) الخصومات والجزاءات</span>
            <span className="font-mono font-bold text-sm text-rose-300">
              -{formatCurrency(totalDeductions, 'YER')}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-cyan-900/60 p-3 rounded-2xl border border-cyan-500/40 shadow-inner">
            <span className="text-[10px] text-cyan-200 block mb-1 font-bold">
              (=) صافي المستحق للصرف
            </span>
            <span className="font-mono font-black text-base text-white">
              {formatCurrency(totalNetDue, 'YER')}
            </span>
          </div>
        </div>
      </div>

      {/* Nurses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNurses.map((nurse) => {
          const nurseTx = transactions.filter(
            (t) => t.nurseId === nurse.id && t.date.startsWith(selectedMonth)
          );

          const bonuses = nurseTx
            .filter((t) => t.type === 'bonus' || t.type === 'reward')
            .reduce((sum, t) => sum + t.amount, 0);

          const withdrawals = nurseTx
            .filter((t) => t.type === 'withdrawal' || t.type === 'advance')
            .reduce((sum, t) => sum + t.amount, 0);

          const deductions = nurseTx
            .filter((t) => t.type === 'deduction')
            .reduce((sum, t) => sum + t.amount, 0);

          // مستحق الممرضة = الراتب الأساسي + العلاوات − السحبيات − الخصومات
          const netDue = nurse.baseSalary + bonuses - withdrawals - deductions;
          const nurseBranch = branches.find((b) => b.id === nurse.branchId);

          return (
            <div
              key={nurse.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 border-b border-slate-100">
                {/* Branch affiliation & Job title */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">
                      {nurseBranch ? nurseBranch.name : nurse.branchName || 'كافة الفروع'}
                    </span>
                  </div>

                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    نشطة
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{nurse.name}</h3>
                      <span className="text-xs text-cyan-700 font-semibold block mt-0.5">
                        {nurse.jobTitle || 'مسؤولة تمريض وعيادات'}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => openEditNurseModal(nurse)}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg transition-colors cursor-pointer"
                        title="تعديل بيانات الممرضة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    تاريخ التعيين: {nurse.hireDate}
                  </span>
                </div>

                {nurse.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mb-4">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span dir="ltr">+967 {nurse.phone}</span>
                  </div>
                )}

                {/* Salary Financial Sheet Breakdown */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">الراتب الأساسي:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(nurse.baseSalary, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>(+) العلاوات والمكافآت:</span>
                    </span>
                    <span className="font-mono font-bold">
                      + {formatCurrency(bonuses, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                      <span>(-) السلف والسحبيات:</span>
                    </span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(withdrawals, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-rose-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>(-) الخصومات والجزاءات:</span>
                    </span>
                    <span className="font-mono font-bold">
                      - {formatCurrency(deductions, nurse.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-bold text-cyan-900 bg-cyan-100/60 p-2 rounded-xl mt-1">
                    <span className="text-xs font-black">الصافي المستحق:</span>
                    <span className="font-mono text-sm font-black text-cyan-950">
                      {formatCurrency(netDue, nurse.currency)}
                    </span>
                  </div>
                </div>

                {/* Quick Transactions Count & History Link */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>حركات الشهر ({nurseTx.length})</span>
                  {nurseTx.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setViewHistoryNurse(nurse)}
                      className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>عرض سجل الخصومات والسلف</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 bg-slate-50/80 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openTransactionModal(nurse, 'deduction')}
                    className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>تسجيل خصم/جزاء</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openTransactionModal(nurse, 'advance')}
                    className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>تسجيل سلفة</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openTransactionModal(nurse, 'bonus')}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>مكافأة وعلاوة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPrintPayslip(nurse, selectedMonth)}
                    className="py-2 px-3 bg-white hover:bg-cyan-50 text-cyan-800 border border-slate-200 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="طباعة قسيمة الراتب"
                  >
                    <Printer className="w-4 h-4 text-cyan-600" />
                    <span>قسيمة راتب</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNurses.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            لا توجد ممرضات مسجلات في هذا الفرع
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            يمكنك تسجيل ممرضة جديدة وتحديد راتبها الأساسي وفرعها بالضغط على "إضافة ممرضة جديدة"
          </p>
        </div>
      )}

      {/* Add / Edit Nurse Modal */}
      {isAddNurseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingNurse ? 'تعديل بيانات الممرضة والراتب' : 'تسجيل ممرضة جديدة في الكادر'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تحديد الفرع، المسمى الوظيفي، والراتب الأساسي المعتمد
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNurseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNurseSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الممرضة الرباعي *</label>
                <input
                  type="text"
                  required
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  placeholder="مثال: فاطمة علي الريمي"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-bold"
                />
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الفرع التابعة له الممرضة *
                </label>
                <div className="relative">
                  <select
                    value={nurseBranchId}
                    onChange={(e) => setNurseBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-bold appearance-none pr-8"
                  >
                    <option value="">كافة الفروع (ممرضة متنقلة)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city}) {b.isMain ? '• المركز الرئيسي' : ''}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-cyan-600 absolute top-3 right-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المسمى والتخصص الوظيفي *
                </label>
                <input
                  type="text"
                  required
                  value={nurseJobTitle}
                  onChange={(e) => setNurseJobTitle(e.target.value)}
                  placeholder="مثال: مسؤولة تعقيم العيادات، مساعدة جراحة وزراعة..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب</label>
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-mono font-bold text-sm text-cyan-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">عملة الراتب</label>
                  <select
                    value={nurseCurrency}
                    onChange={(e) => setNurseCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إدارية</label>
                <textarea
                  rows={2}
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  placeholder="أيام ومواعيد الدوام، شروط العقد، تعليمات التعقيم..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNurseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  {editingNurse ? 'حفظ التعديلات' : 'تسجيل الممرضة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Financial Transaction Modal (Deduction / Advance / Bonus / Salary) */}
      {activeNurseForTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <span>تسجيل حركة مالية: {activeNurseForTx.name}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  الراتب الأساسي: {formatCurrency(activeNurseForTx.baseSalary, activeNurseForTx.currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveNurseForTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الحركة المالية *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('deduction');
                      setTxReason(DEDUCTION_REASONS[0]);
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txType === 'deduction'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>خصم / جزاء</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxType('advance');
                      setTxReason('سلفة نقدية على الراتب');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txType === 'advance' || txType === 'withdrawal'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    <span>سلفة نقدية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxType('bonus');
                      setTxReason(BONUS_REASONS[0]);
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txType === 'bonus' || txType === 'reward'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>مكافأة وعلاوة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxType('salary');
                      setTxReason('صرف الراتب الشهري');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txType === 'salary'
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>صرف راتب</span>
                  </button>
                </div>
              </div>

              {/* Presets based on type */}
              {txType === 'deduction' && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">سبب الخصم / الجزاء *</label>
                  <select
                    value={txReason}
                    onChange={(e) => setTxReason(e.target.value)}
                    className="w-full bg-rose-50/50 border border-rose-200 focus:border-rose-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    {DEDUCTION_REASONS.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(txType === 'bonus' || txType === 'reward') && (
                <div>
                  <label className="block font-bold text-emerald-700 mb-1">
                    بند المكافأة أو العلاوة *
                  </label>
                  <select
                    value={txReason}
                    onChange={(e) => setTxReason(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-200 focus:border-emerald-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    {BONUS_REASONS.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-mono font-bold text-base text-cyan-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وبيان الحركة</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="أدخل توضيح إضافي إن وجد..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveNurseForTx(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  اعتماد وتسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View History & Deductions Modal */}
      {viewHistoryNurse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    سجل الخصومات والسلف: {viewHistoryNurse.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    حركات شهر {selectedMonth}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryNurse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {transactions
                .filter(
                  (t) =>
                    t.nurseId === viewHistoryNurse.id && t.date.startsWith(selectedMonth)
                )
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          tx.type === 'deduction'
                            ? 'bg-rose-500'
                            : tx.type === 'bonus' || tx.type === 'reward'
                            ? 'bg-emerald-500'
                            : tx.type === 'salary'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {tx.reason || tx.notes}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.type === 'deduction'
                                ? 'bg-rose-100 text-rose-800'
                                : tx.type === 'bonus' || tx.type === 'reward'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.type === 'salary'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.type === 'deduction'
                              ? 'خصم'
                              : tx.type === 'bonus' || tx.type === 'reward'
                              ? 'مكافأة'
                              : tx.type === 'salary'
                              ? 'راتب'
                              : 'سلفة'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{tx.date}</span>
                          <span>•</span>
                          <span>المسؤول: {tx.createdBy}</span>
                          {tx.notes && tx.notes !== tx.reason && (
                            <>
                              <span>•</span>
                              <span>{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-sm ${
                          tx.type === 'deduction'
                            ? 'text-rose-600'
                            : tx.type === 'bonus' || tx.type === 'reward'
                            ? 'text-emerald-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {tx.type === 'deduction' ? '-' : tx.type === 'bonus' ? '+' : ''}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                          title="حذف الحركة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryNurse(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
