import React, { useState } from 'react';
import {
  Camera,
  Search,
  Plus,
  Filter,
  Columns,
  Eye,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  Layers,
  FileImage,
  User as UserIcon,
} from 'lucide-react';
import { ClinicalPhoto, Patient, DentalCase, User, PhotoStage } from '../types';
import { DentalCameraModal } from '../components/DentalCameraModal';
import { ClinicalPhotoViewerModal } from '../components/ClinicalPhotoViewerModal';

interface ClinicalPhotosProps {
  photos: ClinicalPhoto[];
  patients: Patient[];
  cases: DentalCase[];
  currentUser: User;
  activeBranchId?: string;
  onSavePhoto: (photo: ClinicalPhoto) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export const ClinicalPhotos: React.FC<ClinicalPhotosProps> = ({
  photos,
  patients,
  cases,
  currentUser,
  activeBranchId,
  onSavePhoto,
  onDeletePhoto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<ClinicalPhoto | null>(null);
  const [preselectedPatient, setPreselectedPatient] = useState<Patient | null>(null);

  const stageLabels: Record<string, { label: string; color: string; badge: string }> = {
    before: { label: 'قبل العلاج', color: 'border-amber-400 text-amber-800 bg-amber-50', badge: 'bg-amber-500' },
    during: { label: 'أثناء المعالجة', color: 'border-blue-400 text-blue-800 bg-blue-50', badge: 'bg-blue-500' },
    after: { label: 'بعد الإنجاز', color: 'border-emerald-400 text-emerald-800 bg-emerald-50', badge: 'bg-emerald-500' },
    xray: { label: 'أشعة / بانوراما', color: 'border-purple-400 text-purple-800 bg-purple-50', badge: 'bg-purple-500' },
    other: { label: 'توثيق سريري', color: 'border-slate-400 text-slate-800 bg-slate-50', badge: 'bg-slate-500' },
  };

  const filteredPhotos = photos.filter((photo) => {
    if (activeBranchId && activeBranchId !== 'all' && photo.branchId && photo.branchId !== activeBranchId) {
      return false;
    }
    if (stageFilter !== 'all' && photo.stage !== stageFilter) {
      return false;
    }
    if (patientFilter !== 'all' && photo.patientId !== patientFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const patient = patients.find((p) => p.id === photo.patientId);
      const matchTitle = photo.title.toLowerCase().includes(q);
      const matchPatient = (photo.patientName || patient?.name || '').toLowerCase().includes(q);
      const matchNotes = (photo.notes || '').toLowerCase().includes(q);
      const matchTeeth = (photo.teethNumbers || []).some((t) => t.includes(q));
      if (!matchTitle && !matchPatient && !matchNotes && !matchTeeth) {
        return false;
      }
    }
    return true;
  });

  const openCameraWithPatient = (p?: Patient) => {
    setPreselectedPatient(p || null);
    setIsCameraOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-cyan-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>نظام التوثيق الصوري السريري والذكاء البصري</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">سجل صور الحالات السنية والأشعة</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            التقاط وحفظ وتوثيق صور الحالات السريرية للمرضى، الأشعة التشخيصية، ومقارنة نتائج المعالجات (قبل وبعد) بدقة واحترافية.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCameraWithPatient()}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 text-sm transition-all transform active:scale-95 cursor-pointer"
        >
          <Camera className="w-5 h-5" />
          <span>فتح الكاميرا والتقاط صورة</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المريض، رقم السن، العنوان..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 pl-3 pr-9 text-slate-900 outline-hidden font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3" />
        </div>

        {/* Stage Filter */}
        <div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 font-bold outline-hidden"
          >
            <option value="all">كل مراحل التوثيق</option>
            <option value="before">قبل العلاج (Before)</option>
            <option value="during">أثناء المعالجة (During)</option>
            <option value="after">بعد العلاج (After)</option>
            <option value="xray">أشعة / بانوراما (X-Ray)</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        {/* Patient Filter */}
        <div>
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-800 font-bold outline-hidden"
          >
            <option value="all">كل المرضى</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-end text-slate-500 font-bold px-2">
          <span>إجمالي الصور المعروضة:</span>
          <span className="mr-1.5 px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-mono">
            {filteredPhotos.length}
          </span>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">لا توجد صور توثيقية مطابقة</h4>
            <p className="text-slate-500 text-xs mt-1">
              قم بتشغيل الكاميرا لالتقاط صورة سريرية وتوثيق حالة المريض
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCameraWithPatient()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>التقاط أول صورة الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const patient = patients.find((p) => p.id === photo.patientId);
            const stageConfig = stageLabels[photo.stage] || stageLabels.other;

            return (
              <div
                key={photo.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-cyan-300 transition-all flex flex-col group"
              >
                {/* Image Header with Stage Badge */}
                <div
                  onClick={() => setSelectedPhotoForView(photo)}
                  className="relative aspect-4/3 bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md text-white ${
                        stageConfig.badge
                      }`}
                    >
                      {stageConfig.label}
                    </span>
                  </div>
                  {photo.teethNumbers && photo.teethNumbers.length > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 flex gap-1">
                      {photo.teethNumbers.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="bg-slate-950/80 text-cyan-300 border border-cyan-400/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-xs"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-slate-950/70 text-white shadow-lg">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 truncate" title={photo.title}>
                      {photo.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700 truncate">
                        {photo.patientName || patient?.name}
                      </span>
                    </div>
                  </div>

                  {photo.notes && (
                    <p className="text-slate-500 text-[11px] line-clamp-2 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {photo.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {photo.date}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedPhotoForView(photo)}
                      className="text-cyan-700 hover:text-cyan-900 font-bold hover:underline"
                    >
                      عرض وتكبير
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DentalCameraModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setPreselectedPatient(null);
        }}
        patient={preselectedPatient}
        patients={patients}
        cases={cases}
        currentUser={currentUser.fullName || currentUser.username}
        branchId={activeBranchId}
        onSavePhoto={onSavePhoto}
      />

      <ClinicalPhotoViewerModal
        photo={selectedPhotoForView}
        allPhotos={photos}
        patient={
          selectedPhotoForView
            ? patients.find((p) => p.id === selectedPhotoForView.patientId) || null
            : null
        }
        onClose={() => setSelectedPhotoForView(null)}
        onDeletePhoto={onDeletePhoto}
      />
    </div>
  );
};
