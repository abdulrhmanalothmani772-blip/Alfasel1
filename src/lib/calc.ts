import { Currency, DentalCase } from '../types';

/**
 * =========================================================================
 * وحدة الحسابات المالية والمحاسبية لمركز الفيصل لطب الأسنان
 * دوال نقية 100% (Pure Functions) قابلة للاختبار المرجعي والدقيق
 * =========================================================================
 */

export interface CaseCalculationInput {
  grossAmount: number;         // المبلغ الإجمالي للعلاج
  discountAmount: number;      // قيمة الخصم المعتمد
  labExpenseAmount: number;    // تكلفة خرج المعمل المرتبط بالحالة
  doctorPercentage: number;    // نسبة الطبيب المعالج (مثال: 40 تعني 40%)
  isNoDoctorShare: boolean;    // خيار حالة بدون نسبة دكتور (تدخل للعيادة 100%)
  paidAmount: number;          // المبلغ المسدد حتى اللحظة
}

export interface CaseCalculationResult {
  amountAfterDiscount: number; // المبلغ بعد الخصم = الإجمالي - الخصم
  netAmount: number;           // الصافي = المبلغ بعد الخصم - خرج المعمل
  doctorShare: number;         // مستحق الطبيب = الصافي × نسبة الطبيب (أو 0)
  clinicShare: number;         // دخل العيادة = الصافي - نسبة الطبيب
  remainingAmount: number;     // المتبقي على المريض = المبلغ بعد الخصم - المدفوع
}

/**
 * الحساب المحاسبي المعتمد لكل حالة طبية:
 * 1. المبلغ بعد الخصم = المبلغ الإجمالي - الخصم
 * 2. الصافي           = المبلغ بعد الخصم - خرج المعمل
 * 3. نسبة الدكتور     = الصافي × (نسبة الدكتور / 100)  [أو 0 إن كانت بدون نسبة]
 * 4. دخل العيادة      = الصافي - نسبة الدكتور
 * 5. المتبقي          = المبلغ بعد الخصم - المدفوع
 *
 * مثال توضيحي إلزامي:
 * مريض 1000 ريال، معمل 200، الصافي 800، نسبة دكتور 40% = 320، دخل العيادة = 480.
 */
export function calculateCaseFinancials(input: CaseCalculationInput): CaseCalculationResult {
  const gross = Math.max(0, Number(input.grossAmount) || 0);
  const discount = Math.max(0, Number(input.discountAmount) || 0);
  const lab = Math.max(0, Number(input.labExpenseAmount) || 0);
  const docPct = Math.max(0, Math.min(100, Number(input.doctorPercentage) || 0));
  const paid = Math.max(0, Number(input.paidAmount) || 0);

  // 1. المبلغ بعد الخصم
  const amountAfterDiscount = Math.max(0, gross - discount);

  // 2. الصافي بعد استبعاد خرج المعمل
  const netAmount = Math.max(0, amountAfterDiscount - lab);

  // 3. حصة الطبيب
  let doctorShare = 0;
  if (!input.isNoDoctorShare && docPct > 0) {
    doctorShare = Math.round((netAmount * docPct) / 100);
  }

  // 4. دخل العيادة المتبقي من الصافي
  const clinicShare = Math.max(0, netAmount - doctorShare);

  // 5. المتبقي في ذمة المريض
  const remainingAmount = Math.max(0, amountAfterDiscount - paid);

  return {
    amountAfterDiscount,
    netAmount,
    doctorShare,
    clinicShare,
    remainingAmount,
  };
}

/**
 * تحويل المبالغ بين العملات المختلفة إلى الريال اليمني (YER)
 * بناءً على أسعار الصرف المدخلة في الإعدادات
 */
export function convertToYER(
  amount: number,
  currency: Currency,
  rates: { sarToYer: number; usdToYer: number }
): number {
  const safeAmount = Number(amount) || 0;
  switch (currency) {
    case 'SAR':
      return safeAmount * (rates.sarToYer || 425);
    case 'USD':
      return safeAmount * (rates.usdToYer || 1610);
    case 'YER':
    default:
      return safeAmount;
  }
}

/**
 * تنسيق الأرقام النقدية مع فواصل الآلاف وبدون كسور زائدة
 */
export function formatCurrency(amount: number, currency?: Currency): string {
  const safeAmount = Number(amount) || 0;
  const formatted = new Intl.NumberFormat('ar-YE', {
    maximumFractionDigits: 1,
  }).format(safeAmount);

  if (!currency) return formatted;

  const symbolMap: Record<Currency, string> = {
    YER: 'ر.ي',
    SAR: 'ر.س',
    USD: '$',
  };

  return `${formatted} ${symbolMap[currency] || currency}`;
}

/**
 * دالة مساعدة لحساب نسبة مئوية أو قيمة ثابتة للخصم
 */
export function computeDiscountValue(
  grossAmount: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.round((grossAmount * Math.min(100, Math.max(0, discountValue))) / 100);
  }
  return Math.min(grossAmount, Math.max(0, discountValue));
}
