'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DashboardClient from '@/components/DashboardClient';
import { Loader2, Lock } from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-3xl mix-blend-multiply" />
        </div>

        <div className="max-w-md w-full glass rounded-[2rem] shadow-2xl p-8 border border-white/50 relative z-10 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">MP Office Portal</h2>
          <p className="text-center text-gray-500 mb-6">Sign in to access citizen priorities</p>
          
          <form className="space-y-4">
            {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{authError}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={handleLogin}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={async () => {
                  setAuthError('');
                  const { error, data } = await supabase.auth.signUp({ email, password });
                  if (error) setAuthError(error.message);
                  else if (!data.session) setAuthError("Signup succeeded, but requires email confirmation. Use 'Bypass Login' for demo.");
                }}
                className="flex-1 bg-white text-blue-600 border border-blue-600 font-bold py-3 rounded-lg shadow hover:bg-blue-50 transition"
              >
                Sign Up
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setEmail('hackthon@demo.in');
                setPassword('Demo@123');
              }}
              className="w-full mb-3 bg-indigo-50 text-indigo-700 font-bold py-3 rounded-lg shadow-sm border border-indigo-200 hover:bg-indigo-100 transition"
            >
              Autofill Demo Credentials
            </button>
            <button
              onClick={() => setSession({ user: { email: 'demo@hackathon.com' } })}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg shadow hover:bg-gray-800 transition"
            >
              Demo: Bypass Login
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              (Bypass uses public database policies to show data instantly)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardClient session={session} />;
}
