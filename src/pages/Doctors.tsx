import React, { useState } from 'react';
import { Doctor, DentalCase, DoctorSettlement, User, ClinicSettings } from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  UserCheck,
  Plus,
  Edit2,
  Printer,
  Calendar,
  Stethoscope,
  DollarSign,
  Phone,
  Award,
  X,
  Archive,
} from 'lucide-react';

interface DoctorsProps {
  doctors: Doctor[];
  cases: DentalCase[];
  settlements: DoctorSettlement[];
  settings: ClinicSettings;
  currentUser: User;
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
  onAddDoctor,
  onUpdateDoctor,
  onArchiveDoctor,
  onPrintDoctorStatement,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'today'>('all');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState('بكالوريوس طب وجراحة الفم والأسنان');
  const [specialty, setSpecialty] = useState('طب وجراحة الفم والأسنان');
  const [percentage, setPercentage] = useState<number>(40);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setPhone('');
    setDegree('بكالوريوس طب وجراحة الفم والأسنان');
    setSpecialty('طب وجراحة الفم والأسنان');
    setPercentage(40);
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setPhone(doc.phone);
    setDegree(doc.degree);
    setSpecialty(doc.specialty);
    setPercentage(doc.percentage);
    setNotes(doc.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDoctor) {
      const updated: Doctor = {
        ...editingDoctor,
        name: name.trim(),
        phone: phone.trim(),
        degree: degree.trim(),
        specialty: specialty.trim(),
        percentage: Number(percentage) || 0,
        notes: notes.trim(),
      };
      await onUpdateDoctor(updated);
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        degree: degree.trim(),
        specialty: specialty.trim(),
        percentage: Number(percentage) || 0,
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

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-600" />
            <span>سجل أطباء مركز الفيصل لطب الأسنان</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة الكادر الطبي وتحديد النسب المعتمدة ومتابعة كشوفات الحساب
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طبيب</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc) => {
          let docCases = cases.filter((c) => c.doctorId === doc.id);
          let docSettlements = settlements.filter((s) => s.doctorId === doc.id);

          if (periodFilter === 'today') {
            docCases = docCases.filter((c) => c.date === todayStr);
            docSettlements = docSettlements.filter((s) => s.date === todayStr);
          } else if (periodFilter === 'month') {
            docCases = docCases.filter((c) => c.date.startsWith(currentMonthStr));
            docSettlements = docSettlements.filter((s) => s.date.startsWith(currentMonthStr));
          }

          const totalEarned = docCases.reduce(
            (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
            0
          );
          const totalPaidOut = docSettlements.reduce((sum, s) => sum + s.amount, 0);
          const balanceDue = Math.max(0, totalEarned - totalPaidOut);

          const periodLabel =
            periodFilter === 'today'
              ? `اليوم (${todayStr})`
              : periodFilter === 'month'
              ? `الشهر الحالي (${currentMonthStr})`
              : 'كامل الفترة المسجلة';

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <span className="text-xs text-cyan-700 font-semibold block mt-0.5">
                      {doc.specialty}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{doc.degree}</span>
                  </div>

                  <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-xl text-xs font-mono font-black">
                    {doc.percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-mono mb-4">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">+967 {doc.phone}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">الحالات</span>
                    <span className="font-bold text-slate-800 font-mono">{docCases.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">إجمالي نسبته</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {formatCurrency(totalEarned, 'YER')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">المتبقي له</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {formatCurrency(balanceDue, 'YER')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3.5 bg-slate-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onPrintDoctorStatement(doc, periodLabel)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-cyan-50 text-cyan-800 border border-slate-200 rounded-xl font-bold text-xs transition-all shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-600" />
                  <span>طباعة كشف الحساب</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openEditModal(doc)}
                    className="p-2 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl transition-all"
                    title="تعديل بيانات الطبيب ونسبته"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onArchiveDoctor(doc.id)}
                    className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl transition-all"
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

      {/* Add / Edit Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingDoctor ? 'تعديل بيانات الطبيب ونسبته' : 'إضافة طبيب جديد'}
              </h3>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
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
                    النسبة المعتمدة (%) *
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
                <label className="block font-bold text-slate-700 mb-1">التخصص والخدمات السنية</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="جراحة الفم وزراعة الأسنان، تقويم، حشوات تجميلية..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المؤهل والدرجة العلمية</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="ماجستير زراعة أسنان، بكالوريوس طب أسنان..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="فترات الدوام، أيام العمل، أرقام تواصل بديلة..."
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
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  {editingDoctor ? 'حفظ التعديلات' : 'تسجيل الطبيب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
