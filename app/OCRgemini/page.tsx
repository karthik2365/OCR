'use client';

import OcrExtractor from "../gemini/OCRExtractor";
import { motion } from "framer-motion";

export default function OCRGeminiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-16 px-4">
      
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Gemini OCR
        </h1>
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
          Extract text from images instantly with AI-powered accuracy.
        </p>
      </motion.section>

      {/* OCR Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col gap-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Image</h2>
          <p className="text-gray-600 text-sm">
            Choose an image file to extract text from. AI-powered recognition ensures high accuracy.
          </p>
        </div>

        {/* OCR Component */}
        <OcrExtractor />

        {/* Optional Tips Section */}
        <div className="mt-6 text-gray-600 text-sm bg-blue-50 p-4 rounded-lg">
          <p>Tip: For best results, use high-resolution images with clear text. You can upload multiple formats including JPG, PNG, and PDF.</p>
        </div>
      </motion.div>
    </main>
  );
}