'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Upload, Layers, Sparkles } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center py-24 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-bold tracking-tight mb-6"
        >
          OCR Dashboard
        </motion.h1>
        <motion.div className="h-1 w-20 bg-[#6366F1] mx-auto mb-8 rounded" />
        <TextAnimate  animation="blurInUp" by="character" once>
          {/* <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-700"> */}
            Effortlessly extract and organize text from images in seconds.
          {/* </p> */}
        </TextAnimate>

      </section>

      {/* Cards Section */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <LinkCard href="/OCRsingle" title="Single Image OCR" description="Upload one image and extract text using Tesseract.js" icon={<Upload />} color="indigo" index={0} />
          <LinkCard href="/OCRbulk" title="Bulk OCR Processing" description="Upload multiple files for batch text extraction" icon={<Layers />} color="indigo" index={1} />
          <LinkCard href="/OCRgemini" title="Gemini AI OCR" description="Get accurate OCR results using Google's Gemini API" icon={<Sparkles />} color="indigo" index={2} />
        </motion.div>
      </section>
      <br></br>
      <br></br>
      <br></br>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} OCR Suite — Built with Next.js & Tailwind
      </footer>
    </main>
  );
}

// Card Component
function LinkCard({ href, title, description, icon, color, index }: { href: string; title: string; description: string; icon: React.ReactNode; color: string; index: number; }) {
  const colors = {
    indigo: { bg: "bg-[#6366F1] text-white", hover: "bg-[#E0E7FF]" },
  };

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 * index } }}
        whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(99,102,241,0.3)" }}
        whileTap={{ scale: 0.98 }}
        className={`group relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl p-8 cursor-pointer overflow-hidden`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-lg ${colors[color].bg} shadow-md`}>{icon}</div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-gray-900 font-semibold text-sm flex items-center gap-2"
        >
          Explore
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
        </motion.div>
      </motion.div>
    </Link>
  );
}