'use client';

import { LeafIcon } from './icons';

const messages = [
  'Examining the leaves…',
  'Comparing species…',
  'Checking plant health…',
  'Almost there…',
];

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
      <div className="relative w-20 h-20 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-green-200/60 dark:bg-green-700/40 animate-pulse-ring" />
        <div className="absolute inset-2 rounded-full bg-green-300/60 dark:bg-green-600/50 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
        <div className="relative text-green-700 dark:text-green-200 animate-leaf-sway">
          <LeafIcon className="w-10 h-10" />
        </div>
      </div>
      <p className="text-lg font-semibold text-green-800 dark:text-green-200">
        Identifying your plant
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        This usually takes a few seconds…
      </p>
    </div>
  );
}