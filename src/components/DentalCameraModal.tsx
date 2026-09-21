import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCw,
  Check,
  Upload,
  Sparkles,
  AlertCircle,
  FileImage,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ClinicalPhoto, PhotoStage, Patient, DentalCase } from '../types';

interface DentalCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  patients: Patient[];
  cases: DentalCase[];
  selectedCaseId?: string;
  currentUser: string;
  branchId?: string;
  onSavePhoto: (photo: ClinicalPhoto) => Promise<void>;
}

export const DentalCameraModal: React.FC<DentalCameraModalProps> = ({
  isOpen,
  onClose,
  patient,
  patients,
  cases,
  selectedCaseId,
  currentUser,
  branchId,
  onSavePhoto,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patient?.id || '');
  const [caseId, setCaseId] = useState<string>(selectedCaseId || '');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stage, setStage] = useState<PhotoStage>('before');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [teethInput, setTeethInput] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if modal reopens or props change
  useEffect(() => {
    if (isOpen) {
      setSelectedPatientId(patient?.id || patients[0]?.id || '');
      setCaseId(selectedCaseId || '');
      setCapturedImage(null);
      setCameraError(null);
      setTitle('');
      setNotes('');
      setTeethInput('');
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, patient, selectedCaseId, facingMode]);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patient;
  const patientCases = cases.filter((c) => c.patientId === selectedPatientId);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم الوصول المباشر لواجهة الكاميرا. يمكنك استخدام زر رفع/التقاط الصورة.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setIsCameraActive(false);
      setCameraError(
        err?.message?.includes('Permission')
          ? 'تم رفض إذن الوصول للكاميرا. يرجى السماح للتطبيق بالوصول للكاميرا أو رفع صورة مباشرة.'
          : 'تعذر تشغيل الكاميرا المباشرة. يمكنك استخدام زر "التقاط من تطبيق الكاميرا / رفع صورة" أدناه.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    // Constrain max dimension to 1280 for fast IndexedDB storage
    const maxDim = 1280;
    let targetWidth = width;
    let targetHeight = height;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        targetWidth = maxDim;
        targetHeight = Math.round((height / width) * maxDim);
      } else {
        targetHeight = maxDim;
        targetWidth = Math.round((width / height) * maxDim);
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();

    // Default title if empty
    if (!title) {
      const stageText =
        stage === 'before'
          ? 'صورة قبل العلاج'
          : stage === 'during'
          ? 'أثناء المعالجة السنية'
          : stage === 'after'
          ? 'نتيجة الحالة بعد الإنجاز'
          : stage === 'xray'
          ? 'صورة أشعة وتشخيص'
          : 'توثيق سريري';
      setTitle(stageText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h / w) * maxDim);
            w = maxDim;
          } else {
            w = Math.round((w / h) * maxDim);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          stopCamera();
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSave = async () => {
    if (!capturedImage) return;
    if (!selectedPatientId) {
      alert('يرجى اختيار المريض أولاً');
      return;
    }

    setIsSaving(true);
    try {
      const teethArr = teethInput
        ? teethInput
            .split(/[,،\s]+/)
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const newPhoto: ClinicalPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patientId: selectedPatientId,
        patientName: activePatient?.name || 'مريض غير محدد',
        caseId: caseId || undefined,
        photoUrl: capturedImage,
        stage,
        title: title.trim() || 'توثيق سريري',
        notes: notes.trim() || undefined,
        teethNumbers: teethArr.length > 0 ? teethArr : undefined,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        takenBy: currentUser,
        branchId: branchId || activePatient?.branchId,
      };

      await onSavePhoto(newPhoto);
      onClose();
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ الصورة: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">كاميرا التوثيق السريري للأسنان</h3>
              <p className="text-[11px] text-cyan-200/80">
                التقاط وتوثيق صور الحالات والأشعة وحفظها بملف المريض
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Patient & Case Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المريض المستهدف *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 font-bold outline-hidden shadow-xs"
              >
                <option value="">— اختر المريض —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone || 'بدون هاتف'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ربط بالحالة السنية (اختياري)</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden shadow-xs"
              >
                <option value="">— عام لملف المريض (بدون ربط بحالة محددة) —</option>
                {patientCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.treatment} ({c.date}) - د. {c.doctorName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Camera Viewfinder or Image Preview */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Grid Overlay for dental alignment */}
                {showGrid && isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-cyan-400">
                    <div className="border-r border-b border-cyan-400" />
                    <div className="border-r border-b border-cyan-400" />
                    <div className="border-b border-cyan-400" />
                    <div className="border-r border-b border-cyan-400" />
                    <div className="border-r border-b border-cyan-400" />
                    <div className="border-b border-cyan-400" />
                    <div className="border-r border-cyan-400" />
                    <div className="border-r border-cyan-400" />
                    <div />
                  </div>
                )}

                {/* Target crosshair */}
                {isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    </div>
                  </div>
                )}

                {/* Controls over video */}
                {isCameraActive ? (
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-4 py-2 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        showGrid ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
                      }`}
                      title="شبكة التوسيط السريري"
                    >
                      <Layers className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCapture}
                      className="w-16 h-16 rounded-full bg-white border-4 border-cyan-500 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center transition-all cursor-pointer"
                      title="التقاط الصورة"
                    >
                      <div className="w-11 h-11 rounded-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center text-white">
                        <Camera className="w-6 h-6" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      title="تبديل الكاميرا (أمامية/خلفية)"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    {cameraError ? (
                      <div className="space-y-3">
                        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                        <p className="text-xs text-amber-200 font-bold max-w-sm mx-auto">
                          {cameraError}
                        </p>
                        <div className="flex justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                          >
                            إعادة محاولة فتح الكاميرا
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
                          >
                            <Upload className="w-4 h-4" />
                            <span>التقاط / رفع صورة</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs">جاري تهيئة واجهة الكاميرا...</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Clinical Snapshot"
                  className="w-full h-full object-contain bg-black"
                />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg backdrop-blur-xs transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>إعادة التقاط</span>
                </button>
              </div>
            )}
          </div>

          {/* Alternative: Upload button */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>أو يمكنك اختيار صورة من المعرض أو التقاطها عبر تطبيق الكاميرا الأساسي:</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-cyan-600" />
              <span>معرض الصور / أشعة جاهزة</span>
            </button>
          </div>

          {/* Photo Classification & Details Form */}
          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            {/* Stage Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                مرحلة التوثيق السريري للصورة *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'before', label: 'قبل العلاج', color: 'border-amber-400 bg-amber-50 text-amber-800' },
                  { id: 'during', label: 'أثناء المعالجة', color: 'border-blue-400 bg-blue-50 text-blue-800' },
                  { id: 'after', label: 'بعد الإنجاز', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
                  { id: 'xray', label: 'أشعة / بانوراما', color: 'border-purple-400 bg-purple-50 text-purple-800' },
                  { id: 'other', label: 'توثيق عام', color: 'border-slate-400 bg-slate-100 text-slate-800' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id as PhotoStage)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      stage === s.id
                        ? `${s.color} ring-2 ring-cyan-500 shadow-xs font-black`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Teeth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان الصورة / الحالة *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تسوس حاد في الطاحن العلوي، ابتسامة بعد تبييض الزيركون..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  أرقام الأسنان (اختياري)
                </label>
                <input
                  type="text"
                  value={teethInput}
                  onChange={(e) => setTeethInput(e.target.value)}
                  placeholder="مثال: 11, 21, 22"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ملاحظات سريرية وتشخيصية للطبيب
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="سجل أي تفاصيل حول اللون، درجة التحسن، المواد المستخدمة أو تاريخ المتابعة..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs transition-all"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            {!capturedImage && isCameraActive && (
              <button
                type="button"
                onClick={handleCapture}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>التقاط وتجميد الإطار</span>
              </button>
            )}

            <button
              type="button"
              disabled={!capturedImage || !selectedPatientId || isSaving}
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                capturedImage && selectedPatientId && !isSaving
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSaving ? (
                <span>جاري الحفظ في السجل...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ الصورة في ملف المريض</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
