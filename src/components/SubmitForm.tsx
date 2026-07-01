'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle, Camera } from 'lucide-react';
import { uploadFile } from '@/lib/uploadFile';

export default function SubmitForm() {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !audioBlob && !photo) {
      alert('Please provide some text, audio, or a photo for your suggestion.');
      return;
    }

    setIsSubmitting(true);
    try {
      let audioUrl = null, photoUrl = null;
      const timestamp = Date.now();
      
      try {
        if (audioBlob) audioUrl = await uploadFile(audioBlob, 'media', `audio_${timestamp}.webm`);
        if (photo) photoUrl = await uploadFile(photo, 'media', `photo_${timestamp}_${photo.name}`);
      } catch (uploadErr) {
        console.warn("Upload skipped due to missing bucket or RLS", uploadErr);
      }

      const { data, error } = await supabase.from('submissions').insert({
        raw_text: text || 'No text provided',
        audio_url: audioUrl,
        photo_url: photoUrl,
        location,
        status: 'new',
      }).select().single();

      if (error) throw error;

      if (data) {
        fetch('/api/pipeline/normalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId: data.id })
        }).catch(err => console.error("Normalize error:", err));
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(`Failed to submit: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-200">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Priority Logged!</h3>
            <p className="text-slate-600 font-medium mb-8">
              AI has processed your request and added it to the priority queue.
            </p>
            <button 
              onClick={() => {
                setSubmitted(false);
                setText('');
                setAudioBlob(null);
                setPhoto(null);
              }}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg shadow-slate-900/20"
            >
              Submit Another
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="p-8 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  Describe the Issue
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="E.g., The streetlights on Main Road have been broken for 2 weeks..."
                    className="relative w-full px-5 py-4 bg-white/90 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-inner font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audio Recording */}
                <div className="p-5 border border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors group">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Mic className="w-4 h-4 text-indigo-500" />
                    Voice Note (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-5 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Record
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-5 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2 animate-pulse shadow-sm"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Stop Recording
                      </button>
                    )}
                    {audioBlob && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Recorded!</span>}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="p-5 border border-slate-200 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors group relative overflow-hidden">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-fuchsia-500" />
                    Upload Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-5
                      file:rounded-xl file:border-0
                      file:text-sm file:font-bold
                      file:bg-fuchsia-50 file:text-fuchsia-600
                      hover:file:bg-fuchsia-100 file:transition-colors file:cursor-pointer
                      file:border file:border-fuchsia-100"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
                  <div className={`relative px-8 py-5 bg-slate-900 text-white font-black text-xl tracking-wide rounded-xl shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] flex items-center justify-center transition-all ${isSubmitting ? 'opacity-90' : 'hover:scale-[1.02]'}`}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-4 border-slate-600 border-t-white rounded-full"></div>
                        Processing via AI...
                      </span>
                    ) : (
                      'Submit Priority'
                    )}
                  </div>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
