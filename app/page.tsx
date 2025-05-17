'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlantInfo {
  name: string;
  confidence: string;
  details: string;
  healthy: string,
  care: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setResult(null);
    setLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to identify plant');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError(err instanceof Error ? err.message : 'Failed to identify plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          Plant Identifier
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="text-center mb-6">
            <label 
              htmlFor="image-upload"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
            >
              Upload Plant Image
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="text-center text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {selectedImage && (
            <div className="relative w-full h-64 mb-6">
              <Image
                src={selectedImage}
                alt="Selected plant"
                fill
                className="rounded-lg object-contain"
              />
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-600">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mb-2"></div>
              <p>Analyzing your plant...</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-green-800 mb-4">
                {result.name}
              </h2>
              <div className="mb-4">
                <div className="text-sm text-green-600 mb-2">
                  Confidence: {result.confidence}
                </div>
                <p className="text-gray-700 mb-2">
                  {result.details}
                </p>
                <p className="text-gray-700 mb-2">
                  <b>Health:</b> {result.healthy}
                </p>
                <p className="text-gray-700 mb-2">
                  <b>Care:</b> {result.care}
                </p>

              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
