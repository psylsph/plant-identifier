'use client';

import { LeafIcon, HeartIcon, CareIcon, InfoIcon } from './icons';
import ConfidenceBar from './ConfidenceBar';
import { PlantInfo } from '@/app/lib/types';

interface ResultCardProps {
  result: PlantInfo;
  confidenceNumber: number;
}

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-green-200/60 dark:border-green-800/60 bg-white/70 dark:bg-gray-800/50 p-4 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-300">
        {icon}
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

export default function ResultCard({ result, confidenceNumber }: ResultCardProps) {
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-green-600 text-white p-3 shadow-md">
          <LeafIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-green-700 dark:text-green-300 font-semibold">
            Identified plant
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 leading-tight">
            {result.name}
          </h2>
        </div>
      </div>

      <ConfidenceBar value={confidenceNumber} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow icon={<InfoIcon />} title="Details">
          {result.details}
        </InfoRow>
        <InfoRow icon={<HeartIcon />} title="Health">
          {result.healthy}
        </InfoRow>
        <div className="sm:col-span-2">
          <InfoRow icon={<CareIcon />} title="Care">
            {result.care}
          </InfoRow>
        </div>
      </div>
    </div>
  );
}