'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BarChart2, MessageSquare, MapPin, Sparkles, Zap, Globe2 } from 'lucide-react';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Light Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-400/30 rounded-full blur-[150px] mix-blend-multiply animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-300/20 rounded-full blur-[100px] mix-blend-multiply" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Floating Elements (Parallax) */}
      <motion.div style={{ y: y1 }} className="absolute top-20 left-[10%] hidden lg:block opacity-80">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 border border-white/60 backdrop-blur-xl rotate-12 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(99,102,241,0.2)]">
          <Sparkles className="text-indigo-500 w-10 h-10" />
        </div>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-40 right-[10%] hidden lg:block opacity-80">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tl from-fuchsia-100 to-pink-50 border border-white/60 backdrop-blur-xl -rotate-12 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(217,70,239,0.2)]">
          <Globe2 className="text-fuchsia-500 w-12 h-12" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        className="w-full max-w-6xl relative z-10 flex flex-col items-center mt-20"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-center mb-6 tracking-tighter leading-[1.1]"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-600 drop-shadow-sm">People's</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 animate-gradient-x drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            Priorities
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed text-center"
        >
          Supercharge local governance with AI. We transform raw citizen complaints into <span className="text-slate-900 font-bold">data-backed, actionable hotspots</span> for MPs instantly.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full"
        >
          <Link href="/submit" className="group relative px-8 py-5 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center text-lg shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)]">
            <MessageSquare className="w-6 h-6" />
            Citizen Intake
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link href="/dashboard" className="group relative overflow-hidden px-8 py-5 bg-white/80 text-slate-900 font-black rounded-2xl hover:bg-white hover:scale-105 hover:-translate-y-2 transition-all duration-300 flex items-center gap-3 w-full sm:w-auto justify-center text-lg border border-slate-200 backdrop-blur-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            MP Portal (Demo)
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Link>
        </motion.div>

        {/* Light Bento Grid Features */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 1.2
              }
            }
          }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-20"
        >
          {[
            {
              icon: MessageSquare,
              title: "Multilingual AI Intake",
              desc: "Citizens speak their native language. AI translates, categorizes, and scores urgency in real-time.",
              color: "from-blue-50 to-cyan-50",
              border: "border-blue-100",
              iconColor: "text-blue-500"
            },
            {
              icon: MapPin,
              title: "Auto-Clustering Engine",
              desc: "Hundreds of complaints magically merge into geographic hotspots so the MP knows exactly where to look.",
              color: "from-fuchsia-50 to-purple-50",
              border: "border-fuchsia-100",
              iconColor: "text-fuchsia-500"
            },
            {
              icon: BarChart2,
              title: "Smart Prioritization",
              desc: "Cross-references complaints with census data to assign a priority score out of 100 for budget allocation.",
              color: "from-emerald-50 to-teal-50",
              border: "border-emerald-100",
              iconColor: "text-emerald-500"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
              className={`p-8 rounded-3xl bg-gradient-to-br ${feature.color} border ${feature.border} backdrop-blur-xl shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-default`}
              style={{ transformPerspective: 1000 }}
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <feature.icon className={`${feature.iconColor} w-10 h-10 mb-6 drop-shadow-[0_4px_10px_currentColor] opacity-90`} />
              <h3 className="font-black text-slate-900 text-2xl mb-3">{feature.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </main>
  );
}
