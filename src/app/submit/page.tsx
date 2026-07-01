'use client';

import { motion } from 'framer-motion';
import SubmitForm from '@/components/SubmitForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center py-12 px-4 md:px-8 relative overflow-hidden">
      
      {/* Light Neon Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/30 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-400/30 blur-[120px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-3 tracking-tight drop-shadow-sm">
            Citizen Voice Intake
          </h1>
          <p className="text-slate-500 text-lg mb-10 font-medium">
            Speak directly to your local MP using AI.
          </p>
          
          <SubmitForm />
        </motion.div>
      </div>
    </main>
  );
}
