import React, { useState } from 'react';
import { Patient, DentalCase, User } from '../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  FileText,
  Edit2,
  Archive,
  X,
  UserPlus,
  Stethoscope,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../lib/calc';

interface PatientsProps {
  patients: Patient[];
  cases: DentalCase[];
  currentUser: User;
  onAddPatient: (patient: Patient) => Promise<void>;
  onUpdatePatient: (patient: Patient) => Promise<void>;
  onArchivePatient: (id: string) => Promise<void>;
  onOpenNewCaseForPatient: (patient: Patient) => void;
  onSelectCaseToPrint: (dentalCase: DentalCase) => void;
}

export const Patients: React.FC<PatientsProps> = ({
  patients,
  cases,
  currentUser,
  onAddPatient,
  onUpdatePatient,
  onArchivePatient,
  onOpenNewCaseForPatient,
  onSelectCaseToPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('صنعاء');
  const [notes, setNotes] = useState('');

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.address && p.address.toLowerCase().includes(q))
    );
  });

  const openAddModal = () => {
    setEditingPatient(null);
    setName('');
    setAge('');
    setGender('male');
    setPhone('');
    setAddress('صنعاء');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setPhone(p.phone);
    setAddress(p.address);
    setNotes(p.notes);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPatient) {
      const updated: Patient = {
        ...editingPatient,
        name: name.trim(),
        age: Number(age) || 0,
        gender,
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };
      await onUpdatePatient(updated);
    } else {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: name.trim(),
        age: Number(age) || 0,
        gender,
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username,
      };
      await onAddPatient(newPatient);
    }

    setIsAddModalOpen(false);
  };

  const handleOpenWhatsApp = (patientPhone: string, patientName: string) => {
    const cleanPhone = patientPhone.replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('967') ? cleanPhone : `967${cleanPhone}`;
    const text = encodeURIComponent(
      `مرحباً ${patientName}، معك مركز الفيصل لطب الأسنان. نسعد دائماً بخدمتك.`
    );
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            <span>سجل المرضى والمراجعات الطبية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إجمالي المرضى المسجلين بالمركز: {patients.length} مريض
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>تسجيل مريض جديد</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم، أو رقم الهاتف (مثال: 778043029)، أو العنوان..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-4 pr-10 text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3.5" />
        </div>
      </div>

      {/* Patients List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم المريض</th>
                <th className="p-3">العمر / الجنس</th>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">العنوان</th>
                <th className="p-3">عدد الحالات</th>
                <th className="p-3">ملاحظات طبية</th>
                <th className="p-3 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد نتائج مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, index) => {
                  const patientCases = cases.filter((c) => c.patientId === p.id);
                  const patientDebt = patientCases.reduce(
                    (sum, c) => sum + (c.remainingAmount || 0),
                    0
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientForView(p)}
                          className="font-bold text-slate-900 hover:text-cyan-700 text-right cursor-pointer"
                        >
                          {p.name}
                        </button>
                        {patientDebt > 0 && (
                          <span className="block text-[10px] text-rose-600 font-bold font-mono">
                            متبقي عليه: {formatCurrency(patientDebt, 'YER')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {p.age || '—'} سنة ({p.gender === 'female' ? 'أنثى' : 'ذكر'})
                      </td>
                      <td className="p-3 font-mono" dir="ltr">
                        {p.phone ? (
                          <span className="text-slate-800 font-bold">+967 {p.phone}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[140px] truncate">
                        {p.address || '—'}
                      </td>
                      <td className="p-3">
                        <span className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-md font-bold font-mono">
                          {patientCases.length} حالة
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-[180px] truncate" title={p.notes}>
                        {p.notes || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Open New Case */}
                          <button
                            type="button"
                            onClick={() => onOpenNewCaseForPatient(p)}
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                            title="فتح حالة علاج جديدة لهذا المريض"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>

                          {/* View file */}
                          <button
                            type="button"
                            onClick={() => setSelectedPatientForView(p)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="عرض الملف والسجل الطبي"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          {p.phone && (
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsApp(p.phone, p.name)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="محادثة واتساب"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="تعديل بيانات المريض"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Archive (admin or reception) */}
                          <button
                            type="button"
                            onClick={() => onArchivePatient(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="أرشفة"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPatient ? 'تعديل بيانات المريض' : 'تسجيل مريض جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المريض الثلاثي / الرباعي *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد عبد الله الشامي"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">العمر (سنوات)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 32"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجنس</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  رقم الهاتف (الافتراضي اليمن +967)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="778043029"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                    dir="ltr"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute top-3 right-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  أدخل الرقم بدون كود الدولة (مثال: 778043029)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان / السكن</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="صنعاء - شارع تعز"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات طبية وتاريخ مرضي (حساسية، سكري، ضغط، سيولة...)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سجل أي حساسية أو أمراض مزمنة أو تفضيلات علاجية..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  {editingPatient ? 'حفظ التعديلات' : 'تسجيل المريض'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient File / History Modal */}
      {selectedPatientForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                  {selectedPatientForView.gender === 'female' ? '👩' : '👨'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedPatientForView.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    الملف الطبي وتاريخ المعالجات السنية
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatientForView(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient overview card */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5">
              <div>
                <span className="text-slate-400 block mb-0.5">العمر والجنس:</span>
                <span className="font-bold text-slate-800">
                  {selectedPatientForView.age || '—'} سنة (
                  {selectedPatientForView.gender === 'female' ? 'أنثى' : 'ذكر'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">رقم الهاتف:</span>
                <span className="font-bold font-mono text-slate-800" dir="ltr">
                  +967 {selectedPatientForView.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">السكن والعنوان:</span>
                <span className="font-bold text-slate-800">
                  {selectedPatientForView.address || '—'}
                </span>
              </div>
            </div>

            {/* Cases History */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 text-sm">
                  سجل الحالات والعلاجات السابقة
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const pat = selectedPatientForView;
                    setSelectedPatientForView(null);
                    onOpenNewCaseForPatient(pat);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>فتح حالة جديدة</span>
                </button>
              </div>

              <div className="space-y-3">
                {cases
                  .filter((c) => c.patientId === selectedPatientForView.id)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="border border-slate-200 rounded-xl p-3.5 hover:border-cyan-400 transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {c.treatment}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            بإشراف: {c.doctorName} • التاريخ: {c.date}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectCaseToPrint(c)}
                          className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 text-cyan-800 rounded-lg font-bold text-[10px] transition-all"
                        >
                          طباعة المستندات
                        </button>
                      </div>

                      {c.teethNumbers?.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-slate-500 font-semibold">الأسنان:</span>
                          <div className="flex flex-wrap gap-1">
                            {c.teethNumbers.map((t) => (
                              <span
                                key={t}
                                className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.2 rounded font-mono font-bold"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-600 font-mono">
                        <span>
                          المبلغ: {formatCurrency(c.amountAfterDiscount, c.currency)}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          المدفوع: {formatCurrency(c.paidAmount, c.currency)}
                        </span>
                        <span
                          className={`font-bold ${
                            c.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          المتبقي: {formatCurrency(c.remainingAmount, c.currency)}
                        </span>
                      </div>
                    </div>
                  ))}

                {cases.filter((c) => c.patientId === selectedPatientForView.id).length === 0 && (
                  <p className="text-center text-slate-400 py-6 italic">
                    لا توجد حالات مسجلة لهذا المريض حتى الآن
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
