import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Patient,
  DentalCase,
  Doctor,
  Nurse,
  NurseTransaction,
  LabExpense,
  ClinicExpense,
  DoctorSettlement,
  Discount,
  ClinicSettings,
  CasePayment,
  Branch,
  ClinicalPhoto,
} from './types';
import {
  initializeDatabase,
  getClinicSettings,
  saveClinicSettings,
  getAllPatients,
  savePatient,
  getAllCases,
  saveCase,
  deleteCaseById,
  getAllDoctors,
  saveDoctor,
  getAllNurses,
  saveNurse,
  getAllNurseTransactions,
  saveNurseTransaction,
  deleteNurseTransactionById,
  getAllLabExpenses,
  saveLabExpense,
  deleteLabExpenseById,
  getAllClinicExpenses,
  saveClinicExpense,
  deleteClinicExpenseById,
  getAllDoctorSettlements,
  saveDoctorSettlement,
  getAllDiscounts,
  saveDiscount,
  deleteDiscountById,
  getAllUsers,
  saveUser,
  deleteUserById,
  getAllBranches,
  saveBranch,
  deleteBranch,
  getAllClinicalPhotos,
  saveClinicalPhoto,
  deleteClinicalPhoto,
  recordCasePayment,
  exportDatabaseBackup,
} from './lib/db';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Toast, ToastType } from './components/Toast';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Cases } from './pages/Cases';
import { ClinicalPhotos } from './pages/ClinicalPhotos';
import { Branches } from './pages/Branches';
import { DoctorDailySettlement } from './pages/DoctorDailySettlement';
import { LabExpenses } from './pages/LabExpenses';
import { Doctors } from './pages/Doctors';
import { Nurses } from './pages/Nurses';
import { ClinicExpenses } from './pages/ClinicExpenses';
import { DailySummary } from './pages/DailySummary';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

// Print components
import { InvoicePrint } from './components/print/InvoicePrint';
import { DoctorExamSheetPrint } from './components/print/DoctorExamSheetPrint';
import { DoctorDailyAccountPrint } from './components/print/DoctorDailyAccountPrint';
import { DailySummarySheetPrint } from './components/print/DailySummarySheetPrint';
import { NursePayslipPrint } from './components/print/NursePayslipPrint';
import { CaseSummaryPrint } from './components/print/CaseSummaryPrint';
import { GenericReportPrint } from './components/print/GenericReportPrint';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('alfaisal_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Current active navigation
  const [activePage, setActivePage] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Branches state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('all');

  // App Data States
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cases, setCases] = useState<DentalCase[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [nurseTransactions, setNurseTransactions] = useState<NurseTransaction[]>([]);
  const [labExpenses, setLabExpenses] = useState<LabExpense[]>([]);
  const [clinicExpenses, setClinicExpenses] = useState<ClinicExpense[]>([]);
  const [doctorSettlements, setDoctorSettlements] = useState<DoctorSettlement[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clinicalPhotos, setClinicalPhotos] = useState<ClinicalPhoto[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Preselected patient when bridging from Patients screen to Cases screen
  const [preselectedPatientForCase, setPreselectedPatientForCase] = useState<Patient | null>(null);

  // Print Modal State
  const [activePrint, setActivePrint] = useState<{
    type:
      | 'invoice'
      | 'exam'
      | 'caseSummary'
      | 'doctorSettlement'
      | 'dailySummary'
      | 'nursePayslip'
      | 'genericReport';
    title: string;
    data: any;
  } | null>(null);

  // Load and refresh full application data from Dexie
  const loadData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      await initializeDatabase();

      const [
        s,
        patList,
        caseList,
        docList,
        nurseList,
        nTxList,
        labList,
        expList,
        docSetList,
        discList,
        userList,
        branchList,
        photoList,
      ] = await Promise.all([
        getClinicSettings(),
        getAllPatients(),
        getAllCases(),
        getAllDoctors(),
        getAllNurses(),
        getAllNurseTransactions(),
        getAllLabExpenses(),
        getAllClinicExpenses(),
        getAllDoctorSettlements(),
        getAllDiscounts(),
        getAllUsers(),
        getAllBranches(),
        getAllClinicalPhotos(),
      ]);

      setSettings(s);
      setPatients(patList);
      setCases(caseList);
      setDoctors(docList);
      setNurses(nurseList);
      setNurseTransactions(nTxList);
      setLabExpenses(labList);
      setClinicExpenses(expList);
      setDoctorSettlements(docSetList);
      setDiscounts(discList);
      setUsers(userList);
      setBranches(branchList);
      setClinicalPhotos(photoList);
    } catch (error) {
      console.error('Error loading database:', error);
      showToast('حدث خطأ أثناء تحميل البيانات من قاعدة البيانات', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleLogin = (user: User, branchId?: string) => {
    setCurrentUser(user);
    const targetBranch = branchId || user.branchId || 'all';
    setActiveBranchId(targetBranch);
    localStorage.setItem('alfaisal_user', JSON.stringify(user));
    localStorage.setItem('alfaisal_active_branch', targetBranch);
    showToast(`مرحباً بك، ${user.fullName}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('alfaisal_user');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  // Branch Handlers
  const handleAddBranch = async (branch: Branch) => {
    await saveBranch(branch);
    setBranches((prev) => [...prev, branch]);
    showToast('تمت إضافة الفرع بنجاح');
  };

  const handleUpdateBranch = async (branch: Branch) => {
    await saveBranch(branch);
    setBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
    showToast('تم تحديث بيانات الفرع بنجاح');
  };

  const handleDeleteBranch = async (branchId: string) => {
    await deleteBranch(branchId);
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    if (activeBranchId === branchId) setActiveBranchId('all');
    showToast('تم حذف الفرع');
  };

  // Quick Backup Handler
  const handleBackup = async () => {
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AlFaisal-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير النسخة الاحتياطية بنجاح');
    } catch (e) {
      showToast('حدث خطأ أثناء النسخ الاحتياطي', 'error');
    }
  };

  // CRUD Handlers
  const handleAddPatient = async (newPatient: Patient) => {
    await savePatient(newPatient);
    setPatients((prev) => [newPatient, ...prev]);
    showToast('تم تسجيل بيانات المريض بنجاح');
  };

  const handleUpdatePatient = async (updated: Patient) => {
    await savePatient(updated);
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast('تم تحديث بيانات المريض بنجاح');
  };

  const handleArchivePatient = async (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    showToast('تمت أرشفة سجل المريض');
  };

  const handleAddCase = async (newCase: DentalCase) => {
    await saveCase(newCase);
    setCases((prev) => [newCase, ...prev]);
    showToast('تم تسجيل حالة العلاج واحتساب الحصص آلياً');
    setPreselectedPatientForCase(null);
  };

  const handleUpdateCase = async (updated: DentalCase) => {
    await saveCase(updated);
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('تم حفظ تعديلات الحالة بنجاح');
  };

  const handleDeleteCase = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الحالة نهائياً؟')) {
      await deleteCaseById(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
      showToast('تم حذف الحالة', 'info');
    }
  };

  const handleAddCasePayment = async (caseId: string, payment: CasePayment) => {
    await recordCasePayment(caseId, payment);
    await loadData();
    showToast('تم تسجيل سند القبض وتحديث متبقي الحالة');
  };

  const handleRecordDoctorSettlement = async (settlement: DoctorSettlement) => {
    await saveDoctorSettlement(settlement);
    setDoctorSettlements((prev) => [settlement, ...prev]);
    showToast('تم تسجيل تسليم مستحقات الطبيب بنجاح');
  };

  const handleAddLabExpense = async (expense: LabExpense) => {
    await saveLabExpense(expense);
    setLabExpenses((prev) => [expense, ...prev]);
    if (expense.caseId) {
      await loadData();
    }
    showToast('تم تسجيل فاتورة المعمل بنجاح');
  };

  const handleDeleteLabExpense = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القيد؟')) {
      await deleteLabExpenseById(id);
      setLabExpenses((prev) => prev.filter((l) => l.id !== id));
      showToast('تم حذف قيد المعمل', 'info');
    }
  };

  const handleAddDoctor = async (doc: Doctor) => {
    await saveDoctor(doc);
    setDoctors((prev) => [...prev, doc]);
    showToast('تمت إضافة الطبيب إلى الكادر بنجاح');
  };

  const handleUpdateDoctor = async (doc: Doctor) => {
    await saveDoctor(doc);
    setDoctors((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    showToast('تم تحديث بيانات الطبيب ونسبته بنجاح');
  };

  const handleArchiveDoctor = async (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    showToast('تمت أرشفة الطبيب');
  };

  const handleAddNurse = async (nurse: Nurse) => {
    await saveNurse(nurse);
    setNurses((prev) => [...prev, nurse]);
    showToast('تمت إضافة الممرضة بنجاح');
  };

  const handleUpdateNurse = async (nurse: Nurse) => {
    await saveNurse(nurse);
    setNurses((prev) => prev.map((n) => (n.id === nurse.id ? nurse : n)));
    showToast('تم تحديث بيانات الممرضة بنجاح');
  };

  const handleAddNurseTransaction = async (tx: NurseTransaction) => {
    await saveNurseTransaction(tx);
    setNurseTransactions((prev) => [tx, ...prev]);
    showToast('تم تسجيل الحركة المالية للممرضة بنجاح');
  };

  const handleDeleteNurseTransaction = async (id: string) => {
    await deleteNurseTransactionById(id);
    setNurseTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('تم حذف الحركة المالية', 'info');
  };

  const handleAddClinicExpense = async (exp: ClinicExpense) => {
    await saveClinicExpense(exp);
    setClinicExpenses((prev) => [exp, ...prev]);
    showToast('تم تسجيل المصروف بنجاح');
  };

  const handleDeleteClinicExpense = async (id: string) => {
    if (window.confirm('هل تود حذف هذا المصروف؟')) {
      await deleteClinicExpenseById(id);
      setClinicExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('تم حذف المصروف', 'info');
    }
  };

  const handleUpdateSettings = async (newSettings: ClinicSettings) => {
    await saveClinicSettings(newSettings, currentUser?.username || 'admin');
    setSettings(newSettings);
    showToast('تم حفظ إعدادات المركز');
  };

  const handleAddDiscount = async (disc: Discount) => {
    await saveDiscount(disc);
    setDiscounts((prev) => [...prev, disc]);
    showToast('تمت إضافة الخصم المعتمد');
  };

  const handleDeleteDiscount = async (id: string) => {
    await deleteDiscountById(id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    showToast('تم حذف الخصم');
  };

  const handleAddUser = async (user: User) => {
    await saveUser(user);
    setUsers((prev) => [...prev, user]);
    showToast('تم إنشاء حساب المستخدم');
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUserById(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('تم حذف المستخدم');
  };

  // Clinical Photos Handlers
  const handleSaveClinicalPhoto = async (photo: ClinicalPhoto) => {
    try {
      await saveClinicalPhoto(photo, currentUser?.fullName || currentUser?.username || 'admin');
      setClinicalPhotos((prev) => {
        const idx = prev.findIndex((p) => p.id === photo.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = photo;
          return next;
        }
        return [photo, ...prev];
      });
      showToast('تم حفظ وتوثيق الصورة السريرية بنجاح');
    } catch (err: any) {
      showToast('فشل في حفظ الصورة: ' + (err?.message || 'خطأ غير معروف'), 'error');
    }
  };

  const handleDeleteClinicalPhoto = async (id: string) => {
    try {
      await deleteClinicalPhoto(id, currentUser?.fullName || currentUser?.username || 'admin');
      setClinicalPhotos((prev) => prev.filter((p) => p.id !== id));
      showToast('تم حذف الصورة التوثيقية بنجاح');
    } catch (err: any) {
      showToast('فشل في حذف الصورة: ' + (err?.message || 'خطأ غير معروف'), 'error');
    }
  };

  // Navigating to New Case with a specific patient pre-selected
  const handleOpenNewCaseForPatient = (patient: Patient) => {
    setPreselectedPatientForCase(patient);
    setActivePage('cases');
  };

  if (!currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={(bId) => {
          setActiveBranchId(bId);
          localStorage.setItem('alfaisal_active_branch', bId);
        }}
        onAddBranch={handleAddBranch}
      />
    );
  }

  if (isLoadingData || !settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans p-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-bold">مركز الفيصل لطب وجراحة الأسنان</h2>
        <p className="text-xs text-slate-400 mt-1">جاري تشغيل قاعدة البيانات وتحميل الفروع والكوادر...</p>
      </div>
    );
  }

  const unpaidCasesCount = cases.filter((c) => c.status === 'in_progress' || c.remainingAmount > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" dir="rtl">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        settings={settings}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectActiveBranch={setActiveBranchId}
        onNavigateToBranches={() => setActivePage('branches')}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onQuickBackup={handleBackup}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          currentTab={activePage}
          onSelectTab={(tab) => {
            setActivePage(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          userRole={currentUser.role}
          pendingRemindersCount={0}
          unpaidCasesCount={unpaidCasesCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 w-full max-w-[1750px] mx-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              cases={cases}
              patients={patients}
              doctors={doctors}
              labExpenses={labExpenses}
              clinicExpenses={clinicExpenses}
              settings={settings}
              currentUser={currentUser}
              branches={branches}
              activeBranchId={activeBranchId}
              onSelectBranch={setActiveBranchId}
              onNavigate={setActivePage}
              onSelectCaseToPrint={(c) =>
                setActivePrint({
                  type: 'invoice',
                  title: `فاتورة وسند قبض - ${c.patientName}`,
                  data: { dentalCase: c, settings },
                })
              }
            />
          )}

          {activePage === 'branches' && (
            <Branches
              branches={branches}
              activeBranchId={activeBranchId}
              onSelectActiveBranch={setActiveBranchId}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              cases={cases}
              patients={patients}
              doctors={doctors}
              currentUser={currentUser}
            />
          )}

          {activePage === 'patients' && (
            <Patients
              patients={patients}
              cases={cases}
              currentUser={currentUser}
              clinicalPhotos={clinicalPhotos}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onArchivePatient={handleArchivePatient}
              onOpenNewCaseForPatient={handleOpenNewCaseForPatient}
              onSelectCaseToPrint={(c) =>
                setActivePrint({
                  type: 'invoice',
                  title: `فاتورة علاج - ${c.patientName}`,
                  data: { dentalCase: c, settings },
                })
              }
              onSavePhoto={handleSaveClinicalPhoto}
              onDeletePhoto={handleDeleteClinicalPhoto}
            />
          )}

          {activePage === 'clinical-photos' && (
            <ClinicalPhotos
              photos={clinicalPhotos}
              patients={patients}
              cases={cases}
              currentUser={currentUser}
              activeBranchId={activeBranchId}
              onSavePhoto={handleSaveClinicalPhoto}
              onDeletePhoto={handleDeleteClinicalPhoto}
            />
          )}

          {activePage === 'cases' && (
            <Cases
              cases={cases}
              patients={patients}
              doctors={doctors}
              discounts={discounts}
              settings={settings}
              currentUser={currentUser}
              branches={branches}
              activeBranchId={activeBranchId}
              preselectedPatient={preselectedPatientForCase}
              clinicalPhotos={clinicalPhotos}
              onSavePhoto={handleSaveClinicalPhoto}
              onAddCase={handleAddCase}
              onUpdateCase={handleUpdateCase}
              onDeleteCase={handleDeleteCase}
              onAddPayment={handleAddCasePayment}
              onSelectPrintInvoice={(c) =>
                setActivePrint({
                  type: 'invoice',
                  title: `فاتورة وسند قبض - ${c.patientName}`,
                  data: { dentalCase: c, settings },
                })
              }
              onSelectPrintExamSheet={(c) =>
                setActivePrint({
                  type: 'exam',
                  title: `ورقة معاينة الطبيب - ${c.patientName}`,
                  data: { dentalCase: c, settings },
                })
              }
              onSelectPrintCaseSummary={(c) =>
                setActivePrint({
                  type: 'caseSummary',
                  title: `كشف حالة تفصيلي - ${c.patientName}`,
                  data: { dentalCase: c, settings },
                })
              }
            />
          )}

          {activePage === 'doctor-settlement' && (
            <DoctorDailySettlement
              doctors={doctors}
              cases={cases}
              settlements={doctorSettlements}
              settings={settings}
              currentUser={currentUser}
              onRecordSettlement={handleRecordDoctorSettlement}
              onPrintSettlement={(doc, selectedDate) =>
                setActivePrint({
                  type: 'doctorSettlement',
                  title: `حساب الطبيب اليومي - د. ${doc?.name || ''}`,
                  data: {
                    doctors: doc ? [doc] : doctors,
                    cases,
                    settlements: doctorSettlements,
                    settings,
                    date: selectedDate,
                  },
                })
              }
            />
          )}

          {activePage === 'lab-expenses' && (
            <LabExpenses
              labExpenses={labExpenses}
              cases={cases}
              settings={settings}
              currentUser={currentUser}
              onAddLabExpense={handleAddLabExpense}
              onDeleteLabExpense={handleDeleteLabExpense}
              onPrintLabReport={() =>
                setActivePrint({
                  type: 'genericReport',
                  title: 'كشف مصاريف وخروج معامل الأسنان',
                  data: {
                    type: 'labs',
                    labs: labExpenses,
                  },
                })
              }
            />
          )}

          {activePage === 'doctors' && (
            <Doctors
              doctors={doctors}
              cases={cases}
              settlements={doctorSettlements}
              settings={settings}
              currentUser={currentUser}
              branches={branches}
              activeBranchId={activeBranchId}
              onAddDoctor={handleAddDoctor}
              onUpdateDoctor={handleUpdateDoctor}
              onArchiveDoctor={handleArchiveDoctor}
              onPrintDoctorStatement={(doc, periodLabel) =>
                setActivePrint({
                  type: 'doctorSettlement',
                  title: `كشف حساب الطبيب - د. ${doc.name}`,
                  data: {
                    doctors: [doc],
                    cases,
                    settlements: doctorSettlements,
                    settings,
                    date: periodLabel,
                  },
                })
              }
            />
          )}

          {activePage === 'nurses' && (
            <Nurses
              nurses={nurses}
              transactions={nurseTransactions}
              settings={settings}
              currentUser={currentUser}
              branches={branches}
              activeBranchId={activeBranchId}
              onAddNurse={handleAddNurse}
              onUpdateNurse={handleUpdateNurse}
              onAddTransaction={handleAddNurseTransaction}
              onDeleteTransaction={handleDeleteNurseTransaction}
              onPrintPayslip={(nurse, monthLabel) =>
                setActivePrint({
                  type: 'nursePayslip',
                  title: `قسيمة راتب شهر ${monthLabel} - ${nurse.name}`,
                  data: {
                    nurse,
                    transactions: nurseTransactions,
                    month: monthLabel,
                    settings,
                  },
                })
              }
            />
          )}

          {(activePage === 'clinic-expenses' || (activePage as string) === 'expenses') && (
            <ClinicExpenses
              expenses={clinicExpenses}
              settings={settings}
              currentUser={currentUser}
              onAddExpense={handleAddClinicExpense}
              onDeleteExpense={handleDeleteClinicExpense}
            />
          )}

          {activePage === 'daily-summary' && (
            <DailySummary
              cases={cases}
              labExpenses={labExpenses}
              clinicExpenses={clinicExpenses}
              doctorSettlements={doctorSettlements}
              nurseTransactions={nurseTransactions}
              settings={settings}
              currentUser={currentUser}
              onPrintDailySummary={(summaryData) =>
                setActivePrint({
                  type: 'dailySummary',
                  title: `كشف تسوية الصندوق اليومي - ${summaryData.date}`,
                  data: {
                    summaryData,
                    cases,
                    labExpenses,
                    clinicExpenses,
                    doctorSettlements,
                    nurseTransactions,
                    settings,
                  },
                })
              }
            />
          )}

          {activePage === 'reports' && (
            <Reports
              cases={cases}
              doctors={doctors}
              nurses={nurses}
              labExpenses={labExpenses}
              clinicExpenses={clinicExpenses}
              doctorSettlements={doctorSettlements}
              nurseTransactions={nurseTransactions}
              settings={settings}
              currentUser={currentUser}
              branches={branches}
              activeBranchId={activeBranchId}
              onPrintReport={(title, data) =>
                setActivePrint({
                  type: 'genericReport',
                  title,
                  data,
                })
              }
            />
          )}

          {activePage === 'settings' && (
            <Settings
              settings={settings}
              discounts={discounts}
              users={users}
              currentUser={currentUser}
              onUpdateSettings={handleUpdateSettings}
              onAddDiscount={handleAddDiscount}
              onDeleteDiscount={handleDeleteDiscount}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Print Document Modal Overlay */}
      {activePrint && (
        <>
          {activePrint.type === 'invoice' && (
            <InvoicePrint
              dentalCase={activePrint.data.dentalCase}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'exam' && (
            <DoctorExamSheetPrint
              dentalCase={activePrint.data.dentalCase}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'caseSummary' && (
            <CaseSummaryPrint
              dentalCase={activePrint.data.dentalCase}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'doctorSettlement' && (
            <DoctorDailyAccountPrint
              doctors={activePrint.data.doctors}
              doctor={activePrint.data.doctors.length === 1 ? activePrint.data.doctors[0] : undefined}
              cases={activePrint.data.cases}
              date={activePrint.data.date}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'dailySummary' && (
            <DailySummarySheetPrint
              data={activePrint.data.summaryData}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'nursePayslip' && (
            <NursePayslipPrint
              nurse={activePrint.data.nurse}
              transactions={activePrint.data.transactions}
              monthLabel={activePrint.data.month}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}

          {activePrint.type === 'genericReport' && (
            <GenericReportPrint
              title={activePrint.title}
              data={activePrint.data}
              settings={settings}
              onClose={() => setActivePrint(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
