import Dexie, { Table } from 'dexie';
import {
  Patient,
  Doctor,
  DoctorSettlement,
  Nurse,
  NurseTransaction,
  DentalCase,
  LabExpense,
  ClinicExpense,
  Discount,
  ExchangeRateHistory,
  AuditLog,
  Reminder,
  ClinicSettings,
  CasePayment,
  User,
  Branch,
} from '../../types';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_NURSES,
  INITIAL_CASES,
  INITIAL_LAB_EXPENSES,
  INITIAL_CLINIC_EXPENSES,
  INITIAL_DISCOUNTS,
  INITIAL_SETTINGS,
  INITIAL_REMINDERS,
  INITIAL_USERS,
  INITIAL_BRANCHES,
} from '../../data/seedData';

/**
 * =========================================================================
 * طبقة قاعدة البيانات المستقلة لمركز الفيصل لطب الأسنان
 * مبنية بـ Dexie (IndexedDB) ومغلفة بالكامل بحيث يسهل استبدال المحرك
 * لاحقاً بـ @capacitor-community/sqlite أو tauri-plugin-sql
 * دون المساس بالواجهات أو منطق الأعمال.
 * =========================================================================
 */
class AlFaisalDatabase extends Dexie {
  patients!: Table<Patient, string>;
  doctors!: Table<Doctor, string>;
  doctorSettlements!: Table<DoctorSettlement, string>;
  nurses!: Table<Nurse, string>;
  nurseTransactions!: Table<NurseTransaction, string>;
  cases!: Table<DentalCase, string>;
  labExpenses!: Table<LabExpense, string>;
  clinicExpenses!: Table<ClinicExpense, string>;
  discounts!: Table<Discount, string>;
  exchangeRateHistory!: Table<ExchangeRateHistory, string>;
  auditLogs!: Table<AuditLog, string>;
  reminders!: Table<Reminder, string>;
  settings!: Table<{ key: string; value: any }, string>;
  users!: Table<User, string>;
  branches!: Table<Branch, string>;

  constructor() {
    super('AlFaisalDentalCenterDB');
    this.version(2).stores({
      patients: 'id, name, phone, createdAt, isArchived, branchId',
      doctors: 'id, name, status',
      doctorSettlements: 'id, doctorId, date',
      nurses: 'id, name, status',
      nurseTransactions: 'id, nurseId, date, type',
      cases: 'id, patientId, doctorId, date, status, currency, branchId',
      labExpenses: 'id, caseId, date, labName',
      clinicExpenses: 'id, date, category, branchId',
      discounts: 'id, name, isActive',
      exchangeRateHistory: 'id, date',
      auditLogs: 'id, timestamp, user',
      reminders: 'id, patientId, appointmentDate, status',
      settings: 'key',
      users: 'id, username, role, branchId',
      branches: 'id, name, code, manager, status',
    });
  }
}

export const db = new AlFaisalDatabase();

/**
 * تهيئة وتلقيم البيانات التجريبية الأولية إن كانت قاعدة البيانات فارغة
 */
export async function initializeDatabase(): Promise<void> {
  const patientCount = await db.patients.count();
  const branchCount = await db.branches.count();

  if (branchCount === 0) {
    await db.branches.bulkAdd(INITIAL_BRANCHES);
  }

  if (patientCount === 0) {
    await db.transaction('rw', [
      db.patients,
      db.doctors,
      db.nurses,
      db.cases,
      db.labExpenses,
      db.clinicExpenses,
      db.discounts,
      db.settings,
      db.reminders,
      db.auditLogs,
      db.users,
      db.branches,
    ], async () => {
      await db.patients.bulkAdd(INITIAL_PATIENTS);
      await db.doctors.bulkAdd(INITIAL_DOCTORS);
      await db.nurses.bulkAdd(INITIAL_NURSES);
      await db.cases.bulkAdd(INITIAL_CASES);
      await db.labExpenses.bulkAdd(INITIAL_LAB_EXPENSES);
      await db.clinicExpenses.bulkAdd(INITIAL_CLINIC_EXPENSES);
      await db.discounts.bulkAdd(INITIAL_DISCOUNTS);
      await db.reminders.bulkAdd(INITIAL_REMINDERS);
      await db.users.bulkAdd(INITIAL_USERS);
      await db.branches.clear();
      await db.branches.bulkAdd(INITIAL_BRANCHES);

      await db.settings.put({ key: 'clinicSettings', value: INITIAL_SETTINGS });
      await db.auditLogs.add({
        id: 'audit-init',
        timestamp: new Date().toISOString(),
        user: 'system',
        action: 'تهيئة النظام',
        target: 'قاعدة البيانات',
        details: 'تم تثبيت البيانات التجريبية الأولية بنجاح',
      });
    });
  }
}

// -------------------------------------------------------------
// سجل النشاط (Audit Log)
// -------------------------------------------------------------
export async function logAudit(
  user: string,
  action: string,
  target: string,
  details: string,
  oldValue?: string,
  newValue?: string
): Promise<void> {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    target,
    details,
    oldValue,
    newValue,
  };
  await db.auditLogs.add(log);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return await db.auditLogs.orderBy('timestamp').reverse().toArray();
}

// -------------------------------------------------------------
// إدارة المرضى
// -------------------------------------------------------------
export async function getPatients(includeArchived = false): Promise<Patient[]> {
  const list = await db.patients.toArray();
  return list.filter((p) => includeArchived || !p.isArchived);
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  return await db.patients.get(id);
}

export async function addPatient(patient: Patient): Promise<void> {
  await db.patients.add(patient);
  await logAudit(patient.createdBy, 'إضافة مريض', patient.name, `تم تسجيل مريض جديد برقم ${patient.phone}`);
}

export async function updatePatient(patient: Patient, updatedBy: string): Promise<void> {
  const old = await db.patients.get(patient.id);
  await db.patients.put(patient);
  await logAudit(
    updatedBy,
    'تعديل بيانات مريض',
    patient.name,
    `تم تحديث بيانات المريض`,
    old ? JSON.stringify(old) : undefined,
    JSON.stringify(patient)
  );
}

export async function archivePatient(id: string, user: string): Promise<void> {
  const p = await db.patients.get(id);
  if (p) {
    p.isArchived = true;
    await db.patients.put(p);
    await logAudit(user, 'أرشفة مريض', p.name, 'تم نقل المريض للأرشيف');
  }
}

// -------------------------------------------------------------
// إدارة الأطباء
// -------------------------------------------------------------
export async function getDoctors(includeArchived = false): Promise<Doctor[]> {
  const list = await db.doctors.toArray();
  return list.filter((d) => includeArchived || d.status === 'active');
}

export async function addDoctor(doctor: Doctor, createdBy: string): Promise<void> {
  await db.doctors.add(doctor);
  await logAudit(createdBy, 'إضافة طبيب', doctor.name, `نسبة الطبيب: ${doctor.percentage}% - تخصص: ${doctor.specialty}`);
}

export async function updateDoctor(doctor: Doctor, updatedBy: string): Promise<void> {
  const old = await db.doctors.get(doctor.id);
  await db.doctors.put(doctor);
  await logAudit(
    updatedBy,
    'تعديل بيانات طبيب',
    doctor.name,
    `تعديل النسبة إلى ${doctor.percentage}%`,
    old ? `النسبة القديمة: ${old.percentage}%` : undefined,
    `النسبة الجديدة: ${doctor.percentage}%`
  );
}

export async function archiveDoctor(id: string, user: string): Promise<void> {
  const d = await db.doctors.get(id);
  if (d) {
    d.status = 'archived';
    await db.doctors.put(d);
    await logAudit(user, 'أرشفة طبيب', d.name, 'تمت أرشفة الطبيب');
  }
}

export async function recordDoctorSettlement(settlement: DoctorSettlement): Promise<void> {
  await db.doctorSettlements.add(settlement);
  await logAudit(
    settlement.createdBy,
    'تسليم مستحقات طبيب',
    settlement.doctorName,
    `تم تسليم مبلغ ${settlement.amount} ${settlement.currency} للطبيب`
  );
}

export async function getDoctorSettlements(): Promise<DoctorSettlement[]> {
  return await db.doctorSettlements.orderBy('date').reverse().toArray();
}

// -------------------------------------------------------------
// إدارة الممرضات
// -------------------------------------------------------------
export async function getNurses(includeArchived = false): Promise<Nurse[]> {
  const list = await db.nurses.toArray();
  return list.filter((n) => includeArchived || n.status === 'active');
}

export async function addNurse(nurse: Nurse, createdBy: string): Promise<void> {
  await db.nurses.add(nurse);
  await logAudit(createdBy, 'إضافة ممرضة', nurse.name, `الراتب الأساسي: ${nurse.baseSalary} ${nurse.currency}`);
}

export async function updateNurse(nurse: Nurse, updatedBy: string): Promise<void> {
  await db.nurses.put(nurse);
  await logAudit(updatedBy, 'تعديل بيانات ممرضة', nurse.name, 'تم تحديث بيانات الممرضة');
}

export async function archiveNurse(id: string, user: string): Promise<void> {
  const n = await db.nurses.get(id);
  if (n) {
    n.status = 'archived';
    await db.nurses.put(n);
    await logAudit(user, 'أرشفة ممرضة', n.name, 'تمت أرشفة الممرضة');
  }
}

export async function getNurseTransactions(nurseId?: string): Promise<NurseTransaction[]> {
  const list = await db.nurseTransactions.toArray();
  if (nurseId) {
    return list.filter((t) => t.nurseId === nurseId);
  }
  return list;
}

export async function addNurseTransaction(tx: NurseTransaction): Promise<void> {
  await db.nurseTransactions.add(tx);
  await logAudit(tx.createdBy, `حركة ممرضة (${tx.type})`, tx.nurseName, `المبلغ: ${tx.amount} ${tx.currency} - ${tx.notes}`);
}

export async function deleteNurseTransaction(id: string, user: string): Promise<void> {
  const tx = await db.nurseTransactions.get(id);
  if (tx) {
    await db.nurseTransactions.delete(id);
    await logAudit(user, 'حذف حركة ممرضة', tx.nurseName, `حذف حركة بقيمة ${tx.amount} ${tx.currency}`);
  }
}

// -------------------------------------------------------------
// إدارة الحالات (Dental Cases)
// -------------------------------------------------------------
export async function getCases(): Promise<DentalCase[]> {
  return await db.cases.orderBy('date').reverse().toArray();
}

export async function getCaseById(id: string): Promise<DentalCase | undefined> {
  return await db.cases.get(id);
}

export async function addCase(dentalCase: DentalCase): Promise<void> {
  await db.cases.add(dentalCase);
  await logAudit(
    dentalCase.createdBy,
    'تسجيل حالة معالجة',
    `${dentalCase.patientName} (${dentalCase.doctorName})`,
    `الإجمالي: ${dentalCase.grossAmount}، الخصم: ${dentalCase.discountAmount}، المعمل: ${dentalCase.labExpenseAmount}، المدفوع: ${dentalCase.paidAmount} ${dentalCase.currency}`
  );

  // إذا كان هناك موعد قادم، ننشئ تذكير تلقائي
  if (dentalCase.nextAppointmentDate) {
    const patient = await db.patients.get(dentalCase.patientId);
    if (patient) {
      await db.reminders.add({
        id: `rem-${Date.now()}`,
        patientId: dentalCase.patientId,
        patientName: dentalCase.patientName,
        phone: patient.phone,
        doctorId: dentalCase.doctorId,
        doctorName: dentalCase.doctorName,
        appointmentDate: dentalCase.nextAppointmentDate,
        status: 'pending',
        notes: `متابعة حالة: ${dentalCase.treatment}`,
      });
    }
  }
}

export async function updateCase(dentalCase: DentalCase, user: string): Promise<void> {
  const old = await db.cases.get(dentalCase.id);
  await db.cases.put(dentalCase);
  await logAudit(
    user,
    'تعديل حالة معالجة',
    dentalCase.patientName,
    `تعديل على الحالة ${dentalCase.id}`,
    old ? JSON.stringify(old) : undefined,
    JSON.stringify(dentalCase)
  );
}

export async function deleteCase(id: string, user: string): Promise<void> {
  const c = await db.cases.get(id);
  if (c) {
    await db.cases.delete(id);
    await logAudit(user, 'حذف حالة', c.patientName, `تم حذف حالة بقيمة ${c.grossAmount} ${c.currency}`);
  }
}

export async function addPaymentToCase(
  caseId: string,
  payment: CasePayment,
  user: string
): Promise<void> {
  const c = await db.cases.get(caseId);
  if (c) {
    c.payments = c.payments || [];
    c.payments.push(payment);
    c.paidAmount = (Number(c.paidAmount) || 0) + Number(payment.amount);
    c.remainingAmount = Math.max(0, (Number(c.amountAfterDiscount) || 0) - c.paidAmount);
    await db.cases.put(c);
    await logAudit(
      user,
      'تسجيل دفعة جديدة',
      c.patientName,
      `سداد مبلغ ${payment.amount} ${payment.currency} للحالة ${c.id}`
    );
  }
}

// -------------------------------------------------------------
// خرج المعمل
// -------------------------------------------------------------
export async function getLabExpenses(): Promise<LabExpense[]> {
  return await db.labExpenses.orderBy('date').reverse().toArray();
}

export async function addLabExpense(expense: LabExpense): Promise<void> {
  await db.labExpenses.add(expense);
  // إن كانت مرتبطة بحالة، يتم تحديث خرج المعمل في الحالة وإعادة حساب حصص الدكتور والعيادة
  if (expense.caseId) {
    const c = await db.cases.get(expense.caseId);
    if (c) {
      c.labExpenseAmount = (Number(c.labExpenseAmount) || 0) + Number(expense.amount);
      const afterDiscount = c.amountAfterDiscount;
      c.netAmount = Math.max(0, afterDiscount - c.labExpenseAmount);
      if (!c.isNoDoctorShare && c.doctorPercentage > 0) {
        c.doctorShare = Math.round((c.netAmount * c.doctorPercentage) / 100);
      } else {
        c.doctorShare = 0;
      }
      c.clinicShare = Math.max(0, c.netAmount - c.doctorShare);
      await db.cases.put(c);
    }
  }
  await logAudit(
    expense.recordedBy,
    'تسجيل خرج معمل',
    expense.labName,
    `مبلغ ${expense.amount} ${expense.currency} - ${expense.description}`
  );
}

export async function deleteLabExpense(id: string, user: string): Promise<void> {
  const item = await db.labExpenses.get(id);
  if (item) {
    await db.labExpenses.delete(id);
    await logAudit(user, 'حذف خرج معمل', item.labName, `حذف مبلغ ${item.amount} ${item.currency}`);
  }
}

// -------------------------------------------------------------
// المصاريف اليومية للعيادة
// -------------------------------------------------------------
export async function getClinicExpenses(): Promise<ClinicExpense[]> {
  return await db.clinicExpenses.orderBy('date').reverse().toArray();
}

export async function addClinicExpense(expense: ClinicExpense): Promise<void> {
  await db.clinicExpenses.add(expense);
  await logAudit(
    expense.recordedBy,
    'تسجيل مصروف عيادة',
    expense.category,
    `مبلغ ${expense.amount} ${expense.currency} - ${expense.description}`
  );
}

export async function deleteClinicExpense(id: string, user: string): Promise<void> {
  const item = await db.clinicExpenses.get(id);
  if (item) {
    await db.clinicExpenses.delete(id);
    await logAudit(user, 'حذف مصروف عيادة', item.category, `حذف مبلغ ${item.amount} ${item.currency}`);
  }
}

// -------------------------------------------------------------
// الخصومات
// -------------------------------------------------------------
export async function getDiscounts(): Promise<Discount[]> {
  return await db.discounts.toArray();
}

export async function addDiscount(discount: Discount, user: string): Promise<void> {
  await db.discounts.add(discount);
  await logAudit(user, 'إضافة خصم', discount.name, `القيمة: ${discount.value} (${discount.type})`);
}

export async function updateDiscount(discount: Discount, user: string): Promise<void> {
  await db.discounts.put(discount);
  await logAudit(user, 'تعديل خصم', discount.name, `القيمة المعدلة: ${discount.value} (${discount.type})`);
}

export async function deleteDiscount(id: string, user: string): Promise<void> {
  const d = await db.discounts.get(id);
  if (d) {
    await db.discounts.delete(id);
    await logAudit(user, 'حذف خصم', d.name, 'تم حذف الخصم');
  }
}

// -------------------------------------------------------------
// الإعدادات وأسعار الصرف
// -------------------------------------------------------------
export async function getClinicSettings(): Promise<ClinicSettings> {
  const item = await db.settings.get('clinicSettings');
  return item ? item.value : INITIAL_SETTINGS;
}

export async function saveClinicSettings(settings: ClinicSettings, user = 'admin'): Promise<void> {
  await db.settings.put({ key: 'clinicSettings', value: settings });
  await logAudit(user, 'تحديث إعدادات المركز', 'الإعدادات العامة', 'تم حفظ أسعار الصرف وبيانات المركز');
}

export async function getExchangeRateHistory(): Promise<ExchangeRateHistory[]> {
  return await db.exchangeRateHistory.orderBy('date').reverse().toArray();
}

export async function recordExchangeRateUpdate(
  sarToYer: number,
  usdToYer: number,
  user: string
): Promise<void> {
  const item: ExchangeRateHistory = {
    id: `ex-${Date.now()}`,
    sarToYer,
    usdToYer,
    date: new Date().toISOString(),
    updatedBy: user,
  };
  await db.exchangeRateHistory.add(item);
}

// -------------------------------------------------------------
// التذكيرات
// -------------------------------------------------------------
export async function getReminders(): Promise<Reminder[]> {
  return await db.reminders.toArray();
}

export async function updateReminderStatus(
  id: string,
  status: 'pending' | 'sent' | 'confirmed'
): Promise<void> {
  const rem = await db.reminders.get(id);
  if (rem) {
    rem.status = status;
    await db.reminders.put(rem);
  }
}

export async function addReminder(reminder: Reminder): Promise<void> {
  await db.reminders.add(reminder);
}

// -------------------------------------------------------------
// النسخ الاحتياطي والاستعادة (Backup & Restore)
// -------------------------------------------------------------
export async function exportDatabaseBackup(): Promise<string> {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    clinic: 'مركز الفيصل لطب الأسنان',
    patients: await db.patients.toArray(),
    doctors: await db.doctors.toArray(),
    doctorSettlements: await db.doctorSettlements.toArray(),
    nurses: await db.nurses.toArray(),
    nurseTransactions: await db.nurseTransactions.toArray(),
    cases: await db.cases.toArray(),
    labExpenses: await db.labExpenses.toArray(),
    clinicExpenses: await db.clinicExpenses.toArray(),
    discounts: await db.discounts.toArray(),
    reminders: await db.reminders.toArray(),
    settings: await db.settings.toArray(),
    auditLogs: await db.auditLogs.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function restoreDatabaseBackup(jsonString: string, user: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !data.patients || !data.cases) {
      throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف');
    }

    await db.transaction('rw', [
      db.patients,
      db.doctors,
      db.doctorSettlements,
      db.nurses,
      db.nurseTransactions,
      db.cases,
      db.labExpenses,
      db.clinicExpenses,
      db.discounts,
      db.reminders,
      db.settings,
      db.auditLogs,
    ], async () => {
      await db.patients.clear();
      await db.doctors.clear();
      await db.doctorSettlements.clear();
      await db.nurses.clear();
      await db.nurseTransactions.clear();
      await db.cases.clear();
      await db.labExpenses.clear();
      await db.clinicExpenses.clear();
      await db.discounts.clear();
      await db.reminders.clear();
      await db.settings.clear();

      if (data.patients?.length) await db.patients.bulkAdd(data.patients);
      if (data.doctors?.length) await db.doctors.bulkAdd(data.doctors);
      if (data.doctorSettlements?.length) await db.doctorSettlements.bulkAdd(data.doctorSettlements);
      if (data.nurses?.length) await db.nurses.bulkAdd(data.nurses);
      if (data.nurseTransactions?.length) await db.nurseTransactions.bulkAdd(data.nurseTransactions);
      if (data.cases?.length) await db.cases.bulkAdd(data.cases);
      if (data.labExpenses?.length) await db.labExpenses.bulkAdd(data.labExpenses);
      if (data.clinicExpenses?.length) await db.clinicExpenses.bulkAdd(data.clinicExpenses);
      if (data.discounts?.length) await db.discounts.bulkAdd(data.discounts);
      if (data.reminders?.length) await db.reminders.bulkAdd(data.reminders);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);

      await logAudit(user, 'استعادة نسخة احتياطية', 'قاعدة البيانات بالكامل', `تم استعادة النسخة بتاريخ ${data.exportedAt || 'غير معروف'}`);
    });

    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

// -------------------------------------------------------------
// إدارة المستخدمين والصلاحيات (Users & Auth)
// -------------------------------------------------------------
export async function getAllUsers(): Promise<User[]> {
  return await db.users.toArray();
}

export async function saveUser(user: User): Promise<void> {
  await db.users.put(user);
}

export async function deleteUserById(id: string): Promise<void> {
  await db.users.delete(id);
}

export async function authenticateUser(identifier: string, codeOrPass?: string): Promise<User | null> {
  const users = await db.users.toArray();
  const trimmed = identifier.trim().toLowerCase();
  const found = users.find(
    (u) =>
      u.username.toLowerCase() === trimmed ||
      (u.email && u.email.toLowerCase() === trimmed)
  );
  if (!found) return null;
  if (codeOrPass !== undefined && codeOrPass !== '') {
    const pTrimmed = codeOrPass.trim();
    const matchesPass = found.password === pTrimmed;
    const matchesPin = found.pinCode === pTrimmed;
    if (!matchesPass && !matchesPin) return null;
  }
  return found;
}

// -------------------------------------------------------------
// واجهات موحدة للربط مع الشاشات (API Aliases for Easy Component Integration)
// -------------------------------------------------------------
export const getAllPatients = async (includeArchived = false) => getPatients(includeArchived);

export const savePatient = async (patient: Patient) => {
  const existing = await db.patients.get(patient.id);
  if (existing) {
    await updatePatient(patient, patient.createdBy || 'user');
  } else {
    await addPatient(patient);
  }
};

export const getAllCases = async () => getCases();

export const saveCase = async (dentalCase: DentalCase) => {
  const existing = await db.cases.get(dentalCase.id);
  if (existing) {
    await updateCase(dentalCase, dentalCase.createdBy || 'user');
  } else {
    await addCase(dentalCase);
  }
};

export const deleteCaseById = async (id: string, user = 'admin') => deleteCase(id, user);

export const getAllDoctors = async (includeArchived = false) => getDoctors(includeArchived);

export const saveDoctor = async (doctor: Doctor) => {
  const existing = await db.doctors.get(doctor.id);
  if (existing) {
    await updateDoctor(doctor, 'admin');
  } else {
    await addDoctor(doctor, 'admin');
  }
};

export const getAllNurses = async (includeArchived = false) => getNurses(includeArchived);

export const saveNurse = async (nurse: Nurse) => {
  const existing = await db.nurses.get(nurse.id);
  if (existing) {
    await updateNurse(nurse, 'admin');
  } else {
    await addNurse(nurse, 'admin');
  }
};

export const getAllNurseTransactions = async (nurseId?: string) => getNurseTransactions(nurseId);

export const saveNurseTransaction = async (tx: NurseTransaction) => addNurseTransaction(tx);

export const deleteNurseTransactionById = async (id: string, user = 'admin') => deleteNurseTransaction(id, user);

export const getAllLabExpenses = async () => getLabExpenses();

export const saveLabExpense = async (exp: LabExpense) => addLabExpense(exp);

export const deleteLabExpenseById = async (id: string, user = 'admin') => deleteLabExpense(id, user);

export const getAllClinicExpenses = async () => getClinicExpenses();

export const saveClinicExpense = async (exp: ClinicExpense) => addClinicExpense(exp);

export const deleteClinicExpenseById = async (id: string, user = 'admin') => deleteClinicExpense(id, user);

export const getAllDoctorSettlements = async () => getDoctorSettlements();

export const saveDoctorSettlement = async (s: DoctorSettlement) => recordDoctorSettlement(s);

export const getAllDiscounts = async () => getDiscounts();

export const saveDiscount = async (d: Discount) => {
  const existing = await db.discounts.get(d.id);
  if (existing) {
    await updateDiscount(d, 'admin');
  } else {
    await addDiscount(d, 'admin');
  }
};

export const deleteDiscountById = async (id: string, user = 'admin') => deleteDiscount(id, user);

export const recordCasePayment = async (caseId: string, payment: CasePayment, user = 'reception') => {
  await addPaymentToCase(caseId, payment, user);
};

export const exportFullDatabaseAsJSON = async () => exportDatabaseBackup();

export const importFullDatabaseFromJSON = async (jsonString: string, user = 'admin') => {
  return restoreDatabaseBackup(jsonString, user);
};

export const resetDatabaseToSeed = async () => {
  await db.transaction('rw', [
    db.patients,
    db.doctors,
    db.doctorSettlements,
    db.nurses,
    db.nurseTransactions,
    db.cases,
    db.labExpenses,
    db.clinicExpenses,
    db.discounts,
    db.reminders,
    db.settings,
    db.auditLogs,
    db.users,
  ], async () => {
    await db.patients.clear();
    await db.doctors.clear();
    await db.doctorSettlements.clear();
    await db.nurses.clear();
    await db.nurseTransactions.clear();
    await db.cases.clear();
    await db.labExpenses.clear();
    await db.clinicExpenses.clear();
    await db.discounts.clear();
    await db.reminders.clear();
    await db.settings.clear();
    await db.auditLogs.clear();
    await db.users.clear();
    await db.branches.clear();

    await db.patients.bulkAdd(INITIAL_PATIENTS);
    await db.doctors.bulkAdd(INITIAL_DOCTORS);
    await db.nurses.bulkAdd(INITIAL_NURSES);
    await db.cases.bulkAdd(INITIAL_CASES);
    await db.labExpenses.bulkAdd(INITIAL_LAB_EXPENSES);
    await db.clinicExpenses.bulkAdd(INITIAL_CLINIC_EXPENSES);
    await db.discounts.bulkAdd(INITIAL_DISCOUNTS);
    await db.reminders.bulkAdd(INITIAL_REMINDERS);
    await db.users.bulkAdd(INITIAL_USERS);
    await db.branches.bulkAdd(INITIAL_BRANCHES);
    await db.settings.put({ key: 'clinicSettings', value: INITIAL_SETTINGS });
  });
};

export const getAllBranches = async (): Promise<Branch[]> => {
  const list = await db.branches.toArray();
  if (list.length === 0) {
    await db.branches.bulkAdd(INITIAL_BRANCHES);
    return INITIAL_BRANCHES;
  }
  return list;
};

export const saveBranch = async (branch: Branch, user = 'admin'): Promise<void> => {
  await db.branches.put(branch);
  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    action: 'حفظ فرع',
    target: branch.name,
    details: `تم حفظ أو تحديث بيانات الفرع (${branch.name}) بواسطة ${user}`,
  });
};

export const deleteBranchById = async (id: string, user = 'admin'): Promise<void> => {
  const branch = await db.branches.get(id);
  await db.branches.delete(id);
  if (branch) {
    await db.auditLogs.add({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user,
      action: 'حذف فرع',
      target: branch.name,
      details: `تم حذف الفرع (${branch.name}) بواسطة ${user}`,
    });
  }
};

