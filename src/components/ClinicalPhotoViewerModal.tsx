import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Trash2,
  Download,
  Printer,
  Sparkles,
  Columns,
  Maximize2,
  Tag,
  Stethoscope,
} from 'lucide-react';
import { ClinicalPhoto, Patient, DentalCase } from '../types';

interface ClinicalPhotoViewerModalProps {
  photo: ClinicalPhoto | null;
  allPhotos: ClinicalPhoto[];
  patient?: Patient | null;
  dentalCase?: DentalCase | null;
  onClose: () => void;
  onDeletePhoto?: (id: string) => Promise<void>;
}

export const ClinicalPhotoViewerModal: React.FC<ClinicalPhotoViewerModalProps> = ({
  photo,
  allPhotos,
  patient,
  dentalCase,
  onClose,
  onDeletePhoto,
}) => {
  const [comparisonPhotoId, setComparisonPhotoId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!photo) return null;

  const comparisonPhoto = allPhotos.find((p) => p.id === comparisonPhotoId);

  // Other photos of the same patient suitable for comparison (especially before vs after)
  const otherPatientPhotos = allPhotos.filter(
    (p) => p.patientId === photo.patientId && p.id !== photo.id
  );

  const stageLabels: Record<string, { label: string; color: string }> = {
    before: { label: 'قبل العلاج', color: 'bg-amber-500 text-white' },
    during: { label: 'أثناء المعالجة', color: 'bg-blue-500 text-white' },
    after: { label: 'بعد العلاج', color: 'bg-emerald-500 text-white' },
    xray: { label: 'أشعة / بانوراما', color: 'bg-purple-500 text-white' },
    other: { label: 'توثيق سريري', color: 'bg-slate-600 text-white' },
  };

  const handleDownload = (photoToDownload: ClinicalPhoto) => {
    const a = document.createElement('a');
    a.href = photoToDownload.photoUrl;
    a.download = `dental-${photoToDownload.stage}-${photoToDownload.patientName || 'patient'}-${photoToDownload.date}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = (photoToPrint: ClinicalPhoto) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>توثيق سريري - ${photoToPrint.title}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; color: #1e293b; }
            .header { border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { font-size: 20px; color: #0891b2; margin: 0; }
            .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
            img { max-width: 90%; max-height: 70vh; border-radius: 12px; border: 1px solid #cbd5e1; margin-top: 15px; }
            .notes { margin-top: 20px; font-size: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>مركز الفيصل التخصصي لطب وجراحة الأسنان</h1>
            <div class="meta">تقرير التوثيق الصوري السريري للحالة</div>
          </div>
          <div style="text-align: right; margin-bottom: 10px; font-size: 13px;">
            <strong>المريض:</strong> ${photoToPrint.patientName || patient?.name || '—'}<br/>
            <strong>التشخيص/العنوان:</strong> ${photoToPrint.title}<br/>
            <strong>المرحلة:</strong> ${stageLabels[photoToPrint.stage]?.label || photoToPrint.stage}<br/>
            <strong>التاريخ:</strong> ${photoToPrint.date} | <strong>الموثق:</strong> ${photoToPrint.takenBy}
            ${photoToPrint.teethNumbers?.length ? `<br/><strong>الأسنان:</strong> ${photoToPrint.teethNumbers.join(', ')}` : ''}
          </div>
          <img src="${photoToPrint.photoUrl}" />
          ${photoToPrint.notes ? `<div class="notes"><strong>الملاحظات السريرية:</strong><br/>${photoToPrint.notes}</div>` : ''}
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async () => {
    if (!onDeletePhoto) return;
    if (confirm('هل أنت متأكد من حذف هذه الصورة التوثيقية نهائياً من سجل المريض؟')) {
      setIsDeleting(true);
      try {
        await onDeletePhoto(photo.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                stageLabels[photo.stage]?.color || 'bg-slate-700'
              }`}
            >
              {stageLabels[photo.stage]?.label || photo.stage}
            </span>
            <div>
              <h3 className="font-bold text-base text-white">{photo.title}</h3>
              <p className="text-xs text-slate-400">
                المريض: <span className="text-cyan-300 font-bold">{photo.patientName || patient?.name}</span>
                {photo.date && ` • ${photo.date}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {otherPatientPhotos.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-xs">
                <Columns className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">مقارنة مع:</span>
                <select
                  value={comparisonPhotoId}
                  onChange={(e) => setComparisonPhotoId(e.target.value)}
                  className="bg-slate-800 text-white border-0 text-xs rounded-lg px-2 py-1 outline-hidden"
                >
                  <option value="">— اختر صورة ثانية (قبل / بعد) —</option>
                  {otherPatientPhotos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {stageLabels[p.stage]?.label || p.stage} - {p.title} ({p.date})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleDownload(photo)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="تحميل الصورة"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handlePrint(photo)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="طباعة التوثيق"
            >
              <Printer className="w-4 h-4" />
            </button>

            {onDeletePhoto && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                title="حذف الصورة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          {comparisonPhoto ? (
            /* Comparison Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-[65vh]">
              {/* Photo 1 */}
              <div className="flex flex-col bg-slate-950 rounded-2xl p-2 border border-white/10">
                <div className="flex items-center justify-between px-2 py-1 mb-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      stageLabels[photo.stage]?.color || 'bg-slate-700'
                    }`}
                  >
                    {stageLabels[photo.stage]?.label || photo.stage}
                  </span>
                  <span className="text-slate-400">{photo.date}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    className="max-w-full max-h-[55vh] object-contain"
                  />
                </div>
                <div className="p-2 text-center text-xs text-slate-300 font-semibold">
                  {photo.title}
                </div>
              </div>

              {/* Photo 2 */}
              <div className="flex flex-col bg-slate-950 rounded-2xl p-2 border border-white/10">
                <div className="flex items-center justify-between px-2 py-1 mb-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      stageLabels[comparisonPhoto.stage]?.color || 'bg-slate-700'
                    }`}
                  >
                    {stageLabels[comparisonPhoto.stage]?.label || comparisonPhoto.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{comparisonPhoto.date}</span>
                    <button
                      type="button"
                      onClick={() => setComparisonPhotoId('')}
                      className="text-rose-400 hover:text-rose-300 text-[10px]"
                    >
                      إلغاء المقارنة
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black">
                  <img
                    src={comparisonPhoto.photoUrl}
                    alt={comparisonPhoto.title}
                    className="max-w-full max-h-[55vh] object-contain"
                  />
                </div>
                <div className="p-2 text-center text-xs text-slate-300 font-semibold">
                  {comparisonPhoto.title}
                </div>
              </div>
            </div>
          ) : (
            /* Single Image View */
            <div className="w-full flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden p-2 max-h-[65vh]">
              <img
                src={photo.photoUrl}
                alt={photo.title}
                className="max-w-full max-h-[62vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          )}

          {/* Details & Notes */}
          <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">الأسنان المرتبطة:</span>
              <div className="flex flex-wrap gap-1">
                {photo.teethNumbers && photo.teethNumbers.length > 0 ? (
                  photo.teethNumbers.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono font-bold"
                    >
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">غير محدد (توثيق عام)</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">الموثق والتاريخ:</span>
              <span className="font-semibold text-slate-200">
                بواسطة: {photo.takenBy} • {photo.date}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">الملاحظات السريرية:</span>
              <p className="text-slate-300 italic">
                {photo.notes || 'لا توجد ملاحظات سريرية إضافية مسجلة.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
