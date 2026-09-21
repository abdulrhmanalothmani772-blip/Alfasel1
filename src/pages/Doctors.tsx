import React, { useState } from 'react';
import { Doctor, DentalCase, DoctorSettlement, User, ClinicSettings, Branch } from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  UserCheck,
  Plus,
  Edit2,
  Printer,
  Phone,
  Building2,
  Mail,
  Archive,
  X,
  Stethoscope,
  Sparkles,
  Filter,
} from 'lucide-react';

interface DoctorsProps {
  doctors: Doctor[];
  cases: DentalCase[];
  settlements: DoctorSettlement[];
  settings: ClinicSettings;
  currentUser: User;
  branches?: Branch[];
  activeBranchId?: string;
  onAddDoctor: (doc: Doctor) => Promise<void>;
  onUpdateDoctor: (doc: Doctor) => Promise<void>;
  onArchiveDoctor: (id: string) => Promise<void>;
  onPrintDoctorStatement: (doc: Doctor, periodLabel: string) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({
  doctors,
  cases,
  settlements,
  settings,
  currentUser,
  branches = [],
  activeBranchId = 'all',
  onAddDoctor,
  onUpdateDoctor,
  onArchiveDoctor,
  onPrintDoctorStatement,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'today'>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranchId);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('بكالوريوس طب وجراحة الفم والأسنان');
  const [specialty, setSpecialty] = useState('طب وجراحة الفم والأسنان');
  const [percentage, setPercentage] = useState<number>(40);
  const [branchId, setBranchId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setPhone('');
    setEmail('');
    setDegree('بكالوريوس طب وجراحة الفم والأسنان');
    setSpecialty('طب وجراحة الفم والأسنان');
    setPercentage(40);
    setBranchId(selectedBranchFilter !== 'all' ? selectedBranchFilter : branches[0]?.id || '');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setPhone(doc.phone);
    setEmail(doc.email || '');
    setDegree(doc.degree);
    setSpecialty(doc.specialty);
    setPercentage(doc.percentage);
    setBranchId(doc.branchId || '');
    setNotes(doc.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedBranch = branches.find((b) => b.id === branchId);

    if (editingDoctor) {
      const updated: Doctor = {
        ...editingDoctor,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        degree: degree.trim(),
        specialty: specialty.trim(),
        percentage: Number(percentage) || 0,
        branchId: branchId || undefined,
        branchName: selectedBranch ? selectedBranch.name : undefined,
        notes: notes.trim(),
      };
      await onUpdateDoctor(updated);
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        degree: degree.trim(),
        specialty: specialty.trim(),
        percentage: Number(percentage) || 0,
        branchId: branchId || undefined,
        branchName: selectedBranch ? selectedBranch.name : undefined,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: notes.trim(),
      };
      await onAddDoctor(newDoc);
    }

    setIsAddModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter doctors by active status & selected branch
  const filteredDoctors = doctors
    .filter((d) => d.status === 'active')
    .filter((d) => {
      if (selectedBranchFilter === 'all') return true;
      return d.branchId === selectedBranchFilter;
    });

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>سجل الأطباء والكوادر الطبية حسب الفروع</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono font-bold">
                  {filteredDoctors.length} طبيب
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع الأطباء على كل فرع بنظام هندسي متكامل ومتابعة النسب والأتعاب
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'today'
                  ? 'bg-white text-cyan-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'month'
                  ? 'bg-white text-cyan-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              هذا الشهر
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'all'
                  ? 'bg-white text-cyan-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة الفترات
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طبيب جديد</span>
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
            <span>كافة الفروع ({doctors.filter((d) => d.status === 'active').length})</span>
          </button>

          {branches.map((b) => {
            const count = doctors.filter((d) => d.status === 'active' && d.branchId === b.id).length;
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

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => {
          // Filter cases by date period and branch
          const docCases = cases.filter((c) => {
            if (c.doctorId !== doc.id) return false;
            if (selectedBranchFilter !== 'all' && c.branchId && c.branchId !== selectedBranchFilter) {
              return false;
            }
            if (periodFilter === 'today') return c.date === todayStr;
            if (periodFilter === 'month') return c.date.startsWith(currentMonthStr);
            return true;
          });

          // Calculate earned commission in YER
          let totalEarned = 0;
          docCases.forEach((c) => {
            const paidYER = convertToYER(
              c.paidAmount,
              c.currency,
              { sarToYer: settings.sarToYer, usdToYer: settings.usdToYer }
            );
            totalEarned += Math.round((paidYER * doc.percentage) / 100);
          });

          // Doctor settlements
          const docSettlements = settlements.filter((s) => {
            if (s.doctorId !== doc.id) return false;
            if (periodFilter === 'today') return s.date === todayStr;
            if (periodFilter === 'month') return s.date.startsWith(currentMonthStr);
            return true;
          });

          let totalSettled = 0;
          docSettlements.forEach((s) => {
            totalSettled += convertToYER(
              s.amount,
              s.currency,
              { sarToYer: settings.sarToYer, usdToYer: settings.usdToYer }
            );
          });

          const balanceDue = totalEarned - totalSettled;
          const periodLabel =
            periodFilter === 'today'
              ? `اليوم (${todayStr})`
              : periodFilter === 'month'
              ? `الشهر الحالي (${currentMonthStr})`
              : 'كامل الفترة المسجلة';

          const docBranch = branches.find((b) => b.id === doc.branchId);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 border-b border-slate-100">
                {/* Branch affiliation badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate">
                      {docBranch ? docBranch.name : doc.branchName || 'استشاري عام (كافة الفروع)'}
                    </span>
                  </div>

                  <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-xl text-xs font-mono font-black">
                    نسبة: {doc.percentage}%
                  </span>
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>{doc.name}</span>
                  </h3>
                  <span className="text-xs text-cyan-700 font-semibold block mt-0.5">
                    {doc.specialty}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{doc.degree}</span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-slate-600 mb-4">
                  {doc.phone && (
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span dir="ltr">+967 {doc.phone}</span>
                    </div>
                  )}
                  {doc.email && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-semibold">
                      الحالات
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      {docCases.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-semibold">
                      إجمالي نسبته
                    </span>
                    <span className="font-bold text-blue-700 font-mono text-xs">
                      {formatCurrency(totalEarned, 'YER')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5 font-semibold">
                      المتبقي له
                    </span>
                    <span className="font-bold text-emerald-700 font-mono text-xs">
                      {formatCurrency(balanceDue, 'YER')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3.5 bg-slate-50/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onPrintDoctorStatement(doc, periodLabel)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-cyan-50 text-cyan-800 border border-slate-200 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-600" />
                  <span>طباعة كشف الحساب</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openEditModal(doc)}
                    className="p-2.5 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="تعديل بيانات الطبيب ونسبته والفرع"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onArchiveDoctor(doc.id)}
                    className="p-2.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="أرشفة الطبيب"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">لا يوجد أطباء مسجلين في هذا الفرع</h3>
          <p className="text-xs text-slate-500 mt-1">
            يمكنك إضافة أطباء وتعيينهم لهذا الفرع بالضغط على "إضافة طبيب جديد"
          </p>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingDoctor ? 'تعديل بيانات الطبيب ونسبته وفرعه' : 'إضافة طبيب جديد للمركز'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تخصيص الطبيب لأحد الفروع وحساب النسب المالية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطبيب الرباعي *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="د. فيصل عثمان النعيمي"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold"
                />
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الفرع التابع له الطبيب *</label>
                <div className="relative">
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-bold appearance-none pr-8"
                  >
                    <option value="">كافة الفروع (استشاري زائر عام)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city}) {b.isMain ? '• المركز الرئيسي' : ''}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-cyan-600 absolute top-3 right-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="778043029"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    النسبة المعتمدة للطبيب (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value) || 0)}
                    placeholder="40"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono font-bold text-cyan-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البريد الإلكتروني للطبيب (اختياري)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@alfaisal.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص والخدمات السنية</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="جراحة الفم وزراعة الأسنان، تقويم، معالجة لبية..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المؤهل الأكاديمي والدرجة</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="ماجستير زراعة الأسنان، بورد، بكالوريوس..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أيام الدوام، المواعيد، تعليمات المحاسبة..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  {editingDoctor ? 'حفظ التعديلات' : 'إضافة الطبيب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
