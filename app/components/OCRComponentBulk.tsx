'use client';

import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Download, Copy } from 'lucide-react';

// Set PDF.js worker source from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface OCRResult {
  text: string;
  confidence: number;
}

interface PDFPageResult extends OCRResult {
  page: number;
}

interface FileResult {
  fileName: string;
  text: string;
  confidence: number;
  error?: string;
}

const OCRBulkUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<number | null>(null); // Track which result was copied

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      setResults([]);
      setError('');
    }
  };

  const preprocessImage = async (image: File | Blob): Promise<File | Blob> => {
    try {
      const response = await fetch('/api/preprocess', {
        method: 'POST',
        body: image,
      });
      if (!response.ok) throw new Error('Preprocessing failed');
      return await response.blob();
    } catch (error) {
      console.warn('Using original image due to preprocessing error:', error);
      return image;
    }
  };

  const processImage = async (image: File | Blob, fileName: string): Promise<FileResult> => {
    try {
      const processedImage = await preprocessImage(image);
      const { data } = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m: any) => console.log(m),
      });

      return { fileName, text: data.text, confidence: data.confidence };
    } catch (error) {
      console.error(`OCR Error for ${fileName}:`, error);
      return { fileName, text: '', confidence: 0, error: 'Failed to process image' };
    }
  };

  const processPDF = async (file: File): Promise<FileResult> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageResults: PDFPageResult[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const imageData = canvas.toDataURL('image/png');
        const blob = await (await fetch(imageData)).blob();

        const { text, confidence } = await processImage(blob, `${file.name} - Page ${pageNum}`);
        pageResults.push({ page: pageNum, text, confidence });
      }

      const combinedText = pageResults.map(r => `📄 Page ${r.page}\n${r.text}\n`).join('\n');
      const avgConfidence = pageResults.reduce((sum, r) => sum + r.confidence, 0) / pageResults.length || 0;

      return { fileName: file.name, text: combinedText, confidence: avgConfidence };
    } catch (error) {
      console.error(`PDF Error for ${file.name}:`, error);
      return { fileName: file.name, text: '', confidence: 0, error: 'Failed to process PDF' };
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const processPromises = files.map(async (file) => {
        const fileType = file.type;
        if (fileType.includes('pdf')) {
          return await processPDF(file);
        } else if (fileType.includes('image')) {
          return await processImage(file, file.name);
        } else {
          return { fileName: file.name, text: '', confidence: 0, error: 'Unsupported file type' };
        }
      });

      const allResults = await Promise.all(processPromises);
      setResults(allResults);
    } catch (err: any) {
      console.error('Bulk processing error:', err);
      setError('An error occurred during bulk processing.');
    } finally {
      setLoading(false);
    }
  };

  const averageConfidence = results.length > 0 ? results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length : 0;

  const downloadJSON = () => {
    const jsonData = {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      averageConfidence: averageConfidence.toFixed(2),
      results: results.map(result => ({
        fileName: result.fileName,
        text: result.text,
        confidence: result.confidence.toFixed(2),
        error: result.error || null,
      })),
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_results_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text:', err);
      setError('Failed to copy text to clipboard.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Bulk OCR Text Extractor</h1>
        </div>

        <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} multiple className="hidden" />
          <Upload className="w-10 h-10 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">
            {files.length > 0 ? (
              <span className="font-medium">{files.length} file(s) selected</span>
            ) : (
              'Click or drag files to upload'
            )}
          </p>
        </label>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{file.name}</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleProcess}
            disabled={loading || files.length === 0}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              loading || files.length === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Processing...
              </span>
            ) : (
              'Extract Text from All'
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 mt-4 text-sm">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {results.length > 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-green-600 w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-800">Extracted Results</h2>
            </div>

            {results.map((result, index) => (
              <div key={index} className="mb-4 p-3 bg-white rounded-lg border border-gray-100">
                <h3 className="text-md font-medium text-gray-700">{result.fileName}</h3>
                {result.error ? (
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                ) : (
                  <>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                      {result.text}
                    </pre>
                    <p className="text-sm text-gray-600 mt-2">
                      Confidence: <span className="font-medium text-blue-700">{result.confidence.toFixed(2)}%</span>
                    </p>
                    <button
                      onClick={() => handleCopy(index, result.text)}
                      className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex items-center gap-1 text-sm"
                      disabled={!result.text}
                    >
                      <Copy className="w-4 h-4" />
                      {copySuccess === index ? 'Copied!' : 'Copy'}
                    </button>
                    {copySuccess === index && (
                      <span className="text-green-600 text-xs ml-2 animate-pulse">✓</span>
                    )}
                  </>
                )}
              </div>
            ))}

            <p className="text-sm text-gray-600 mt-4">
              Average Confidence: <span className="font-medium text-blue-700">{averageConfidence.toFixed(2)}%</span>
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={downloadJSON}
                disabled={results.length === 0}
                className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                  results.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                }`}
              >
                <Download className="w-4 h-4" /> Download as JSON
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OCRBulkUpload;