// components/OcrExtractor.tsx
'use client';

import { useState, ChangeEvent } from 'react';

interface ExtractedData {
  text: string;
}

export default function OcrExtractor() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setError('');
      setExtractedText('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractText = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text');
      }

      const data: ExtractedData = await response.json();
      setExtractedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Upload Section */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imageInput"
          />
          <label htmlFor="imageInput" className="cursor-pointer block">
            <svg className="w-12 h-12 mx-auto mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-gray-700 font-medium">Click to upload image</p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF, WebP up to 20MB</p>
          </label>
        </div>

        {preview && (
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <button
          onClick={handleExtractText}
          disabled={!image || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Extracting...' : 'Extract Text'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-6 min-h-96 max-h-96 overflow-y-auto">
          {extractedText ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Extracted Text:</h3>
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {extractedText}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-20">
              Extracted text will appear here
            </p>
          )}
        </div>

        {extractedText && (
          <button
            onClick={handleCopyText}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Copy Text
          </button>
        )}
      </div>
    </div>
  );
}