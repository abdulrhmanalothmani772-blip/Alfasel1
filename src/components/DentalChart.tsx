import React, { useState } from 'react';

interface DentalChartProps {
  selectedTeeth: string[];
  onChange: (teeth: string[]) => void;
  readOnly?: boolean;
}

// Universal FDI Two-Digit World Dental Federation Notation
// Upper Right (Quadrant 1), Upper Left (Quadrant 2)
// Lower Left (Quadrant 3), Lower Right (Quadrant 4)
const UPPER_JAW = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
];

const LOWER_JAW = [
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
];

// Deciduous / Child teeth
const CHILD_UPPER = ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'];
const CHILD_LOWER = ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75'];

export const DentalChart: React.FC<DentalChartProps> = ({
  selectedTeeth,
  onChange,
  readOnly = false,
}) => {
  const [chartMode, setChartMode] = useState<'adult' | 'child'>('adult');

  const toggleTooth = (tooth: string) => {
    if (readOnly) return;
    if (selectedTeeth.includes(tooth)) {
      onChange(selectedTeeth.filter((t) => t !== tooth));
    } else {
      onChange([...selectedTeeth, tooth].sort());
    }
  };

  const renderTooth = (num: string) => {
    const isSelected = selectedTeeth.includes(num);

    return (
      <button
        key={num}
        type="button"
        disabled={readOnly}
        onClick={() => toggleTooth(num)}
        className={`relative flex flex-col items-center justify-center w-8 h-10 sm:w-9 sm:h-12 rounded-lg border text-xs font-mono font-bold transition-all ${
          isSelected
            ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30 scale-105 ring-2 ring-cyan-300'
            : 'bg-white hover:bg-cyan-50 border-slate-200 text-slate-700 hover:border-cyan-300'
        }`}
        title={`سن رقم ${num}`}
      >
        {/* Tooth Icon Silhouette */}
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 mb-0.5 ${isSelected ? 'fill-white' : 'fill-slate-400'}`}
        >
          <path d="M12 2C8 2 5 5 5 9C5 13 7 17 8 21C9 22 10 22 11 20C11.5 19 12 16 12 16C12 16 12.5 19 13 20C14 22 15 22 16 21C17 17 19 13 19 9C19 5 16 2 12 2Z" />
        </svg>
        <span>{num}</span>
      </button>
    );
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-right">
          <span className="text-xs font-bold text-slate-700 block">
            مخطط الأسنان التفاعلي (FDI)
          </span>
          <span className="text-[11px] text-slate-500">
            انقر على السن لتحديده في الحالة المعالجة
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartMode('adult')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartMode === 'adult'
                ? 'bg-white text-cyan-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            دائم (كبار)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('child')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartMode === 'child'
                ? 'bg-white text-cyan-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            لبني (أطفال)
          </button>
        </div>
      </div>

      {/* Jaws Display */}
      <div className="space-y-3 overflow-x-auto pb-2">
        {/* Upper Jaw */}
        <div>
          <div className="text-[10px] text-slate-400 font-bold mb-1">الفك العلوي (يمين ↔ يسار)</div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-nowrap min-w-max">
            {(chartMode === 'adult' ? UPPER_JAW : CHILD_UPPER).map(renderTooth)}
          </div>
        </div>

        {/* Mid-line separator */}
        <div className="h-px bg-slate-200 w-full relative">
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 px-2 text-[10px] text-slate-400 font-bold">
            خط المنتصف
          </span>
        </div>

        {/* Lower Jaw */}
        <div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-nowrap min-w-max">
            {(chartMode === 'adult' ? LOWER_JAW : CHILD_LOWER).map(renderTooth)}
          </div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">الفك السفلي (يمين ↔ يسار)</div>
        </div>
      </div>

      {/* Selected tags */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 font-semibold">الأسنان المحددة ({selectedTeeth.length}):</span>
          {selectedTeeth.length === 0 ? (
            <span className="text-slate-400 italic">لم يتم اختيار أسنان (إجراء عام)</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedTeeth.map((tooth) => (
                <span
                  key={tooth}
                  className="bg-cyan-100 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-md font-mono font-bold"
                >
                  #{tooth}
                </span>
              ))}
            </div>
          )}
        </div>

        {!readOnly && selectedTeeth.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
          >
            إلغاء التحديد
          </button>
        )}
      </div>
    </div>
  );
};
