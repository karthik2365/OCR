'use client';

import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Copy, Download } from 'lucide-react';

// Set PDF.js worker source from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface OCRResult {
  text: string;
  confidence: number;
}

interface PDFPageResult extends OCRResult {
  page: number;
}

const OCRUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false); // Track copy success

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText('');
      setConfidence(0);
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

  const processImage = async (image: File | Blob): Promise<OCRResult> => {
    try {
      const processedImage = await preprocessImage(image);
      const { data } = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m: any) => console.log(m),
      });

      return { text: data.text, confidence: data.confidence };
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  };

  const processPDF = async (file: File): Promise<PDFPageResult[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results: PDFPageResult[] = [];

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

      const { text, confidence } = await processImage(blob);
      results.push({ page: pageNum, text, confidence });
    }

    return results;
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const fileType = file.type;

      if (fileType.includes('pdf')) {
        const results = await processPDF(file);
        const combinedText = results.map(r => `📄 Page ${r.page}\n${r.text}\n`).join('\n');
        setText(combinedText);
        setConfidence(results[0]?.confidence || 0);
      } else if (fileType.includes('image')) {
        const { text, confidence } = await processImage(file);
        setText(text);
        setConfidence(confidence);
      } else {
        setError('Unsupported file type. Please upload a JPG, PNG, or PDF.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to extract text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text:', err);
      setError('Failed to copy text to clipboard.');
    });
  };

  const downloadJSON = () => {
    const jsonData = {
      timestamp: new Date().toISOString(),
      fileName: file?.name || 'unknown_file',
      text: text,
      confidence: confidence.toFixed(2),
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_result_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-800">OCR Text Extractor</h1>
        </div>

        <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition">
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          <Upload className="w-10 h-10 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">
            {file ? <span className="font-medium">{file.name}</span> : 'Click or drag a file to upload'}
          </p>
        </label>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleProcess}
            disabled={loading || !file}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              loading || !file
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Processing...
              </span>
            ) : (
              'Extract Text'
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 mt-4 text-sm">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {text && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-green-600 w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-800">Extracted Text</h2>
            </div>

            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white rounded-lg p-3 overflow-auto max-h-80 border">
              {text}
            </pre>

            <p className="text-sm text-gray-600 mt-2">
              Confidence: <span className="font-medium text-blue-700">{confidence.toFixed(2)}%</span>
            </p>

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex items-center gap-1 text-sm"
                disabled={!text}
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadJSON}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-1 text-sm"
                disabled={!text}
              >
                <Download className="w-4 h-4" /> Download as JSON
              </button>
            </div>
            {copySuccess && <span className="text-green-600 text-xs ml-2 animate-pulse">✓</span>}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OCRUploader;