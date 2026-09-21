export type Currency = 'YER' | 'SAR' | 'USD';

export type UserRole = 'admin' | 'reception';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  manager: string; // e.g. "د. مروان العامري"
  isMain?: boolean;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  pinCode?: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  branchId?: string;
  branchName?: string;
  isActive?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string; // e.g. 778043029 (Yemen default 967)
  address: string;
  notes: string;
  branchId?: string;
  branchName?: string;
  createdAt: string; // ISO string
  createdBy: string;
  isArchived?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  degree: string; // ماجستير، بكالوريوس، زمالة، إلخ
  specialty: string; // زراعة أسنان، تقويم، جراحة فك وتجميل، معالجة لبية
  percentage: number; // e.g. 40 means 40%
  branchId?: string;
  branchName?: string;
  joinedDate: string;
  status: 'active' | 'archived';
  notes?: string;
}

export interface DoctorSettlement {
  id: string;
  doctorId: string;
  doctorName: string;
  branchId?: string;
  branchName?: string;
  date: string;
  amount: number;
  currency: Currency;
  notes: string;
  createdBy: string;
}

export interface Nurse {
  id: string;
  name: string;
  phone: string;
  jobTitle?: string; // e.g. "ممرضة عمليات وتخدير", "مسؤولة تعقيم", "مساعدة طبيب"
  branchId?: string;
  branchName?: string;
  baseSalary: number;
  currency: Currency;
  hireDate: string;
  status: 'active' | 'archived';
  notes?: string;
}

export type NurseTransactionType =
  | 'salary'
  | 'withdrawal'
  | 'advance'
  | 'bonus'
  | 'deduction'
  | 'reward';

export interface NurseTransaction {
  id: string;
  nurseId: string;
  nurseName: string;
  type: NurseTransactionType;
  amount: number;
  currency: Currency;
  date: string;
  reason?: string; // سبب الخصم أو نوع السلفة أو بند العلاوة
  notes: string;
  branchId?: string;
  branchName?: string;
  createdBy: string;
}

export type CaseStatus = 'new' | 'in_progress' | 'completed' | 'followup';

export interface CasePayment {
  id: string;
  caseId: string;
  amount: number;
  currency: Currency;
  date: string;
  notes?: string;
  receivedBy: string;
}

export interface DentalCase {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  branchId?: string;
  branchName?: string;
  date: string;
  diagnosis: string;
  treatment: string;
  teethNumbers: string[]; // e.g. ["11", "21", "22"]
  grossAmount: number; // المبلغ الإجمالي
  discountId?: string;
  discountName?: string;
  discountAmount: number; // قيمة الخصم
  amountAfterDiscount: number; // المبلغ بعد الخصم = الإجمالي - الخصم
  labExpenseAmount: number; // خرج المعمل المرتبط
  isNoDoctorShare: boolean; // خيار "حالة بدون نسبة دكتور" (تدخل للعيادة 100%)
  doctorPercentage: number; // نسبة الدكتور المسجلة مع الحالة
  netAmount: number; // الصافي = بعد الخصم - خرج المعمل
  doctorShare: number; // الصافي * النسبة (أو صفر إن كانت للعيادة 100%)
  clinicShare: number; // الصافي - نسبة الدكتور
  paidAmount: number; // المدفوع حتى الآن
  remainingAmount: number; // المتبقي = بعد الخصم - المدفوع
  currency: Currency;
  nextAppointmentDate?: string;
  notes?: string;
  status: CaseStatus;
  createdAt: string;
  createdBy: string;
  payments?: CasePayment[];
}

export interface LabExpense {
  id: string;
  caseId?: string;
  patientName?: string;
  labName: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  recordedBy: string;
  branchId?: string;
  branchName?: string;
}

export type ExpenseCategory =
  | 'electricity'
  | 'water'
  | 'rent'
  | 'supplies'
  | 'maintenance'
  | 'salaries'
  | 'other';

export interface ClinicExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: Currency;
  recordedBy: string;
  branchId?: string;
  branchName?: string;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 15 for 15%, or 5000 for 5000 YER
  notes?: string;
  isActive: boolean;
}

export interface ExchangeRates {
  sarToYer: number; // e.g. 425
  usdToYer: number; // e.g. 1610
  updatedAt: string;
  updatedBy: string;
}

export interface ExchangeRateHistory {
  id: string;
  sarToYer: number;
  usdToYer: number;
  date: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface Reminder {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  status: 'pending' | 'sent' | 'confirmed';
  notes?: string;
}

export interface ClinicSettings {
  name: string;
  subtitle?: string;
  clinicName?: string;
  phone1: string;
  phone2?: string;
  phone?: string;
  address: string;
  examSheetHeader?: string;
  invoiceHeader?: string;
  whatsappTemplate?: string;
  sarToYer: number;
  usdToYer: number;
  exchangeRates?: {
    YER: number;
    SAR: number;
    USD: number;
  };
  reception24hLock?: boolean;
}

export type PhotoStage = 'before' | 'during' | 'after' | 'xray' | 'other';

export interface ClinicalPhoto {
  id: string;
  patientId: string;
  patientName?: string;
  caseId?: string;
  photoUrl: string; // base64 or blob URL
  stage: PhotoStage;
  title: string;
  notes?: string;
  teethNumbers?: string[];
  date: string; // YYYY-MM-DD
  createdAt: string;
  takenBy: string;
  branchId?: string;
}
