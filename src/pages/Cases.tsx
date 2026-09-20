import React, { useState } from 'react';
import {
  DentalCase,
  Patient,
  Doctor,
  Discount,
  Currency,
  CasePayment,
  User,
  ClinicSettings,
  Branch,
} from '../types';
import {
  calculateCaseFinancials,
  computeDiscountValue,
  formatCurrency,
} from '../lib/calc';
import { DentalChart } from '../components/DentalChart';
import {
  Stethoscope,
  Plus,
  Search,
  Lock,
  Printer,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  X,
  CreditCard,
  Trash2,
  Edit,
  Sparkles,
  Info,
  Building2,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

interface CasesProps {
  cases: DentalCase[];
  patients: Patient[];
  doctors: Doctor[];
  discounts: Discount[];
  settings: ClinicSettings;
  currentUser: User;
  branches?: Branch[];
  activeBranchId?: string;
  onAddCase: (dentalCase: DentalCase) => Promise<void>;
  onUpdateCase: (dentalCase: DentalCase) => Promise<void>;
  onDeleteCase: (id: string) => Promise<void>;
  onAddPayment: (caseId: string, payment: CasePayment) => Promise<void>;
  onSelectPrintExamSheet: (dentalCase: DentalCase) => void;
  onSelectPrintInvoice: (dentalCase: DentalCase) => void;
  onSelectPrintCaseSummary: (dentalCase: DentalCase) => void;
  preselectedPatient?: Patient | null;
}

export const Cases: React.FC<CasesProps> = ({
  cases,
  patients,
  doctors,
  discounts,
  settings,
  currentUser,
  branches = [],
  activeBranchId = 'all',
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onAddPayment,
  onSelectPrintExamSheet,
  onSelectPrintInvoice,
  onSelectPrintCaseSummary,
  preselectedPatient,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState<string>(activeBranchId || 'all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [quickFilter, setQuickFilter] = useState<'all' | 'unpaid' | 'paid' | 'today'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedPatient);
  const [editingCase, setEditingCase] = useState<DentalCase | null>(null);

  // Payment recording modal
  const [paymentModalCase, setPaymentModalCase] = useState<DentalCase | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNotes, setPaymentNotes] = useState('سداد دفعة نقدية');

  // Form states for Add / Edit Case
  const [patientId, setPatientId] = useState(preselectedPatient?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [caseBranchId, setCaseBranchId] = useState<string>(
    activeBranchId && activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || ''
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [teethNumbers, setTeethNumbers] = useState<string[]>([]);
  const [grossAmount, setGrossAmount] = useState<number | ''>('');
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number | ''>('');
  const [labExpenseAmount, setLabExpenseAmount] = useState<number | ''>('');
  const [isNoDoctorShare, setIsNoDoctorShare] = useState(false);
  const [doctorPercentage, setDoctorPercentage] = useState<number>(doctors[0]?.percentage || 40);
  const [currency, setCurrency] = useState<Currency>('YER');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'new' | 'in_progress' | 'completed' | 'followup'>('completed');

  // When doctor changes, update default percentage
  const handleDoctorChange = (docId: string) => {
    setDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setDoctorPercentage(doc.percentage);
    }
  };

  // Calculate discount amount
  const calculatedDiscountAmount = (() => {
    const gross = Number(grossAmount) || 0;
    if (selectedDiscountId && selectedDiscountId !== 'custom') {
      const disc = discounts.find((d) => d.id === selectedDiscountId);
      if (disc) {
        return computeDiscountValue(gross, disc.type, disc.value);
      }
    }
    return Number(customDiscountAmount) || 0;
  })();

  // Live Pure Financial Calculation
  const liveFinancials = calculateCaseFinancials({
    grossAmount: Number(grossAmount) || 0,
    discountAmount: calculatedDiscountAmount,
    labExpenseAmount: Number(labExpenseAmount) || 0,
    doctorPercentage: isNoDoctorShare ? 0 : Number(doctorPercentage) || 0,
    isNoDoctorShare,
    paidAmount: Number(paidAmount) || 0,
  });

  const openAddModal = (presetPat?: Patient) => {
    setEditingCase(null);
    setPatientId(presetPat ? presetPat.id : patients[0]?.id || '');
    setDoctorId(doctors[0]?.id || '');
    setDoctorPercentage(doctors[0]?.percentage || 40);
    setCaseBranchId(activeBranchId && activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setDiagnosis('');
    setTreatment('');
    setTeethNumbers([]);
    setGrossAmount('');
    setSelectedDiscountId('');
    setCustomDiscountAmount('');
    setLabExpenseAmount('');
    setIsNoDoctorShare(false);
    setCurrency('YER');
    setPaidAmount('');
    setNextAppointmentDate('');
    setNotes('');
    setStatus('completed');
    setIsModalOpen(true);
  };

  const openEditModal = (c: DentalCase) => {
    setEditingCase(c);
    setPatientId(c.patientId);
    setDoctorId(c.doctorId);
    setDoctorPercentage(c.doctorPercentage);
    setCaseBranchId(c.branchId || branches[0]?.id || '');
    setDate(c.date);
    setDiagnosis(c.diagnosis);
    setTreatment(c.treatment);
    setTeethNumbers(c.teethNumbers || []);
    setGrossAmount(c.grossAmount);
    setSelectedDiscountId(c.discountId || '');
    setCustomDiscountAmount(c.discountAmount || '');
    setLabExpenseAmount(c.labExpenseAmount || '');
    setIsNoDoctorShare(c.isNoDoctorShare);
    setCurrency(c.currency);
    setPaidAmount(c.paidAmount);
    setNextAppointmentDate(c.nextAppointmentDate || '');
    setNotes(c.notes || '');
    setStatus(c.status);
    setIsModalOpen(true);
  };

  // Check 24-hour rule:
  // "موظف الاستقبال مسموح له يعدل الحالات المسجلة خلال 24 ساعة فقط.
  // بعد 24 ساعة: تظهر الحالة للقراءة فقط مع قفل [🔒]، ولا يقدر يعدلها إلا المدير."
  const isCaseEditable = (c: DentalCase) => {
    if (isAdmin) return true;
    const createdAtTime = new Date(c.createdAt || c.date).getTime();
    const now = Date.now();
    const hoursDifference = (now - createdAtTime) / (1000 * 60 * 60);
    return hoursDifference <= 24;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    const discountObj = discounts.find((d) => d.id === selectedDiscountId);
    const discAmount = calculatedDiscountAmount;
    const branchObj = branches.find((b) => b.id === caseBranchId);

    if (editingCase) {
      const updated: DentalCase = {
        ...editingCase,
        patientId,
        patientName: patient.name,
        doctorId,
        doctorName: doctor.name,
        branchId: caseBranchId,
        branchName: branchObj?.name,
        date,
        diagnosis,
        treatment,
        teethNumbers,
        grossAmount: Number(grossAmount) || 0,
        discountId: selectedDiscountId,
        discountName: discountObj?.name,
        discountAmount: discAmount,
        amountAfterDiscount: liveFinancials.amountAfterDiscount,
        labExpenseAmount: Number(labExpenseAmount) || 0,
        isNoDoctorShare,
        doctorPercentage: Number(doctorPercentage) || 0,
        netAmount: liveFinancials.netAmount,
        doctorShare: liveFinancials.doctorShare,
        clinicShare: liveFinancials.clinicShare,
        paidAmount: Number(paidAmount) || 0,
        remainingAmount: liveFinancials.remainingAmount,
        currency,
        nextAppointmentDate: nextAppointmentDate || undefined,
        notes,
        status,
      };
      await onUpdateCase(updated);
    } else {
      const newCase: DentalCase = {
        id: `case-${Date.now()}`,
        patientId,
        patientName: patient.name,
        doctorId,
        doctorName: doctor.name,
        branchId: caseBranchId,
        branchName: branchObj?.name,
        date,
        diagnosis,
        treatment,
        teethNumbers,
        grossAmount: Number(grossAmount) || 0,
        discountId: selectedDiscountId,
        discountName: discountObj?.name,
        discountAmount: discAmount,
        amountAfterDiscount: liveFinancials.amountAfterDiscount,
        labExpenseAmount: Number(labExpenseAmount) || 0,
        isNoDoctorShare,
        doctorPercentage: Number(doctorPercentage) || 0,
        netAmount: liveFinancials.netAmount,
        doctorShare: liveFinancials.doctorShare,
        clinicShare: liveFinancials.clinicShare,
        paidAmount: Number(paidAmount) || 0,
        remainingAmount: liveFinancials.remainingAmount,
        currency,
        nextAppointmentDate: nextAppointmentDate || undefined,
        notes,
        status,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
        payments:
          Number(paidAmount) > 0
            ? [
                {
                  id: `pay-${Date.now()}`,
                  caseId: `case-${Date.now()}`,
                  amount: Number(paidAmount),
                  currency,
                  date,
                  receivedBy: currentUser.username,
                  notes: 'سداد نقدي أولي عند التسجيل',
                },
              ]
            : [],
      };
      await onAddCase(newCase);
    }

    setIsModalOpen(false);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCase || !paymentAmount) return;

    const payment: CasePayment = {
      id: `pay-${Date.now()}`,
      caseId: paymentModalCase.id,
      amount: Number(paymentAmount),
      currency: paymentModalCase.currency,
      date: new Date().toISOString().split('T')[0],
      notes: paymentNotes,
      receivedBy: currentUser.username,
    };

    await onAddPayment(paymentModalCase.id, payment);
    setPaymentModalCase(null);
    setPaymentAmount('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matchPatient = c.patientName.toLowerCase().includes(q);
      const matchDoctor = c.doctorName.toLowerCase().includes(q);
      const matchTreatment = c.treatment.toLowerCase().includes(q);
      if (!matchPatient && !matchDoctor && !matchTreatment) return false;
    }

    if (doctorFilter !== 'all' && c.doctorId !== doctorFilter) return false;
    if (currencyFilter !== 'all' && c.currency !== currencyFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    if (branchFilter !== 'all') {
      const matchBranch =
        c.branchId === branchFilter ||
        (!c.branchId && branches.find((b) => b.id === branchFilter)?.isMain);
      if (!matchBranch) return false;
    }

    if (quickFilter === 'unpaid' && c.remainingAmount <= 0) return false;
    if (quickFilter === 'paid' && c.remainingAmount > 0) return false;
    if (quickFilter === 'today' && c.date !== todayStr) return false;

    return true;
  });

  const unpaidCount = cases.filter((c) => c.remainingAmount > 0).length;
  const paidCount = cases.filter((c) => c.remainingAmount <= 0).length;
  const todayCount = cases.filter((c) => c.date === todayStr).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Required Clarification Formula Banner (MANDATORY in Prompt!) */}
      <div className="bg-cyan-950 border border-cyan-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs">
          <Info className="w-4 h-4" />
          <span>المعادلة المحاسبية المعتمدة بمركز الفيصل لطب الأسنان:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="bg-slate-900/90 px-2.5 py-1 rounded-md text-slate-200">
            المبلغ بعد الخصم = الإجمالي − الخصم
          </span>
          <span className="text-cyan-400">←</span>
          <span className="bg-slate-900/90 px-2.5 py-1 rounded-md text-slate-200">
            الصافي = بعد الخصم − خرج المعمل
          </span>
          <span className="text-cyan-400">←</span>
          <span className="bg-slate-900/90 px-2.5 py-1 rounded-md text-blue-300">
            نسبة الدكتور = الصافي × النسبة
          </span>
          <span className="text-cyan-400">←</span>
          <span className="bg-slate-900/90 px-2.5 py-1 rounded-md text-emerald-300">
            دخل العيادة = الصافي − نسبة الدكتور
          </span>
        </div>
        <div className="mt-2 text-[11px] text-cyan-200/90 bg-cyan-900/40 p-2 rounded-lg">
          <strong className="text-cyan-300">مثال توضيحي إلزامي:</strong> مريض 1,000 ريال، معمل 200،
          الصافي 800، نسبة دكتور 40% = 320، دخل العيادة = 480.
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-600" />
            <span>سجل الحالات والمعالجات السنية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي الحالات: {cases.length} حالة • قاعدة الـ 24 ساعة للاستقبال مفعّلة
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="عرض البطاقات الذكية (أفضل للموبايل)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="عرض الجدول المكتبي"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openAddModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-l from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل حالة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setQuickFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            quickFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          جميع الحالات ({cases.length})
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('unpaid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickFilter === 'unpaid'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span>متبقي عليها مبالغ</span>
          <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {unpaidCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('paid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickFilter === 'paid'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span>خالصة بالكامل</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {paidCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setQuickFilter('today')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickFilter === 'today'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>حالات اليوم</span>
          <span className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {todayCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="relative lg:col-span-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالمريض أو الطبيب..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 pr-9 text-slate-800 outline-hidden font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
        </div>

        {/* Branch Filter */}
        <div className="relative">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 outline-hidden font-bold"
          >
            <option value="all">🏢 جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 outline-hidden font-semibold"
        >
          <option value="all">جميع الأطباء</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 outline-hidden font-semibold"
        >
          <option value="all">جميع العملات (YER, SAR, USD)</option>
          <option value="YER">ريال يمني (YER)</option>
          <option value="SAR">ريال سعودي (SAR)</option>
          <option value="USD">دولار أمريكي (USD)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 outline-hidden font-semibold"
        >
          <option value="all">جميع الحالات</option>
          <option value="completed">مكتملة</option>
          <option value="in_progress">قيد العلاج</option>
          <option value="followup">متابعة</option>
          <option value="new">جديدة</option>
        </select>
      </div>

      {/* Main Content: Card View OR Table View */}
      {viewMode === 'cards' ? (
        /* Luxury Smart Cards Grid */
        filteredCases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold">لا توجد حالات مطابقة لمعايير البحث الحالية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCases.map((c) => {
              const editable = isCaseEditable(c);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between gap-3.5 relative overflow-hidden group"
                >
                  {/* Top Header: Patient name, ID, Date, Branch badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                          {c.patientName ? c.patientName.charAt(0) : 'م'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-cyan-600 transition-colors">
                            {c.patientName}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{c.date}</span>
                            <span>•</span>
                            <span>#{c.id.slice(-5)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Branch Badge */}
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-bold border border-slate-200/60 shrink-0">
                        {c.branchName || 'الفرع الرئيسي'}
                      </span>
                    </div>

                    {/* Doctor & Treatment Box */}
                    <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Stethoscope className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span>{c.doctorName}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                          {c.isNoDoctorShare ? '100% للعيادة' : `نسبة ${c.doctorPercentage}%`}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 pt-0.5">
                        {c.treatment}
                      </div>

                      {c.teethNumbers && c.teethNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {c.teethNumbers.map((t) => (
                            <span
                              key={t}
                              className="bg-cyan-100 text-cyan-900 border border-cyan-300/60 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Financial Summary Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/80 mt-2.5">
                      <div>
                        <div className="text-[9px] text-slate-400 font-medium">الإجمالي</div>
                        <div className="font-extrabold font-mono text-slate-900">
                          {formatCurrency(c.grossAmount, c.currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-medium">دخل العيادة</div>
                        <div className="font-extrabold font-mono text-emerald-600">
                          {formatCurrency(c.clinicShare, c.currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-medium">نسبة الطبيب</div>
                        <div className="font-extrabold font-mono text-blue-600">
                          {formatCurrency(c.doctorShare, c.currency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Status, Print actions, Edit/Delete */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    {/* Payment Status Bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">حالة السداد:</span>
                      {c.remainingAmount <= 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>خالص بالكامل</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-lg font-bold text-[11px] font-mono">
                            متبقي: {formatCurrency(c.remainingAmount, c.currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentModalCase(c);
                              setPaymentAmount(c.remainingAmount);
                            }}
                            className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                            title="تسجيل سداد دفعة"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>سداد</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Print Action Buttons (>= 48px touch-friendly) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectPrintInvoice(c)}
                        className="py-2 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="طباعة فاتورة / سند قبض"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-600" />
                        <span>فاتورة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPrintExamSheet(c)}
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="طباعة ورقة معاينة الطبيب"
                      >
                        <span>معاينة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPrintCaseSummary(c)}
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="طباعة كشف تفصيلي للحالة"
                      >
                        <span>كشف</span>
                      </button>
                    </div>

                    {/* Footer: Author & Edit/Delete */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[10px] text-slate-400">
                        سجلها: {c.createdBy || 'الاستقبال'}
                      </span>
                      <div className="flex items-center gap-1">
                        {editable ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="تعديل الحالة"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذه الحالة السنية؟')) {
                                    onDeleteCase(c.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف الحالة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-[10px] text-slate-400"
                            title="مغلقة للقراءة فقط (تجاوزت 24 ساعة)"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>مغلقة</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Desktop Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">المريض</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">الطبيب المعالج</th>
                  <th className="p-3">الإجراء السني / الأسنان</th>
                  <th className="p-3">الإجمالي والخصم</th>
                  <th className="p-3">خرج المعمل</th>
                  <th className="p-3">الصافي</th>
                  <th className="p-3 text-blue-700">نسبة الدكتور</th>
                  <th className="p-3 text-emerald-700">دخل العيادة</th>
                  <th className="p-3">المدفوع / المتبقي</th>
                  <th className="p-3 text-center">المستندات والطباعة</th>
                  <th className="p-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-400">
                      لا توجد حالات مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => {
                    const editable = isCaseEditable(c);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{c.date}</td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          {c.patientName}
                        </td>
                        <td className="p-3 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                          {c.branchName || 'الرئيسي'}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                          {c.doctorName}
                          <span className="block text-[10px] text-slate-400">
                            {c.isNoDoctorShare ? 'بدون نسبة' : `${c.doctorPercentage}%`}
                          </span>
                        </td>
                        <td className="p-3 max-w-[200px]">
                          <div className="font-semibold text-slate-800 line-clamp-1">{c.treatment}</div>
                          {c.teethNumbers && c.teethNumbers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {c.teethNumbers.map((t) => (
                                <span
                                  key={t}
                                  className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-1 py-0.2 rounded text-[10px] font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono">
                          <div className="font-bold text-slate-900">
                            {formatCurrency(c.grossAmount, c.currency)}
                          </div>
                          {c.discountAmount > 0 && (
                            <div className="text-[10px] text-rose-500">
                              خصم: -{formatCurrency(c.discountAmount, c.currency)}
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-amber-700 font-semibold">
                          {c.labExpenseAmount > 0
                            ? formatCurrency(c.labExpenseAmount, c.currency)
                            : '—'}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900 bg-slate-50/50">
                          {formatCurrency(c.netAmount, c.currency)}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono font-bold text-blue-700">
                          {formatCurrency(c.doctorShare, c.currency)}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono font-bold text-emerald-700 bg-emerald-50/30">
                          {formatCurrency(c.clinicShare, c.currency)}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono">
                          <div className="text-emerald-700 font-bold">
                            مدفوع: {formatCurrency(c.paidAmount, c.currency)}
                          </div>
                          {c.remainingAmount > 0 ? (
                            <div className="text-rose-600 font-bold text-[11px]">
                              متبقي: {formatCurrency(c.remainingAmount, c.currency)}
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-600 font-bold">خالص ✓</div>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectPrintInvoice(c)}
                              className="p-1 px-2 bg-slate-100 hover:bg-cyan-50 text-cyan-700 rounded-md font-bold text-[10px] transition-all cursor-pointer"
                              title="طباعة فاتورة / سند قبض"
                            >
                              فاتورة
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectPrintExamSheet(c)}
                              className="p-1 px-2 bg-slate-100 hover:bg-cyan-50 text-slate-700 rounded-md font-bold text-[10px] transition-all cursor-pointer"
                              title="طباعة ورقة معاينة الطبيب"
                            >
                              معاينة
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectPrintCaseSummary(c)}
                              className="p-1 px-2 bg-slate-100 hover:bg-cyan-50 text-slate-700 rounded-md font-bold text-[10px] transition-all cursor-pointer"
                              title="طباعة كشف تفصيلي للحالة"
                            >
                              كشف
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {c.remainingAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentModalCase(c);
                                  setPaymentAmount(c.remainingAmount);
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                title="تسجيل دفعة جديدة للمتبقي"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}

                            {editable ? (
                              <button
                                type="button"
                                onClick={() => openEditModal(c)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title="تعديل الحالة"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            ) : (
                              <span
                                className="p-1.5 text-slate-400 cursor-not-allowed"
                                title="مغلقة للقراءة فقط (تجاوزت 24 ساعة — يحق للمدير فقط التعديل)"
                              >
                                <Lock className="w-4 h-4 text-amber-500" />
                              </span>
                            )}

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذه الحالة؟')) {
                                    onDeleteCase(c.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="حذف الحالة (للمدير فقط)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCase ? 'تعديل بيانات الحالة الطبية' : 'تسجيل حالة معالجة جديدة'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  الحساب المحاسبي يتم آلياً وفورياً وفق معادلات مركز الفيصل
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient, Doctor, Branch & Date Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المريض *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    <option value="">اختر المريض...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.phone ? `(${p.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطبيب المعالج *</label>
                  <select
                    required
                    value={doctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفرع التابع له *</label>
                  <select
                    required
                    value={caseBranchId}
                    onChange={(e) => setCaseBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                  >
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))
                    ) : (
                      <option value="main-sanaa">فرع صنعاء - المركز الرئيسي</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ المعالجة *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Diagnosis and Treatment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    التشخيص السريري
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="مثال: تسوس عميق، التهاب عصب، فقدان سن، سوء إطباق..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الإجراء والعلاج المقدّم *
                  </label>
                  <input
                    type="text"
                    required
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="مثال: سحب عصب كامل، حشوة كمبوزيت تجميلية، جسر زيركون..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-semibold"
                  />
                </div>
              </div>

              {/* Interactive FDI Dental Chart */}
              <div className="my-2">
                <DentalChart
                  selectedTeeth={teethNumbers}
                  onChange={(teeth) => setTeethNumbers(teeth)}
                />
              </div>

              {/* Financial Inputs Row */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-600" />
                  <span>المعطيات المالية للحالة</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Currency */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">العملة</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                    >
                      <option value="YER">ريال يمني (YER)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </div>

                  {/* Gross Amount */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      المبلغ الإجمالي *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={grossAmount}
                      onChange={(e) => setGrossAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono font-bold text-sm"
                    />
                  </div>

                  {/* Discount selector */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">الخصم المعتمد</label>
                    <select
                      value={selectedDiscountId}
                      onChange={(e) => setSelectedDiscountId(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                    >
                      <option value="">بدون خصم (0%)</option>
                      {discounts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.type === 'percentage' ? `${d.value}%` : `${d.value} ثابت`})
                        </option>
                      ))}
                      <option value="custom">خصم مخصص (قيمة يدوية)...</option>
                    </select>
                  </div>

                  {/* Custom discount amount if selected */}
                  {selectedDiscountId === 'custom' ? (
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">قيمة الخصم اليدوي</label>
                      <input
                        type="number"
                        min="0"
                        value={customDiscountAmount}
                        onChange={(e) =>
                          setCustomDiscountAmount(e.target.value ? Number(e.target.value) : '')
                        }
                        placeholder="0"
                        className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">قيمة الخصم المحسوبة</label>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-emerald-700 font-mono font-bold">
                        {formatCurrency(calculatedDiscountAmount, currency)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* Lab expense */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">خرج المعمل</label>
                    <input
                      type="number"
                      min="0"
                      value={labExpenseAmount}
                      onChange={(e) =>
                        setLabExpenseAmount(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                    />
                  </div>

                  {/* Doctor percentage */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">نسبة الطبيب (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      disabled={isNoDoctorShare}
                      value={doctorPercentage}
                      onChange={(e) => setDoctorPercentage(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* Paid amount */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      المبلغ المدفوع (المسدد) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono font-bold"
                    />
                  </div>

                  {/* Next appointment date */}
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">الموعد القادم</label>
                    <input
                      type="date"
                      value={nextAppointmentDate}
                      onChange={(e) => setNextAppointmentDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Option: Case with NO Doctor Share (100% clinic) */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noDocShare"
                    checked={isNoDoctorShare}
                    onChange={(e) => setIsNoDoctorShare(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded-md"
                  />
                  <label htmlFor="noDocShare" className="font-bold text-slate-800 cursor-pointer">
                    حالة بدون نسبة دكتور (تدخل لحساب العيادة 100%)
                  </label>
                </div>
              </div>

              {/* Real-time Calculation Result Card */}
              <div className="bg-gradient-to-l from-cyan-950 to-slate-900 text-white rounded-2xl p-4 border border-cyan-800/80">
                <div className="flex items-center justify-between mb-3 border-b border-cyan-800/60 pb-2">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>نتيجة الحساب الفوري للحالة:</span>
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">
                    المتبقي = بعد الخصم − المدفوع
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">بعد الخصم</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(liveFinancials.amountAfterDiscount, currency)}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">الصافي (بعد المعمل)</span>
                    <span className="font-mono font-black text-cyan-300">
                      {formatCurrency(liveFinancials.netAmount, currency)}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-blue-900/50">
                    <span className="text-[10px] text-blue-400 block mb-0.5">حصة الدكتور</span>
                    <span className="font-mono font-black text-blue-300">
                      {formatCurrency(liveFinancials.doctorShare, currency)}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-emerald-900/50">
                    <span className="text-[10px] text-emerald-400 block mb-0.5">دخل العيادة</span>
                    <span className="font-mono font-black text-emerald-300">
                      {formatCurrency(liveFinancials.clinicShare, currency)}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      liveFinancials.remainingAmount > 0
                        ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                        : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] block mb-0.5">المتبقي على المريض</span>
                    <span className="font-mono font-black">
                      {formatCurrency(liveFinancials.remainingAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات وتوصيات المتابعة
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي تفاصيل خاصة بالجلسة أو تخدير أو تعليمات ما بعد العلاج..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-l from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  {editingCase ? 'حفظ تعديلات الحالة' : 'حفظ وتسجيل الحالة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {paymentModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">سند قبض / سداد دفعة</h3>
              <button
                type="button"
                onClick={() => setPaymentModalCase(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 space-y-1">
              <div>
                <span className="text-slate-500">المريض: </span>
                <span className="font-bold text-slate-800">{paymentModalCase.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500">العلاج: </span>
                <span className="text-slate-800">{paymentModalCase.treatment}</span>
              </div>
              <div className="text-rose-600 font-bold font-mono">
                المتبقي الحالي:{' '}
                {formatCurrency(paymentModalCase.remainingAmount, paymentModalCase.currency)}
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ المقبوض ({paymentModalCase.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentModalCase.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان السند وملاحظات</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCase(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  اعتماد سند القبض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
