import React, { useState, useRef } from 'react';
import { ClinicSettings, Discount, User } from '../types';
import {
  Settings as SettingsIcon,
  DollarSign,
  Percent,
  Building,
  Save,
  Download,
  Upload,
  UserCheck,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { exportFullDatabaseAsJSON, importFullDatabaseFromJSON, resetDatabaseToSeed } from '../lib/db';

interface SettingsProps {
  settings: ClinicSettings;
  discounts: Discount[];
  users: User[];
  currentUser: User;
  onUpdateSettings: (settings: ClinicSettings) => Promise<void>;
  onAddDiscount: (discount: Discount) => Promise<void>;
  onDeleteDiscount: (id: string) => Promise<void>;
  onAddUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  discounts,
  users,
  currentUser,
  onUpdateSettings,
  onAddDiscount,
  onDeleteDiscount,
  onAddUser,
  onDeleteUser,
  onRefreshData,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for general clinic info
  const [clinicName, setClinicName] = useState(settings.clinicName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [reception24hLock, setReception24hLock] = useState(settings.reception24hLock);

  // Exchange rates
  const [sarRate, setSarRate] = useState(settings.exchangeRates.SAR);
  const [usdRate, setUsdRate] = useState(settings.exchangeRates.USD);

  // New discount form
  const [newDiscName, setNewDiscName] = useState('');
  const [newDiscType, setNewDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscValue, setNewDiscValue] = useState<number | ''>('');

  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'reception'>('reception');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveClinicSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClinicSettings = {
      ...settings,
      clinicName,
      phone,
      address,
      reception24hLock,
      exchangeRates: {
        YER: 1,
        SAR: Number(sarRate) || 140,
        USD: Number(usdRate) || 535,
      },
    };
    await onUpdateSettings(updated);
    showNotice('تم حفظ إعدادات المركز وأسعار الصرف بنجاح');
  };

  const handleAddDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscName || !newDiscValue) return;

    const discount: Discount = {
      id: `disc-${Date.now()}`,
      name: newDiscName.trim(),
      type: newDiscType,
      value: Number(newDiscValue),
      isActive: true,
    };

    await onAddDiscount(discount);
    setNewDiscName('');
    setNewDiscValue('');
    showNotice('تمت إضافة الخصم المعتمد بنجاح');
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newFullName) return;

    const user: User = {
      id: `usr-${Date.now()}`,
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      role: newUserRole,
      password: newPassword,
      isActive: true,
    };

    await onAddUser(user);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    showNotice('تم إنشاء حساب المستخدم بنجاح');
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportFullDatabaseAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AlFaisal_Dental_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotice('تم تصدير النسخة الاحتياطية بنجاح إلى ملف JSON');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تصدير النسخة الاحتياطية');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirm = window.confirm(
      'تنبيه مهم: استعادة النسخة الاحتياطية ستستبدل البيانات الحالية. هل تود الاستمرار؟'
    );
    if (!confirm) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await importFullDatabaseFromJSON(json);
        await onRefreshData();
        showNotice('تمت استعادة قاعدة البيانات بنجاح من الملف');
      } catch (err) {
        console.error(err);
        alert('فشل استيراد الملف، تأكد من صحة تنسيق ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = async () => {
    const confirm = window.confirm(
      'تحذير: هل أنت متأكد من إعادة ضبط النظام لبيانات النموذج الأولية؟'
    );
    if (!confirm) return;
    await resetDatabaseToSeed();
    await onRefreshData();
    showNotice('تمت إعادة ضبط النظام للبيانات التجريبية الأولية بنجاح');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-600" />
            <span>إعدادات النظام والمركز والنسخ الاحتياطي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ضبط أسعار صرف العملات، الخصومات، وصلاحيات الحسابات
          </p>
        </div>

        {notification && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Clinic General Information & Currencies */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-cyan-600" />
            <span>بيانات المركز وأسعار الصرف</span>
          </h3>

          <form onSubmit={handleSaveClinicSettings} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المركز الرسمي *</label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-bold disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان والموقع</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-2 px-3 text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {/* Exchange Rates Row */}
            <div className="p-3.5 bg-cyan-50/50 rounded-xl border border-cyan-100 space-y-2">
              <h4 className="font-bold text-cyan-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-cyan-600" />
                <span>أسعار الصرف مقابل الريال اليمني (YER)</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    1 ريال سعودي (SAR) =
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={!isAdmin}
                      value={sarRate}
                      onChange={(e) => setSarRate(Number(e.target.value) || 140)}
                      className="w-full bg-white border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 font-mono font-bold text-slate-900 outline-hidden"
                    />
                    <span className="font-mono text-slate-500">YER</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    1 دولار أمريكي (USD) =
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={!isAdmin}
                      value={usdRate}
                      onChange={(e) => setUsdRate(Number(e.target.value) || 535)}
                      className="w-full bg-white border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 font-mono font-bold text-slate-900 outline-hidden"
                    />
                    <span className="font-mono text-slate-500">YER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 24-hour rule toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="reception24h"
                disabled={!isAdmin}
                checked={reception24hLock}
                onChange={(e) => setReception24hLock(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded-md"
              />
              <label htmlFor="reception24h" className="font-bold text-slate-800 cursor-pointer">
                تفعيل قاعدة الـ 24 ساعة (منع موظف الاستقبال من تعديل أو حذف الحالات بعد 24 ساعة)
              </label>
            </div>

            {isAdmin && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ إعدادات المركز والصرف</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Discounts Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="w-4 h-4 text-cyan-600" />
            <span>قائمة الخصومات المعتمدة للمركز</span>
          </h3>

          {/* List of discounts */}
          <div className="space-y-2">
            {discounts.map((disc) => (
              <div
                key={disc.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{disc.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {disc.type === 'percentage' ? `${disc.value}% خصم نسبي` : `${disc.value} خصم مقطوع`}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteDiscount(disc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    title="حذف الخصم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add discount form */}
          {isAdmin && (
            <form onSubmit={handleAddDiscountSubmit} className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">إضافة خصم معتمد جديد:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={newDiscName}
                  onChange={(e) => setNewDiscName(e.target.value)}
                  placeholder="اسم الخصم (مثال: خصم أعياد)"
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden"
                />

                <select
                  value={newDiscType}
                  onChange={(e) => setNewDiscType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-2 outline-hidden"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>

                <div className="flex gap-1">
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDiscValue}
                    onChange={(e) =>
                      setNewDiscValue(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="القيمة"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Users & Permissions Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-cyan-600" />
            <span>المستخدمون وصلاحيات النظام (Admin / Reception)</span>
          </h3>

          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{u.fullName}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    @{u.username} • الدور:{' '}
                    <strong className={u.role === 'admin' ? 'text-cyan-700' : 'text-slate-700'}>
                      {u.role === 'admin' ? 'مدير النظام (Admin)' : 'موظف استقبال (Reception)'}
                    </strong>
                  </span>
                </div>

                {isAdmin && u.username !== currentUser.username && (
                  <button
                    type="button"
                    onClick={() => onDeleteUser(u.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    title="حذف المستخدم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <form onSubmit={handleAddUserSubmit} className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">إضافة مستخدم جديد:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden"
                />
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="اسم الدخول (username)"
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden font-mono"
                  dir="ltr"
                />
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl py-1.5 px-3 outline-hidden font-bold"
                >
                  <option value="reception">موظف استقبال (Reception)</option>
                  <option value="admin">مدير المركز (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all cursor-pointer"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Backup & Restore and Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-4 h-4 text-cyan-600" />
            <span>النسخ الاحتياطي وتجهيز التطبيق (Capacitor / Tauri)</span>
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            النظام يعمل محلياً بالكامل عبر قاعدة بيانات سريعة (Dexie IndexedDB). يمكنك تصدير
            واستعادة كافة السجلات في أي وقت. البنية مصممة ومفصولة هندسياً لتتحول مباشرة إلى APK
            للأندرويد و EXE للويندوز دون تعديل في المنطق الداخلي.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>استعادة من ملف نسخة احتياطية</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>

            {isAdmin && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetSeed}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-all border border-rose-200 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة ضبط المصنع للبيانات التجريبية الأولية</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
