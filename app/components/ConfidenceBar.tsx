'use client';

interface ConfidenceBarProps {
  value: number; // 0-100
}

export default function ConfidenceBar({ value }: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 80
      ? 'from-green-500 to-emerald-500'
      : clamped >= 50
      ? 'from-amber-400 to-yellow-500'
      : 'from-orange-500 to-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
        <span>Confidence</span>
        <span>{Math.round(clamped)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}