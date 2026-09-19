import React, { useState } from 'react';
import { Doctor, DentalCase, DoctorSettlement, User, ClinicSettings } from '../types';
import { formatCurrency, convertToYER } from '../lib/calc';
import {
  Calculator,
  Calendar,
  Printer,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Stethoscope,
  X,
  CreditCard,
  History,
} from 'lucide-react';

interface DoctorDailySettlementProps {
  doctors: Doctor[];
  cases: DentalCase[];
  settlements: DoctorSettlement[];
  settings: ClinicSettings;
  currentUser: User;
  onRecordSettlement: (settlement: DoctorSettlement) => Promise<void>;
  onPrintSettlement: (doc?: Doctor, date?: string) => void;
}

export const DoctorDailySettlement: React.FC<DoctorDailySettlementProps> = ({
  doctors,
  cases,
  settlements,
  settings,
  currentUser,
  onRecordSettlement,
  onPrintSettlement,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeDoctorForPay, setActiveDoctorForPay] = useState<Doctor | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payNotes, setPayNotes] = useState('تسليم أتعاب يومية');

  // Filter cases of selected date
  const dayCases = cases.filter((c) => c.date === selectedDate);

  const handleOpenPayModal = (doc: Doctor, suggestedAmount: number) => {
    setActiveDoctorForPay(doc);
    setPayAmount(suggestedAmount > 0 ? suggestedAmount : '');
    setPayNotes(`تسليم مستحقات يوم ${selectedDate}`);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctorForPay || !payAmount) return;

    const settlement: DoctorSettlement = {
      id: `doc-set-${Date.now()}`,
      doctorId: activeDoctorForPay.id,
      doctorName: activeDoctorForPay.name,
      date: selectedDate,
      amount: Number(payAmount),
      currency: 'YER',
      notes: payNotes,
      createdBy: currentUser.username,
    };

    await onRecordSettlement(settlement);
    setActiveDoctorForPay(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-600" />
            <span>محاسبة الأطباء اليومية (تسوية نهاية اليوم)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حساب فوري لمستحقات الأطباء ودخل العيادة وتسجيل تسليم المبالغ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => onPrintSettlement(undefined, selectedDate)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف المحاسبة للجميع</span>
          </button>
        </div>
      </div>

      {/* Doctors Cards Grid for the selected day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc) => {
          const docCases = dayCases.filter((c) => c.doctorId === doc.id);
          const totalPaid = docCases.reduce(
            (sum, c) => sum + convertToYER(c.paidAmount, c.currency, settings),
            0
          );
          const totalLab = docCases.reduce(
            (sum, c) => sum + convertToYER(c.labExpenseAmount, c.currency, settings),
            0
          );
          const totalNet = docCases.reduce(
            (sum, c) => sum + convertToYER(c.netAmount, c.currency, settings),
            0
          );
          const totalDocShare = docCases.reduce(
            (sum, c) => sum + convertToYER(c.doctorShare, c.currency, settings),
            0
          );
          const totalClinicShare = docCases.reduce(
            (sum, c) => sum + convertToYER(c.clinicShare, c.currency, settings),
            0
          );

          // Check if paid out today
          const todayPaidOut = settlements
            .filter((s) => s.doctorId === doc.id && s.date === selectedDate)
            .reduce((sum, s) => sum + s.amount, 0);

          const remainingDueToday = Math.max(0, totalDocShare - todayPaidOut);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Doctor header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                  <span className="text-[11px] text-slate-500 block">{doc.specialty}</span>
                  <span className="text-[10px] font-mono text-cyan-700 font-bold">
                    النسبة المسجلة: {doc.percentage}%
                  </span>
                </div>
                <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 font-mono">
                  {docCases.length} حالات
                </div>
              </div>

              {/* Financial numbers list */}
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>إجمالي المدفوع نقداً:</span>
                  <span className="font-mono font-bold">{formatCurrency(totalPaid, 'YER')}</span>
                </div>

                <div className="flex justify-between items-center text-amber-700">
                  <span>خرج المعمل المرتبط:</span>
                  <span className="font-mono font-bold">
                    - {formatCurrency(totalLab, 'YER')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-900 font-semibold pt-1 border-t border-slate-100">
                  <span>الصافي المشترك:</span>
                  <span className="font-mono font-bold">{formatCurrency(totalNet, 'YER')}</span>
                </div>

                <div className="flex justify-between items-center text-blue-700 font-bold bg-blue-50/60 p-2 rounded-xl">
                  <span>نسبة الدكتور المستحقة:</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totalDocShare, 'YER')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50/60 p-2 rounded-xl">
                  <span>دخل العيادة من أعماله:</span>
                  <span className="font-mono text-sm">
                    {formatCurrency(totalClinicShare, 'YER')}
                  </span>
                </div>

                {todayPaidOut > 0 && (
                  <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1">
                    <span>تم تسليمه اليوم:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {formatCurrency(todayPaidOut, 'YER')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPayModal(doc, remainingDueToday)}
                  disabled={remainingDueToday === 0 && totalDocShare === 0}
                  className="flex-1 py-2 bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>تسليم مستحقات الطبيب</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintSettlement(doc, selectedDate)}
                  className="p-2 bg-white hover:bg-cyan-50 text-cyan-700 border border-slate-200 rounded-xl transition-all"
                  title="طباعة كشف هذا الطبيب اليوم"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Doctor Modal */}
      {activeDoctorForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                تسليم مستحقات: {activeDoctorForPay.name}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDoctorForPay(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ المسلم نقداً (ريال يمني) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-slate-900 outline-hidden font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان وملاحظات التسليم</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDoctorForPay(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  تأكيد صرف المستحقات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
