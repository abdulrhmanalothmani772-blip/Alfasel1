import React, { useState } from 'react';
import { Branch, DentalCase, Doctor, Patient, User } from '../types';
import {
  Building2,
  Plus,
  Phone,
  MapPin,
  UserCheck,
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Stethoscope,
  Users,
  CreditCard,
  ShieldAlert,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

interface BranchesProps {
  branches: Branch[];
  activeBranchId: string;
  onSelectActiveBranch: (branchId: string) => void;
  onAddBranch: (branch: Branch) => Promise<void>;
  onUpdateBranch: (branch: Branch) => Promise<void>;
  onDeleteBranch: (branchId: string) => Promise<void>;
  cases: DentalCase[];
  patients: Patient[];
  doctors: Doctor[];
  currentUser: User;
}

export const Branches: React.FC<BranchesProps> = ({
  branches,
  activeBranchId,
  onSelectActiveBranch,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  cases,
  patients,
  doctors,
  currentUser,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('صنعاء');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('778043029');
  const [manager, setManager] = useState('د. مروان العامري');
  const [isMain, setIsMain] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openAddModal = () => {
    setEditingBranch(null);
    setName('');
    setCode(`BR-${branches.length + 1}`.padStart(6, '0'));
    setCity('صنعاء');
    setAddress('');
    setPhone('778043029');
    setManager('د. مروان العامري');
    setIsMain(branches.length === 0);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setCity(branch.city);
    setAddress(branch.address);
    setPhone(branch.phone);
    setManager(branch.manager || 'د. مروان العامري');
    setIsMain(!!branch.isMain);
    setStatus(branch.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const branchData: Branch = {
      id: editingBranch ? editingBranch.id : `branch-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      manager: manager.trim(),
      isMain,
      status,
    };

    if (editingBranch) {
      await onUpdateBranch(branchData);
    } else {
      await onAddBranch(branchData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>نظام إدارة الفروع المستقلة متعددة المراكز</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              فروع مركز الفيصل التخصصي
            </h1>
            <p className="text-sm text-cyan-100/80 mt-1 max-w-xl">
              إدارة كل فرع باستقلالية تامة مع تقارير مالية وسجلات مرضى ومحاسبة منفصلة تحت إشراف{' '}
              <span className="text-amber-300 font-bold">د. مروان العامري</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectActiveBranch('all')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeBranchId === 'all'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>عرض جميع الفروع المدمجة</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فرع جديد</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Branch Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            🏢
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">الفرع النشط قيد العمل حالياً:</div>
            <div className="text-sm font-extrabold text-slate-800">
              {activeBranchId === 'all'
                ? 'جميع الفروع (نظرة شاملة للإدارة العامة)'
                : branches.find((b) => b.id === activeBranchId)?.name || 'الفرع الرئيسي'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectActiveBranch('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeBranchId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          {branches.map((b) => {
            const isSelected = activeBranchId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectActiveBranch(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b.name}</span>
                {b.isMain && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-bold">
                    الرئيسي
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => {
          const isSelected = activeBranchId === b.id;
          const branchCases = cases.filter((c) => c.branchId === b.id || (!c.branchId && b.isMain));
          const branchPatients = patients.filter((p) => p.branchId === b.id || (!p.branchId && b.isMain));
          const completedCasesCount = branchCases.filter((c) => c.status === 'completed').length;

          return (
            <div
              key={b.id}
              className={`relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
                isSelected
                  ? 'border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                  : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Card Header Strip */}
              <div
                className={`p-5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-900 to-slate-900 text-white'
                    : 'bg-slate-50 border-b border-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {b.code}
                      </span>
                      {b.isMain && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          الفرع الرئيسي
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black tracking-tight">{b.name}</h3>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'hover:bg-slate-800 text-cyan-300'
                            : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="تعديل بيانات الفرع"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!b.isMain && branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف فرع "${b.name}"؟`)) {
                              onDeleteBranch(b.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSelected
                              ? 'hover:bg-rose-900/60 text-rose-300'
                              : 'hover:bg-rose-50 text-rose-600'
                          }`}
                          title="حذف الفرع"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Manager Tag */}
                <div
                  className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold ${
                    isSelected
                      ? 'bg-white/10 text-cyan-200 border border-white/10'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
                  <span>مدير الفرع:</span>
                  <span className="text-amber-500 font-extrabold">{b.manager || 'د. مروان العامري'}</span>
                </div>
              </div>

              {/* Card Body - Details & Metrics */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {b.city} — {b.address || 'شارع رئيسي'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span dir="ltr">{b.phone || '778043029'}</span>
                  </div>
                </div>

                {/* Quick Branch Stats */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">الحالات المسجلة</div>
                    <div className="text-sm font-black text-slate-800 font-mono">
                      {branchCases.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">المرضى التابعين</div>
                    <div className="text-sm font-black text-slate-800 font-mono">
                      {branchPatients.length}
                    </div>
                  </div>
                </div>

                {/* Switch / Select Action */}
                <button
                  type="button"
                  onClick={() => onSelectActiveBranch(b.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 cursor-default'
                      : 'bg-slate-900 hover:bg-cyan-700 text-white shadow-md'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                      <span>الفرع النشط حالياً</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>التبديل والعمل على هذا الفرع</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-cyan-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm">
                  {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد للمركز'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الفرع *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: فرع حدة التخصصي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold focus:border-cyan-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز الفرع (Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HAD-02"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:border-cyan-500 outline-hidden uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="صنعاء"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-cyan-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="778043029"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono focus:border-cyan-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مدير الفرع المعتمد *</label>
                <input
                  type="text"
                  required
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="د. مروان العامري"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان الدقيق</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="شارع حدة - أمام برج المدينة السكني"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isMainBranch"
                  checked={isMain}
                  onChange={(e) => setIsMain(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="isMainBranch" className="text-slate-700 font-bold select-none">
                  تعيين كفرع رئيسي للمركز (Main Branch)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-l from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingBranch ? 'تحديث الفرع' : 'حفظ الفرع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
