'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { List, Map, AlertTriangle, CheckCircle, BarChart, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Leaflet map must be dynamically imported with SSR disabled
const MapView = dynamic(() => import('./MapComponent'), { ssr: false });

export default function DashboardClient() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [rankings, setRankings] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rankings')
      .select(`
        *,
        clusters (*)
      `)
      .order('priority_score', { ascending: false });

    if (error) {
      console.error("Dashboard fetch error:", error);
    }

    if (!error && data) {
      setRankings(data);
    }
    setLoading(false);
  };

  const handleSelectCluster = async (r: any) => {
    setSelectedCluster(r);
    if (r.clusters.submission_ids && (!r.clusters.submissions || r.clusters.submissions.length === 0)) {
      const { data } = await supabase.from('submissions').select('*').in('id', r.clusters.submission_ids);
      r.clusters.submissions = data || [];
      setSelectedCluster({ ...r });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar - Sleek dark glass */}
      <div className="w-72 glass-dark text-white p-6 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.1)] relative z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <BarChart className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white drop-shadow-sm">MP Portal</h1>
            <p className="text-xs text-indigo-300 font-medium">Jaipur District</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setView('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              view === 'list' 
                ? 'bg-indigo-600/80 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] border border-indigo-500/50' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="font-bold">Prioritized List</span>
          </button>
          <button 
            onClick={() => setView('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              view === 'map' 
                ? 'bg-indigo-600/80 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] border border-indigo-500/50' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="font-bold">Hotspot Map</span>
          </button>
        </nav>

        <div className="mt-auto bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm font-bold text-white">Live Data Feed</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI is continuously analyzing incoming citizen feedback.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-20 glass border-b border-slate-200/60 flex items-center justify-between px-8 z-10 sticky top-0">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {view === 'list' ? 'Top Priorities (AI Ranked)' : 'Geographic Hotspots'}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                alert('Clustering started in background. Refresh in a minute.');
                await fetch('/api/pipeline/cluster');
              }} 
              className="text-sm bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-200 hover:shadow-md transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Run AI Pipeline
            </button>
            <button onClick={fetchData} className="text-sm text-slate-500 font-bold hover:text-indigo-600 transition-colors">
              Refresh Data
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 relative">
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
              </motion.div>
            ) : selectedCluster ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <button 
                  onClick={() => setSelectedCluster(null)}
                  className="mb-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                >
                  ← Back to view
                </button>
                <div className="glass rounded-[2rem] shadow-xl p-8 border border-white/60">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-bold uppercase tracking-wider">
                      Priority Score: {selectedCluster.priority_score}/100
                    </span>
                    <span className="text-slate-500 font-medium">
                      {selectedCluster.clusters.submission_count} Citizen Submissions
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 mb-4">{selectedCluster.clusters.theme}</h3>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                    {selectedCluster.clusters.summary}
                  </p>

                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-6 rounded-2xl mb-8 shadow-lg text-white border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BarChart className="w-24 h-24" />
                    </div>
                    <h4 className="font-bold text-indigo-200 mb-2 flex items-center gap-2 uppercase tracking-widest text-xs">
                      <AlertTriangle className="w-4 h-4" /> AI Justification
                    </h4>
                    <p className="text-white/90 leading-relaxed font-medium relative z-10">
                      {selectedCluster.justification}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 text-xl tracking-tight">Raw Citizen Feedback</h4>
                    <div className="space-y-3">
                      {!selectedCluster.clusters.submissions ? (
                        <div className="p-4 text-slate-500 font-medium italic text-center animate-pulse">Loading citizen feedback...</div>
                      ) : (
                        selectedCluster.clusters.submissions.map((sub: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
                            <p className="text-sm text-slate-700 italic font-medium">"{sub.translated_text || sub.raw_text}"</p>
                            <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Location: {sub.location_text || 'Unknown'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === 'list' ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto grid gap-6"
              >
                {rankings.map((r, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={r.id}
                    onClick={() => handleSelectCluster(r)}
                    className="glass p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-white/60 hover:shadow-[0_10px_30px_-10px_rgba(79,70,229,0.2)] hover:border-indigo-200 cursor-pointer transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-8">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            r.priority_score > 80 ? 'bg-rose-100 text-rose-700' :
                            r.priority_score > 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            Score: {r.priority_score}
                          </span>
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                            {r.clusters.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {r.clusters.theme}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 font-medium leading-relaxed">
                          {r.clusters.summary}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-3xl font-black text-slate-300 group-hover:text-indigo-200 transition-colors">#{idx + 1}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          {r.clusters.submission_count} Reports
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {rankings.length === 0 && (
                  <div className="text-center p-12 glass rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-bold">No data analyzed yet. Click "Run AI Pipeline" to process pending submissions.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-10rem)] rounded-2xl overflow-hidden shadow-2xl border border-white/60 relative z-0"
              >
                <MapView clusters={rankings} onClusterClick={handleSelectCluster} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
