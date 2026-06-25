'use client';

import { HistoryEntry } from '@/app/lib/types';
import { ClockIcon, LeafIcon, TrashIcon } from './icons';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function HistoryPanel({
  entries,
  onSelect,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  if (entries.length === 0) return null;

  return (
    <section className="bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-2xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <ClockIcon className="w-5 h-5" />
          <h3 className="font-semibold">Recent identifications</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group relative rounded-xl overflow-hidden border border-green-200/60 dark:border-green-800/60 bg-white dark:bg-gray-900/60 hover:shadow-md transition-all"
          >
            <button
              onClick={() => onSelect(entry)}
              className="block w-full text-left"
              title={`Re-open ${entry.result.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.thumbnail}
                alt={entry.result.name}
                className="w-full h-24 object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 line-clamp-1">
                  {entry.result.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(entry.at)}
                </p>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.id);
              }}
              aria-label={`Remove ${entry.result.name}`}
              className="absolute top-1 right-1 rounded-full bg-black/40 hover:bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <LeafIcon className="w-4 h-4 text-green-600" />
        Click a card to re-display its result.
      </div>
    </section>
  );
}