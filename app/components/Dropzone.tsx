'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadIcon } from './icons';

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function Dropzone({ onFile, disabled }: DropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onFile(file);
      }
    },
    [onFile, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // allow re-selecting the same file
    e.target.value = '';
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload a plant image"
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          inputRef.current?.click();
        }
      }}
      className={[
        'relative flex flex-col items-center justify-center gap-3',
        'rounded-2xl border-2 border-dashed p-10 text-center',
        'transition-all duration-200 cursor-pointer select-none',
        disabled
          ? 'opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700'
          : dragActive
          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 scale-[1.01]'
          : 'border-green-300 dark:border-green-700 bg-green-50/40 dark:bg-green-900/10 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
      ].join(' ')}
    >
      <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-4 text-green-700 dark:text-green-300">
        <UploadIcon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
          Drop a plant photo here
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          or <span className="text-green-700 dark:text-green-300 underline underline-offset-2">browse files</span> · PNG, JPG up to ~10MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}