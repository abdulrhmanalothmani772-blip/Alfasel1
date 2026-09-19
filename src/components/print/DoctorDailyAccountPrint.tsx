import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { Doctor, DentalCase, ClinicSettings } from '../../types';
import { formatCurrency } from '../../lib/calc';

interface DoctorDailyAccountPrintProps {
  doctor?: Doctor; // if undefined, prints all doctors
  doctors: Doctor[];
  cases: DentalCase[];
  date: string;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const DoctorDailyAccountPrint: React.FC<DoctorDailyAccountPrintProps> = ({
  doctor,
  doctors,
  cases,
  date,
  settings,
  onClose,
}) => {
  const targetDoctors = doctor ? [doctor] : doctors;

  return (
    <PrintWrapper
      title={
        doctor
          ? `كشف المحاسبة اليومي — ${doctor.name}`
          : 'كشف المحاسبة اليومي لجميع أطباء المركز'
      }
      subtitle={`عن يوم: ${date}`}
      settings={settings}
      onClose={onClose}
    >
      <div className="space-y-6 text-xs">
        {targetDoctors.map((doc) => {
          const docCases = cases.filter((c) => c.doctorId === doc.id && c.date === date);

          const totalPaid = docCases.reduce((sum, c) => sum + c.paidAmount, 0);
          const totalLab = docCases.reduce((sum, c) => sum + c.labExpenseAmount, 0);
          const totalNet = docCases.reduce((sum, c) => sum + c.netAmount, 0);
          const totalDocShare = docCases.reduce((sum, c) => sum + c.doctorShare, 0);
          const totalClinicShare = docCases.reduce((sum, c) => sum + c.clinicShare, 0);

          return (
            <div key={doc.id} className="border border-slate-300 rounded-xl overflow-hidden">
              {/* Doctor header */}
              <div className="bg-slate-100 p-3.5 flex justify-between items-center border-b border-slate-300">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                  <span className="text-[11px] text-slate-600">
                    {doc.specialty} — النسبة المعتمدة: {doc.percentage}%
                  </span>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-bold text-cyan-800">
                  عدد الحالات اليوم: {docCases.length}
                </div>
              </div>

              {/* Cases Table */}
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-2.5">المريض</th>
                    <th className="p-2.5">الإجراء الطبي</th>
                    <th className="p-2.5">المدفوع</th>
                    <th className="p-2.5">خرج المعمل</th>
                    <th className="p-2.5">الصافي</th>
                    <th className="p-2.5 text-blue-700">مستحق الدكتور</th>
                    <th className="p-2.5 text-emerald-700">دخل العيادة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docCases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                        لا توجد حالات مسجلة لهذا الطبيب في هذا اليوم
                      </td>
                    </tr>
                  ) : (
                    docCases.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2.5 font-bold text-slate-800">{c.patientName}</td>
                        <td className="p-2.5 text-slate-600">{c.treatment}</td>
                        <td className="p-2.5 font-mono">{formatCurrency(c.paidAmount, c.currency)}</td>
                        <td className="p-2.5 font-mono text-amber-700">
                          {formatCurrency(c.labExpenseAmount, c.currency)}
                        </td>
                        <td className="p-2.5 font-mono font-bold">
                          {formatCurrency(c.netAmount, c.currency)}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-blue-700">
                          {formatCurrency(c.doctorShare, c.currency)}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700">
                          {formatCurrency(c.clinicShare, c.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Doctor totals footer */}
                <tfoot className="bg-cyan-50/50 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={2} className="p-3 text-cyan-900 font-black">
                      الإجمالي لمستحقات اليوم:
                    </td>
                    <td className="p-3 font-mono">{formatCurrency(totalPaid, 'YER')}</td>
                    <td className="p-3 font-mono text-amber-800">{formatCurrency(totalLab, 'YER')}</td>
                    <td className="p-3 font-mono">{formatCurrency(totalNet, 'YER')}</td>
                    <td className="p-3 font-mono text-blue-800 text-sm font-black">
                      {formatCurrency(totalDocShare, 'YER')}
                    </td>
                    <td className="p-3 font-mono text-emerald-800 text-sm font-black">
                      {formatCurrency(totalClinicShare, 'YER')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>
    </PrintWrapper>
  );
};
