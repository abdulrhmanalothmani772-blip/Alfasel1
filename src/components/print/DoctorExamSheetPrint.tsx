import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { DentalCase, Patient, ClinicSettings } from '../../types';

interface DoctorExamSheetPrintProps {
  dentalCase: DentalCase;
  patient?: Patient;
  settings?: ClinicSettings;
  onClose: () => void;
}

export const DoctorExamSheetPrint: React.FC<DoctorExamSheetPrintProps> = ({
  dentalCase,
  patient,
  settings,
  onClose,
}) => {
  return (
    <PrintWrapper
      title="ورقة كشف ومعاينة الطبيب"
      subtitle={`رقم الحالة: #${dentalCase.id}`}
      settings={settings}
      onClose={onClose}
    >
      {/* Patient Information Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2">
          بيانات المريض الأساسية
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">اسم المريض:</span>
            <span className="font-bold text-slate-800 text-sm">{dentalCase.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">العمر / الجنس:</span>
            <span className="font-bold text-slate-800">
              {patient?.age || '—'} سنة ({patient?.gender === 'female' ? 'أنثى' : 'ذكر'})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">رقم الجوال:</span>
            <span className="font-bold font-mono text-slate-800" dir="ltr">
              {patient?.phone ? `+967 ${patient.phone}` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">تاريخ الكشف:</span>
            <span className="font-bold text-slate-800">{dentalCase.date}</span>
          </div>
        </div>
      </div>

      {/* Doctor & Diagnosis section */}
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold mb-1">الطبيب المعالج:</span>
            <span className="font-bold text-slate-900 text-sm">{dentalCase.doctorName}</span>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block font-semibold mb-1">الأسنان المعالجة:</span>
            <span className="font-bold text-cyan-700 font-mono text-sm">
              {dentalCase.teethNumbers?.length
                ? dentalCase.teethNumbers.map((t) => `#${t}`).join(' ، ')
                : 'إجراء عام للفكين'}
            </span>
          </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg bg-white">
          <span className="text-slate-500 block font-semibold mb-1">التشخيص السريري:</span>
          <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
            {dentalCase.diagnosis || 'لم يحدد'}
          </p>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg bg-white">
          <span className="text-slate-500 block font-semibold mb-1">العلاج والإجراء المقدّم:</span>
          <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
            {dentalCase.treatment || 'لم يحدد'}
          </p>
        </div>

        {dentalCase.notes && (
          <div className="p-4 border border-slate-200 rounded-lg bg-amber-50/50">
            <span className="text-amber-800 block font-semibold mb-1">ملاحظات الطبيب وتوصيات المتابعة:</span>
            <p className="text-xs text-slate-700 leading-relaxed">{dentalCase.notes}</p>
          </div>
        )}

        {dentalCase.nextAppointmentDate && (
          <div className="p-3 border-2 border-dashed border-cyan-300 rounded-lg bg-cyan-50/50 flex items-center justify-between">
            <span className="font-bold text-cyan-900">موعد المراجعة القادمة:</span>
            <span className="font-bold font-mono text-cyan-800 text-sm">
              {dentalCase.nextAppointmentDate}
            </span>
          </div>
        )}
      </div>

      {/* Doctor Prescription / Notes Space */}
      <div className="mt-8 border border-slate-200 rounded-xl p-4 min-h-[140px]">
        <span className="text-xs font-bold text-slate-400 block mb-2">
          الوصفة الطبية وتوجيهات الاستخدام (Rx):
        </span>
        <div className="space-y-6 pt-2">
          <div className="border-b border-dashed border-slate-200 h-6"></div>
          <div className="border-b border-dashed border-slate-200 h-6"></div>
          <div className="border-b border-dashed border-slate-200 h-6"></div>
        </div>
      </div>
    </PrintWrapper>
  );
};
