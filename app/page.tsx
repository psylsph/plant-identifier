'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Dropzone from './components/Dropzone';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import {
  CopyIcon,
  CheckIcon,
  LeafIcon,
  TrashIcon,
} from './components/icons';
import {
  formatPlantInfoForCopy,
  loadHistory,
  parseConfidence,
  removeEntry,
  saveEntry,
  clearHistory,
} from './lib/history';
import { HistoryEntry, PlantInfo } from './lib/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<PlantInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const reset = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const identify = useCallback(async (file: File, preview: string) => {
    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to identify plant');
      }

      const data: PlantInfo = await response.json();
      setResult(data);

      // persist to history
      const entry: HistoryEntry = {
        id: generateId(),
        thumbnail: preview,
        result: data,
        at: Date.now(),
      };
      const next = saveEntry(entry);
      if (next) setHistory(next);
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to identify plant'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setSelectedImage(preview);
        setSelectedFile(file);
        identify(file, preview);
      };
      reader.readAsDataURL(file);
    },
    [identify]
  );

  const handleRetry = () => {
    if (selectedFile) identify(selectedFile, selectedImage!);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatPlantInfoForCopy(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setSelectedImage(entry.thumbnail);
    setResult(entry.result);
    setError(null);
    // scroll to top of result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveHistory = (id: string) => {
    const next = removeEntry(id);
    setHistory(next);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const confidenceNumber = result ? parseConfidence(result.confidence) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-600 text-white p-2.5 shadow-md">
              <LeafIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 tracking-tight">
                Plant Identifier
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Identify any plant from a single photo
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 mb-6 transition-colors">
          {!selectedImage && !loading && (
            <Dropzone onFile={handleFile} />
          )}

          {error && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200 animate-fade-in">
              <div className="flex-1">
                <p className="font-semibold">Something went wrong</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              {selectedFile && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {selectedImage && (
            <div className="relative w-full h-72 sm:h-80 mb-6 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-green-100 dark:border-green-900">
              <Image
                src={selectedImage}
                alt="Selected plant"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <button
                onClick={reset}
                aria-label="Remove image"
                className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white p-1.5 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading && <LoadingState />}

          {result && !loading && (
            <div className="space-y-5">
              <ResultCard result={result} confidenceNumber={confidenceNumber} />
              <div className="flex flex-wrap gap-2 pt-2 border-t border-green-100 dark:border-green-900">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium transition-colors"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? 'Copied!' : 'Copy info'}
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-medium transition-colors"
                >
                  Try another image
                </button>
              </div>
            </div>
          )}

          {!selectedImage && !loading && !result && !error && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              We never store your photos — they're processed and discarded.
            </p>
          )}
        </section>

        <HistoryPanel
          entries={history}
          onSelect={handleSelectHistory}
          onRemove={handleRemoveHistory}
          onClear={handleClearHistory}
        />

        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 mt-10">
          Powered by AI · Made with{' '}
          <span className="text-green-600 dark:text-green-400">🌱</span> for plant lovers
        </footer>
      </div>
    </main>
  );
}